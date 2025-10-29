// Home Page
import { getFeaturedArticles } from "../lib/getFeaturedArticles";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { redirect } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import "./globals.css";
import Welcome from "@/components/Welcome";
import styles from "../styles/HomePage.module.css";
import FeaturedAuthors from "@/components/FeaturedAuthors";

export default async function HomePage() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile?.username) {
      redirect("/onboarding/username");
    }
  }

  const articles = await getFeaturedArticles();

  const renderTags = (tags: string[] | string | null) => {
    if (!tags) return null;

    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim())
      : [];

    return tagArray.map((tag) => (
      <Link
        href={`/tags/${tag}`}
        key={tag}
        className="bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200"
      >
        #{tag}
      </Link>
    ));
  };

  return (
    <div className={styles.homePage}>
      <Welcome />

      <div className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h1 className={styles.sectionTitle}>Featured Publications</h1>
              <p>
                Peer-reviewed scholarship selected by our editorial board for
                exceptional research and quality and impact
              </p>
            </div>
            <Link href="/articles">View More</Link>
          </div>

          <div className={styles.articlesContainer}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {articles.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
                <h3 className={styles.emptyStateTitle}>No Featured Articles</h3>
                <p className={styles.emptyStateDescription}>
                  No featured articles available at the moment. Check back soon
                  for new legal insights and analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <FeaturedAuthors />
    </div>
  );
}
