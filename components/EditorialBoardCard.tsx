"use client";

import React from "react";
import Link from "next/link";
import styles from "../styles/EditorialBoardCard.module.css";

interface EditorialBoardCardProps {
  editor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    editor_role?: string;
    institution?: string;
  };
}

export default function EditorialBoardCard({ editor }: EditorialBoardCardProps) {
  const initials =
    editor.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    editor.username?.slice(0, 2).toUpperCase() ||
    "ED";

  return (
    <div className={styles.card}>
      {/* Avatar Section */}
      <div className={styles.avatarSection}>
        <Link href={`/authors/${editor.username}`} className={styles.avatarLink}>
          {editor.avatar_url ? (
            <img
              src={editor.avatar_url}
              alt={editor.full_name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>{initials}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Editor Info */}
      <div className={styles.info}>
        <Link href={`/authors/${editor.username}`} className={styles.nameLink}>
          <h3 className={styles.name}>{editor.full_name}</h3>
        </Link>

        {editor.editor_role && (
          <p className={styles.role}>{editor.editor_role}</p>
        )}

        {editor.institution && (
          <p className={styles.institution}>{editor.institution}</p>
        )}
      </div>
    </div>
  );
}