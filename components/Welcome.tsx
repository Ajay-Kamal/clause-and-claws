"use client";

import { useState, useEffect } from "react";
import styles from "../styles/Welcome.module.css";
import Link from "next/link";

const slidingPoints = [
  "100% free publication for all articles — because knowledge should never be behind a paywall.",
  "Research Papers, Legislative Comments, Case Commentaries, and Book Reviews undergo a transparent peer-review process.",
  "Merit-based publication, not pay-to-publish models.",
  "A single review fee of just ₹700 covers submission of any scholarly work.",
  "Editorial standards aligned with academic and professional expectations.",
  "Independent legal research & online publication platform — making legal knowledge accessible, ethical, and student-friendly.",
  "Transparent peer-review process focused on quality, not favouritism.",
];

export default function Welcome() {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentPoint((prev) => (prev + 1) % slidingPoints.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeWrapper}>
        {/* Fixed background banner via inline style to avoid CSS module path issues */}
        <div
          className={styles.bannerBackground}
          style={{ backgroundImage: "url('./images/welcome-banner.svg')" }}
        />

        {/* Text overlay */}
        <div className={styles.welcomeText}>
          {/* Static heading — always visible */}
          <h1>Where Clauses Speak,</h1>
          <h1>and Claws Create Change</h1>
          <p className={styles.staticSubtitle}>
            Cutting-edge legal scholarship for law students and professionals.
            Research, analysis and discourse on contemporary legal issues.
          </p>

          {/* Sliding points below */}
          <p
            className={styles.slidingPoint}
            style={{ opacity: fade ? 1 : 0 }}
          >
            {slidingPoints[currentPoint]}
          </p>

          {/* Dots indicator */}
          <div className={styles.textDots}>
            {slidingPoints.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentPoint ? styles.activeDot : ""}`}
                onClick={() => setCurrentPoint(index)}
                aria-label={`Go to point ${index + 1}`}
              />
            ))}
          </div>

          <div className={styles["btn-section"]}>
            <Link href="/articles" className={styles["btn-primary"]}>
              Explore Publications
            </Link>
            <Link
              href="https://chat.whatsapp.com/HW1zoefd3yt4Q3EAu9WDdg"
              className={styles["btn-secondary"]}
            >
              Join Community
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.associationSection}>
        <div className={styles.associationSectionWrapper}>
          <div className={styles.associationDiv}>
            <span className={styles.associationText}>In Association With</span>
            <p className={styles.associationP}>Trust Law Offices - Advocates & Solicitors</p>
          </div>
        </div>
      </div>
    </div>
  );
}