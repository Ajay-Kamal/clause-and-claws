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
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.299-.173-.538-.018-.83.13-1.082.143-.248.638-.608.872-.731.233-.124.52-.186.52-.186.124 0 .248-.062.372-.062.124 0 .31.062.465.248.155.186.67.909.73.994.062.086.124.186.062.372-.062.186-.062.31-.124.372-.062.062-.186.124-.372.248-.186.124-.248.186-.372.31-.124.124-.248.248-.124.465.124.217.56.932 1.205 1.514.677.606 1.24.784 1.456.867.216.083.372.062.52-.037.149-.1.639-.56.81-.744.173-.186.347-.149.52-.099.173.05.744.354 1.013.52.27.167.45.248.52.372.068.124.068.708-.23 1.39-.297.683-.537.582-.835.433z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.768.473 3.425 1.299 4.85L2 22l5.35-1.325A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-8-8c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"
      fill="currentColor"
    />
  </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Clause & Claws</span>
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
