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
  citations?: number;
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
  accepted_coauthors?: Array<{
    coauthor: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string;
      profession?: string | null;
    };
  }>;
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

const QuoteIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
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
    citations = 0,
    watermarked_pdf_url,
    thumbnail_url,
    created_at,
    type,
    profiles,
  } = article;

  const [likeCount, setLikeCount] = useState(likes);
  const [viewCount, setViewCount] = useState(views);
  const [citationCount, setCitationCount] = useState(citations);
  const [liked, setLiked] = useState(false);
  const [hasCited, setHasCited] = useState(false);
  const [showCiteModal, setShowCiteModal] = useState(false);
  const [citationUrl, setCitationUrl] = useState("");
  const [citationTitle, setCitationTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const checkCitation = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("citations")
        .select("id")
        .eq("article_id", id)
        .eq("cited_by_user_id", session.user.id)
        .maybeSingle();

      if (data) setHasCited(true);
    };

    checkLike();
    checkCitation();
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

  const handleCiteClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      alert("Login required to cite this article.");
      return;
    }

    if (hasCited) {
      alert("You have already cited this article.");
      return;
    }

    setShowCiteModal(true);
  };

  const handleCiteSubmit = async () => {
    if (!citationUrl.trim()) {
      alert("Please enter a citation URL.");
      return;
    }

    // Basic URL validation
    try {
      new URL(citationUrl);
    } catch {
      alert("Please enter a valid URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert("Please login to cite this article.");
        return;
      }

      const { data, error } = await supabase
        .from("citations")
        .insert({
          article_id: id,
          cited_by_user_id: session.user.id,
          citation_url: citationUrl,
          citation_title: citationTitle || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          alert("You have already cited this article.");
        } else {
          throw error;
        }
        return;
      }

      // Success
      setCitationCount((prev) => prev + 1);
      setHasCited(true);
      setShowCiteModal(false);
      setCitationUrl("");
      setCitationTitle("");
      alert("Citation added successfully!");
    } catch (err) {
      console.error("Citation error:", err);
      alert("Failed to add citation. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <div className={styles.typeBadge}>{type}</div>
          <h1 className={styles.mainTitle}>{title}</h1>

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

          {article.accepted_coauthors && article.accepted_coauthors.length > 0 && (
            <div className={styles.coauthorsSection}>
              <h3 className={styles.coauthorsHeading}>Co-Authors</h3>
              <div className={styles.coauthorsList}>
                {article.accepted_coauthors.map((item: any) => {
                  const coauthor = item.coauthor;
                  return (
                    <Link
                      key={coauthor.id}
                      href={`/authors/${coauthor.username}`}
                      className={styles.coauthorCard}
                    >
                      <img
                        src={coauthor.avatar_url || "/default-avatar.png"}
                        alt={coauthor.full_name || coauthor.username}
                        className={styles.coauthorAvatar}
                      />
                      <div className={styles.coauthorInfo}>
                        <span className={styles.coauthorName}>
                          {coauthor.full_name || coauthor.username}
                        </span>
                        {coauthor.profession && (
                          <span className={styles.coauthorProfession}>
                            {coauthor.profession}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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
              <div className={styles.statItem}>
                <QuoteIcon />
                <span>{citationCount.toLocaleString()} citations</span>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button 
                className={`${styles.shareButton} ${hasCited ? styles.citedButton : ''}`}
                onClick={handleCiteClick}
                disabled={hasCited}
              >
                <QuoteIcon />
                <span>{hasCited ? "Cited" : "Cite"}</span>
              </button>
              <button className={styles.shareButton} onClick={handleShare}>
                <ShareIcon />
                <span>Share</span>
              </button>
            </div>
          </div>

          {thumbnail_url && (
            <div className={styles.heroImageContainer}>
              <img
                src={thumbnail_url}
                alt={title}
                className={styles.heroImage}
              />
            </div>
          )}

          {abstract && (
            <div className={styles.abstractBox}>
              <h2 className={styles.abstractHeading}>Abstract</h2>
              <p className={styles.abstractContent}>{abstract}</p>
            </div>
          )}

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

          {watermarked_pdf_url && (
            <div className={styles.pdfSection}>
              <h2 className={styles.sectionHeading}>Full Document</h2>
              {type === "Article" ? (
                <div className={styles.pdfViewerWrapper}>
                  <FileViewer fileUrl={watermarked_pdf_url} title={title} backgroundColor="#f5f1e8"/>
                </div>
              ) : (
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  paddingBottom: '141.4%',
                  height: 0,
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={watermarked_pdf_url}
                    title={title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </article>
      </div>

      {/* Citation Modal */}
      {showCiteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCiteModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cite This Article</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowCiteModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className={styles.citeForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Citation URL <span className={styles.required}>*</span>
                </label>
                <input
                  type="url"
                  className={styles.formInput}
                  placeholder="https://example.com/your-article"
                  value={citationUrl}
                  onChange={(e) => setCitationUrl(e.target.value)}
                />
                <p className={styles.formHint}>
                  Enter the URL where you cited this article (your published article or website)
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Title (Optional)
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Title of your work"
                  value={citationTitle}
                  onChange={(e) => setCitationTitle(e.target.value)}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCiteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleCiteSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Citation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}