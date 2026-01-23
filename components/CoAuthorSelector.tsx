// components/CoAuthorSelector.tsx - REPLACE ENTIRE FILE
"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../styles/CoAuthorSelector.module.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string;
}

interface CoAuthorSelectorProps {
  selectedCoAuthors: Profile[];
  onCoAuthorsChange: (coAuthors: Profile[]) => void;
  currentUserId: string;
}

const MAX_COAUTHORS = 2;

export default function CoAuthorSelector({
  selectedCoAuthors,
  onCoAuthorsChange,
  currentUserId,
}: CoAuthorSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const isMaxReached = selectedCoAuthors.length >= MAX_COAUTHORS;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for users by username
  const searchUsers = async (query: string) => {
    if (!query.trim() || isMaxReached) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .ilike("username", `%${query}%`)
        .neq("id", currentUserId)
        .limit(10);

      if (error) throw error;

      const selectedIds = selectedCoAuthors.map((author) => author.id);
      const filteredResults = (data || []).filter(
        (profile) => !selectedIds.includes(profile.id),
      );

      setSearchResults(filteredResults);
      setShowDropdown(filteredResults.length > 0);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, selectedCoAuthors]);

  const handleAddCoAuthor = (profile: Profile) => {
    if (isMaxReached) {
      alert(`Maximum ${MAX_COAUTHORS} co-authors allowed`);
      return;
    }
    onCoAuthorsChange([...selectedCoAuthors, profile]);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveCoAuthor = (profileId: string) => {
    onCoAuthorsChange(
      selectedCoAuthors.filter((author) => author.id !== profileId),
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <label className={styles.label}>Co-Authors (Optional)</label>
        <span
          className={`${styles.counter} ${isMaxReached ? styles.counterMax : ""}`}
        >
          {selectedCoAuthors.length}/{MAX_COAUTHORS}
        </span>
      </div>
      <p className={styles.description}>
        Search and add up to {MAX_COAUTHORS} co-authors by their username
      </p>

      <div className={styles.searchContainer} ref={searchRef}>
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={
              isMaxReached
                ? "Maximum co-authors reached"
                : "Search by username..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0 && !isMaxReached)
                setShowDropdown(true);
            }}
            disabled={isMaxReached}
          />
          {isSearching && (
            <div className={styles.spinner}>
              <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
                <circle
                  className={styles.spinnerCircle}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </div>

        {showDropdown && searchResults.length > 0 && !isMaxReached && (
          <div className={styles.dropdown}>
            {searchResults.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className={styles.dropdownItem}
                onClick={() => handleAddCoAuthor(profile)}
              >
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className={styles.avatar}
                />
                <div className={styles.profileInfo}>
                  <span className={styles.username}>@{profile.username}</span>
                  {profile.full_name && (
                    <span className={styles.fullName}>{profile.full_name}</span>
                  )}
                </div>
                <svg
                  className={styles.addIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}

        {showDropdown &&
          searchQuery &&
          !isSearching &&
          searchResults.length === 0 &&
          !isMaxReached && (
            <div className={styles.noResults}>
              <p>No users found matching "{searchQuery}"</p>
            </div>
          )}
      </div>

      {isMaxReached && (
        <div className={styles.warningBox}>
          <svg
            className={styles.warningIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Maximum {MAX_COAUTHORS} co-authors reached. Remove one to add
            another.
          </span>
        </div>
      )}

      {selectedCoAuthors.length > 0 && (
        <div className={styles.selectedContainer}>
          <p className={styles.selectedLabel}>
            Selected Co-Authors ({selectedCoAuthors.length}/{MAX_COAUTHORS})
          </p>
          <div className={styles.selectedList}>
            {selectedCoAuthors.map((author, index) => (
              <div key={author.id} className={styles.selectedItem}>
                <span className={styles.numberBadge}>{index + 1}</span>
                <img
                  src={author.avatar_url}
                  alt={author.username}
                  className={styles.selectedAvatar}
                />
                <div className={styles.selectedInfo}>
                  <span className={styles.selectedUsername}>
                    @{author.username}
                  </span>
                  {author.full_name && (
                    <span className={styles.selectedFullName}>
                      {author.full_name}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCoAuthor(author.id)}
                  className={styles.removeButton}
                  aria-label={`Remove ${author.username}`}
                >
                  <svg
                    className={styles.removeIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
