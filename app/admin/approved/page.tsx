"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import { adminFetch } from "@/utils/adminFetch";
import styles from "../../../styles/ApprovedPage.module.css";

export default function ApprovedPage() {
  const supabase = createSupabaseBrowserClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchApproved(); 
  }, []);

  async function fetchApproved() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("id, title, created_at, slug, profiles(username,email)")
      .eq("approved", true)
      .eq("payment_submitted", false)
      .eq("published", false)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  async function resend(id: string) {
    const res = await adminFetch(`/api/admin/articles/${id}/resend-approval`, { 
      method: "POST" 
    });
    if (res?.error) return alert("Resend failed: " + res.error);
    alert("Approval link resent.");
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
      <h1 className={styles.pageTitle}>Approved — Awaiting UTR</h1>
      
      {articles.length === 0 ? (
        <p className={styles.emptyState}>No approved articles waiting for UTR.</p>
      ) : (
        <div className={styles.articlesList}>
          {articles.map(a => (
            <div key={a.id} className={styles.articleCard}>
              <div className={styles.articleInfo}>
                <h3 className={styles.articleTitle}>{a.title}</h3>
                <p className={styles.articleMeta}>
                  Author: {a.profiles?.username}
                </p>
              </div>
              
              <div className={styles.buttonContainer}>
                <button 
                  onClick={() => resend(a.id)} 
                  className={styles.resendButton}
                >
                  Resend Approval Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}