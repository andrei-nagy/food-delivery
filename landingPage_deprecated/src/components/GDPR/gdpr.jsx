import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import "./GDPR.css";

const lastUpdated = "December 15, 2024";
const companyName = "Orderly SRL";
const companyEmail = "privacy@orderly.app";
const companyAddress = "Str. Victoriei 42, Bucharest 010063, Romania";

const sections = [
  {
    id: "who-we-are",
    number: "01",
    title: "Who We Are",
    icon: "🏢",
    content: [
      `${companyName} ("Orderly", "we", "us", or "our") is the data controller responsible for your personal data. We operate the Orderly restaurant management platform, accessible via our website and mobile applications.`,
      `You can contact our Data Protection team at: ${companyEmail}`,
      `Registered address: ${companyAddress}`,
    ],
  },
  {
    id: "what-we-collect",
    number: "02",
    title: "Data We Collect",
    icon: "🗃️",
    content: [
      "Account information: name, email address, phone number, and billing details provided during registration.",
      "Business data: restaurant name, address, operational settings, menu items, and staff information you enter into the platform.",
      "Usage data: how you interact with our services, including pages visited, features used, error logs, and session durations.",
      "Device and technical data: IP address, browser type, operating system, device identifiers, and cookies.",
      "Communications: messages you send to our support team, feedback, and survey responses.",
      "Payment data: processed securely via our payment providers. We do not store full card numbers on our servers.",
    ],
  },
  {
    id: "legal-basis",
    number: "03",
    title: "Legal Basis for Processing",
    icon: "⚖️",
    content: [
      "Contract performance: Processing necessary to provide our services under your subscription agreement.",
      "Legitimate interests: Improving our platform, preventing fraud, ensuring security, and conducting analytics — where these interests are not overridden by your rights.",
      "Legal obligations: Where we are required to retain or share data by applicable law.",
      "Consent: For optional features such as marketing communications, where we will always ask for your explicit opt-in.",
    ],
  },
  {
    id: "how-we-use",
    number: "04",
    title: "How We Use Your Data",
    icon: "🔧",
    content: [
      "To provide, maintain, and improve the Orderly platform and its features.",
      "To process payments, manage your subscription, and send transactional communications.",
      "To respond to support requests and provide customer assistance.",
      "To send product updates, security alerts, and account notifications.",
      "To conduct aggregate analytics and improve our services (using anonymized or pseudonymized data where possible).",
      "To detect, investigate, and prevent fraudulent transactions and other illegal activities.",
    ],
  },
  {
    id: "data-sharing",
    number: "05",
    title: "Data Sharing & Transfers",
    icon: "🔗",
    content: [
      "We do not sell your personal data to third parties. Ever.",
      "We share data only with trusted service providers who assist us in operating our platform (hosting, payments, email, analytics) — all subject to strict data processing agreements.",
      "We may disclose data if required by law, court order, or to protect the rights and safety of Orderly and its users.",
      "If we are involved in a merger or acquisition, your data may be transferred. We will notify you in advance of any such change.",
      "Some providers may be located outside the EEA. When transferring data internationally, we rely on Standard Contractual Clauses approved by the European Commission.",
    ],
  },
  {
    id: "your-rights",
    number: "06",
    title: "Your Rights",
    icon: "✋",
    content: [
      "Right of access: Request a copy of the personal data we hold about you.",
      "Right to rectification: Request correction of inaccurate or incomplete data.",
      "Right to erasure: Request deletion of your personal data, subject to legal retention obligations.",
      "Right to restrict processing: Ask us to limit how we use your data in certain circumstances.",
      "Right to data portability: Receive your data in a structured, machine-readable format.",
      "Right to object: Object to processing based on legitimate interests or for direct marketing.",
      "Right to withdraw consent: Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing.",
      `To exercise any of these rights, contact us at: ${companyEmail}. We will respond within 30 days.`,
    ],
  },
  {
    id: "data-retention",
    number: "07",
    title: "Data Retention",
    icon: "📅",
    content: [
      "We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for legal, accounting, or reporting requirements.",
      "Account data is retained for the duration of your subscription and for up to 3 years after termination for legal compliance.",
      "Backup data may persist for up to 90 days after deletion requests before complete removal from all systems.",
      "You can request earlier deletion of your data, subject to legal obligations that may require us to retain certain records.",
    ],
  },
  {
    id: "cookies",
    number: "08",
    title: "Cookies & Tracking",
    icon: "🍪",
    content: [
      "We use essential cookies to keep you logged in and remember your preferences. These cannot be disabled.",
      "We use analytics cookies (e.g., anonymized usage tracking) to understand how our platform is used. You can opt out via our Cookie Settings panel.",
      "We do not use advertising or tracking cookies for third-party marketing purposes.",
      "You can manage cookie preferences at any time through your account settings or browser controls.",
    ],
  },
  {
    id: "security",
    number: "09",
    title: "Security",
    icon: "🔐",
    content: [
      "We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and regular penetration testing.",
      "Access to personal data is restricted to authorized personnel on a need-to-know basis.",
      "We maintain a vulnerability disclosure program and take data breaches seriously. In the event of a breach affecting your rights, we will notify you and relevant authorities within 72 hours as required by GDPR.",
      "While we use best-practice security measures, no system is 100% secure. We encourage you to use strong, unique passwords and enable two-factor authentication.",
    ],
  },
  {
    id: "complaints",
    number: "10",
    title: "Complaints & Contact",
    icon: "📬",
    content: [
      `If you have any questions or concerns about this policy or our data practices, contact our Data Protection team at ${companyEmail}.`,
      "If you believe we have not handled your data appropriately, you have the right to lodge a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP) at www.dataprotection.ro, or with the supervisory authority in your country of residence.",
      "We take all complaints seriously and aim to resolve them promptly and fairly.",
    ],
  },
];

