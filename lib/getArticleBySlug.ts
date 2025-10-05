import { supabase } from "@/utils/supabase/server";

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      id, title, abstract, tags, views, likes, file_url, watermarked_pdf_url, created_at,
      profiles (
        full_name,
        username,
        avatar_url,
        bio,
        profession,
        id
      )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.log("Error fetching article by slug:", error.message);
    return null;
  }

  return data;
}
