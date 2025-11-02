"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import styles from "../../../styles/PublishedPage.module.css";

export default function PublishedPage() {
  const supabase = createSupabaseBrowserClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished(); 
  }, []);

  async function fetchPublished() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("id, title, created_at, profiles(username,email), slug, is_featured")
      .eq("published", true)
      .is("is_featured", false)
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  }

  async function featureArticle(id: string) {
    try {
      const { error: updateErr } = await supabase
        .from("articles")
        .update({ is_featured: true })
        .eq("id", id);

      if (updateErr) throw new Error(updateErr.message);
      
      // Refresh the list after featuring
      fetchPublished();
      alert("Article featured successfully!");
    } catch (error) {
      alert("Failed to feature article: " + (error as any)?.message);
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
      <h1 className={styles.pageTitle}>Published</h1>
      
      {articles.length === 0 ? (
        <p className={styles.emptyState}>No published articles.</p>
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
                <a 
                  href={`/articles/${a.slug ?? a.id}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`${styles.button} ${styles.viewButton}`}
                >
                  View
                </a>
                
                <button 
                  onClick={() => { 
                    if (confirm("Feature article?")) {
                      featureArticle(a.id);
                    }
                  }} 
                  className={`${styles.button} ${styles.featureButton}`}
                >
                  Feature Article
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}