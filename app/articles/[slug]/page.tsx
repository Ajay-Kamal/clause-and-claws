// In your article/[slug]/page.tsx SERVER COMPONENT
// This is where you fetch the article data before passing to ArticleClient

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ArticleClient from "./ArticleClient"; // Your client component

export default async function ArticlePage({ params }: any ) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // ✅ UPDATED QUERY: Fetch article with ONLY accepted co-authors
  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      *,
      profiles!author_id(
        id,
        username,
        full_name,
        avatar_url,
        bio,
        profession
      ),
      accepted_coauthors:article_coauthors!inner(
        coauthor:profiles!coauthor_id(
          id,
          username,
          full_name,
          avatar_url,
          bio,
          profession
        )
      )
    `)
    .eq("slug", slug)
    .eq("article_coauthors.accepted", true) // ✅ Only accepted co-authors
    .eq("published", true) // Only published articles
    .single();

  if (error || !article) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "2rem"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Article Not Found
          </h1>
          <p style={{ color: "#6B7280" }}>
            The article you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return <ArticleClient article={article} />;
}