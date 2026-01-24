"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './legal.module.css';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Introduction</h2>
          <p className={styles.text}>
            These terms govern your access to and use of the clause and claws website. By using the website, you agree to these terms and our privacy policy. We may modify these terms, and your continued use constitutes acceptance.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. SERVICES</h2>
          <p className={styles.text}>
            <strong>2.1 Terms of Offer:</strong> By registering, you agree to these terms.
          </p>
          <p className={styles.text}>
            <strong>2.2 Marketing Communications:</strong> We may send you informational communications. We will only send direct marketing communications with your consent, which you can withdraw. Please check about the withdrawal process in our privacy policy.
          </p>
          <p className={styles.text}>
            <strong>2.3 Refund Policy:</strong> We do not offer any kind of refund of donations or payments.
          </p>
          <p className={styles.text}>
            <strong>2.4 Intellectual Property Rights:</strong> We own all intellectual property rights on the website and its content. You may not copy, reproduce, sell, or distribute our content without our written permission. In case of this breach, we may initiate a legal action against the offender.
          </p>
          <p className={styles.text}>
            <strong>2.5 Products/Services:</strong> Products/services include online/offline courses, events, workshops, study materials, and online resources.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. WEBSITE</h2>
          <p className={styles.text}>
            <strong>3.1 Content:</strong> The website provides information about clause and claws and its work. We own the content, which is protected by Indian intellectual property laws. Your use of the content is limited to personal, non-commercial purposes.
          </p>
          <p className={styles.text}>
            <strong>3.2 Third-Party Websites:</strong> the website may contain links to third-party websites. We are not responsible for these websites.
          </p>
          <p className={styles.text}>
            <strong>3.3 Acceptable Use:</strong> You agree to use the website for lawful purposes. Prohibited activities include illegal use, interfering with the website, reselling materials, distributing spam, harassment, unauthorized access, collecting personal data without consent, uploading malicious code, and violating laws. We are not liable for damages from your website use.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. USER SUBMISSIONS</h2>
          <p className={styles.text}>
            <strong>4.1</strong> By submitting content to us, you grant us an exclusive license to use it.
          </p>
          <p className={styles.text}>
            <strong>4.2</strong> We may monitor or remove inappropriate content.
          </p>
          <p className={styles.text}>
            <strong>4.3</strong> You are responsible for your submissions, which must not violate third-party rights or be unlawful.
          </p>
          <p className={styles.text}>
            <strong>4.4</strong> We will not retain your data for longer than necessary.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. DISCLAIMER OF WARRANTIES</h2>
          <p className={styles.text}>
            Your use of the website is at your own risk. The website and its content are provided "as is." We disclaim all warranties.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. ACCOUNT, PASSWORD, AND SECURITY</h2>
          <p className={styles.text}>
            You are responsible for maintaining your account confidentiality and security. Notify the use of any unauthorized use in writing as soon as possible.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>7. LIMITATION OF LIABILITY</h2>
          <p className={styles.text}>
            The website's liability is limited to the amount you paid for website products/services. The university is not liable for any damages, including direct, indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>8. INDEMNIFICATION</h2>
          <p className={styles.text}>
            You agree to indemnify the website from any liabilities, claims, damages, costs, and expenses arising from your use of the website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>9. GOVERNING LAWS; DISPUTE RESOLUTION</h2>
          <p className={styles.text}>
            The laws of india govern these terms. Claims must be brought within 1 month of the cause of action. Disputes will be attempted to be resolved through mediation.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>10. PRIVACY</h2>
          <p className={styles.text}>
            We are committed to protecting users' privacy. Refer to the privacy policy on the website.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>11. AGREEMENT TO BE BOUND</h2>
          <p className={styles.text}>
            By using the website, you agree to these terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>12. GENERAL</h2>
          <p className={styles.text}>
            <strong>12.1 Force Majeure:</strong> We are not responsible for delays or interruptions due to events beyond its control.
          </p>
          <p className={styles.text}>
            <strong>12.2 Cessation of Operation:</strong> We may cease operation of the website at any time.
          </p>
          <p className={styles.text}>
            <strong>12.3 Entire Agreement:</strong> These terms constitute the entire agreement between you and us.
          </p>
          <p className={styles.text}>
            <strong>12.4 Effect of Waiver:</strong> Failure to enforce any provision does not constitute a waiver.
          </p>
          <p className={styles.text}>
            <strong>12.5 Termination:</strong> We may terminate your access for breach of these terms.
          </p>
          <p className={styles.text}>
            <strong>12.6 Domestic Use:</strong> We make no representation that the website is appropriate for use outside india.
          </p>
          <p className={styles.text}>
            <strong>12.7 Assignment:</strong> You may not assign your rights or obligations under these terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>CONTACT:</h2>
          <p className={styles.text}>
            Contact the Grievance Redressal officer at <a href="mailto:info.clauseandclaws@gmail.com" className={styles.link}>info.clauseandclaws@gmail.com</a> with questions or complaints.
          </p>
        </section>

        <div className={styles.footer}>
          <button onClick={() => router.back()} className={styles.backButton}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}