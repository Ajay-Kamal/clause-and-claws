"use client";

import Link from "next/link";
import styles from "../styles/CategoriesSection.module.css";

const iconProps = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as React.SVGProps<SVGSVGElement>;

const categories = {
  "Civil Law": {
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    color: "#00a8e6", // Primary blue
    bgColor: "rgba(0, 168, 230, 0.1)"
  },
  "Constitutional Law": {
    icon: (
      <svg {...iconProps}>
        <path d="M3 3h18v18H3z" />
        <path d="M8 12h8" />
        <path d="M8 8h8" />
        <path d="M8 16h8" />
      </svg>
    ),
    color: "#ef4444", // Danger red
    bgColor: "rgba(239, 68, 68, 0.1)"
  },
  "Criminal Law": {
    icon: (
      <svg {...iconProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: "#10b981", // Success green
    bgColor: "rgba(16, 185, 129, 0.1)"
  },
  "Property Law": {
    icon: (
      <svg {...iconProps}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: "#f59e0b", // Warning amber
    bgColor: "rgba(245, 158, 11, 0.1)"
  },
  "Family Law": {
    icon: (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "#8b5cf6", // Purple
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  "Contract Law": {
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    color: "#06b6d4", // Cyan
    bgColor: "rgba(6, 182, 212, 0.1)"
  },
};

export default function CategoriesSection() {
  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Explore by Practice Area</h2>
          <p className={styles.sectionSubtitle}>
            Browse articles organized by legal specializations and find content that matters to your practice
          </p>
        </div>

        {/* Categories Grid */}
        <div className={styles.categoriesGrid}>
          {Object.entries(categories).map(([category, { icon, color, bgColor }]) => (
            <Link
              key={category}
              href={`/tags/${encodeURIComponent(category)}`}
              className={styles.categoryCard}
            >
              <div 
                className={styles.iconContainer}
                style={{ 
                  backgroundColor: bgColor,
                  color: color 
                }}
              >
                {icon}
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <div className={styles.categoryArrow}>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className={styles.ctaSection}>
          <Link href="/tags" className={styles.ctaButton}>
            View More
          </Link>
        </div>
      </div>
    </section>
  );
}