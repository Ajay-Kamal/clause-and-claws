"use client";

import React from "react";
import Link from "next/link";
import styles from "./AboutUs.module.css";
import Image from "next/image";

type Stats = { articles: number; authors: number };

type Admin = {
  id: number;
  name: string;
  title: string;
  email: string;
  linkedin: string;
  profileImage: string;
  bio: string;
  expertise: string[];
  achievements: string[];
};

const adminData: Admin[] = [
  {
    id: 1,
    name: "Rudransh Rajput",
    title: "Founder",
    email: "Info.clauseandclaws@gmail.com",
    linkedin: "http://www.linkedin.com/in/rudransh-rajput",
    profileImage: "/images/rudransh-bhaiya.jpg",
    bio: "I am Rudransh Singh Rajput, Founder of this online legal publication platform, driven by a passion for law, research, and the power of informed discourse. I have gained diverse legal exposure through internships at the Supreme Court, High Court, corporate law offices, and public sector enterprises. My professional journey so far has equipped me with expertise in various field of law. In an era of dynamic change, where the global legal landscape is constantly evolving, I believe that creating such a platform is not just a professional pursuit but a responsibility. Through this initiative, I aspire to bridge the gap between academia and practice, and to provide a forum where fresh ideas can inspire reforms, debates, and solutions.",
    expertise: [
      "Civil Law",
      "Criminal Law",
      " Alternate Dispute Resolution",
      "Competition Law",
      "Consumer Protection Law",
    ],
    achievements: [
      "Published Comprehensive legal research on pressing national and international issues.",
      "State Debater at Viksit Bharat, Ministry of Youth Affairs and Sports.",
      "Researched on issues took up in Rajya Sabha.",
      "Developed application Student First- a student centric mobile application.",
    ],
  },
  // {
  //   id: 2,
  //   name: "Purav Garg",
  //   title: "Co-Founder",
  //   email: "puravgarg0786@gmail.com",
  //   linkedin: "https://www.linkedin.com/in/purav-garg-a27925267",
  //   profileImage: "/images/purav-bhaiya.jpg",
  //   bio: "I am Purav Garg, Co-Founder of this online legal publication platform, committed to building a space where law and ideas converge. As a law student with a keen interest in legal research, policy, and practical application of jurisprudence, I have dedicated my academic journey towards understanding how legal frameworks shape society and governance.Through internships and academic engagements, I have gained exposure across diverse areas of law, ranging from constitutional principles and criminal law to corporate regulations and dispute resolution. These experiences have strengthened my conviction that law must be accessible, well-disseminated, and critically analyzed in order to truly serve its purpose.",
  //   expertise: [
  //     "Data Privacy Law",
  //     "Cybersecurity",
  //     "Competition Law",
  //     "Constitutional Law",
  //     "Arbiration Law",
  //   ],
  //   achievements: [
  //     "Authored multiple Articles and Research Reports.",
  //     "Former Research Manager.",
  //     "Drafting Wizard and Experienced in peer-reviewing.",
  //     "Data Privacy Professional.",
  //   ],
  // },
  // {
  //   id: 3,
  //   name: "Venkat Murali Avugaddi",
  //   title: "Chief Technical Officer",
  //   email: "venkatmuraliavugaddi@gmail.com",
  //   linkedin: "https://www.linkedin.com/in/murali-avugaddi-918904269/",
  //   profileImage: "/images/murali-anna.jpg",
  //   bio: "I am Avugaddi Venkat Murali, co‑founder of this online legal publication platform here in India. I am also building my agency, Avugaddi Software Systems. Through our agency, we designed and developed Clause and Claws entirely from the ground up. From constructing the full-stack architecture to creating intuitive user experiences, every aspect of this product reflects innovation, usability, and reliability. Clause and Claws is the first product launched under my agency, representing my vision of blending technology with meaningful impact—creating a digital space where law, research, and fresh ideas can thrive. As a student passionate about technology and design, I focus on learning and applying modern development and UX/UI techniques. Through this initiative, I aim to combine creativity and problem-solving to support the legal community and lay a foundation for future products and services as my agency grows.",
  //   expertise: ["UI/UX Design", "Flutter","Backend Development","Spring Boot"],
  //   achievements: [
  //     "Co‑founded an online legal publication platform in India.",
  //     "Building Avugaddi Software Systems, a student‑led digital agency."
  //   ],
  // }
];

const LinkedInIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const EmailIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const AdminCard = ({ admin }: { admin: Admin }) => (
  <div className={styles.adminCard}>
    <div className={styles.adminHeader}>
      <div className={styles.profileImageContainer}>
        <div className={styles.profileImage}>
          <Image
            src={admin.profileImage}
            alt={`${admin.name} profile picture`}
            width={120}
            height={120}
            className={styles.profileImg}
          />
        </div>
      </div>
      <div className={styles.adminInfo}>
        <h2 className={styles.adminName}>{admin.name}</h2>
        <p className={styles.adminTitle}>{admin.title}</p>
        <div className={styles.contactLinks}>
          <a
            href={`mailto:${admin.email}`}
            className={styles.contactLink}
            aria-label={`Email ${admin.name}`}
          >
            <EmailIcon />
            <span>{admin.email}</span>
          </a>
          <a
            href={admin.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
            aria-label={`${admin.name}'s LinkedIn profile`}
          >
            <LinkedInIcon />
            <span>LinkedIn Profile</span>
          </a>
        </div>
      </div>
    </div>
    <div className={styles.adminContent}>
      <div className={styles.bioSection}>
        <h3 className={styles.sectionTitle}>About</h3>
        <p className={styles.bio}>{admin.bio}</p>
      </div>
      <div className={styles.expertiseSection}>
        <h3 className={styles.sectionTitle}>Areas of Expertise</h3>
        <div className={styles.expertiseTags}>
          {admin.expertise.map((area, index) => (
            <span key={index} className={styles.expertiseTag}>
              {area}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.achievementsSection}>
        <h3 className={styles.sectionTitle}>Key Achievements</h3>
        <ul className={styles.achievementsList}>
          {admin.achievements.map((achievement, index) => (
            <li key={index} className={styles.achievementItem}>
              <CheckIcon />
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);


//Removed stats for now 
//Just add the params if needed in future
export default function AboutUsClient() {
  return (
    <div className={styles.aboutPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            The Clause and Claws : A Call to Action
          </h1>
            <p className={styles.heroSubtitle}>
            The Clause and Claws is more than just a publication; it is a
            movement. We are a dynamic platform dedicated to promoting public
            service by empowering the legal community to tackle the most
            pressing issues of our time. In a world that is rapidly globalizing,
            we believe it&apos;s essential to not only understand the law but to
            actively shape it. We provide a space where the legal fraternity can
            showcase the &quot;need of the hour,&quot; turning discourse into impactful
            change. Connecting Global Ideas to Indian Roots Our ambition is
            deeply intertwined with the Viksit Bharat movement. We aim to forge
            a unique path by connecting the best of global legal thought with
            the timeless wisdom and rich cultural heritage of Bharat. We are not
            just reporting on the law; we are building a bridge between
            international principles and our national identity, ensuring that
            our legal future is both globally relevant and authentically Indian.
            </p>
        </div>
      </section>

      <section className={styles.journalSection}>
        <div className={styles.container}>
          <div className={styles.journalContent}>
            <h2 className={styles.journalTitle}>
              Our Core Mission: Cultivating Excellence
            </h2>
            <p className={styles.journalDescription}>
              Our mission is built on three core pillars designed to elevate the
              legal profession: <br />
              <b> Championing Legal Advocacy:</b> We provide a powerful platform
              for passionate advocates to voice their arguments and drive
              meaningful legal reform. <br />
              <b>Driving Legal Research:</b> We are committed to publishing
              groundbreaking research that challenges the status quo and deepens
              our collective understanding of the law.
              <br />
              <b>Fostering Legal Scholarship:</b> We are a launchpad for the
              next generation of legal scholars, providing the tools and
              opportunities they need to achieve their professional and academic
              ambitions. Join us in our mission to not only understand the law
              but to use it as a force for positive change.
            </p>
            <div className={styles.statsGrid}>
              {/* <div className={styles.statCard}>
                <h3 className={styles.statNumber}>{stats.articles}+</h3>
                <p className={styles.statLabel}>Articles Published</p>
              </div> */}
              {/* <div className={styles.statCard}>
                <h3 className={styles.statNumber}>{stats.authors}+</h3>
                <p className={styles.statLabel}>Contributing Authors</p>
              </div> */}
              <div className={styles.statCard}>
                <h3 className={styles.statNumber}>55+</h3>
                <p className={styles.statLabel}>Legal Specializations</p>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statNumber}>10+</h3>
                <p className={styles.statLabel}>Monthly Readers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Meet the Founder</h2>
          </div>
          <div className={styles.adminsGrid}>
            {adminData.map((admin) => (
              <AdminCard key={admin.id} admin={admin} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      {/* <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Get In Touch</h2>
            <p className={styles.ctaDescription}>
              Have questions about our journal or interested in contributing?
              We&apos;d love to hear from you.
            </p>
            <div className={styles.ctaButtons}>
              <a
                href="mailto:clauseandclaws@gmail.com"
                className={styles.ctaButton}
              >
                Contact Us
              </a>
              <Link href="/upload" className={styles.ctaButtonSecondary}>
                Submit an Article
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
