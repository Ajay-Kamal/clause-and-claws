"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./legal.module.css";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.heading}>INFORMATION THAT WE COLLECT:</h2>
          <p className={styles.text}>
            <strong>Contact information:</strong> We collect your name, address,
            contact number, email address.
          </p>
          <p className={styles.text}>
            <strong>Payment and billing information:</strong> We collect your
            billing name, billing email address, and payment method when you buy
            anything on the website.
          </p>
          <p className={styles.text}>
            <strong>Google Form:</strong> Information given by you through a
            google form in attempt to submit your material for publication in
            the Journal.
          </p>
          <p className={styles.text}>
            <strong>Information you provide:</strong> We collect the information
            you post in a public space on our website or on a third-party social
            media site belonging to www.clauseandclaws.com.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>CONSENT MECHANISM</h2>
          <p className={styles.text}>
            We at Clause and Claws take serious care of not publishing or
            processing your personal data without your consent.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>USE OF YOUR PERSONAL INFORMATION:</h2>
          <p className={styles.text}>
            <strong>To contact you:</strong> We might use the information you
            provide to contact you for confirmation of your registration for
            publication of any material, its approval, its rejection or
            resending the article for making changes. We may reach out to you
            for any promotional purposes (subject to consent).
          </p>
          <p className={styles.text}>
            <strong>To respond to your requests or questions:</strong> We might
            use your information to answer any of your queries, moreover it can
            be used for any event, training or course.
          </p>
          <p className={styles.text}>
            <strong>To display on the website:</strong> We may use your
            information to publish the article on our website, by submitting
            your article or paper for publication, you are consenting to the
            same.
          </p>
          <p className={styles.text}>
            <strong>To improve our products and services:</strong> We might use
            your information to customize your experience with us. This could
            include displaying content suited to your preferences.
          </p>
          <p className={styles.text}>
            <strong>To look at site trends and customer interests:</strong> We
            might use your information to make our website more user-friendly.
          </p>
          <p className={styles.text}>
            <strong>For security purposes:</strong> We may use information to
            protect our company, our customers, or our websites from any illicit
            activities.
          </p>
          <p className={styles.text}>
            <strong>For marketing purposes:</strong> We might send you
            information about special promotions or offers. We might also tell
            you about new features or products. These might be our offers or
            products (subject to consent).
          </p>
          <p className={styles.text}>
            <strong>For transactional purposes:</strong> We might send you
            emails or SMS about your account or in case of any purchase. We use
            information as otherwise permitted by law.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>
            RIGHTS THAT CAN BE EXERCISED BY YOU:
          </h2>
          <p className={styles.text}>
            Subject to the new Digital Personal Data Protection Act, the user
            now has following rights:
          </p>
          <ul className={styles.list}>
            <li>
              The Right to <strong>Access</strong> the personal data.
            </li>
            <li>
              The Right to <strong>Correct/Erase</strong> the personal data.
            </li>
            <li>
              The Right to <strong>Grievance</strong>.
            </li>
            <li>
              The Right to <strong>Nominate</strong>.
            </li>
            <li>
              The Right to <strong>withdraw Consent</strong>.
            </li>
          </ul>
          <p className={styles.text}>
            You may exercise your rights by e-mailing to{" "}
            <a
              href="mailto:info.clauseandclaws@gmail.com"
              className={styles.link}
            >
              info.clauseandclaws@gmail.com
            </a>
            .
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>
            SHARING OF YOUR INFORMATION WITH THIRD PARTIES:
          </h2>
          <p className={styles.text}>
            Your information may be shared with an organization or a statutory
            authority for legal compliance.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>DATA SHARED WITH PROCESSORS:</h2>
          <p className={styles.text}>
            Your data that will be displayed on our website will be shared with
            our web hosting platform, but any further use of your data by the
            data processor, will be subject to your consent.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>DATA PROTECTION IMPACT ASSESSMENT:</h2>
          <p className={styles.text}>
            We at ClauseandClaws, undertake periodic Data Protection Impact
            Assessments to evaluate the use of your personal data and assess any
            risks that may to breach of your data.
          </p>
          <p className={styles.text}>
            A DPIA is done in order to safeguard your Data and our website from
            Data Breaches.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>PROCEDURE DURING DATA BREACH:</h2>
          <p className={styles.text}>
            A threefold approach is followed during the time of Data Breach:
          </p>
          <ul className={styles.list}>
            <li>
              The Data Breach is <strong>identified</strong>, the{" "}
              <strong>services</strong> of the website will be immediately{" "}
              <strong>halted</strong> to prevent more breach,{" "}
              <strong>professionals indicted</strong> to recover the data lost.
            </li>
            <li>
              Information regarding the Data Breach is provided to the Data
              Principals as soon as possible after the Data Breach.
            </li>
            <li>
              Data Breach is also notified to the Data Protection Board which is
              a statutory body framed under the DPDP Act, 2023.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>DATA RETENTION AND DATA DELETION:</h2>
          <p className={styles.text}>
            <strong>Data Retention:</strong> Your data is retained with us for
            the period during which your article is published on our website.
            Data that will be retained may be your Name and contact details.
          </p>
          <p className={styles.text}>
            For deletion of your data completely, you may write us on{" "}
            <a
              href="mailto:info.clauseandclaws@gmail.com"
              className={styles.link}
            >
              info.clauseandclaws@gmail.com
            </a>
            .
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>COOKIE POLICY</h2>
          <p className={styles.text}>
            To improve the responsiveness of the sites for our users, we may use
            "cookies", or similar electronic tools to collect information to
            assign each visitor a unique, random number as a User Identification
            (User ID) to understand the user's individual interests using the
            identified Computer. Unless you voluntarily identify yourself
            (through registration, for example), we will have no way of knowing
            who you are, even if we assign a cookie to your computer. The only
            personal information a cookie can contain is information you supply.
            A cookie can't read data off your hard drive. Our advertisers may
            also assign their cookies to your browser (if you click on their
            ads), a process that we do not control.
          </p>
          <p className={styles.text}>
            You can prevent the storage of cookies by choosing a "disable
            cookies" option in your browser settings. But this can limit the
            functionality of our services.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>CHILDREN DATA</h2>
          <p className={styles.text}>
            If you are under 18 or the age of minority in your jurisdiction, you
            may only supply us your personal data with the consent of
            parents/guardians. We will not be liable for any cause of action
            arising due to this section.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>OPTING-OUT OF MARKETING:</h2>
          <p className={styles.text}>
            You can opt out of receiving our marketing messages and emails: To
            stop receiving our promotional emails, please email at{" "}
            <a
              href="mailto:info.clauseandclaws@gmail.com"
              className={styles.link}
            >
              info.clauseandclaws@gmail.com
            </a>
            . It may take a reasonable amount of time to process your request of
            Opting Out of marketing.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>GRIEVANCE REDRESSAL:</h2>
          <p className={styles.text}>
            Users who have concerns or grievances related to the privacy policy
            can contact our designated Grievance Officer using the following
            details:
          </p>
          <p className={styles.text}>
            <strong>Grievance Officer:</strong> Rudransh Rajput
            <br />
            <strong>Email:</strong>{" "}
            <a
              href="mailto:info.clauseandclaws@gmail.com"
              className={styles.link}
            >
              info.clauseandclaws@gmail.com
            </a>
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>UPDATION OF POLICY:</h2>
          <p className={styles.text}>
            From time to time, we may change our privacy practices. We will
            notify you of any material changes to this policy as required by
            law. We will also post an updated copy on our website. Please check
            our site periodically for updates.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>JURISDICTION:</h2>
          <p className={styles.text}>
            If you choose to visit the website, your visit and any dispute over
            privacy is subject to this Policy and the website's terms of use. In
            addition to the foregoing, any disputes arising under this Policy
            shall be governed by the laws of India.
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
