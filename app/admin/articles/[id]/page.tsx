"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import ConfirmModal from "@/components/ConfirmModal";
import { adminFetch } from "@/utils/adminFetch";

export default function ArticleDetail() {
  const supabase = createSupabaseBrowserClient();
  const params = useParams();
  const id = (params as any)?.id;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchArticle() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*, profiles(username,email)")
      .eq("id", id)
      .maybeSingle();
    setArticle(data || null);
    setLoading(false);
  }

  function openConfirm(
    title: string,
    message: string,
    confirmLabel: string,
    action: () => Promise<void>
  ) {
    setModalConfig({ title, message, confirmLabel, action });
    setModalOpen(true);
  }
  async function runAction() {
    setActionLoading(true);
    try {
      await modalConfig.action();
      await fetchArticle();
      setModalOpen(false);
    } catch (err) {
      alert("Action failed: " + (err as any)?.message || "unknown");
    } finally {
      setActionLoading(false);
    }
  }

  async function approve() {
    const res = await adminFetch(`/api/admin/articles/${id}/approve`, {
      method: "POST",
    });
    if (res?.error) throw new Error(res.error);
    alert("Approved & email sent.");
  }

  async function reject() {
    const reason = prompt("Enter rejection reason (min 10 chars):") || "";
    if (reason.trim().length < 10) return alert("Reason too short");
    const res = await adminFetch(`/api/admin/articles/${id}/reject`, {
      method: "POST",
      body: { rejection_reason: reason },
    });
    if (res?.error) throw new Error(res.error);
    alert("Rejected & email sent.");
  }

  async function verifyPublish() {
    const res = await adminFetch(
      `/api/admin/articles/${id}/verify-and-publish`,
      {
        method: "POST",
      }
    );
    if (res?.error) throw new Error(res.error);
    alert("Verified & published.");
  }

  async function unpublish() {
    const res = await adminFetch(`/api/admin/articles/${id}/unpublish`, {
      method: "POST",
    });
    if (res?.error) throw new Error(res.error);
    alert("Unpublished.");
  }

  const styles: Record<string, React.CSSProperties> = {
    container: { padding: 16, maxWidth: 900, margin: "0 auto" },
    title: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#111827" },
    meta: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
    abstract: { marginTop: 16, lineHeight: 1.6, color: "#111827" },
    tags: { marginTop: 12, fontSize: 14, color: "#374151" },
    actions: { marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" },
    btnPrimary: {
      padding: "6px 12px",
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: 600,
    },
    btnDanger: {
      padding: "6px 12px",
      background: "#dc2626",
      color: "#ffffff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontWeight: 600,
    },
    btnOutline: {
      padding: "6px 12px",
      border: "1px solid #e5e7eb",
      borderRadius: 6,
      background: "transparent",
      cursor: "pointer",
    },
    link: {
      marginTop: 24,
      color: "#2563eb",
      fontSize: 14,
      textDecoration: "none",
    },
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!article) return <div style={{ padding: 16 }}>Article not found.</div>;

  return (
    <div style={styles.container}>
      <ConfirmModal
        open={modalOpen}
        title={modalConfig?.title}
        message={modalConfig?.message}
        confirmLabel={modalConfig?.confirmLabel}
        loading={actionLoading}
        onConfirm={runAction}
        onClose={() => setModalOpen(false)}
      />

      <h1 style={styles.title}>{article.title}</h1>
      <p style={styles.meta}>
        Author: {article.profiles?.username} •{" "}
        {new Date(article.created_at).toLocaleString()}
      </p>

      <p style={styles.abstract}>{article.abstract}</p>
      <p style={styles.tags}>Tags: {article.tags?.join(", ")}</p>

      <div style={styles.actions}>
        {!article.approved && article.rejection_reason == null && (
          <>
            <button
              onClick={() =>
                openConfirm(
                  "Approve article?",
                  "Approve and send approval email with UTR link.",
                  "Approve & Send",
                  async () => await approve()
                )
              }
              style={styles.btnPrimary}
            >
              Approve
            </button>

            <button
              onClick={() =>
                openConfirm(
                  "Reject article?",
                  "Reject the article and send rejection email.",
                  "Reject",
                  async () => await reject()
                )
              }
              style={styles.btnDanger}
            >
              Reject
            </button>
          </>
        )}

        {article.approved &&
          article.payment_submitted &&
          !article.payment_done && (
            <button
              onClick={() =>
                openConfirm(
                  "Verify & publish?",
                  "Verify payment and publish the article immediately.",
                  "Verify & Publish",
                  async () => await verifyPublish()
                )
              }
              style={styles.btnPrimary}
            >
              Verify & Publish
            </button>
          )}

        {article.published && (
          <button
            onClick={() =>
              openConfirm(
                "Unpublish?",
                "Unpublish this article.",
                "Unpublish",
                async () => await unpublish()
              )
            }
            style={styles.btnOutline}
          >
            Unpublish
          </button>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <a
          style={styles.link}
          href={article.file_url}
          target="_blank"
          rel="noreferrer"
        >
          Download file
        </a>
      </div>
    </div>
  );
}
