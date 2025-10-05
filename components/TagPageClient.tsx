// app/tags/[tag]/TagPageClient.tsx (Client Component)
"use client";

import { useEffect, useState } from "react";
import ArticleCard from "@/components/ArticleCard";

export default function TagPageClient({
  tag,
  initialArticles,
}: {
  tag: string;
  initialArticles: any[];
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const res = await fetch(`/api/articles/by-tag?tag=${tag}&page=${page}`);
    const newArticles = await res.json();

    if (newArticles.length === 0) {
      setHasMore(false);
    } else {
      setArticles((prev) => [...prev, ...newArticles]);
      setPage((prev) => prev + 1);
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <>
      <style>{`
        .tag-articles-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2.5rem 1.2rem 2rem 1.2rem;
        }
        .tag-articles-title {
          font-size: 2rem;
          font-weight: 700;
          color: #22223b;
          margin-bottom: 2rem;
          text-align: center;
        }
        .tag-articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        .tag-articles-loading,
        .tag-articles-end {
          text-align: center;
          margin-top: 2rem;
          font-size: 1.08rem;
          color: #6b7280;
        }
        @media (max-width: 900px) {
          .tag-articles-container {
            padding: 1.5rem 0.5rem;
          }
          .tag-articles-title {
            font-size: 1.4rem;
            margin-bottom: 1.2rem;
          }
          .tag-articles-grid {
            gap: 1.2rem;
            grid-template-columns: 1fr;
            justify-items: center;
          }
        }
        @media (max-width: 600px) {
          .tag-articles-title {
            font-size: 1.1rem;
          }
          .tag-articles-grid {
            gap: 0.7rem;
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="tag-articles-container">
        <h1 className="tag-articles-title">
          Articles tagged with: <span style={{ color: "#2563eb" }}>{tag}</span>
        </h1>
        <div className="tag-articles-grid">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {loading && <p className="tag-articles-loading">Loading more...</p>}
        {!hasMore && <p className="tag-articles-end">No more articles</p>}
      </div>
    </>
  );
}
