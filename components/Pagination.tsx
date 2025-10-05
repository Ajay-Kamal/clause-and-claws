"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  const router = useRouter();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= showPages; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const getPageUrl = (page: number) => {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
  };

  return (
    <>
      <style>{`
        .pagination {
          margin: 3rem 0;
          display: flex;
          justify-content: center;
        }
        .pagination-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .pagination-btn:hover:not(.disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        .pagination-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }
        .pagination-numbers {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .pagination-number {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 0.5rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .pagination-number:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        .pagination-number.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }
        .pagination-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          color: #6b7280;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .pagination-btn {
            padding: 0.5rem 1rem;
            font-size: 0.8125rem;
          }
          .pagination-number {
            min-width: 36px;
            height: 36px;
            font-size: 0.8125rem;
          }
          .pagination-ellipsis {
            min-width: 36px;
            height: 36px;
          }
        }
      `}</style>
      <nav className="pagination" aria-label="Pagination">
        <div className="pagination-container">
          {/* Previous Button */}
          {currentPage > 1 ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="pagination-btn pagination-prev"
              aria-label="Previous page"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Previous
            </Link>
          ) : (
            <span className="pagination-btn pagination-prev disabled">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Previous
            </span>
          )}

          {/* Page Numbers */}
          <div className="pagination-numbers">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="pagination-ellipsis"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <Link
                  key={pageNum}
                  href={getPageUrl(pageNum)}
                  className={`pagination-number${isActive ? " active" : ""}`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {/* Next Button */}
          {currentPage < totalPages ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="pagination-btn pagination-next"
              aria-label="Next page"
            >
              Next
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ) : (
            <span className="pagination-btn pagination-next disabled">
              Next
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </nav>
    </>
  );
}
