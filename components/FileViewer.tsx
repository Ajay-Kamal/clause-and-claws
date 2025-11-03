"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import styles from "../styles/FileViewer.module.css";

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface FileViewerProps {
  fileUrl: string;
  title?: string;
  backgroundColor?: string; // Allow customizable background color
}

export default function FileViewer({ fileUrl, title, backgroundColor = "#F5F1E8" }: FileViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

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

  // Measure container width with multiple attempts
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const measureWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
          return true;
        }
      }
      return false;
    };

    // Try measuring immediately
    if (measureWidth()) return;

    // Keep trying until we get a valid width
    const interval = setInterval(() => {
      attempts++;
      if (measureWidth() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);

    // Set up resize observer once we have initial width
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", measureWidth);

    return () => {
      clearInterval(interval);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureWidth);
    };
  }, []);

  // Render all pages
  useEffect(() => {
    if (!pdfDoc || !containerRef.current || containerWidth === 0) return;

    // Clear existing content
    containerRef.current.innerHTML = "";
    canvasRefs.current = [];

    const renderAllPages = async () => {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        await renderPage(pageNum);
      }
    };

    renderAllPages();
  }, [pdfDoc, numPages, containerWidth, backgroundColor]);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !containerRef.current || containerWidth === 0) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      
      // Calculate scale to fit container width perfectly
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.className = styles.pdfPage;
      containerRef.current.appendChild(canvas);
      canvasRefs.current.push(canvas);

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(scaledViewport.width * outputScale);
      canvas.height = Math.floor(scaledViewport.height * outputScale);
      canvas.style.width = Math.floor(scaledViewport.width) + "px";
      canvas.style.height = Math.floor(scaledViewport.height) + "px";

      // Fill with background color BEFORE scaling
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Now scale for rendering
      context.scale(outputScale, outputScale);

      // Render PDF with background specified
      const renderTask = page.render({ 
        canvasContext: context, 
        viewport: scaledViewport,
        background: backgroundColor
      });

      await renderTask.promise;
    } catch (error: any) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer} style={{ backgroundColor }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderWidth: 4,
              borderStyle: "solid",
              borderColor: "#e5e7eb",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "lj-spin 1s linear infinite",
              boxSizing: "border-box",
            }}
          />
          <p style={{ margin: 0, color: "#6B7280", fontSize: "0.875rem" }}>
            Loading document...
          </p>
        </div>

        <style>{`
          @keyframes lj-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.errorContainer}>
        <p style={{ color: "#EF4444", fontSize: "0.875rem", margin: 0 }}>
          Failed to load document. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={styles.pdfContainer} 
      ref={containerRef}
      style={{ backgroundColor }}
    ></div>
  );
}