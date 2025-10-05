"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "../../../styles/ArticleSlugPage.module.css";
import { createBrowserClient } from "@supabase/ssr";

const FileViewer = dynamic(() => import("@/components/FileViewer"), {
  ssr: false,
  loading: () => (
    <div className={styles.fileViewerLoading}>
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Loading document viewer...</p>
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
  created_at: string;
  profiles?: {
    id?: string | null;
    username?: string;
    full_name?: string;
    bio?: string;
    profession?: string;
    avatar_url?: string;
  } | null;
}

const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

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
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "red" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
    created_at,
    profiles,
  } = article;

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

  const readingTime = "8 min read";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.articleLayout}>
          <main className={styles.mainContent}>
            <article className={styles.articleCard}>
              <header className={styles.articleHeader}>
                <h1 className={styles.articleTitle}>{title}</h1>
                <div className={styles.articleMeta}>
                  <div className={styles.metaLeft}>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorAvatar}>
                        <img
                          src={profiles?.avatar_url ?? "/default-avatar.png"}
                          alt="Author"
                        />
                      </div>
                      <div className={styles.authorDetails}>
                        <Link
                          href={`/authors/${profiles?.username ?? "unknown"}`}
                          className={styles.authorName}
                        >
                          {profiles?.full_name ?? "Unknown Author"}
                        </Link>
                        <div className={styles.authorMeta}>
                          <span className={styles.publishDate}>
                            {new Date(created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className={styles.metaSeparator}>•</span>
                          <span className={styles.readingTime}>
                            <ClockIcon />
                            {readingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.metaRight}>
                    <div className={styles.articleStats}>
                      <div className={styles.statItem}>
                        <EyeIcon />
                        <span>{viewCount.toLocaleString()}</span>
                      </div>
                      <div
                        className={styles.statItem}
                        onClick={handleLike}
                        style={{ cursor: "pointer" }}
                      >
                        <HeartIcon filled={liked} />
                        <span>{likeCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {abstract && (
                  <div className={styles.abstractSection}>
                    <h2 className={styles.abstractTitle}>Abstract</h2>
                    <p className={styles.abstractText}>{abstract}</p>
                  </div>
                )}
              </header>

              <div className={styles.articleContent}>
                <div className={styles.contentGrid}>
                  <div className={styles.mainColumn}>
                    {watermarked_pdf_url && (
                      <section className={styles.fileSection}>
                        <h2 className={styles.sectionTitle}>Full Document</h2>
                        <div className={styles.fileViewer}>
                          <FileViewer
                            fileUrl={watermarked_pdf_url}
                            title={title}
                          />
                        </div>
                      </section>
                    )}
                  </div>
                  <aside className={styles.sidebar}>
                    <div className={styles.authorCard}>
                      <h3>About the Author</h3>
                      <div className={styles.authorProfile}>
                        <div className={styles.authorAvatarLarge}>
                          {profiles?.full_name?.charAt(0) ?? "?"}
                        </div>
                        <div className={styles.authorBio}>
                          <Link
                            href={`/authors/${profiles?.username ?? "unknown"}`}
                            className={styles.authorNameLarge}
                          >
                            {profiles?.full_name ?? "Unknown Author"}
                          </Link>
                          <p>
                            {profiles?.bio ?? "Experienced legal professional."}
                          </p>
                          {profiles?.profession && <p>{profiles.profession}</p>}
                        </div>
                      </div>
                    </div>

                    {renderTags(tags).length > 0 && (
                      <div className={styles.tagsCard}>
                        <h3>Related Topics</h3>
                        <div className={styles.tagsList}>
                          {renderTags(tags).map((tag) => (
                            <Link
                              key={tag}
                              href={`/tags/${tag}`}
                              className={styles.tag}
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.citationCard}>
                      <h3>How to Cite</h3>
                      <p>
                        {profiles?.full_name ?? "Unknown Author"}. "{title}."{" "}
                        <em>LegalHub</em>, {new Date(created_at).getFullYear()}.
                      </p>
                      <button className={styles.copyButton}>
                        Copy Citation
                      </button>
                    </div>
                  </aside>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}