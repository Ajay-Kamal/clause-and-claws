"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { adminFetch } from "@/utils/adminFetch";
import Link from "next/link";
import styles from "../../../styles/PaymentsPage.module.css";

export default function PaymentsPage() {
  const supabase = createSupabaseBrowserClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => { 
    fetchPayments(); 
  }, []);

  async function fetchPayments() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("id, title, utr_number, created_at, profiles(username,email), author_id")
      .eq("approved", true)
      .eq("payment_submitted", true)
      .eq("payment_done", false)
      .eq("published", false)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  function openConfirm(title: string, message: string, confirmLabel: string, action: () => Promise<void>) {
    setModalConfig({ title, message, confirmLabel, action });
    setModalOpen(true);
  }

  async function runAction() {
    setWaiting(true);
    try {
      await modalConfig.action();
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      alert("Action failed: " + (err as any)?.message || "unknown");
    } finally { 
      setWaiting(false); 
    }
  }

  async function verifyAndPublish(id: string) {
    const res = await adminFetch(`/api/admin/articles/${id}/verify-and-publish`, { 
      method: "POST" 
    });
    if (res?.error) throw new Error(res.error);
    alert("Payment verified & published; email sent.");
  }

  async function rejectPayment(id: string) {
    const reason = prompt("Enter payment rejection reason (optional):") || "";
    const res = await adminFetch(`/api/admin/articles/${id}/reject-payment`, { 
      method: "POST", 
      body: { reason } 
    });
    if (res?.error) throw new Error(res.error);
    alert("Payment rejected and author notified.");
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
      <ConfirmModal 
        open={modalOpen} 
        title={modalConfig?.title} 
        message={modalConfig?.message} 
        confirmLabel={modalConfig?.confirmLabel} 
        loading={waiting} 
        onConfirm={runAction} 
        onClose={() => setModalOpen(false)} 
      />
      
      <h1 className={styles.pageTitle}>Payment Submitted — Verify</h1>
      
      {articles.length === 0 ? (
        <p className={styles.emptyState}>No payments submitted.</p>
      ) : (
        <div className={styles.articlesList}>
          {articles.map(a => (
            <div key={a.id} className={styles.articleCard}>
              <div className={styles.articleInfo}>
                <h3 className={styles.articleTitle}>
                  <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                </h3>
                <p className={styles.articleMeta}>
                  Author: {a.profiles?.username}
                </p>
                <div className={styles.utrContainer}>
                  UTR: <span className={styles.utrNumber}>{a.utr_number}</span>
                </div>
              </div>
              
              <div className={styles.buttonContainer}>
                <button 
                  onClick={() => openConfirm(
                    "Verify payment & publish?", 
                    `Verify payment for "${a.title}" (UTR: ${a.utr_number}) and publish the article.`, 
                    "Verify & Publish", 
                    async () => await verifyAndPublish(a.id)
                  )} 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Verify & Publish
                </button>
                
                <button 
                  onClick={() => openConfirm(
                    "Reject payment?", 
                    `Reject payment for "${a.title}". This will notify the author to resubmit UTR.`, 
                    "Reject Payment", 
                    async () => await rejectPayment(a.id)
                  )} 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Reject Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}