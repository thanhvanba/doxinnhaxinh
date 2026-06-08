/**
 * Đăng bài lên Facebook Page qua Graph API.
 * Cần FB_PAGE_ID + FB_PAGE_ACCESS_TOKEN (token dài hạn của page bạn là admin).
 *
 * Link affiliate để NGAY TRONG bài (vẫn click được) — không cần quyền
 * pages_manage_engagement (comment dưới tên Page). Vẫn thử comment thêm
 * nếu có quyền, nhưng không bắt buộc.
 */
const GRAPH = (path: string) =>
  `https://graph.facebook.com/${process.env.FB_GRAPH_VERSION || "v21.0"}/${path}`;

function requireEnv() {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    throw new Error(
      "Thiếu FB_PAGE_ID hoặc FB_PAGE_ACCESS_TOKEN trong .env.local.",
    );
  }
  return { pageId, token };
}

async function fbPost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  const res = await fetch(GRAPH(path), { method: "POST", body });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Facebook lỗi: ${json.error?.message || res.statusText}`);
  }
  return json as { id: string; post_id?: string };
}

export async function publishToFacebook(opts: {
  caption: string;
  imageUrl?: string | null;
  affiliateUrl?: string | null;
}): Promise<{ fbPostId: string }> {
  const { pageId, token } = requireEnv();

  // Gắn link affiliate vào cuối caption (clickable, không cần quyền comment).
  const fullCaption = opts.affiliateUrl
    ? `${opts.caption}\n\n🛒 Mua ngay: ${opts.affiliateUrl}`
    : opts.caption;

  let fbPostId: string;

  if (opts.imageUrl) {
    const r = await fbPost(`${pageId}/photos`, {
      url: opts.imageUrl,
      caption: fullCaption,
      access_token: token,
    });
    fbPostId = r.post_id || r.id;
  } else {
    const r = await fbPost(`${pageId}/feed`, {
      message: fullCaption,
      access_token: token,
    });
    fbPostId = r.id;
  }

  return { fbPostId };
}
