"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "@/components/SessionProvider";
import styles from "../../styles/CategoriesPage.module.css";

const LAW_CATEGORIES: Record<string, string[]> = {
  "Core Categories of Law": [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Contract Law",
    "Tort Law",
    "Property Law",
    "Family Law",
    "Evidence Law",
    "Procedural Law (CPC & CrPC)",
  ],
  "Specialized & Applied Branches": [
    "Corporate & Company Law",
    "Commercial Law",
    "Banking & Finance Law",
    "Intellectual Property Rights (IPR)",
    "Competition / Antitrust Law",
    "Consumer Protection Law",
    "Insurance Law",
    "Taxation Law",
    "International Trade Law",
    "Investment & Securities Law",
  ],
  "Public & Regulatory Laws": [
    "Administrative Law",
    "Environmental Law",
    "Labour & Employment Law",
    "Energy & Mining Law",
    "Cyber Law / Information Technology Law",
    "Media & Entertainment Law",
    "Telecommunications Law",
    "Healthcare & Medical Law",
    "Education Law",
    "Transportation & Maritime Law",
  ],
  "International & Comparative Law": [
    "Public International Law",
    "Private International Law",
    "Human Rights Law",
    "Humanitarian & Refugee Law",
    "Space Law",
    "Comparative Law",
  ],
  "Emerging & Interdisciplinary Fields": [
    "Artificial Intelligence & Law",
    "Data Protection & Privacy Law",
    "FinTech & Cryptocurrency Law",
    "Sports Law",
    "Aviation & Aerospace Law",
    "Maritime & Admiralty Law",
    "Military & Security Law",
    "Agricultural & Food Law",
    "Fashion Law",
  ],
  "Litigation & Dispute Resolution": [
    "Alternative Dispute Resolution (ADR)",
    "Arbitration Law",
    "Mediation & Negotiation",
    "Judicial Process & Court Practice",
  ],
  "Socio-Legal & Theoretical Studies": [
    "Law & Economics",
    "Law & Technology",
    "Law & Society",
    "Jurisprudence & Legal Philosophy",
    "Legal History & Evolution of Law",
    "Feminist Legal Studies",
    "Critical Legal Studies",
  ],
};

