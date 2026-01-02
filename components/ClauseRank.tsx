'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from "../styles/ClauseRank.module.css";
import Link from "next/link";

interface TrendingTopic {
  rank: number;
  topic: string;
  change: string;
  category?: string;
  count?: number;
}

interface Leader {
  rank: number;
  name: string;
  role: string;
  score: number; // 0-10 normalized score
}

interface ApiTopic {
  topic: string;
  category: string;
  change: string;
  count: number;
  articles?: unknown[];
}

const ClauseRank: React.FC = () => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const supabase = createClientComponentClient();

  // Fallback data for trending topics
  const fallbackTopics: TrendingTopic[] = [
    { rank: 1, topic: "DataPrivacy & GDPR Compliance", change: "+2.5%" },
    { rank: 2, topic: "Supreme Court Digital Guidelines", change: "+2.3%" },
    { rank: 3, topic: "GST Amendment Updates", change: "+2.1%" },
    { rank: 4, topic: "Labour Law Reforms", change: "+1.9%" },
    { rank: 5, topic: "Environmental Regulations", change: "+1.7%" },
    { rank: 6, topic: "Cryptocurrency Legal Framework", change: "+1.5%" },
    { rank: 7, topic: "Consumer Protection Laws", change: "+1.3%" },
    { rank: 8, topic: "Real Estate RERA Compliance", change: "+1.1%" },
  ];

  // Fallback data for leadership board
  const fallbackLeaders: Leader[] = [
    { rank: 1, name: "Avugaddi Venkat Murali", role: "Student", score: 9.5 },
    { rank: 2, name: "Priya Sharma", role: "Legal Analyst", score: 8.7 },
    { rank: 3, name: "Rajesh Kumar", role: "Law Student", score: 7.2 },
    { rank: 4, name: "Anita Desai", role: "Researcher", score: 6.8 },
    { rank: 5, name: "Vikram Singh", role: "Student", score: 6.5 },
  ];

  // Load trending topics from API
  useEffect(() => {
    loadTrendingTopics();
    
    // Auto-refresh every hour for trending topics only
    const interval = setInterval(() => {
      loadTrendingTopics();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

  // Load leadership data once on mount (no auto-refresh)
  useEffect(() => {
    fetchLeadershipData();
  }, []);

  // Calculate impact score (same formula as Leadership page)
  const calculateImpactScore = (articleCount: number, views: number, likes: number): number => {
    return (articleCount * 50) + (views * 2) + (likes * 10);
  };

  // Normalize scores to 0-10 scale
// Normalize scores to 0-10 scale
const normalizeScores = (authors: Array<{
  id: string;
  name: string;
  role: string;
  articleCount: number;
  impactScore: number;
}>) => {
  const authorsWithArticles = authors.filter(a => a.articleCount > 0);
  
  if (authorsWithArticles.length === 0) return authors.map(a => ({ ...a, normalizedScore: 0 }));
  
  const maxScore = Math.max(...authorsWithArticles.map(a => a.impactScore));
  const minScore = Math.min(...authorsWithArticles.map(a => a.impactScore));
  
  return authors.map(author => {
    if (author.articleCount === 0) {
      return { ...author, normalizedScore: 0 };
    }
    
    // Scale from 1-10 for authors with articles
    if (maxScore === minScore) {
      return { ...author, normalizedScore: 10 };
    }
    
    const normalized = 1 + ((author.impactScore - minScore) / (maxScore - minScore)) * 9;
    return { ...author, normalizedScore: parseFloat(normalized.toFixed(2)) };
  });
};

  // Fetch leadership data from Supabase
  const fetchLeadershipData = async () => {
    setLeadersLoading(true);
    
    try {
      // Fetch authors with their profile info
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select('id, full_name, profession')
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
            id: author.id,
            name: author.full_name,
            role: author.profession || 'Student',
            articleCount,
            impactScore,
          };
        })
      );

      // Normalize scores to 0-10
      const normalizedAuthors = normalizeScores(authorsWithStats);

      // Filter authors with at least one article and sort by raw impact score
// Filter authors with at least one article and sort by raw impact score
    const rankedAuthors = normalizedAuthors
      .filter(author => author.articleCount > 0)
      .sort((a, b) => b.impactScore - a.impactScore) // Sort by RAW score (not normalized)
      .slice(0, 5) // Get top 5 only
      .map((author, index) => ({
    rank: index + 1,
    name: author.name,
    role: author.role,
    score: author.normalizedScore, // Display normalized score (0-10)
  }));

      if (rankedAuthors.length > 0) {
        setLeaders(rankedAuthors);
        console.log('✅ Loaded top 5 leaders from database:', rankedAuthors.length);
      } else {
        throw new Error('No authors with published articles found');
      }
    } catch (error) {
      console.error('❌ Error fetching leadership data:', error);
      // Use fallback data on error
      setLeaders(fallbackLeaders);
      console.log('⚠ Using fallback leadership data');
    } finally {
      setLeadersLoading(false);
    }
  };

  // Function to fetch trending topics from API
  const loadTrendingTopics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trending-topics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending topics');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const transformedTopics: TrendingTopic[] = result.data.map((item: ApiTopic, index: number) => ({
          rank: index + 1,
          topic: item.topic,
          change: item.change,
          category: item.category,
          count: item.count
        }));

        setTrendingTopics(transformedTopics);
        setLastUpdated(new Date(result.timestamp));
        console.log('✅ Loaded topics from API:', transformedTopics.length);
      } else {
        throw new Error('No data received from API');
      }
    } catch (err: unknown) {
      console.error('❌ Error loading topics:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Use fallback data
      setTrendingTopics(fallbackTopics);
      console.log('⚠ Using fallback data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.clauseRankSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Clause & Claws</h2>
        <p className={styles.sectionSubtitle}>
          Real-time analysis of the most discussed legal topics based on citations, reads,
          and research momentum.
        </p>

        <div className={styles.contentCard}>
          <div className={styles.contentWrapper}>
            {/* Trending Topics List */}
            <div className={styles.trendingTopics}>
              <h3 className={styles.columnTitle}>ClauseRank Trending Topics</h3>
              <div className={styles.topicsList}>
                {trendingTopics.map((item) => (
                  <div key={item.rank} className={styles.topicItem}>
                    <div className={styles.topicLeft}>
                      <span className={styles.topicRank}>#{item.rank}</span>
                      <div>
                        <span className={styles.topicName}>{item.topic}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={styles.topicChange}>+{item.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leadership Board */}
            <div className={styles.leadershipBoard}>
              <h3 className={styles.columnTitle}>ClawsRank Leadership Board</h3>
              
              {leadersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#676F7E' }}>
                  🔄 Loading leadership rankings...
                </div>
              ) : (
                <div className={styles.leadersList}>
                  {leaders.map((leader) => (
                    <div key={leader.rank} className={styles.leaderItem}>
                      <div className={styles.leaderLeft}>
                        <span className={styles.leaderRank}>#{leader.rank}</span>
                        <div className={styles.leaderInfo}>
                          <p className={styles.leaderName}>{leader.name}</p>
                          <p className={styles.leaderRole}>{leader.role}</p>
                        </div>
                      </div>
                      <div className={styles.leaderScore}>
                        <span className={styles.scoreLabel}>Impact Score:</span>
                        <span className={styles.scoreValue}>{leader.score}</span>
                      </div>
                    </div>
                  ))}
                  <button className={styles.moreButton}>
                    <Link href={`/leadership`}>More...</Link>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClauseRank;