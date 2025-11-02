// app/authors/AuthorsClient.tsx
"use client";

import { useState, useMemo } from "react";
import AuthorCard from "@/components/AuthorCard";
import Pagination from "@/components/Pagination";
import styles from "../../styles/AuthorsPage.module.css";

interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  profession?: string;
  location?: string;
  bio?: string;
  name?: string;
  follower_count?: number;
  articleCount?: number;
  totalReads?: number;
  [key: string]: any;
}

interface AuthorsClientProps {
  authors: Author[];
  authorsPerPage: number;
  initialPage: number;
}

export default function AuthorsClient({ 
  authors, 
  authorsPerPage,
  initialPage 
}: AuthorsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Filter authors based on search query
  const filteredAuthors = useMemo(() => {
    if (!searchQuery.trim()) {
      return authors;
    }

    const query = searchQuery.toLowerCase().trim();
    return authors.filter((author) => {
      // Search in multiple name fields
      const fullName = author.full_name?.toLowerCase() || "";
      const name = author.name?.toLowerCase() || "";
      const username = author.username?.toLowerCase() || "";
      
      return (
        fullName.includes(query) ||
        name.includes(query) ||
        username.includes(query)
      );
    });
  }, [authors, searchQuery]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
  const startIndex = (currentPage - 1) * authorsPerPage;
  const endIndex = startIndex + authorsPerPage;
  const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className={styles.authorsPage}>
      <div className={styles.authorsHeader}>
        <h1 className={styles.authorsTitle}>Our Authors</h1>
        <p className={styles.authorsSubtitle}>
          Meet the distinguished legal scholars, practitioners, and researchers
          contributing to Clause & Claws.
        </p>
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search authors..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button type="submit" aria-label="Search">
              <img src="/images/search-icon.svg" alt="Search" />
            </button>
          </form>
        </div>
      </div>

      <div className={styles.authorsContainer}>
        {/* Search Results Count */}
        {searchQuery && (
          <div className={styles.searchResults}>
            <p>
              Found {filteredAuthors.length} author{filteredAuthors.length !== 1 ? "s" : ""} 
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Authors Grid */}
        {paginatedAuthors.length > 0 ? (
          <>
            <div className={styles.authorsGrid}>
              {paginatedAuthors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/authors"
              />
            )}
          </>
        ) : (
          <div className={styles.noAuthors}>
            <p>
              {searchQuery 
                ? `No authors found matching "${searchQuery}"`
                : "No authors found."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}