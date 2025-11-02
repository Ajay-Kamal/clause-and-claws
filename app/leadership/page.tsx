"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from "../../styles/Leadership.module.css";
import Link from 'next/link';

interface Author {
  id: string;
  full_name: string;
  username: string;
  profession: string;
  avatar_url: string;
  article_count: number;
  total_views: number;
  total_likes: number;
  impact_score: number;
}

export default function LeadershipPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLeadershipData();
  }, []);

  const calculateImpactScore = (articleCount: number, views: number, likes: number): number => {
    // Formula: (Articles * 50) + (Views * 2) + (Likes * 10)
    // You can adjust these weights based on your preference
    return (articleCount * 50) + (views * 2) + (likes * 10);
  };

  const fetchLeadershipData = async () => {
    try {
      // Fetch authors with their article statistics
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select('id, full_name, username, profession, avatar_url')
        .not('full_name', 'is', null);

      if (authorsError) throw authorsError;

      // Fetch article statistics for each author
      const authorsWithStats = await Promise.all(
        (authorsData || []).map(async (author) => {
          const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('views, likes')
            .eq('author_id', author.id)
            .eq('published', true)
            .eq('approved', true);

          if (articlesError) throw articlesError;

          const articleCount = articles?.length || 0;
          const totalViews = articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;
          const totalLikes = articles?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0;
          const impactScore = calculateImpactScore(articleCount, totalViews, totalLikes);

          return {
            ...author,
            article_count: articleCount,
            total_views: totalViews,
            total_likes: totalLikes,
            impact_score: impactScore,
          };
        })
      );

      // Filter authors with at least one article and sort by impact score
      const rankedAuthors = authorsWithStats
        .filter(author => author.article_count > 0)
        .sort((a, b) => b.impact_score - a.impact_score);

      setAuthors(rankedAuthors);
    } catch (error) {
      console.error('Error fetching leadership data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading leadership rankings...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Leadership Rankings</h1>
      <p className={styles.subtitle}>
        Top contributors ranked by their impact score
      </p>

      <div className={styles.leaderboardList}>
        {authors.map((author, index) => (
          <div key={author.id} className={styles.leaderboardItem}>
            <div className={styles.rank}>#{index + 1}</div>
            
            <div className={styles.authorInfo}>
              <img 
                src={author.avatar_url} 
                alt={author.full_name}
                className={styles.avatar}
              />
              <div className={styles.details}>
                <h3 className={styles.name}><Link href={`/authors/${author.username}`}>{author.full_name}</Link></h3>
                <p className={styles.profession}>{author.profession || 'Student'}</p>
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Articles:</span>
                <span className={styles.statValue}>{author.article_count}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Views:</span>
                <span className={styles.statValue}>{author.total_views}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Likes:</span>
                <span className={styles.statValue}>{author.total_likes}</span>
              </div>
            </div>

            <div className={styles.impactScore}>
              <span className={styles.scoreLabel}>Impact Score:</span>
              <span className={styles.scoreValue}>{author.impact_score}</span>
            </div>
          </div>
        ))}

        {authors.length === 0 && (
          <div className={styles.noData}>
            No authors found with published articles.
          </div>
        )}
      </div>
    </div>
  );
}