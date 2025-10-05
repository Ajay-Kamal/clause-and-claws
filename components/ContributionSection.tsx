"use client";

import Link from "next/link";
import styles from "../styles/ContributionSection.module.css";

export default function ContributionSection() {
  return (
    <div className={styles.contributionSection}>
      <h1 className={styles.heading}>Contribute to Legal Knowledge</h1>
      <p>
        Share your expertise and insights with a global audience of legal
        professionals and enthusiasts. Empower the legal community with your
        valuable perspectives and analysis.
      </p>
      <Link href={"/upload"} className={styles.contributeButton}>
        Submit Your Article
      </Link>
    </div>
  );
}