type CategoryIconProps = {
  category: string;
  className?: string;
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className }) => {
  const iconProps = {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  } as React.SVGProps<SVGSVGElement>;

  switch (category) {
    case "Constitutional Law":
      return (
        <svg {...iconProps}>
          <path d="M3 3h18v18H3z" />
          <path d="M8 12h8" />
          <path d="M8 8h8" />
          <path d="M8 16h8" />
        </svg>
      );
    case "Criminal Law":
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "Civil Law":
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "Contract Law":
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case "Tort Law":
      return (
        <svg {...iconProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "Property Law":
      return (
        <svg {...iconProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "Family Law":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Evidence Law":
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case "Procedural Law (CPC & CrPC)":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );

    case "Corporate & Company Law":
      return (
        <svg {...iconProps}>
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
        </svg>
      );
    case "Commercial Law":
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "Banking & Finance Law":
      return (
        <svg {...iconProps}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "Intellectual Property Rights (IPR)":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "Competition / Antitrust Law":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="8,12 12,16 16,12" />
        </svg>
      );
    case "Consumer Protection Law":
      return (
        <svg {...iconProps}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "Insurance Law":
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "Taxation Law":
      return (
        <svg {...iconProps}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "International Trade Law":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "Investment & Securities Law":
      return (
        <svg {...iconProps}>
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
      );
    case "Administrative Law":
      return (
        <svg {...iconProps}>
          <path d="M3 21h18" />
          <path d="M6 21V9" />
          <path d="M10 21V7" />
          <path d="M14 21V3" />
          <path d="M18 21V5" />
        </svg>
      );
    case "Environmental Law":
      return (
        <svg {...iconProps}>
          <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L19.65 7.5a.5.5 0 0 1 .773.405v7.348a2 2 0 0 1-.659 1.486l-5.906 5.291a1 1 0 0 1-1.316 0l-5.906-5.291a2 2 0 0 1-.659-1.486V7.905a.5.5 0 0 1 .773-.405l2.744 1.664a1 1 0 0 0 1.516-.294l2.952-5.604z" />
        </svg>
      );
    case "Labour & Employment Law":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Energy & Mining Law":
      return (
        <svg {...iconProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "Cyber Law / Information Technology Law":
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "Media & Entertainment Law":
      return (
        <svg {...iconProps}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "Telecommunications Law":
      return (
        <svg {...iconProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "Healthcare & Medical Law":
      return (
        <svg {...iconProps}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "Education Law":
      return (
        <svg {...iconProps}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "Transportation & Maritime Law":
      return (
        <svg {...iconProps}>
          <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" />
          <path d="M4 18 2 12h20l-2 6" />
          <path d="M6 12V7" />
          <path d="M10 12V9" />
          <path d="M14 12V9" />
          <path d="M18 12V7" />
        </svg>
      );
    case "Public International Law":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "Private International Law":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "Human Rights Law":
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "Humanitarian & Refugee Law":
      return (
        <svg {...iconProps}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "Space Law":
      return (
        <svg {...iconProps}>
          <path d="M9 9v3a3 3 0 0 0 6 0v-3" />
          <path d="M21 9H3l3-7 4 7h4l4-7z" />
        </svg>
      );
    case "Comparative Law":
      return (
        <svg {...iconProps}>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
    case "Artificial Intelligence & Law":
      return (
        <svg {...iconProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "Data Protection & Privacy Law":
      return (
        <svg {...iconProps}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "FinTech & Cryptocurrency Law":
      return (
        <svg {...iconProps}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "Sports Law":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="10,8 16,12 10,16 10,8" />
        </svg>
      );
    case "Aviation & Aerospace Law":
      return (
        <svg {...iconProps}>
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      );
    case "Maritime & Admiralty Law":
      return (
        <svg {...iconProps}>
          <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" />
          <path d="M4 18 2 12h20l-2 6" />
          <path d="M6 12V7" />
          <path d="M10 12V9" />
          <path d="M14 12V9" />
          <path d="M18 12V7" />
        </svg>
      );
    case "Military & Security Law":
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "Agricultural & Food Law":
      return (
        <svg {...iconProps}>
          <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L19.65 7.5a.5.5 0 0 1 .773.405v7.348a2 2 0 0 1-.659 1.486l-5.906 5.291a1 1 0 0 1-1.316 0l-5.906-5.291a2 2 0 0 1-.659-1.486V7.905a.5.5 0 0 1 .773-.405l2.744 1.664a1 1 0 0 0 1.516-.294l2.952-5.604z" />
        </svg>
      );
    case "Fashion Law":
      return (
        <svg {...iconProps}>
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      );
    case "Alternative Dispute Resolution (ADR)":
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "Arbitration Law":
      return (
        <svg {...iconProps}>
          <path d="M3 3h18v18H3z" />
          <path d="M8 12h8" />
          <path d="M8 8h8" />
          <path d="M8 16h8" />
        </svg>
      );
    case "Mediation & Negotiation":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Judicial Process & Court Practice":
      return (
        <svg {...iconProps}>
          <path d="M3 21h18" />
          <path d="M6 21V9" />
          <path d="M10 21V7" />
          <path d="M14 21V3" />
          <path d="M18 21V5" />
        </svg>
      );
    case "Law & Economics":
      return (
        <svg {...iconProps}>
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
      );
    case "Law & Technology":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "Law & Society":
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Jurisprudence & Legal Philosophy":
      return (
        <svg {...iconProps}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "Legal History & Evolution of Law":
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      );
    case "Feminist Legal Studies":
      return (
        <svg {...iconProps}>
          <path d="M3 3h18v18H3z" />
          <path d="M8 12h8" />
          <path d="M8 8h8" />
          <path d="M8 16h8" />
        </svg>
      );
    case "Critical Legal Studies":
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
  }
};

// function countTags(articles: any[] = [], allCategories: string[]) {
//   const counts: Record<string, number> = {};
//   for (const cat of allCategories) counts[cat] = 0;
//   for (const article of articles) {
//     const tags = article?.tags;
//     if (Array.isArray(tags)) {
//       for (const tag of tags) {
//         if (typeof tag === "string" && counts[tag] !== undefined) counts[tag]++;
//       }
//     }
//   }
//   return counts;
// }

type CategoryCardProps = {
  category: string;
  // count: number;
  // isLoading: boolean;
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  // count,
  // isLoading,
}) => (
  <Link
    href={`/tags/${encodeURIComponent(category)}`}
    className={styles.categoryCard}
  >
    <CategoryIcon category={category} className={styles.categoryIcon} />
    <div className={styles.categoryContent}>
      <h3 className={styles.categoryTitle}>{category}</h3>
      {/* <p className={styles.categoryCount}>
        {isLoading ? (
          <span className={styles.loadingText}>Loading...</span>
        ) : (
          `${count} article${count !== 1 ? "s" : ""}`
        )}
      </p> */}
    </div>
  </Link>
);

export default function CategoriesPage() {
  // const { supabase } = useSession();
  // const [articleCounts, setArticleCounts] = useState<Record<string, number>>(
  //   {}
  // );
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchAllArticles = async () => {
  //     setLoading(true);
  //     const allCategories = Object.values(LAW_CATEGORIES).flat();
  //     try {
  //       // Fetch all articles with tags
  //       const { data: articles, error } = await supabase
  //         .from("articles")
  //         .select("tags");
  //       if (error) throw error;
  //       setArticleCounts(countTags(articles || [], allCategories));
  //     } catch (error) {
  //       console.error("Error fetching articles:", error);
  //       setArticleCounts({});
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchAllArticles();
  // }, [supabase]);

  return (
    <>
      <div className={styles.categoriesPage}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Law Categories</h1>
          <p className={styles.pageDescription}>
            Explore legal topics organized by specialized areas of law
          </p>
        </div>
        <div className={styles.categoriesContainer}>
          {Object.entries(LAW_CATEGORIES).map(([sectionTitle, categories]) => (
            <section key={sectionTitle} className={styles.categorySection}>
              <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
              <div className={styles.categoryGrid}>
                {categories.map((category) => (
                  <CategoryCard
                    key={category}
                    category={category}
                    // count={articleCounts[category] || 0}
                    // isLoading={loading}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
