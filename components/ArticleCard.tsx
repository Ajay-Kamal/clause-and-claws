"use client";

import Link from "next/link";
import styles from "../styles/ArticleCard.module.css";
import { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  showAuthor?: boolean;
  showReadButton?: boolean;
}

export default function ArticleCard({
  article,
  showAuthor = true,
  showReadButton = true,
}: ArticleCardProps) {
  // Calculate impact score: (Views × 2) + (Likes × 10)
  const calculateImpactScore = () => {
    const views = article.views || 0;
    const likes = article.likes || 0;
    const rawScore = (views * 2) + (likes * 10);
    
    // For normalization, we'll use a reasonable max value
    // Adjust this based on your typical article stats
    const maxPossibleScore = 5000; // e.g., 1000 views + 800 likes = 10000
    
    // Normalize to 1-10 scale (0 if no views/likes)
    if (rawScore === 0) return 0;
    
    const normalized = Math.min(10, 1 + (rawScore / maxPossibleScore) * 9);
    return parseFloat(normalized.toFixed(2));
  };

  const impactScore = calculateImpactScore();

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={
            article.thumbnail_url ||
            process.env.NEXT_PUBLIC_DEFAULT_THUMBNAIL_URL ||
            "/api/placeholder/400/240"
          }
          alt={article.title}
          className={styles.image}
        />

        <div className={styles.badges}>
          <span className={styles.featuredBadge}>{article.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>
          <Link href={`/articles/${article.slug}`} className={styles.titleLink}>
            {article.title ||
              "LAW JOURNAL: A Peer-Reviewed Journal for Legal Scholarship"}
          </Link>
        </h3>

        {/* Abstract/Description */}
        {article.abstract && (
          <p className={styles.abstract}>{article.abstract}</p>
        )}

        {/* Author and Date */}
        {showAuthor && (
          <div className={styles.authorSection}>
            <div className={styles.authorInfo}>
              <div className={styles.authorDetails}>
                <h4>{article.profiles?.full_name || "Anonymous"}</h4>
              </div>
            </div>

            <div className={styles.publishDate}>
              {article.created_at
                ? new Date(article.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "2 days ago"}
            </div>
          </div>
        )}

        <div className={styles.statistics}>
          <div>
            Reads <p>{article.views || 0}</p>
          </div>
          <div>
            Likes <p>{article.likes || 0}</p>
          </div>
          <div>
            Impact <p>{impactScore}</p>
          </div>
        </div>

        {/* Read Article Button */}
        {showReadButton && (
          <Link
            href={`/articles/${article.slug}`}
            className={styles.readButton}
          >
            Read Article
          </Link>
        )}
      </div>
    </div>
  );
}