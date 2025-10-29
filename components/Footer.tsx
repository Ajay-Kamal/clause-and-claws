"use client";

import React from "react";
import Link from "next/link";
import styles from "../styles/Footer.module.css";

const LinkedInIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const EmailIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-whatsapp"
    viewBox="0 0 16 16"
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Clause <span style={{ color: 'rgb(255, 217, 0)' }}>&</span> Claws</span>
            </div>
            <p className={styles.brandDescription}>
              Empowering legal professionals with insightful articles, analysis,
              and commentary from industry leaders.
            </p>
            <div className={styles.socialLinks}>
              <a
                href="https://www.instagram.com/clause_and_claws/"
                className={styles.socialLink}
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/clause-and-claws"
                className={styles.socialLink}
                aria-label="Follow us on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://chat.whatsapp.com/HW1zoefd3yt4Q3EAu9WDdg"
                className={styles.socialLink}
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
              </a>
              <a
                href="mailto:clauseandclaws@gmail.com"
                className={styles.socialLink}
                aria-label="Email us"
              >
                <EmailIcon />
              </a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Practice Areas</h3>
            <ul className={styles.linkList}>
              <li>
                <Link
                  href="/tags/Corporate%20Law"
                  className={styles.footerLink}
                >
                  Corporate Law
                </Link>
              </li>
              <li>
                <Link
                  href="/tags/Constitutional%20Law"
                  className={styles.footerLink}
                >
                  Constitutional Law
                </Link>
              </li>
              <li>
                <Link
                  href="/tags/Employment%20Law"
                  className={styles.footerLink}
                >
                  Employment Law
                </Link>
              </li>
              <li>
                <Link href="/tags/Real%20Estate" className={styles.footerLink}>
                  Real Estate
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>Resources</h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="/files/author-guidelines.docx"
                  className={styles.footerLink}
                  download
                >
                  Author Guidelines
                </a>
              </li>
              <li>
                <a
                  href="/files/privacy-policy.docx"
                  className={styles.footerLink}
                  download
                >
                  Editorial Policy
                </a>
              </li>
              <li>
                <a
                  href="mailto:clauseandclaws@gmail.com"
                  className={styles.footerLink}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/about-us" className={styles.footerLink}>
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>Clause and Claws. All rights reserved.</p>
          </div>
          <div className={styles.legalLinks}>
            <a
              href="/files/privacy-policy.docx"
              className={styles.legalLink}
              download
            >
              Privacy Policy
            </a>
            <a
              href="/files/terms-of-service.docx"
              className={styles.legalLink}
              download
            >
              Terms of Service
            </a>
            <a
              href="/files/privacy-policy.docx"
              className={styles.legalLink}
              download
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
