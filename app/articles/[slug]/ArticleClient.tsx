"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "../../../styles/ArticleSlugPage.module.css";
import { createBrowserClient } from "@supabase/ssr";

const FileViewer = dynamic(() => import("@/components/FileViewer"), {
  ssr: false,
  loading: () => (
    <div
      className={styles.fileViewerLoading}
      style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}
    >
      <div style={{ textAlign: "center" }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 50 50"
          style={{ display: "block", margin: "0 auto 16px" }}
          aria-hidden="true"
        >
          <circle cx="25" cy="25" r="20" stroke="#d1d5db" strokeWidth="4" fill="none" />
          <path
            d="M45 25a20 20 0 0 1-20 20"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <p style={{ fontSize: 14, color: "#4b5563", margin: 0 }}>Loading document viewer...</p>
      </div>
    </div>
  ),
});

const renderTags = (tags: string[] | string | null) => {
  if (!tags) return [];
  const tagArray = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
    ? tags.split(",").map((tag) => tag.trim())
    : [];
  return tagArray.filter((tag) => tag.length > 0);
};

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Article {
  id: string;
  title: string;
  abstract?: string;
  tags?: string[] | null;
  views?: number;
  slug?: string;
  likes?: number;
  file_url?: string;
  watermarked_pdf_url?: string;
  thumbnail_url?: string;
  created_at: string;
  type?: string;
  profiles?: {
    id?: string | null;
    username?: string;
    full_name?: string;
    bio?: string;
    profession?: string;
    avatar_url?: string;
  } | null;
}

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export default function ArticleClient({ article }: { article: Article }) {
  const {
    id,
    title,
    abstract = "",
    tags = [],
    views = 0,
    likes = 0,
    watermarked_pdf_url,
    thumbnail_url,
    created_at,
    type,
    profiles,
  } = article;

  console.log("Article data in client:", article);
  
  const [likeCount, setLikeCount] = useState(likes);
  const [viewCount, setViewCount] = useState(views);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("article_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) setLiked(true);
    };

    checkLike();
  }, [id]);

  useEffect(() => {
    const registerView = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await supabase.rpc("register_article_view", {
          p_article_id: id,
          p_user_id: session?.user?.id ?? null,
        });
        setViewCount((prev) => prev + 1);
      } catch (err) {
        console.error("View insert error:", err);
      }
    };

    registerView();
  }, [id]);

  const handleLike = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      alert("Login required to like this article.");
      return;
    }

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("article_id", id)
        .eq("user_id", session.user.id);
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ article_id: id, user_id: session.user.id });
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: abstract,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const readingTime = "15 min read";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <article className={styles.articleWrapper}>
          {/* Type Badge */}
          <div className={styles.typeBadge}>{type}</div>

          {/* Title */}
          <h1 className={styles.mainTitle}>{title}</h1>

          {/* Author & Meta Info */}
          <div className={styles.authorMetaSection}>
            <div className={styles.authorInfoInline}>
              <Link
                href={`/authors/${profiles?.username ?? "unknown"}`}
                className={styles.authorAvatarLink}
              >
                <img
                  src={profiles?.avatar_url ?? "/default-avatar.png"}
                  alt={profiles?.full_name ?? "Author"}
                  className={styles.authorAvatarSmall}
                />
              </Link>
              <div className={styles.authorTextInfo}>
                <Link
                  href={`/authors/${profiles?.username ?? "unknown"}`}
                  className={styles.authorNameLink}
                >
                  {profiles?.full_name ?? "Unknown Author"}
                </Link>
                <div className={styles.authorProfession}>
                  {profiles?.profession ?? "Legal Professional"}
                </div>
              </div>
            </div>

            <div className={styles.metaInfoRow}>
              <span className={styles.publishedDate}>
                Published: {new Date(created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.readTime}>{readingTime}</span>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className={styles.statsActionsBar}>
            <div className={styles.statsGroup}>
              <div className={styles.statItem}>
                <EyeIcon />
                <span>{viewCount.toLocaleString()} reads</span>
              </div>
              <div
                className={`${styles.statItem} ${styles.clickable}`}
                onClick={handleLike}
              >
                <HeartIcon filled={liked} />
                <span>{likeCount.toLocaleString()}</span>
              </div>
            </div>

            <button className={styles.shareButton} onClick={handleShare}>
              <ShareIcon />
              <span>Share</span>
            </button>
          </div>

          {/* Hero Image */}
          {thumbnail_url && (
            <div className={styles.heroImageContainer}>
              <img
                src={thumbnail_url}
                alt={title}
                className={styles.heroImage}
              />
            </div>
          )}

          {/* Abstract */}
          {abstract && (
            <div className={styles.abstractBox}>
              <h2 className={styles.abstractHeading}>Abstract</h2>
              <p className={styles.abstractContent}>{abstract}</p>
            </div>
          )}

          {/* Tags */}
          {renderTags(tags).length > 0 && (
            <div className={styles.tagsSection}>
              {renderTags(tags).map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className={styles.tagPill}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* PDF Viewer */}
          {watermarked_pdf_url && (
            <div className={styles.pdfSection}>
              <h2 className={styles.sectionHeading}>Full Document</h2>
              <div className={styles.pdfViewerWrapper}>
                <FileViewer fileUrl={watermarked_pdf_url} title={title} backgroundColor="#f5f1e8"/>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}