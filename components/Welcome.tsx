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
  const slides = [
    "./images/welcome-banner.svg",
    "./images/welcome-banner.svg",
    "./images/welcome-banner.svg",
    "./images/welcome-banner.svg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, []);

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
              <img
                key={index}
                src={slide}
                alt="WELCOME"
                className={styles.carouselImage}
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
        <div className={styles.welcomeText}>
          <h1>Where Clauses Speak,</h1>
          <h1>and Claws Create Change</h1>
          <p>
            Cutting-edge legal scholarship for law students and 
            professionals. Research, analysis and discourse on 
            contemporary legal issues.
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
          <header>IN ASSOCIATION WITH</header>
          <div className={styles.associations}>
            <div className={styles.association1}>
              <h1>Trust Law Offices</h1>
              <p>GLOBAL LEGAL PARTNER</p>
            </div>
            <div className={styles.midLine}></div>
            <div className={styles.association2}>
              <h1>Ministry of Law & Justice</h1>
              <p>GOVERNMENT OF INDIA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}