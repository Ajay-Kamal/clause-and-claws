"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import { adminFetch } from "@/utils/adminFetch";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import Link from "next/link";
import styles from "../../styles/PendingPage.module.css";

export default function PendingPage() {
  const supabase = createSupabaseBrowserClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Appearance State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchPending(); }, []);

  async function fetchPending() {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, tags, slug, created_at, author_id, profiles(username, email)")
      .eq("approved", false)
      .is("rejection_reason", null)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  function openConfirm(title: string, message: string, confirmLabel: string, action: () => Promise<void>) {
    setModalConfig({ title, message, confirmLabel, action });
    setModalOpen(true);
  }

  async function runAction() {
    setActionLoading(true);
    try {
      await modalConfig.action();
      setModalOpen(false);
      fetchPending();
    } catch (err) {
      alert("Action failed: " + (err as any)?.message || "unknown");
      console.log(err);
    } finally { 
      setActionLoading(false); 
    }
  }

  async function approve(id: string) {
    const res = await adminFetch(`/api/admin/articles/${id}/approve`, { method: "POST" });
    if (res?.error) throw new Error(res.error);
    alert("Approved and approval email sent.");
  }

  async function reject(id: string) {
    const reason = prompt("Enter rejection reason (min 10 chars):") || "";
    if (reason.trim().length < 10) return alert("Reason too short");
    const res = await adminFetch(`/api/admin/articles/${id}/reject`, { 
      method: "POST", 
      body: { rejection_reason: reason } 
    });
    if (res?.error) throw new Error(res.error);
    alert("Rejected and email sent.");
  }

  async function resend(id: string) {
    const res = await adminFetch(`/api/admin/articles/${id}/resend-approval`, { method: "POST" });
    if (res?.error) throw new Error(res.error);
    alert("Approval link resent.");
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading pending articles...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ConfirmModal 
        open={modalOpen} 
        title={modalConfig?.title} 
        message={modalConfig?.message} 
        confirmLabel={modalConfig?.confirmLabel} 
        loading={actionLoading} 
        onConfirm={runAction} 
        onClose={() => setModalOpen(false)} 
      />
      
      <h1 className={styles.pageTitle}>Pending Articles</h1>
      
      {articles.length === 0 ? (
        <p className={styles.emptyState}>No pending articles.</p>
      ) : (
        <div className={styles.articlesList}>
          {articles.map((a) => (
            <div key={a.id} className={styles.articleCard}>
              <div className={styles.articleInfo}>
                <h2 className={styles.articleTitle}>
                  <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                </h2>
                <p className={styles.articleMeta}>
                  Author: {a.profiles?.username ?? a.author_id} • {new Date(a.created_at).toLocaleString()}
                </p>
                <p className={styles.articleTags}>
                  Tags: {a.tags?.join(", ") || "—"}
                </p>
                <div><b>Token :</b><i>{a.slug}</i></div>
              </div>

              <div className={styles.buttonContainer}>
                <button 
                  onClick={() => openConfirm(
                    "Approve article?", 
                    `Approve "${a.title}" and send approval email with UTR link and QR to the author.`, 
                    "Approve & Send", 
                    async () => await approve(a.id)
                  )} 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Approve
                </button>

                <button 
                  onClick={() => openConfirm(
                    "Reject article?", 
                    `Reject "${a.title}". This will send an email with the reason and the record will remain rejected.`, 
                    "Reject", 
                    async () => await reject(a.id)
                  )} 
                  className={`${styles.button} ${styles.buttonDanger}`}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}