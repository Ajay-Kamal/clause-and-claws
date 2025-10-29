"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../../styles/Drafts.module.css";
import { Article } from "@/types";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Drafts() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [drafts, setDrafts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchDrafts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        setUser(user);

        // Fetch all drafts for current user
        const { data, error } = await supabase
          .from("articles")
          .select("*, profiles(username, full_name, avatar_url)")
          .eq("author_id", user.id)
          .eq("draft", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setDrafts((data as Article[]) || []);
      } catch (error) {
        console.error("Error fetching drafts:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchDrafts();
  }, [router]);

  const handleEdit = (slug: string) => {
    router.push(`/edit-draft/${slug}`);
  };

  const handleDelete = async (id: string, fileUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    setDeleting(id);
    try {
      // Delete from database
      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) throw error;

      // Delete file from storage if exists
      if (fileUrl) {
        const fileName = fileUrl.split("/").pop();
        if (fileName) {
          await supabase.storage.from("articles").remove([`articles/${fileName}`]);
        }
      }

      // Remove from UI
      setDrafts(drafts.filter((draft) => draft.id !== id));
      alert("Draft deleted successfully!");
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Failed to delete draft. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmitForReview = async (id: string, slug: string, fileUrl: string | null) => {
    if (!fileUrl) {
      alert("Please upload a PDF file before submitting for review.");
      return;
    }

    if (!confirm("Are you sure you want to submit this draft for review? You won't be able to edit it after submission.")) return;

    setSubmitting(id);
    try {
      // Add watermark
      const watermarkRes = await fetch("/api/watermark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: slug,
          pdfUrl: fileUrl,
          logoUrl: `${window.location.origin}/images/final-logo.png`,
        }),
      });

      const watermarkData = await watermarkRes.json();

      if (!watermarkData.success) {
        throw new Error("Failed to add watermark: " + watermarkData.error);
      }

      // Update article to not be draft
      const { error } = await supabase
        .from("articles")
        .update({
          draft: false,
          watermarked_pdf_url: watermarkData.watermarkedPdfUrl,
        })
        .eq("id", id);

      if (error) throw error;

      // Remove from drafts list
      setDrafts(drafts.filter((draft) => draft.id !== id));
      alert("Draft submitted successfully for review! Check your email frequently.");
    } catch (error) {
      console.error("Error submitting draft:", error);
      alert("Failed to submit draft. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your drafts...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.pageTitle}>My Drafts</h1>
          <p className={styles.pageSubtitle}>
            Continue working on your manuscripts or submit them for review
          </p>
        </div>
      </div>

      <div className={styles.draftsSection}>
        <div className={styles.draftsContent}>
          {drafts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <h2 className={styles.emptyTitle}>No drafts yet</h2>
              <p className={styles.emptyMessage}>
                Start writing your first manuscript and save it as a draft to continue later.
              </p>
              <button
                onClick={() => router.push("/upload")}
                className={styles.createButton}
              >
                Create New Article
              </button>
            </div>
          ) : (
            <div className={styles.draftsGrid}>
              {drafts.map((draft) => (
                <div key={draft.id} className={styles.draftCard}>
                  <div className={styles.draftThumbnail}>
                    <img
                      src={draft.thumbnail_url || "/images/default-thumbnail.webp"}
                      alt={draft.title}
                      className={styles.thumbnailImage}
                    />
                    <div className={styles.draftBadge}>DRAFT</div>
                  </div>

                  <div className={styles.draftContent}>
                    <div className={styles.draftHeader}>
                      <span className={styles.draftType}>{draft.type}</span>
                      <span className={styles.draftDate}>
                        {new Date(draft.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className={styles.draftTitle}>{draft.title}</h3>

                    {draft.abstract && (
                      <p className={styles.draftAbstract}>
                        {draft.abstract.length > 150
                          ? draft.abstract.substring(0, 150) + "..."
                          : draft.abstract}
                      </p>
                    )}

                    {draft.tags && draft.tags.length > 0 && (
                      <div className={styles.draftTags}>
                        {draft.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                        {draft.tags.length > 3 && (
                          <span className={styles.tagMore}>
                            +{draft.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.draftActions}>
                      <button
                        onClick={() => handleEdit(draft.slug)}
                        className={styles.editButton}
                        disabled={submitting === draft.id || deleting === draft.id}
                      >
                        <svg
                          className={styles.buttonIcon}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleSubmitForReview(draft.id, draft.slug, draft.file_url)
                        }
                        className={styles.submitButton}
                        disabled={
                          submitting === draft.id ||
                          deleting === draft.id ||
                          !draft.file_url
                        }
                      >
                        {submitting === draft.id ? (
                          "Submitting..."
                        ) : (
                          <>
                            <svg
                              className={styles.buttonIcon}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Submit
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(draft.id, draft.file_url)}
                        className={styles.deleteButton}
                        disabled={submitting === draft.id || deleting === draft.id}
                      >
                        {deleting === draft.id ? (
                          "Deleting..."
                        ) : (
                          <>
                            <svg
                              className={styles.buttonIcon}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}