"use client";

import styles from "../styles/Welcome.module.css";
import Link from "next/link";

export default function Welcome() {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeWrapper}>
        <img src="./images/welcome-banner.svg" alt="WELCOME" />
        <div className={styles.welcomeText}>
          <h1>Legal Knowledge</h1>
          <p>
            Your trusted source for expert legal analysis, in-depth articles,
            and schobily commentary.
          </p>
          <div className={styles["btn-section"]}>
            <Link href="/articles" className={styles["btn-primary"]}>
              Explore Articles
            </Link>
            <Link href="https://chat.whatsapp.com/HW1zoefd3yt4Q3EAu9WDdg" className={styles["btn-secondary"]}>
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
