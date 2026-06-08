import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase dùng cho Server Components / Route Handlers (đọc dữ liệu công khai).
 * Dùng anon key — RLS đảm bảo chỉ thấy sản phẩm status='published'.
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local",
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
