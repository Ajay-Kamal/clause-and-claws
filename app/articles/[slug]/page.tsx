// In your article/[slug]/page.tsx SERVER COMPONENT

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ArticleClient from "./ArticleClient"; // Your client component

export default async function ArticlePage({ params }: any) {
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

  // ✅ FIXED QUERY: Remove the !inner and the .eq filter on coauthors
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
      accepted_coauthors:article_coauthors(
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
    .eq("published", true)
    .eq("article_coauthors.accepted", true) // Filter coauthors, not articles
    .single();

  console.log("Fetched article:", article, "Error:", error);

  if (error || !article) {
    console.error("Article fetch error:", error);
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#F5F1E8",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "600px" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#1E3A5F",
            }}
          >
            Article Not Found
          </h1>
          <p style={{ color: "#6B7280", marginBottom: "2rem" }}>
            The article you're looking for doesn't exist or has been removed.
          </p>
          
           <a href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#1E3A5F",
              color: "#FFFFFF",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return <ArticleClient article={article} />;
}