import { createClient } from "@supabase/supabase-js";

/**
 * Client service-role — BỎ QUA RLS, dùng để GHI (tạo/sửa sản phẩm, đăng bài).
 * CHỈ ĐƯỢC dùng ở phía server (API routes, pipeline). Tuyệt đối không import vào client.
 */
export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseAdminClient chỉ được dùng ở server.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
