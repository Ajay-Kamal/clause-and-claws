"use client";

import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import styles from "../styles/PDFArticle.module.css";

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface PDFArticleRendererProps {
  fileUrl: string;
  title?: string;
}

interface TextBlock {
  text: string;
  fontSize: number;
  x: number;
  y: number;
  isHeading: boolean;
}

export default function PDFArticleRenderer({ fileUrl, title }: PDFArticleRendererProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;

    const extractPDFContent = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Group text items by their vertical position (y-coordinate)
          const lines: { [key: string]: TextBlock[] } = {};
          
          textContent.items.forEach((item: any) => {
            const tx = item.transform;
            const fontSize = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
            const y = Math.round(tx[5]);
            const x = tx[4];
            
            if (!lines[y]) {
              lines[y] = [];
            }
            
            lines[y].push({
              text: item.str,
              fontSize: fontSize,
              x: x,
              y: y,
              isHeading: fontSize > 14, // Larger text = heading
            });
          });

          // Sort lines by Y position (top to bottom)
          const sortedYs = Object.keys(lines).sort((a, b) => parseFloat(b) - parseFloat(a));
          
          let previousFontSize = 0;
          let currentParagraph = "";

          sortedYs.forEach((y) => {
            // Sort items in the line by X position (left to right)
            const lineItems = lines[y].sort((a, b) => a.x - b.x);
            const lineText = lineItems.map(item => item.text).join(' ').trim();
            const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;

            if (lineText.length === 0) return;

            // Detect headings (larger font size)
            if (avgFontSize > 14) {
              if (currentParagraph) {
                fullText += `<p>${currentParagraph}</p>\n`;
                currentParagraph = "";
              }
              fullText += `<h2>${lineText}</h2>\n`;
            }
            // New paragraph if there's a significant gap or font size change
            else if (Math.abs(avgFontSize - previousFontSize) > 2 && currentParagraph) {
              fullText += `<p>${currentParagraph}</p>\n`;
              currentParagraph = lineText;
            }
            // Continue current paragraph
            else {
              if (currentParagraph && !currentParagraph.endsWith('-')) {
                currentParagraph += ' ';
              }
              currentParagraph += lineText;
            }

            previousFontSize = avgFontSize;
          });

          // Add remaining paragraph
          if (currentParagraph) {
            fullText += `<p>${currentParagraph}</p>\n`;
          }

          // Add page break (except for last page)
          if (pageNum < pdf.numPages) {
            fullText += `<div class="page-break"></div>\n`;
          }
        }

        setContent(fullText);
        setIsLoading(false);
      } catch (error) {
        console.error("Error extracting PDF content:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    extractPDFContent();
  }, [fileUrl]);

  const downloadPdf = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title ? `${title}.pdf` : "document.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p>Extracting article content...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.error}>
        <p>Failed to extract PDF content</p>
      </div>
    );
  }

  return (
    <div className={styles.articleContainer}>
      <div className={styles.downloadSection}>
        <button onClick={downloadPdf} className={styles.downloadBtn}>
          <DownloadIcon /> Download Original PDF
        </button>
      </div>
      
      <article 
        className={styles.articleContent}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}