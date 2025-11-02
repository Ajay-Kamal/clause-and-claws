import { supabase } from "@/utils/supabase/server";
import { Article } from "@/types/index";

export async function getFeaturedArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        tags,
        views,
        likes,
        is_featured,
        approved,
        abstract,
        author_id,
        type,
        thumbnail_url,
        created_at,
        profiles!inner(
          username,
          full_name,
          avatar_url
        )
      `
    )
    .eq("published", true)
    .eq("is_featured", true)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(3);  

  if (error || !data) {
    console.log("Supabase Error:", error);
    return [];
  }

  return data as unknown as Article[];
}
