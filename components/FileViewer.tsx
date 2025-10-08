"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import styles from "../styles/FileViewer.module.css";

// Set up PDF.js worker - using local file from public folder
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface FileViewerProps {
  fileUrl: string;
  title?: string;
}

export default function FileViewer({ fileUrl, title }: FileViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.2);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasks = useRef<Map<number, pdfjsLib.RenderTask>>(new Map());

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

        const wrapper = document.createElement("div");
        wrapper.className = styles.pageWrapper;
        wrapper.appendChild(canvas);
        containerRef.current?.appendChild(wrapper);
      }

      const context = canvas.getContext("2d");
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      // Clear and reset transform
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(outputScale, outputScale);

      // Cancel previous render if exists
      const prevTask = renderTasks.current.get(pageNum);
      if (prevTask) prevTask.cancel();

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTasks.current.set(pageNum, renderTask);

      await renderTask.promise;
      renderTasks.current.delete(pageNum);
    } catch (error: any) {
      if (error.name === "RenderingCancelledException") {
        console.log(`Render for page ${pageNum} cancelled`);
      } else {
        console.error(`Error rendering page ${pageNum}:`, error);
      }
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

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
        <p>Failed to load PDF</p>
      </div>
    );
  }

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.pdfContainer} ref={containerRef}></div>
    </div>
  );
}