const SectionCard = ({ section, index }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`gdpr-section-card${open ? " gdpr-section-card--open" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        className="gdpr-section-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="gdpr-section-left">
          <span className="gdpr-section-number">{section.number}</span>
          <span className="gdpr-section-icon">{section.icon}</span>
          <span className="gdpr-section-title">{section.title}</span>
        </div>
        <motion.span
          className="gdpr-section-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="gdpr-section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="gdpr-section-body-inner">
              {section.content.map((para, i) => (
                <p key={i} className="gdpr-para">
                  {para.includes(":") && !para.startsWith("To ") && !para.startsWith("You ") && !para.startsWith("If ") && !para.startsWith("We ")
                    ? (
                      <>
                        <strong className="gdpr-para-key">{para.split(":")[0]}:</strong>
                        {para.split(":").slice(1).join(":")}
                      </>
                    )
                    : para
                  }
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const GDPR = () => {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <main className="gdpr-root">
      <div className="gdpr-bg-orb gdpr-bg-orb-1" />
      <div className="gdpr-bg-orb gdpr-bg-orb-2" />
      <div className="gdpr-grid-overlay" />

      {/* Hero */}
      <section className="gdpr-hero">
        <motion.div
          className="gdpr-hero-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="gdpr-hero-badge">
            <span className="gdpr-badge-shield">🛡️</span>
            GDPR Compliant
          </div>
          <h1 className="gdpr-hero-title">Privacy Policy</h1>
          <p className="gdpr-hero-sub">
            We believe privacy is a fundamental right. This policy explains clearly and honestly
            what data we collect, why we collect it, and how you can control it.
          </p>
          <div className="gdpr-hero-meta">
            <span className="gdpr-meta-item">
              <strong>Last updated:</strong> {lastUpdated}
            </span>
            <span className="gdpr-meta-divider">·</span>
            <span className="gdpr-meta-item">
              <strong>Controller:</strong> {companyName}
            </span>
            <span className="gdpr-meta-divider">·</span>
            <span className="gdpr-meta-item">
              <strong>Contact:</strong>{" "}
              <a href={`mailto:${companyEmail}`} className="gdpr-meta-link">{companyEmail}</a>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Quick nav */}
      <section className="gdpr-nav-strip">
        <div className="gdpr-nav-inner">
          <span className="gdpr-nav-label">Jump to section:</span>
          <div className="gdpr-nav-pills">
            {sections.slice(0, 6).map((s) => (
              <a key={s.id} href={`#${s.id}`} className="gdpr-nav-pill">
                {s.icon} {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="gdpr-content">
        <div className="gdpr-content-inner">
          <div className="gdpr-sections-list">
            {sections.map((section, i) => (
              <div key={section.id} id={section.id}>
                <SectionCard section={section} index={i} />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="gdpr-sidebar">
            <motion.div
              className="gdpr-sidebar-card gdpr-sidebar-card--rights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h3 className="gdpr-sidebar-title">Your Rights at a Glance</h3>
              {[
                { icon: "👁️", right: "Access your data" },
                { icon: "✏️", right: "Correct inaccuracies" },
                { icon: "🗑️", right: "Request erasure" },
                { icon: "⏸️", right: "Restrict processing" },
                { icon: "📦", right: "Data portability" },
                { icon: "🚫", right: "Object to processing" },
                { icon: "↩️", right: "Withdraw consent" },
              ].map((r) => (
                <div key={r.right} className="gdpr-right-item">
                  <span className="gdpr-right-icon">{r.icon}</span>
                  <span className="gdpr-right-label">{r.right}</span>
                </div>
              ))}
              <a href={`mailto:${companyEmail}`} className="gdpr-sidebar-btn">
                Exercise Your Rights →
              </a>
            </motion.div>

            <motion.div
              className="gdpr-sidebar-card gdpr-sidebar-card--contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <h3 className="gdpr-sidebar-title">Privacy Contact</h3>
              <p className="gdpr-sidebar-text">Have a privacy question or concern? Our team responds within 30 days.</p>
              <a href={`mailto:${companyEmail}`} className="gdpr-contact-link">
                <span>📧</span> {companyEmail}
              </a>
              <div className="gdpr-contact-address">
                <span>📍</span>
                <span>{companyAddress}</span>
              </div>
            </motion.div>

            <motion.div
              className="gdpr-sidebar-card gdpr-sidebar-card--trust"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <div className="gdpr-trust-badges">
                {[
                  { icon: "🛡️", label: "GDPR Compliant" },
                  { icon: "🔐", label: "SSL Encrypted" },
                  { icon: "🚫", label: "No Data Sales" },
                  { icon: "🇪🇺", label: "EU Hosted" },
                ].map((b) => (
                  <div key={b.label} className="gdpr-trust-badge">
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </section>

      {/* Footer note */}
      <section className="gdpr-footer-note">
        <div className="gdpr-footer-note-inner">
          <p>
            We may update this Privacy Policy from time to time. When we do, we'll revise the "Last updated"
            date and notify you by email if changes are material. Continued use of our services after changes
            are posted constitutes acceptance of the updated policy.
          </p>
          <p>
            This policy applies to all personal data processed by {companyName} in connection with the Orderly platform.
            It does not apply to third-party websites or services linked from our platform.
          </p>
        </div>
      </section>
    </main>
  );
};

export default GDPR;