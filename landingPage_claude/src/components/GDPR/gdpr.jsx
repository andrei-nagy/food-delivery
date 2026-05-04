import React, { useState } from "react";
import "./GDPR.css";

const lastUpdated    = "December 15, 2024";
const companyName    = "Orderly SRL";
const companyEmail   = "privacy@orderly.app";
const companyAddress = "Str. Victoriei 42, Bucharest 010063, Romania";

const sections = [
  { id:"who-we-are",    number:"01", title:"Who We Are",           icon:"🏢", content:["Orderly SRL ('Orderly', 'we', 'us', or 'our') is the data controller responsible for your personal data. We operate the Orderly restaurant management platform, accessible via our website and mobile applications.","You can contact our Data Protection team at: privacy@orderly.app","Registered address: Str. Victoriei 42, Bucharest 010063, Romania"] },
  { id:"what-we-collect",number:"02",title:"Data We Collect",       icon:"🗃️", content:["Account information: name, email address, phone number, and billing details provided during registration.","Business data: restaurant name, address, operational settings, menu items, and staff information you enter into the platform.","Usage data: how you interact with our services, including pages visited, features used, error logs, and session durations.","Device and technical data: IP address, browser type, operating system, device identifiers, and cookies.","Communications: messages you send to our support team, feedback, and survey responses.","Payment data: processed securely via our payment providers. We do not store full card numbers on our servers."] },
  { id:"legal-basis",   number:"03", title:"Legal Basis",           icon:"⚖️", content:["Contract performance: Processing necessary to provide our services under your subscription agreement.","Legitimate interests: Improving our platform, preventing fraud, ensuring security, and conducting analytics.","Legal obligations: Where we are required to retain or share data by applicable law.","Consent: For optional features such as marketing communications, where we will always ask for your explicit opt-in."] },
  { id:"how-we-use",    number:"04", title:"How We Use Your Data",  icon:"🔧", content:["To provide, maintain, and improve the Orderly platform and its features.","To process payments, manage your subscription, and send transactional communications.","To respond to support requests and provide customer assistance.","To send product updates, security alerts, and account notifications.","To conduct aggregate analytics and improve our services (using anonymized data where possible).","To detect, investigate, and prevent fraudulent transactions and other illegal activities."] },
  { id:"data-sharing",  number:"05", title:"Data Sharing",          icon:"🔗", content:["We do not sell your personal data to third parties. Ever.","We share data only with trusted service providers (hosting, payments, email, analytics) — all subject to strict data processing agreements.","We may disclose data if required by law, court order, or to protect the rights and safety of Orderly and its users.","If we are involved in a merger or acquisition, your data may be transferred. We will notify you in advance.","Some providers may be located outside the EEA. We rely on Standard Contractual Clauses approved by the European Commission."] },
  { id:"your-rights",   number:"06", title:"Your Rights",           icon:"✋", content:["Right of access: Request a copy of the personal data we hold about you.","Right to rectification: Request correction of inaccurate or incomplete data.","Right to erasure: Request deletion of your personal data, subject to legal retention obligations.","Right to restrict processing: Ask us to limit how we use your data in certain circumstances.","Right to data portability: Receive your data in a structured, machine-readable format.","Right to object: Object to processing based on legitimate interests or for direct marketing.","Right to withdraw consent: Where processing is based on consent, withdraw it at any time.","To exercise any of these rights, contact us at: privacy@orderly.app. We will respond within 30 days."] },
  { id:"data-retention",number:"07", title:"Data Retention",        icon:"📅", content:["We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected.","Account data is retained for the duration of your subscription and for up to 3 years after termination.","Backup data may persist for up to 90 days after deletion requests before complete removal from all systems.","You can request earlier deletion of your data, subject to legal obligations."] },
  { id:"cookies",       number:"08", title:"Cookies & Tracking",    icon:"🍪", content:["We use essential cookies to keep you logged in and remember your preferences. These cannot be disabled.","We use analytics cookies (anonymized usage tracking) to understand how our platform is used. You can opt out via our Cookie Settings panel.","We do not use advertising or tracking cookies for third-party marketing purposes.","You can manage cookie preferences at any time through your account settings or browser controls."] },
  { id:"security",      number:"09", title:"Security",              icon:"🔐", content:["We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and regular penetration testing.","Access to personal data is restricted to authorized personnel on a need-to-know basis.","In the event of a breach affecting your rights, we will notify you and relevant authorities within 72 hours as required by GDPR.","We encourage you to use strong, unique passwords and enable two-factor authentication."] },
  { id:"complaints",    number:"10", title:"Complaints & Contact",  icon:"📬", content:["If you have any questions or concerns about this policy or our data practices, contact our Data Protection team at privacy@orderly.app.","If you believe we have not handled your data appropriately, you have the right to lodge a complaint with the Romanian ANSPDCP at www.dataprotection.ro.","We take all complaints seriously and aim to resolve them promptly and fairly."] },
];

