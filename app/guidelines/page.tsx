"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './guideline.module.css';

export default function GuidelinesPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <h1 className={styles.mainTitle}>Submission Guidelines</h1>
        <p className={styles.subtitle}>Clause and Claws Law Review</p>

        {/* Types of Submissions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>I. Types of Submissions</h2>
          <p className={styles.sectionText}>
            We accept manuscripts on any topic of contemporary legal relevance, meeting the following criteria:
          </p>
          <div className={styles.typesList}>
            {[
              { type: 'Research Paper', words: '4,000-6,000 words' },
              { type: 'Case Notes', words: '2,000-5,000 words' },
              { type: 'Legislative Comments', words: '1,000-3,000 words' },
              { type: 'Book Reviews', words: '1,000-3,000 words' }
            ].map((item, idx) => (
              <div key={idx} className={styles.typeItem}>
                <strong>{item.type}:</strong> {item.words}
              </div>
            ))}
          </div>
          <div className={styles.note}>
            <strong>Note:</strong> Word limits are exclusive of abstract and footnotes.
          </div>
        </section>

        {/* General Guidelines */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>II. General Submission Guidelines</h2>
          <ul className={styles.list}>
            <li>Manuscripts must not be co-authored by more than two people.</li>
            <li>Authors may submit only one manuscript per author or co-author team.</li>
            <li>Authors will be informed of manuscript status after every review stage.</li>
            <li>Editorial decisions are based solely on final manuscript review.</li>
            <li>Manuscripts not conforming to guidelines may be rejected at the Editorial Board's discretion.</li>
            <li>The Editorial Board may request modifications at any stage.</li>
            <li>The Editorial Board's decisions are final and binding.</li>
          </ul>
        </section>

        {/* Citation Standards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>III. Citation Standards</h2>
          <ul className={styles.list}>
            <li>Citations must strictly conform to <strong>Bluebook (21st Edition)</strong> standards.</li>
            <li>Use <strong>only footnotes</strong> for citations.</li>
            <li>Speaking/substantive footnotes are highly discouraged.</li>
            <li>SCC citations for cases must be preferred where available.</li>
          </ul>
        </section>

        {/* Formatting Guidelines */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>IV. Style & Formatting Guidelines</h2>
          
          <div className={styles.formatTable}>
            <h3 className={styles.subsectionTitle}>Text Formatting</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Format</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { element: 'Title', format: 'Times New Roman, 14pt, 1.5 spacing, Bold, ALL CAPS, Center' },
                  { element: 'Abstract', format: 'Times New Roman, 12pt, 1.15 spacing, Italics, Justified, 2cm indent' },
                  { element: 'Heading Level 1', format: 'Times New Roman, 14pt, Bold, Small Caps, Center (I, II, III...)' },
                  { element: 'Heading Level 2', format: 'Times New Roman, 12pt, Italics, Sentence case, Center (A, B, C...)' },
                  { element: 'Heading Level 3', format: 'Times New Roman, 12pt, Italics & Underlined, Left (a), b), c)...)' },
                  { element: 'Heading Level 4', format: 'Times New Roman, 12pt, Italics, Left (i., ii., iii....)' },
                  { element: 'Main Body', format: 'Times New Roman, 12pt, 1.15 spacing, Justified, 1-inch margins' },
                  { element: 'Footnotes', format: 'Times New Roman, 10pt, 1.0 spacing, Justified' }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.element}</strong></td>
                    <td>{row.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={styles.subsectionTitle}>Additional Style Rules</h3>
          <ul className={styles.list}>
            <li>Acronyms and short forms must be spelled out in parentheses on first use.</li>
            <li>Case names, publications, books, and foreign words should be italicized.</li>
            <li>Numbers should be written in words.</li>
            <li>Use the '%' symbol for percentages.</li>
            <li>For case names, use bold & italic font (e.g., <strong><em>KS Puttaswamy vs. Union of India</em></strong>).</li>
            <li>Page Layout: Portrait orientation with 2cm margins on all sides.</li>
            <li>No page borders should be used.</li>
          </ul>
        </section>

        {/* Evaluation Parameters */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>V. Evaluation Parameters</h2>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>A. Technical Review</h3>
            <div className={styles.plagiarismWarning}>
              <p className={styles.warningTitle}>Plagiarism Policy (Grounds for Immediate Rejection):</p>
              <ul className={styles.warningList}>
                <li>Manuscripts must be original and free of plagiarized content (less than 10%).</li>
                <li>Manuscripts without footnotes will be rejected at Stage I.</li>
                <li>Paraphrasing or verbatim usage without citation qualifies as plagiarism.</li>
                <li>Any plagiarism in abstract or conclusion = immediate disqualification.</li>
                <li>Secondary plagiarism (plagiarism of sources) = immediate disqualification.</li>
              </ul>
            </div>
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>B. Content Review Criteria</h3>
            <div className={styles.criteriaGrid}>
              {[
                {
                  title: '1. Grammar and Language',
                  desc: 'Language must be crisp and concise. Direct statements preferred over indirect. Minimize passive voice. Avoid unnecessary repetition and long-winded sentences.'
                },
                {
                  title: '2. Structure and Logical Coherence',
                  desc: 'Manuscript must be logically sound with clear structure and proper flow. Arguments must be based on correct premises, not incorrect presumptions.'
                },
                {
                  title: '3. Contribution to Existing Literature',
                  desc: 'For extensively written topics, clearly state your contribution. Merely quoting/summarizing precedents is inadequate. Novel explanations and interpretations are appreciated.'
                },
                {
                  title: '4. Contemporary Relevance',
                  desc: 'Include recent developments. Address trending societal and legal issues deserving attention. Highlight relevance in the introduction.'
                },
                {
                  title: '5. Referencing and Research',
                  desc: 'Demonstrate in-depth research, not superficial. Be aware of when to cite, what to cite, and the relevance of citations.'
                }
              ].map((item, idx) => (
                <div key={idx} className={styles.criteriaCard}>
                  <h4 className={styles.criteriaTitle}>{item.title}</h4>
                  <p className={styles.criteriaDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className={styles.quickReference}>
          <h3 className={styles.quickRefTitle}>Quick Reference Checklist</h3>
          <div className={styles.checklistGrid}>
            {[
              '✓ Word limit compliance',
              '✓ Bluebook 21st Ed. citations',
              '✓ Plagiarism < 10%',
              '✓ Times New Roman font',
              '✓ Proper spacing (1.15 body, 1.0 footnotes)',
              '✓ 2cm margins, Portrait layout',
              '✓ Original work',
              '✓ Maximum 2 co-authors'
            ].map((item, idx) => (
              <div key={idx} className={styles.checklistItem}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            For any clarifications, please contact us.
          </p>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            Back to Submission Form
          </button>
        </div>
      </div>
    </div>
  );
}