// Add this component to your project as a separate file: components/CoAuthorSelector.tsx

"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import styles from "../styles/CoAuthorSelector.module.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for users by username
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
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
        .neq("id", currentUserId) // Exclude current user
        .limit(10);

      if (error) throw error;

      // Filter out already selected co-authors
      const selectedIds = selectedCoAuthors.map((author) => author.id);
      const filteredResults = (data || []).filter(
        (profile) => !selectedIds.includes(profile.id)
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
  }, [searchQuery]);

  const handleAddCoAuthor = (profile: Profile) => {
    onCoAuthorsChange([...selectedCoAuthors, profile]);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveCoAuthor = (profileId: string) => {
    onCoAuthorsChange(selectedCoAuthors.filter((author) => author.id !== profileId));
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Co-Authors (Optional)</label>
      <p className={styles.description}>
        Search and add co-authors by their username
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
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
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

        {showDropdown && searchResults.length > 0 && (
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

        {showDropdown && searchQuery && !isSearching && searchResults.length === 0 && (
          <div className={styles.noResults}>
            <p>No users found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {selectedCoAuthors.length > 0 && (
        <div className={styles.selectedContainer}>
          <p className={styles.selectedLabel}>
            Selected Co-Authors ({selectedCoAuthors.length})
          </p>
          <div className={styles.selectedList}>
            {selectedCoAuthors.map((author) => (
              <div key={author.id} className={styles.selectedItem}>
                <img
                  src={author.avatar_url}
                  alt={author.username}
                  className={styles.selectedAvatar}
                />
                <div className={styles.selectedInfo}>
                  <span className={styles.selectedUsername}>@{author.username}</span>
                  {author.full_name && (
                    <span className={styles.selectedFullName}>{author.full_name}</span>
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