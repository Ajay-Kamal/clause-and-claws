"use client";

import React from "react";
import styles from "../../styles/ResearchPaper.module.css";

export default function ResearchPaper() {
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Upload Research Paper</h1>
        <div className={styles.guidelines}>
          <h3 className={styles.guidelinesTitle}>Publishing Guidelines</h3>
          <div className={styles.guidelinesContent}>
            {/* Types of Submissions */}
            <section>
              <h2 className={styles.sectionTitle}>Types of Submissions</h2>
              <ul className={styles.guidelinesList}>
                <li>Research Paper: 4,000–6,000 words</li>
                <li>Case Notes: 2,000–5,000 words</li>
                <li>Legislative Comments: 1,000–3,000 words</li>
                <li>Book Reviews: 1,000–3,000 words</li>
              </ul>
              <p>
                <em>
                  The word limit is exclusive of the abstract and the footnotes.
                </em>
              </p>
            </section>

            {/* General Submission Guidelines */}
            <section>
              <h2 className={styles.sectionTitle}>General Submission Guidelines</h2>
              <ul className={styles.guidelinesList}>
                <li>Maximum of two co-authors per manuscript.</li>
                <li>One submission per author or team of co-authors.</li>
                <li>Authors will be informed of manuscript status after every review stage.</li>
                <li>No expedited review requests will be entertained.</li>
                <li>Non-conforming manuscripts may be rejected or sent back for modifications.</li>
                <li>
                  The Editorial Board reserves the right to waive or amend rules at its discretion. Its decision is final in case of dispute.
                </li>
              </ul>
            </section>

            {/* Citation Standards */}
            <section>
              <h2 className={styles.sectionTitle}>Citation Standards</h2>
              <ul className={styles.guidelinesList}>
                <li>Must strictly conform to <strong>Bluebook (21st Edition)</strong>.</li>
                <li>Only footnotes permitted for citations.</li>
                <li>Speaking/substantive footnotes discouraged.</li>
                <li>SCC citations preferred for cases.</li>
              </ul>
            </section>

            {/* Style Guidelines */}
            <section>
              <h2 className={styles.sectionTitle}>Style Guidelines</h2>
              <ol className={styles.guidelinesList}>
                <li>Title: Times New Roman, 14 pt, 1.5 spacing, Bold, All Caps, Centre-aligned</li>
                <li>Abstract: Times New Roman, 12 pt, 1.15 spacing, Italics, Justified, 2 cm indent both sides</li>
                <li>Heading Level 1: Times New Roman, 14 pt, 1.5 spacing, Bold, Small Caps, Centre-aligned (I, II, III…)</li>
                <li>Heading Level 2: Times New Roman, 12 pt, 1.5 spacing, Italics, Sentence case, Centre-aligned (A, B, C…)</li>
                <li>Heading Level 3: Times New Roman, 12 pt, 1.5 spacing, Italics + Underlined, Sentence case, Left-aligned (a), b), c)…)</li>
                <li>Heading Level 4: Times New Roman, 12 pt, 1.5 spacing, Italics, Sentence case, Left-aligned (i., ii., iii.…)</li>
                <li>Main Body: Times New Roman, 12 pt, 1.15 spacing, Justified, 1-inch margins</li>
                <li>Footnotes: Times New Roman, 10 pt, 1.0 spacing, Justified</li>
                <li>Acronyms: Expanded in first instance; consistent usage thereafter</li>
                <li>Italics for case names, publications, books, foreign words</li>
                <li>Numbers written in words; use “%” symbol for percentages</li>
              </ol>
            </section>

            {/* Parameters for Evaluation */}
            <section>
              <h2 className={styles.sectionTitle}>Parameters for Evaluation</h2>
              <h3 className={styles.subSectionTitle}>1. Technical Review</h3>
              <ul className={styles.guidelinesList}>
                <li>All submissions must be original and plagiarism-free.</li>
                <li>Plagiarism check is conducted in two stages.</li>
                <li>No footnotes → automatic rejection at Stage I.</li>
                <li>Paraphrasing or verbatim use without citation counts as plagiarism.</li>
                <li>Plagiarism in abstract or conclusion → immediate disqualification.</li>
                <li>Secondary plagiarism (plagiarised sources) → immediate disqualification.</li>
              </ul>
              <h3 className={styles.subSectionTitle}>2. Content Review</h3>
              <p>
                Conducted in two stages; shortlisted manuscripts go for Peer Review. Evaluated on:
              </p>
              <ol className={styles.guidelinesList}>
                <li>
                  <strong>Grammar and Language:</strong> Crisp, concise, minimal passive voice; avoid repetition, long-winded sentences, rhetoric.
                </li>
                <li>
                  <strong>Structure and Logical Coherence:</strong> Clear structure, logical flow; avoid incorrect premises or weak logic.
                </li>
                <li>
                  <strong>Contribution to Literature:</strong> Go beyond summaries; provide novel analysis or interpretation.
                </li>
                <li>
                  <strong>Contemporary Relevance:</strong> Must include recent developments or highlight under-discussed issues.
                </li>
                <li>
                  <strong>Referencing and Research:</strong> In-depth research; appropriate citations with relevance.
                </li>
              </ol>
            </section>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <div className={styles.cancelButton}>Coming Soon...</div>
        </div>
      </div>
    </>
  );
}