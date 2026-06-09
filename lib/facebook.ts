/**
 * Đăng bài lên Facebook Page qua Graph API.
 * Cần FB_PAGE_ID + FB_PAGE_ACCESS_TOKEN (token dài hạn của page bạn là admin).
 *
 * Ưu tiên media để bài "uy tín" hơn:
 *   1. Có VIDEO  → đăng video (hút nhất trên fanpage).
 *   2. Nhiều ẢNH → đăng album.
 *   3. 1 ảnh     → đăng ảnh đơn.
 *   4. Không có  → đăng chữ.
 * (Graph API không cho 1 post feed vừa video vừa album → chọn video làm chính.)
 *
 * Link affiliate để NGAY TRONG bài (vẫn click được) — không cần quyền comment.
 */
const GRAPH = (path: string) =>
  `https://graph.facebook.com/${process.env.FB_GRAPH_VERSION || "v21.0"}/${path}`;

function requireEnv() {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    throw new Error("Thiếu FB_PAGE_ID hoặc FB_PAGE_ACCESS_TOKEN trong .env.local.");
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

/** Đăng album nhiều ảnh: upload từng ảnh (chưa publish) rồi gộp vào 1 bài feed. */
async function postAlbum(
  pageId: string,
  token: string,
  images: string[],
  message: string,
): Promise<string> {
  const mediaFbids: string[] = [];
  for (const url of images.slice(0, 10)) {
    try {
      const r = await fbPost(`${pageId}/photos`, {
        url,
        published: "false",
        access_token: token,
      });
      if (r.id) mediaFbids.push(r.id);
    } catch {
      // bỏ ảnh lỗi, tiếp tục
    }
  }
  if (mediaFbids.length === 0) throw new Error("Không upload được ảnh nào");

  const params: Record<string, string> = { message, access_token: token };
  mediaFbids.forEach((id, i) => {
    params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id });
  });
  const r = await fbPost(`${pageId}/feed`, params);
  return r.id;
}

export async function publishToFacebook(opts: {
  caption: string;
  imageUrl?: string | null;
  images?: string[] | null;
  videoUrl?: string | null;
  affiliateUrl?: string | null;
}): Promise<{ fbPostId: string }> {
  const { pageId, token } = requireEnv();

  const fullCaption = opts.affiliateUrl
    ? `${opts.caption}\n\n🛒 Mua ngay: ${opts.affiliateUrl}`
    : opts.caption;

  // Gom danh sách ảnh (ưu tiên images[]; fallback imageUrl).
  const imgs =
    opts.images && opts.images.length
      ? opts.images
      : opts.imageUrl
        ? [opts.imageUrl]
        : [];

  // 1) Video làm chính nếu có.
  if (opts.videoUrl) {
    try {
      const r = await fbPost(`${pageId}/videos`, {
        file_url: opts.videoUrl,
        description: fullCaption,
        access_token: token,
      });
      return { fbPostId: r.id };
    } catch {
      // video lỗi (format/CDN) → rớt xuống đăng ảnh
    }
  }

  // 2) Album nhiều ảnh.
  if (imgs.length > 1) {
    try {
      return { fbPostId: await postAlbum(pageId, token, imgs, fullCaption) };
    } catch {
      // rớt xuống ảnh đơn
    }
  }

  // 3) Ảnh đơn.
  if (imgs.length === 1) {
    const r = await fbPost(`${pageId}/photos`, {
      url: imgs[0],
      caption: fullCaption,
      access_token: token,
    });
    return { fbPostId: r.post_id || r.id };
  }

  // 4) Chỉ chữ.
  const r = await fbPost(`${pageId}/feed`, {
    message: fullCaption,
    access_token: token,
  });
  return { fbPostId: r.id };
}
