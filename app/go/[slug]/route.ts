import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Chuyển hướng affiliate có đếm click: /go/[slug] → tăng lượt quan tâm → redirect Shopee.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const sb = createSupabaseAdminClient();

  const { data } = await sb
    .from("products")
    .select("affiliate_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data?.affiliate_url) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Tăng click (không chặn redirect nếu lỗi)
  await sb.rpc("increment_clicks", { p_slug: slug }).then(
    () => {},
    () => {},
  );

  return NextResponse.redirect(data.affiliate_url);
}
