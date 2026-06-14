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

/** Key từ bảng ai_keys (active). Chịu lỗi mềm nếu bảng chưa có. */
async function dbKeys(): Promise<string[]> {
  try {
    const sb = createSupabaseAdminClient();
    const { data, error } = await sb
      .from("ai_keys")
      .select("api_key")
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => r.api_key).filter(Boolean);
  } catch {
    return [];
  }
}

/** Danh sách (baseUrl, key, model) sẽ thử lần lượt: key DB trước, rồi env. */
async function loadProviders(): Promise<Provider[]> {
  const base =
    process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  const model = process.env.AI_MODEL || "gemini-flash-latest";

  const envRaw = process.env.AI_API_KEYS || process.env.AI_API_KEY || "";
  const envKeys = envRaw.split(",").map((s) => s.trim()).filter(Boolean);

  // Key DB ưu tiên trước, gộp env, bỏ trùng.
  const all = [...(await dbKeys()), ...envKeys];
  const uniq = [...new Set(all)];
  const list: Provider[] = uniq.map((apiKey) => ({ baseUrl: base, apiKey, model }));

  // Nhà cung cấp dự phòng (khác provider) khi hết sạch key chính.
  const fbBase = process.env.AI_FALLBACK_BASE_URL;
  const fbKey = process.env.AI_FALLBACK_KEY;
  const fbModel = process.env.AI_FALLBACK_MODEL;
  if (fbBase && fbKey && fbModel) {
    list.push({ baseUrl: fbBase, apiKey: fbKey, model: fbModel });
  }
  return list;
}

// ---- Quản lý key (cho bot/admin) ----
export type AiKeyRow = { id: number; label: string | null; active: boolean; masked: string };

function mask(k: string): string {
  return k.length <= 6 ? "••••" : `••••${k.slice(-4)}`;
}

export async function listKeys(): Promise<AiKeyRow[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("ai_keys")
    .select("id,api_key,label,active")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as number,
    label: (r.label as string) ?? null,
    active: r.active as boolean,
    masked: mask(r.api_key as string),
  }));
}

export async function addKey(apiKey: string, label?: string): Promise<number | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("ai_keys")
    .insert({ api_key: apiKey.trim(), label: label || null })
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
