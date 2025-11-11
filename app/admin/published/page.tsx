"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { adminFetch } from "@/utils/adminFetch";
import styles from "../../../styles/PublishedPage.module.css";
import type { Article } from "@/types";

type PublishedArticle = Pick<Article, 'id' | 'title' | 'type' | 'created_at' | 'slug' | 'is_featured'> & {
  profiles: {
    username: string;
    email?: string;
  };
};

export default function PublishedPage() {
  const [articles, setArticles] = useState<PublishedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished(); 
  }, []);

  async function fetchPublished() {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, type, created_at, profiles(username, email), slug, is_featured")
      .eq("published", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } else {
      setArticles((data as PublishedArticle[]) || []);
    }
    setLoading(false);
  }

  async function toggleFeatureArticle(id: string, currentStatus: boolean, title: string) {
    const action = currentStatus ? "unfeature" : "feature";
    
    const result = await adminFetch(`/api/articles/${id}/feature`, {
      method: "PUT",
      body: { is_featured: !currentStatus },
      confirm: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Article`,
        message: `Are you sure you want to ${action} "${title}"?`
      }
    });

    if (result.cancelled) return;

    if (result.error) {
      alert(`Failed to ${action} article: ${result.error}`);
      return;
    }

    await fetchPublished();
    alert(`Article ${action}d successfully!`);
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
                <h3 className={styles.articleTitle}>
                  {a.title}
                  {a.is_featured && (
                    <span className={styles.featuredBadge}>★ Featured</span>
                  )}
                </h3>
                <p className={styles.articleMeta}>
                  Author: {a.profiles?.username || 'Unknown'}
                </p>
                <p>
                  publication type: {a.type}
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
                  onClick={() => toggleFeatureArticle(a.id, a.is_featured ?? false, a.title)} 
                  className={`${styles.button} ${a.is_featured ? styles.unfeaturedButton : styles.featureButton}`}
                >
                  {a.is_featured ? 'Unfeature Article' : 'Feature Article'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}