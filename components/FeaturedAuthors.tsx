import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import React from "react";
import styles from "../styles/FeaturedAuthors.module.css";
import AuthorCard from "./AuthorCard";
import Link from "next/link";

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

  // Fetch featured authors with article count
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

  // Fetch article counts and reads for each author
  const authorsWithStats = await Promise.all(
    (authors || []).map(async (author) => {
      const { count: articleCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", author.id)
        .eq("published", true);

      const { data: articles } = await supabase
        .from("articles")
        .select("views")
        .eq("author_id", author.id)
        .eq("published", true);

      const totalReads = articles?.reduce((sum, article) => sum + (article.views || 0), 0) || 0;

      return {
        ...author,
        articleCount: articleCount || 0,
        totalReads,
      };
    })
  );

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
          {authorsWithStats?.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </div>
    </div>
  );
}