'use client';

import React, { useState, useEffect } from 'react';
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
  score: number;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const leadershipBoard: Leader[] = [
    { rank: 1, name: "Avugaddi Venkat Murali", role: "Student", score: 400 },
    { rank: 2, name: "Priya Sharma", role: "Legal Analyst", score: 385 },
    { rank: 3, name: "Rajesh Kumar", role: "Law Student", score: 372 },
    { rank: 4, name: "Anita Desai", role: "Researcher", score: 356 },
    { rank: 5, name: "Vikram Singh", role: "Student", score: 340 },
  ];

  // Fallback data in case API fails
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

  // Load trending topics from API
  useEffect(() => {
    loadTrendingTopics();
    
    // Auto-refresh every hour
    const interval = setInterval(() => {
      loadTrendingTopics();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

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
        <h2 className={styles.sectionTitle}>ClauseRank™ Trending Topics</h2>
        <p className={styles.sectionSubtitle}>
          Real-time analysis of the most discussed legal topics based on citations, reads,
          and research momentum.
        </p>

        {/* Status indicator */}
        {/* {loading && (
          <p style={{ textAlign: 'center', color: '#676F7E', marginBottom: '20px' }}>
            🔄 Loading latest topics...
          </p>
        )}
        
        {error && (
          <p style={{ textAlign: 'center', color: '#f59e0b', marginBottom: '20px', fontSize: '14px' }}>
            ⚠ Using cached data. {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString('en-IN')}` : ''}
          </p>
        )}

        {!loading && !error && lastUpdated && (
          <p style={{ textAlign: 'center', color: '#10b981', marginBottom: '20px', fontSize: '14px' }}>
            ✅ Live data • Updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </p>
        )} */}

        <div className={styles.contentCard}>
          <div className={styles.contentWrapper}>
            {/* Trending Topics List */}
            <div className={styles.trendingTopics}>
              <h3 className={styles.columnTitle}>ClauseRank™ Trending Topics</h3>
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
              <div className={styles.leadersList}>
                {leadershipBoard.map((leader) => (
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
                  <Link href={`/leadership`}>More...</Link></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClauseRank;