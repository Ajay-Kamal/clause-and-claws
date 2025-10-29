"use client";

import React from "react";
import Link from "next/link";
import styles from "../styles/AuthorCard.module.css";
import FollowButton from "./FollowButton";

interface AuthorCardProps {
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    profession?: string;
    location?: string;
    bio?: string;
    follower_count: number;
    articleCount?: number;
    totalReads?: number;
  };
}

export default function AuthorCard({ author }: AuthorCardProps) {
  const initials = author.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || author.username?.slice(0, 2).toUpperCase() || "AU";

  return (
    <div className={styles.card}>
      {/* Avatar Section */}
      <div className={styles.avatarSection}>
        <Link href={`/authors/${author.username}`} className={styles.avatarLink}>
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.full_name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>{initials}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Author Info */}
      <div className={styles.info}>
        <Link href={`/authors/${author.username}`} className={styles.nameLink}>
          <h3 className={styles.name}>{author.full_name}</h3>
        </Link>
        
        {author.profession && (
          <p className={styles.profession}>{author.profession}</p>
        )}
        
        {author.location && (
          <p className={styles.location}>{author.location}</p>
        )}

      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{author.articleCount || 0}</div>
          <div className={styles.statLabel}>Articles</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{author.follower_count || 0}</div>
          <div className={styles.statLabel}>Follows</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{author.totalReads || 0}</div>
          <div className={styles.statLabel}>Reads</div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Link href={`/authors/${author.username}`} className={styles.viewBtn}>
          View Profile
        </Link>
        <FollowButton profileId={author.id} />
      </div>
    </div>
  );
}