import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import React from "react";
import styles from "../styles/FeaturedAuthors.module.css";
import AuthorCard from "./AuthorCard";
import Link from "next/link";

// Helper function to calculate impact score
const calculateImpactScore = (articleCount: number, views: number, likes: number): number => {
  return (articleCount * 50) + (views * 2) + (likes * 10);
};

// Helper function to normalize scores to 0-10 scale
const normalizeImpactScores = (authors: any[]) => {
  const authorsWithArticles = authors.filter(a => a.articleCount > 0);
  
  if (authorsWithArticles.length === 0) {
    return authors.map(a => ({ ...a, impactScore: 0 }));
  }
  
  // Find max and min raw scores
  const rawScores = authorsWithArticles.map(a => a.rawImpactScore);
  const maxScore = Math.max(...rawScores);
  const minScore = Math.min(...rawScores);
  
  return authors.map(author => {
    if (author.articleCount === 0) {
      return { ...author, impactScore: 0 };
    }
    
    // Scale from 1-10 for authors with articles
    if (maxScore === minScore) {
      return { ...author, impactScore: 10 };
    }
    
    const normalized = 1 + ((author.rawImpactScore - minScore) / (maxScore - minScore)) * 9;
    return { ...author, impactScore: parseFloat(normalized.toFixed(2)) };
  });
};

export default async function FeaturedAuthors() {
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

  // Fetch featured authors
  const { data: authors, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("featured", true)
    .order("full_name", { ascending: true })
    .limit(3);

  if (error) {
    console.error("Error fetching featured authors:", error);
    return null;
  }

  // ✅ UPDATED: Fetch article counts, views, AND likes for each author
  const authorsWithStats = await Promise.all(
    (authors || []).map(async (author) => {
      const { count: articleCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", author.id)
        .eq("published", true)
        .eq("approved", true);

      // ✅ UPDATED: Fetch both views and likes
      const { data: articles } = await supabase
        .from("articles")
        .select("views, likes")
        .eq("author_id", author.id)
        .eq("published", true)
        .eq("approved", true);

      const totalViews = articles?.reduce((sum, article) => sum + (article.views || 0), 0) || 0;
      const totalLikes = articles?.reduce((sum, article) => sum + (article.likes || 0), 0) || 0;

      // ✅ UPDATED: Calculate raw impact score
      const rawImpactScore = calculateImpactScore(articleCount || 0, totalViews, totalLikes);

      return {
        ...author,
        articleCount: articleCount || 0,
        totalViews,
        totalLikes,
        rawImpactScore,
      };
    })
  );

  // ✅ UPDATED: Normalize scores to 0-10 scale
  const authorsWithNormalizedScores = normalizeImpactScores(authorsWithStats);

  return (
   <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div> 
            <h1 className={styles.title}>Spotlight Authors</h1>
            <p className={styles.subtitle}>
              Leading scholars and practitioners shaping contemporary legal discourse
            </p>
          </div>
          <Link href="/authors" className={styles.viewAllBtn}>
            View More
          </Link>
        </header>
        <div className={styles.authors}>
          {authorsWithNormalizedScores?.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </div>
    </div>
  );
}