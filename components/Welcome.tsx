"use client";

import { useState, useEffect } from "react";
import styles from "../styles/Welcome.module.css";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";

const eb = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-eb",
  display: "swap",
});

export default function Welcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slides = [
    { image: "./images/welcome-banner.svg", showText: true },
    { image: "./images/welcome-1.png", showText: false },
    { image: "./images/welcome-2.png", showText: false },
    { image: "./images/welcome-3.png", showText: false },
    { image: "./images/welcome-4.png", showText: false },
  ];

  // const points = [
  //   "Clause & Claws offers 100% free publication for all articles, because knowledge should never be behind a paywall.",
  //   "Research Papers, Legislative Comments, Case Commentaries, and Book Reviews are subject to a transparent peer-review process.",
  //   "A single review fee of just ₹700 covers submission of any two scholarly works.",
  //   "Clause & Claws believes in merit-based publication, not pay-to-publish models.",
  //   "Collaborated with Trustlaw.in to provide pro bono legal research support to NGOs and social enterprises.",
  // ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // useEffect(() => {
  //   const pointTimer = setInterval(() => {
  //     setIsVisible(false);
  //     setTimeout(() => {
  //       setCurrentPoint((prev) => (prev + 1) % points.length);
  //       setIsVisible(true);
  //     }, 500);
  //   }, 5000);

  //   return () => clearInterval(pointTimer);
  // }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeWrapper}>
        <div className={styles.carouselContainer}>
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className={styles.carouselImage}
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
                role="img"
                aria-label="WELCOME"
              />
            ))}
          </div>
          <div className={styles.carouselDots}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${
                  index === currentSlide ? styles.activeDot : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div
          className={styles.welcomeText}
          style={{
            opacity: slides[currentSlide].showText ? 1 : 0,
            visibility: slides[currentSlide].showText ? "visible" : "hidden",
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <h1>Where Clauses Speak,</h1>
          <h1>and Claws Create Change</h1>
          <p>
            Cutting-edge legal scholarship for law students and professionals.
            Research, analysis and discourse on contemporary legal issues.
          </p>
          <div className={styles["btn-section"]}>
            <Link href="/articles" className={styles["btn-primary"]}>
              Explore Publications
            </Link>
            <Link
              href="https://chat.whatsapp.com/HW1zoefd3yt4Q3EAu9WDdg"
              className={styles["btn-secondary"]}
            >
              Join Community
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.associationSection}>
        <div className={styles.associationSectionWrapper}>
          <div className={styles.associationDiv}>
            <span className={styles.associationText}>In Association With</span>
            <p className={styles.associationP}>Trust Law Offices - Advocates & Solicitors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
