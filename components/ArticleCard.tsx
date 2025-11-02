"use client";

import Link from "next/link";
import styles from "../styles/ArticleCard.module.css";
import { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  showAuthor?: boolean;
  showReadButton?: boolean;
}

// const renderTags = (tags: string[] | string | null) => {
//   if (!tags) return [];

//   const tagArray = Array.isArray(tags)
//     ? tags
//     : typeof tags === "string"
//     ? tags.split(",").map((tag) => tag.trim())
//     : [];

//   return tagArray.filter((tag) => tag.length > 0);
// };

export default function ArticleCard({
  article,
  showAuthor = true,
  showReadButton = true,
}: ArticleCardProps) {
  // const allTags = renderTags(article.tags);

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

        {/* Bottom Stats Overlay */}
        {/* <div className={styles.stats}>
          <div className={styles.statsOverlay}>
            <div className={styles.statItem}>
              <img
                src="./images/eye-icon.svg"
                alt=""
                className={styles.statIcon}
              />
              <span>{article.views || 0}</span>
            </div>
          </div>
          <div className={styles.statsOverlay}>
            <div className={styles.statItem}>
              <img
                src="./images/heart-icon.svg"
                alt=""
                className={styles.statIcon}
              />
              <span>{article.likes || 0}</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Tags Section */}
        {/* {allTags.length > 0 && (
          <div className={styles.tagsSection}>
            <div className={styles.tagsContainer}>
              <div className={styles.tagsScrollable}>
                {allTags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tags/${tag}`}
                    className={styles.tagItem}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <div className={styles.fadeOverlay}></div>
            </div>
          </div>
        )} */}

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
            Reads <p>{article.views}</p>
          </div>
          <div>
            Likes <p>{article.likes}</p>
          </div>
          <div>
            Impact <p>100</p>
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
