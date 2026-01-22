"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/browser";
import styles from "../../../styles/ProfilesManagement.module.css";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  featured: boolean;
  institution?: string;
  profession?: string;
  bio?: string;
  created_at: string;
}

interface AuthorStats {
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  impactScore: number;
}

export default function SpotlightAuthorsManagement() {
  const supabase = createSupabaseBrowserClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [authorStats, setAuthorStats] = useState<Record<string, AuthorStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = profiles.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(query) ||
          p.username?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query)
      );
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  async function fetchProfiles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching profiles:", error);
      alert("Failed to fetch profiles");
    } else {
      setProfiles(data || []);
      setFilteredProfiles(data || []);
      
      // Count featured authors
      const featured = (data || []).filter(p => p.featured).length;
      setFeaturedCount(featured);

      // Fetch stats for all authors
      await fetchAuthorStats(data || []);
    }
    setLoading(false);
  }

  async function fetchAuthorStats(authors: Profile[]) {
    const stats: Record<string, AuthorStats> = {};

    for (const author of authors) {
      // Get article count
      const { count: articleCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", author.id)
        .eq("published", true)
        .eq("approved", true);

      // Get views and likes
      const { data: articles } = await supabase
        .from("articles")
        .select("views, likes")
        .eq("author_id", author.id)
        .eq("published", true)
        .eq("approved", true);

      const totalViews = articles?.reduce((sum, article) => sum + (article.views || 0), 0) || 0;
      const totalLikes = articles?.reduce((sum, article) => sum + (article.likes || 0), 0) || 0;
      
      // Calculate impact score
      const rawScore = (articleCount || 0) * 50 + totalViews * 2 + totalLikes * 10;

      stats[author.id] = {
        articleCount: articleCount || 0,
        totalViews,
        totalLikes,
        impactScore: rawScore,
      };
    }

    setAuthorStats(stats);
  }

  async function toggleFeatured(profileId: string, currentStatus: boolean) {
    // Check if trying to add more than 3 featured authors
    if (!currentStatus && featuredCount >= 3) {
      alert("Maximum 3 spotlight authors allowed. Please remove one before adding another.");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ featured: !currentStatus })
        .eq("id", profileId);

      if (error) throw error;

      // Update local state
      setProfiles(prevProfiles =>
        prevProfiles.map(p =>
          p.id === profileId ? { ...p, featured: !currentStatus } : p
        )
      );

      // Update featured count
      setFeaturedCount(prev => currentStatus ? prev - 1 : prev + 1);

      alert(currentStatus ? "Removed from spotlight" : "Added to spotlight successfully!");
    } catch (err) {
      console.error("Toggle featured error:", err);
      alert("Failed to update spotlight status: " + (err as any)?.message);
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading authors...</div>
      </div>
    );
  }

  // Sort profiles: featured first, then by impact score
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    const aScore = authorStats[a.id]?.impactScore || 0;
    const bScore = authorStats[b.id]?.impactScore || 0;
    return bScore - aScore;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Spotlight Authors Management</h1>
          <p style={{ marginTop: '8px', color: '#666' }}>
            {featuredCount} of 3 spotlight positions filled
          </p>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {sortedProfiles.length === 0 ? (
        <p className={styles.emptyState}>
          {searchQuery ? "No authors found matching your search." : "No authors available."}
        </p>
      ) : (
        <div className={styles.profilesList}>
          {sortedProfiles.map((profile) => {
            const stats = authorStats[profile.id] || {
              articleCount: 0,
              totalViews: 0,
              totalLikes: 0,
              impactScore: 0,
            };

            return (
              <div key={profile.id} className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileAvatar}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {getInitials(profile.full_name)}
                      </div>
                    )}
                  </div>
                  <div className={styles.profileInfo}>
                    <h3 className={styles.profileName}>{profile.full_name}</h3>
                    <p className={styles.profileUsername}>@{profile.username}</p>
                    <p className={styles.profileEmail}>{profile.email}</p>
                    {profile.profession && (
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {profile.profession}
                      </p>
                    )}
                  </div>
                  <div className={styles.editorBadge}>
                    {profile.featured && (
                      <span className={styles.badge}>⭐ Spotlight</span>
                    )}
                  </div>
                </div>

                <div className={styles.editorDetails}>
                  <p><strong>Articles:</strong> {stats.articleCount}</p>
                  <p><strong>Total Views:</strong> {stats.totalViews.toLocaleString()}</p>
                  <p><strong>Total Likes:</strong> {stats.totalLikes.toLocaleString()}</p>
                  <p><strong>Impact Score:</strong> {stats.impactScore.toLocaleString()}</p>
                  {profile.institution && (
                    <p><strong>Institution:</strong> {profile.institution}</p>
                  )}
                </div>

                {profile.bio && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    <strong>Bio:</strong> {profile.bio}
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    onClick={() => toggleFeatured(profile.id, profile.featured)}
                    className={`${styles.button} ${
                      profile.featured ? styles.buttonDanger : styles.buttonPrimary
                    }`}
                    disabled={!profile.featured && featuredCount >= 3}
                  >
                    {profile.featured ? "Remove from Spotlight" : "Add to Spotlight"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 