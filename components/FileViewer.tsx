"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import styles from "../styles/FileViewer.module.css";

// Set up PDF.js worker - using local file from public folder
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

// Icons (unchanged)
const PDFIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M11 8v6M8 11h6M21 21l-4.35-4.35" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M8 11h6M21 21l-4.35-4.35" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface FileViewerProps {
  fileUrl: string;
  title?: string;
}

interface PageCanvasRef {
  canvas: HTMLCanvasElement;
  pageNum: number;
}

export default function FileViewer({ fileUrl, title }: FileViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.2);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Load PDF document
  useEffect(() => {
    if (!fileUrl) return;

    setIsLoading(true);
    setHasError(false);

    const loadingTask = pdfjsLib.getDocument(fileUrl);

    loadingTask.promise
      .then((pdf) => {
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading PDF:", error);
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [fileUrl]);

  // Render all pages when PDF loads or scale changes
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const renderAllPages = async () => {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        await renderPage(pageNum);
      }
    };

    renderAllPages();
  }, [pdfDoc, scale, numPages]);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Get or create canvas
      let canvas = canvasRefs.current.get(pageNum);
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = styles.pdfPage;
        canvasRefs.current.set(pageNum, canvas);
        
        // Create wrapper for canvas
        const wrapper = document.createElement("div");
        wrapper.className = styles.pageWrapper;
        wrapper.appendChild(canvas);
        containerRef.current?.appendChild(wrapper);
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      // Support high DPI displays
      const outputScale = window.devicePixelRatio || 1;
      
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(outputScale, outputScale);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.5));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

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

  const openPdf = () => {
    window.open(fileUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.errorContainer}>
        <ErrorIcon />
        <p>Failed to load PDF</p>
      </div>
    );
  }

  return (
    <div className={styles.viewerContainer}>
      {/* Header 
      <div className={styles.viewerHeader}>
        <div className={styles.viewerHeaderLeft}>
          <div className={styles.viewerHeaderIcon}>
            <PDFIcon />
          </div>
          <div>
            <p className={styles.viewerHeaderTitle}>{title}</p>
            <p className={styles.viewerHeaderType}>PDF Document • {numPages} pages</p>
          </div>
        </div>
        <div className={styles.viewerHeaderActions}>
          <button onClick={openPdf} className={styles.openBtn}>
            <ExternalIcon /> Open
          </button>
          <button onClick={downloadPdf} className={styles.downloadBtn}>
            <DownloadIcon /> Download
          </button>
        </div>
      </div>*/}

      {/* Zoom Controls
      <div className={styles.pdfControls}>
        <button onClick={zoomOut} disabled={scale <= 0.6}>
          <ZoomOutIcon /> Zoom Out
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} disabled={scale >= 2.5}>
          <ZoomInIcon /> Zoom In
        </button>
      </div>  

      {/* PDF Container */}
      <div className={styles.pdfContainer} ref={containerRef}>
        {/* Pages will be rendered here dynamically */}
      </div>
    </div>
  );
}	