function SectionCard({ section, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`gdpr__card ${open ? "gdpr__card--open" : ""}`} style={{ animationDelay: `${index * 0.04}s` }}>
      <button className="gdpr__card-header" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="gdpr__card-left">
          <span className="gdpr__card-number">{section.number}</span>
          <span className="gdpr__card-icon">{section.icon}</span>
          <span className="gdpr__card-title">{section.title}</span>
        </div>
        <span className={`gdpr__card-chevron ${open ? "open" : ""}`}>↓</span>
      </button>

      {open && (
        <div className="gdpr__card-body">
          {section.content.map((para, i) => (
            <p key={i} className="gdpr__para">
              {para.includes(":") && !para.startsWith("To ") && !para.startsWith("You ") && !para.startsWith("If ") && !para.startsWith("We ")
                ? <><strong className="gdpr__para-key">{para.split(":")[0]}:</strong>{para.split(":").slice(1).join(":")}</>
                : para
              }
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GDPR() {
  return (
    <main className="gdpr">
      <div className="gdpr__bg-orb gdpr__bg-orb--1" />
      <div className="gdpr__bg-orb gdpr__bg-orb--2" />

      {/* Hero */}
      <section className="gdpr__hero">
        <div className="gdpr__hero-badge">
          <span>🛡️</span>
          GDPR Compliant
        </div>
        <h1 className="gdpr__hero-title">Privacy Policy</h1>
        <p className="gdpr__hero-sub">
          We believe privacy is a fundamental right. This policy explains clearly what data we
          collect, why we collect it, and how you can control it.
        </p>
        <div className="gdpr__hero-meta">
          <span><strong>Last updated:</strong> {lastUpdated}</span>
          <span className="gdpr__meta-sep">·</span>
          <span><strong>Controller:</strong> {companyName}</span>
          <span className="gdpr__meta-sep">·</span>
          <span><strong>Contact:</strong> <a href={`mailto:${companyEmail}`} className="gdpr__meta-link">{companyEmail}</a></span>
        </div>
      </section>

      {/* Nav pills */}
      <div className="gdpr__nav-strip">
        <span className="gdpr__nav-label">Jump to:</span>
        <div className="gdpr__nav-pills">
          {sections.slice(0, 6).map(s => (
            <a key={s.id} href={`#${s.id}`} className="gdpr__nav-pill">
              {s.icon} {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="gdpr__layout">
        <div className="gdpr__sections">
          {sections.map((s, i) => (
            <div key={s.id} id={s.id}>
              <SectionCard section={s} index={i} />
            </div>
          ))}
        </div>

        <aside className="gdpr__sidebar">
          <div className="gdpr__sidebar-card">
            <h3 className="gdpr__sidebar-title">Your Rights at a Glance</h3>
            {[
              { icon:"👁️", right:"Access your data"        },
              { icon:"✏️", right:"Correct inaccuracies"     },
              { icon:"🗑️", right:"Request erasure"          },
              { icon:"⏸️", right:"Restrict processing"      },
              { icon:"📦", right:"Data portability"         },
              { icon:"🚫", right:"Object to processing"     },
              { icon:"↩️", right:"Withdraw consent"         },
            ].map(r => (
              <div key={r.right} className="gdpr__right-item">
                <span>{r.icon}</span>
                <span>{r.right}</span>
              </div>
            ))}
            <a href={`mailto:${companyEmail}`} className="gdpr__sidebar-btn">
              Exercise Your Rights →
            </a>
          </div>

          <div className="gdpr__sidebar-card gdpr__sidebar-card--contact">
            <h3 className="gdpr__sidebar-title">Privacy Contact</h3>
            <p className="gdpr__sidebar-text">Have a privacy question? Our team responds within 30 days.</p>
            <a href={`mailto:${companyEmail}`} className="gdpr__contact-link">📧 {companyEmail}</a>
            <div className="gdpr__contact-addr">📍 {companyAddress}</div>
          </div>

          <div className="gdpr__sidebar-card gdpr__sidebar-card--trust">
            {["🛡️ GDPR Compliant","🔐 SSL Encrypted","🚫 No Data Sales","🇪🇺 EU Hosted"].map(b => (
              <div key={b} className="gdpr__trust-badge">{b}</div>
            ))}
          </div>
        </aside>
      </div>

      {/* Footer note */}
      <div className="gdpr__footer-note">
        <p>We may update this Privacy Policy from time to time. When we do, we'll revise the "Last updated" date and notify you by email if changes are material.</p>
        <p>This policy applies to all personal data processed by {companyName} in connection with the Orderly platform.</p>
      </div>
    </main>
  );
}