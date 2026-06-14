/**
 * Gọi AI (chuẩn OpenAI) với POOL NHIỀU KEY — tự nhảy key kế tiếp khi key hiện
 * tại lỗi/hết quota (429), giống cách 9Router failover. Dùng chung cho caption
 * + trợ lý.
 *
 * Cấu hình env:
 *   AI_BASE_URL   — endpoint (vd https://generativelanguage.googleapis.com/v1beta/openai/)
 *   AI_MODEL      — model (vd gemini-flash-latest)
 *   AI_API_KEYS   — NHIỀU key, ngăn cách dấu phẩy: "key1,key2,key3"  (ưu tiên)
 *   AI_API_KEY    — 1 key (fallback nếu không có AI_API_KEYS)
 *   (tùy chọn) AI_FALLBACK_BASE_URL / AI_FALLBACK_MODEL / AI_FALLBACK_KEY
 *               — nhà cung cấp DỰ PHÒNG (vd OpenCode mimo) khi hết sạch key chính.
 */

import { createSupabaseAdminClient } from "./supabase/admin";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type Provider = { baseUrl: string; apiKey: string; model: string };

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** Preset nhà cung cấp (endpoint chuẩn OpenAI) → khai nhanh khi /key add. */
export const PROVIDER_PRESETS: Record<string, { base: string; model: string }> = {
  gemini: { base: "https://generativelanguage.googleapis.com/v1beta/openai/", model: "gemini-flash-latest" },
  anthropic: { base: "https://api.anthropic.com/v1/", model: "claude-haiku-4-5" },
  deepseek: { base: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  kimi: { base: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
  openrouter: { base: "https://openrouter.ai/api/v1", model: "google/gemini-2.0-flash-exp:free" },
  opencode: { base: "https://opencode.ai/zen/v1", model: "mimo-v2.5-free" },
};

function envBaseModel() {
  return {
    base: process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: process.env.AI_MODEL || "gemini-flash-latest",
  };
}

type DbKeyRow = { api_key: string; base_url: string | null; model: string | null };

/** Key từ bảng ai_keys (active). Chịu lỗi mềm nếu bảng/ cột chưa có. */
async function dbRows(): Promise<DbKeyRow[]> {
  try {
    const sb = createSupabaseAdminClient();
    const { data, error } = await sb
      .from("ai_keys")
      .select("api_key,base_url,model")
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as DbKeyRow[];
  } catch {
    return [];
  }
}

/** Danh sách provider thử lần lượt: mỗi key tự mang base+model (DB trước, rồi env). */
async function loadProviders(): Promise<Provider[]> {
  const env = envBaseModel();

  const dbProvs: Provider[] = (await dbRows()).map((r) => ({
    baseUrl: r.base_url || env.base,
    apiKey: r.api_key,
    model: r.model || env.model,
  }));

  const envRaw = process.env.AI_API_KEYS || process.env.AI_API_KEY || "";
  const envProvs: Provider[] = envRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((apiKey) => ({ baseUrl: env.base, apiKey, model: env.model }));

  // Gộp, bỏ trùng theo apiKey (DB ưu tiên).
  const seen = new Set<string>();
  const list: Provider[] = [];
  for (const p of [...dbProvs, ...envProvs]) {
    if (seen.has(p.apiKey)) continue;
    seen.add(p.apiKey);
    list.push(p);
  }

  // Nhà cung cấp dự phòng cuối (env AI_FALLBACK_*).
  const fbBase = process.env.AI_FALLBACK_BASE_URL;
  const fbKey = process.env.AI_FALLBACK_KEY;
  const fbModel = process.env.AI_FALLBACK_MODEL;
  if (fbBase && fbKey && fbModel) {
    list.push({ baseUrl: fbBase, apiKey: fbKey, model: fbModel });
  }
  return list;
}

// ---- Quản lý key (cho bot/admin) ----
export type AiKeyRow = {
  id: number;
  label: string | null;
  active: boolean;
  masked: string;
  model: string;
};

function mask(k: string): string {
  return k.length <= 6 ? "••••" : `••••${k.slice(-4)}`;
}

export async function listKeys(): Promise<AiKeyRow[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("ai_keys")
    .select("id,api_key,label,active,model")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const env = envBaseModel();
  return data.map((r) => ({
    id: r.id as number,
    label: (r.label as string) ?? null,
    active: r.active as boolean,
    masked: mask(r.api_key as string),
    model: (r.model as string) || env.model,
  }));
}

export async function addKey(
  apiKey: string,
  opts: { label?: string; baseUrl?: string; model?: string } = {},
): Promise<number | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("ai_keys")
    .insert({
      api_key: apiKey.trim(),
      label: opts.label || null,
      base_url: opts.baseUrl || null,
      model: opts.model || null,
    })
    .select("id")
    .single();
  return (data?.id as number) ?? null;
}

export async function deleteKey(id: number): Promise<void> {
  const sb = createSupabaseAdminClient();
  await sb.from("ai_keys").delete().eq("id", id);
}

/** Bỏ phần "suy nghĩ" của model reasoning (nếu lọt vào content). */
export function stripThinking(s: string): string {
  return s
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();
}

/**
 * Gọi chat completion, tự xoay vòng qua các key/provider tới khi có kết quả.
 * Ném lỗi nếu tất cả đều fail.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: { maxTokens?: number } = {},
): Promise<string> {
  const provs = await loadProviders();
  if (provs.length === 0) {
    throw new Error("Chưa có AI key nào (thêm bằng /key add hoặc env AI_API_KEYS).");
  }
  const maxTokens = opts.maxTokens ?? 1000;
  let lastErr = "";

  for (let i = 0; i < provs.length; i++) {
    const p = provs[i];
    try {
      const res = await fetch(`${trimSlash(p.baseUrl)}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({ model: p.model, max_tokens: maxTokens, messages }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        lastErr = json.error?.message || res.statusText;
        // 429/quota/balance/ bất kỳ lỗi nào → thử key/provider kế tiếp.
        continue;
      }
      const content: string = json.choices?.[0]?.message?.content || "";
      const text = stripThinking(content);
      if (text) return text;
      lastErr = "model trả về rỗng";
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`AI lỗi (đã thử ${provs.length} key): ${lastErr}`);
}
