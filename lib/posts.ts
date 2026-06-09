import { createSupabaseAdminClient } from "./supabase/admin";

export type Post = {
  id: string;
  created_at: string;
  product_id: string | null;
  caption: string | null;
  image_url: string | null;
  images: string[] | null;
  video_url: string | null;
  affiliate_url: string | null;
  status: string;
  fb_post_id: string | null;
  error: string | null;
  published_at: string | null;
  product?: { name: string; slug: string } | null;
};

const COLS =
  "id,created_at,product_id,caption,image_url,images,video_url,affiliate_url,status,fb_post_id,error,published_at,product:products(name,slug)";

export async function adminGetPosts(): Promise<Post[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("posts")
    .select(COLS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

export async function adminGetPost(id: string): Promise<Post | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("posts")
    .select(COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Post) ?? null;
}
