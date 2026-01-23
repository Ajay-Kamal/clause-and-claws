"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

export default function ArticlesPage() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <h1 style={styles.mainTitle}>Article Submission Guidelines</h1>
        <p style={styles.subtitle}>Clause and Claws Law Review</p>

        {/* Introduction */}
        <section style={styles.section}>
          <p style={styles.introText}>
            We cordially invite contributions from scholars, practitioners, and
            students to our platform, with a particular emphasis on law and
            allied disciplines. In order to uphold the quality, consistency, and
            academic rigor of the publications, contributors are requested to
            kindly observe the following guidelines:
          </p>
        </section>

        {/* Scope of Submissions */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Scope of Submissions</h2>
          <p style={styles.sectionText}>
            Contributions are welcomed across diverse areas, with a primary
            focus on law and related subjects.
          </p>
        </section>

        {/* Word Limit */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Word Limit</h2>
          <div style={styles.highlightBox}>
            <p style={styles.highlightText}>
              Articles should preferably fall within the range of{" "}
              <strong>1500–1800 words</strong>.
            </p>
          </div>
        </section>

        {/* Citation Style */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Citation Style</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              References must conform to the{" "}
              <strong>Bluebook (21st Edition)</strong> citation style.
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>A complete bibliography shall
              be included at the end of the article.
            </li>
          </ul>
        </section>

        {/* Originality */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Originality</h2>
          <div style={styles.originalityBox}>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <span style={styles.bullet}>•</span>
                Submissions must be the original work of the author(s).
              </li>
              <li style={styles.listItem}>
                <span style={styles.bullet}>•</span>
                The similarity index must not exceed <strong>10%</strong>, and
                the editorial team will ensure strict compliance with
                originality requirements.
              </li>
              <li style={styles.listItem}>
                <span style={styles.bullet}>•</span>
                While the intellectual property shall remain with the author(s),
                publication rights shall be vested in the platform upon
                acceptance.
              </li>
            </ul>
          </div>
        </section>

        {/* Formatting Requirements */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Formatting Requirements</h2>

          <div style={styles.formatTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Element</th>
                  <th style={styles.tableHeader}>Specification</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tableRowEven}>
                  <td style={styles.tableCell}>
                    <strong>Font</strong>
                  </td>
                  <td style={styles.tableCell}>Times New Roman</td>
                </tr>
                <tr>
                  <td style={styles.tableCell}>
                    <strong>Font Size - Main Body</strong>
                  </td>
                  <td style={styles.tableCell}>12pt</td>
                </tr>
                <tr style={styles.tableRowEven}>
                  <td style={styles.tableCell}>
                    <strong>Font Size - Headings</strong>
                  </td>
                  <td style={styles.tableCell}>14pt</td>
                </tr>
                <tr>
                  <td style={styles.tableCell}>
                    <strong>Font Size - Bibliography</strong>
                  </td>
                  <td style={styles.tableCell}>10pt</td>
                </tr>
                <tr style={styles.tableRowEven}>
                  <td style={styles.tableCell}>
                    <strong>Alignment</strong>
                  </td>
                  <td style={styles.tableCell}>Justified</td>
                </tr>
                <tr>
                  <td style={styles.tableCell}>
                    <strong>Spacing - Body Text</strong>
                  </td>
                  <td style={styles.tableCell}>1.5</td>
                </tr>
                <tr style={styles.tableRowEven}>
                  <td style={styles.tableCell}>
                    <strong>Spacing - Bibliography</strong>
                  </td>
                  <td style={styles.tableCell}>1.0</td>
                </tr>
                <tr>
                  <td style={styles.tableCell}>
                    <strong>Page Layout</strong>
                  </td>
                  <td style={styles.tableCell}>Portrait orientation</td>
                </tr>
                <tr style={styles.tableRowEven}>
                  <td style={styles.tableCell}>
                    <strong>Margins</strong>
                  </td>
                  <td style={styles.tableCell}>1 cm on all sides</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Case References */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Case References</h2>
          <p style={styles.sectionText}>
            Case names should be presented in <strong>bold and italics</strong>.
          </p>
          <div style={styles.exampleBox}>
            <p style={styles.exampleLabel}>Example:</p>
            <p style={styles.exampleText}>
              <strong>
                <em>K.S. Puttaswamy v. Union of India</em>
              </strong>
            </p>
          </div>
        </section>

        {/* Presentation & Design */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Presentation & Design</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              Submissions should maintain a professional and academic tone.
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span>
              Decorative elements such as page borders are to be avoided in
              order to preserve uniformity.
            </li>
          </ul>
        </section>

        {/* Quick Reference */}
        <section style={styles.quickReference}>
          <h3 style={styles.quickRefTitle}>Quick Reference Checklist</h3>
          <div style={styles.checklistGrid}>
            {[
              "✓ 1500-1800 words",
              "✓ Bluebook 21st Ed. citations",
              "✓ Similarity index < 10%",
              "✓ Times New Roman font",
              "✓ Spacing: 1.5 body, 1.0 bibliography",
              "✓ 1cm margins, Portrait layout",
              "✓ Original work",
              "✓ Bibliography included",
            ].map((item, idx) => (
              <div key={idx} style={styles.checklistItem}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            For any clarifications, please contact us.
          </p>
          <button
            onClick={() => router.back()}
            style={styles.backButton}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform =
                "translateY(-1px)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 4px 12px rgba(255, 193, 7, 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 2px 8px rgba(255, 193, 7, 0.3)";
            }}
          >
            Back to Submission Form
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    padding: "32px",
    maxWidth: "56rem",
    margin: "0 auto",
    backgroundColor: "#f7f1e0",
    minHeight: "100vh",
    fontFamily: '"Arial", "Roboto", "Open Sans", system-ui, sans-serif',
  },
  content: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(68, 72, 89, 0.08)",
    border: "1px solid #e9ecef",
  },
  mainTitle: {
    fontSize: "2.5rem",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "8px",
    textAlign: "center" as const,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    textAlign: "center" as const,
    color: "#6c757d",
    fontSize: "16px",
    marginBottom: "40px",
    fontWeight: "500",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "16px",
    borderBottom: "3px solid #ffc107",
    paddingBottom: "8px",
  },
  introText: {
    fontSize: "15px",
    color: "#444859",
    lineHeight: "1.8",
    textAlign: "justify" as const,
  },
  sectionText: {
    fontSize: "15px",
    color: "#444859",
    lineHeight: "1.8",
  },
  highlightBox: {
    padding: "20px",
    backgroundColor: "#fff8e1",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    borderLeft: "4px solid #f4d942",
  },
  highlightText: {
    fontSize: "15px",
    color: "#444859",
    margin: "0",
  },
  list: {
    listStyle: "none",
    padding: "0",
    margin: "0",
  },
  listItem: {
    padding: "12px 0 12px 28px",
    position: "relative" as const,
    fontSize: "15px",
    color: "#444859",
    lineHeight: "1.7",
  },
  bullet: {
    color: "#f4d942",
    fontWeight: "600",
    fontSize: "1.2em",
    position: "absolute" as const,
    left: "0",
    top: "12px",
  },
  originalityBox: {
    backgroundColor: "#fff8e1",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },
  formatTable: {
    backgroundColor: "#fff8e1",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "24px",
    border: "1px solid #e9ecef",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "14px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    overflow: "hidden" as const,
  },
  tableHeader: {
    padding: "12px",
    textAlign: "left" as const,
    borderBottom: "2px solid #f4d942",
    fontWeight: "600",
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  tableCell: {
    padding: "12px",
    borderBottom: "1px solid #e9ecef",
    color: "#444859",
  },
  tableRowEven: {
    backgroundColor: "#fff8e1",
  },
  exampleBox: {
    padding: "20px",
    backgroundColor: "#fff8e1",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    marginTop: "16px",
  },
  exampleLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "600",
    marginBottom: "8px",
  },
  exampleText: {
    fontSize: "15px",
    color: "#444859",
    margin: "0",
  },
  quickReference: {
    backgroundColor: "#f4d942",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  quickRefTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "16px",
    textAlign: "center" as const,
  },
  checklistGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px",
  },
  checklistItem: {
    padding: "8px 12px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#444859",
    fontWeight: "500",
  },
  footer: {
    textAlign: "center" as const,
    padding: "24px",
    borderTop: "2px solid #e9ecef",
  },
  footerText: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "16px",
  },
  backButton: {
    fontFamily: '"Arial", "Roboto", "Open Sans", system-ui, sans-serif',
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "#f4d942",
    color: "#444859",
    padding: "12px 32px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer" as const,
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.3)",
  },
};
