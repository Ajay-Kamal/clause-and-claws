"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import styles from "../../../styles/RejectedPage.module.css";

export default function RejectedPage() {
  const supabase = createSupabaseBrowserClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejected();
  }, []);

  async function fetchRejected() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select(
        "id, title, rejection_reason, created_at, file_url, thumbnail_url, profiles(username,email)"
      )
      .neq("rejection_reason", null)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  async function handleDelete(article: any) {
    const confirmDelete = confirm(
      `Are you sure you want to delete the article "${article.title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const bucketName = "articles";
    const filesToDelete: string[] = [];

    // Helper: convert full public URL → relative path
    function extractPath(fullUrl: string | null) {
      if (!fullUrl) return null;
      try {
        const url = new URL(fullUrl);
        const idx = url.pathname.indexOf(`${bucketName}/`);
        if (idx !== -1) {
          return url.pathname.substring(idx + bucketName.length + 1); // relative path
        }
        return null;
      } catch {
        return null;
      }
    }

    // Original PDF
    const originalPath = extractPath(article.file_url);
    if (originalPath) {
      filesToDelete.push(originalPath);

      // Watermarked PDF (same filename, in watermarked/)
      const filename = originalPath.split("/").pop();
      if (filename) filesToDelete.push(`watermarked/${filename}`);
    }

    // Thumbnail (skip default)
    const thumbPath = extractPath(article.thumbnail_url);
    if (thumbPath && !thumbPath.includes("default thumbnail.webp")) {
      filesToDelete.push(thumbPath);
    }

    try {
      if (filesToDelete.length > 0) {
        console.log("Deleting from storage:", filesToDelete);
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);
        if (storageError) throw storageError;
      }

      const { error: dbError } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);
      if (dbError) throw dbError;

      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      alert("Article + files deleted ✅");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting article ❌");
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Rejected Articles</h1>

      {articles.length === 0 ? (
        <p className={styles.emptyState}>No rejected articles.</p>
      ) : (
        <div className={styles.articlesList}>
          {articles.map((a) => (
            <div key={a.id} className={styles.articleCard}>
              <div className={styles.articleHeader}>
                <div className={styles.articleInfo}>
                  <h3 className={styles.articleTitle}>{a.title}</h3>
                  <p className={styles.articleMeta}>{a.profiles?.username}</p>
                </div>
                <div className={styles.deleteButtonContainer}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(a)}
                  >
                    <svg className={styles.deleteIcon} viewBox="0 0 20 20">
                      <path
                        d="M6 6l8 8M6 14L14 6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>

              <div className={styles.rejectionContainer}>
                <div className={styles.rejectionLabel}>Rejection Reason :</div>
                <p className={styles.rejectionReason}>{a.rejection_reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
