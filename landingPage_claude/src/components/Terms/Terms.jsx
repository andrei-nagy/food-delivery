import React, { useState, useEffect, useRef } from "react";
import "./Terms.css";

const SECTIONS = [
  { id:"general",       number:"01", title:"General Information",      icon:"🌐" },
  { id:"contract",      number:"02", title:"Contract Object",           icon:"📄" },
  { id:"registration",  number:"03", title:"Registration",              icon:"👥" },
  { id:"services",      number:"04", title:"Services",                  icon:"⚡" },
  { id:"pricing",       number:"05", title:"Pricing & Payments",        icon:"💰" },
  { id:"rights",        number:"06", title:"Rights & Obligations",      icon:"💼" },
  { id:"ip",            number:"07", title:"Intellectual Property",     icon:"🔒" },
  { id:"data",          number:"08", title:"Data Protection",           icon:"🛡️" },
  { id:"suspension",    number:"09", title:"Suspension & Termination",  icon:"⏸️" },
  { id:"liability",     number:"10", title:"Limitation of Liability",   icon:"⚠️" },
  { id:"force",         number:"11", title:"Force Majeure",             icon:"🌪️" },
  { id:"law",           number:"12", title:"Governing Law",             icon:"⚖️" },
  { id:"final",         number:"13", title:"Final Provisions",          icon:"✅" },
];

const VERSIONS = [
  { date:"13 Feb 2026", version:"v3.2", changes:"GDPR update, cookies section" },
  { date:"15 Jan 2026", version:"v3.1", changes:"Subscription pricing changes" },
  { date:"01 Dec 2025", version:"v3.0", changes:"Full document restructuring" },
  { date:"15 Sep 2025", version:"v2.5", changes:"Added online payments section" },
];

const CONTENT = {
  general: ["Orderly SRL ('Orderly') provides a restaurant management platform. These Terms govern access to and use of all services offered via orderly.app and associated applications.","By creating an account or using our Services, you agree to be bound by these Terms. If you do not accept these Terms, you may not use our Services.","Last updated: February 13, 2026."],
  contract: ["Orderly grants you a limited, non-exclusive, non-transferable license to access and use the Platform solely for your internal business purposes.","The Platform includes: QR code menus, order management, payment processing, analytics, and related features as described on our website."],
  registration: ["You must register an account to use our Services. You agree to provide accurate, complete information and keep it updated.","You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.","Each subscription may cover one restaurant location unless explicitly stated otherwise in your plan."],
  services: ["Orderly offers two service tiers: Basic (up to 3,000 orders/month) and Pro (unlimited orders). Full feature comparison is available on our pricing page.","We reserve the right to modify or discontinue features with reasonable notice. We will always aim to provide at least 30 days advance notice for material changes.","Uptime target: 99.5% monthly availability, excluding scheduled maintenance windows."],
  pricing: ["Subscriptions are billed monthly or annually as selected at checkout. All prices are in USD unless otherwise stated.","Annual subscriptions are paid upfront and offer a 25% discount. Monthly subscriptions may be cancelled at any time.","We reserve the right to change pricing with 30 days notice. If you disagree with a price change, you may cancel before it takes effect.","All fees are exclusive of applicable taxes, which are added at checkout as required by law."],
  rights: ["You agree not to: reverse engineer the Platform, resell or sublicense access, scrape or extract data in bulk, or use the Platform to compete with Orderly.","You retain all rights to data you submit to the Platform. By submitting data, you grant Orderly a license to process it solely to provide the Services.","We reserve the right to suspend accounts that violate these Terms or applicable law."],
  ip: ["All intellectual property in the Platform — including software, designs, trademarks, and content — belongs to Orderly or its licensors.","Your use of the Platform does not grant you any IP rights. You may not copy, modify, or distribute any part of the Platform without written consent."],
  data: ["Orderly processes personal data in accordance with our Privacy Policy and GDPR. By using our Services, you agree to our data processing practices.","You are the data controller for guest data collected through your menus. Orderly acts as a data processor on your behalf.","We implement technical and organizational measures to protect personal data. See our Security page for details."],
  suspension: ["We may suspend or terminate your account if: you breach these Terms, fail to pay fees, or use the Platform in a way that harms others or Orderly.","You may terminate your subscription at any time from your account settings. Upon termination, your data is retained for 30 days before deletion.","Upon termination, all licenses granted to you cease immediately."],
  liability: ["Orderly's total liability to you will not exceed the fees paid by you in the 12 months prior to the claim.","Orderly is not liable for: indirect, incidental, or consequential damages; loss of profits or data; or business interruption.","Some jurisdictions do not allow exclusion of certain warranties, so some limitations may not apply to you."],
  force: ["Neither party is liable for failures caused by circumstances beyond reasonable control, including natural disasters, government actions, internet failures, or pandemics.","Force majeure events must be notified promptly. Obligations are suspended for the duration of the event."],
  law: ["These Terms are governed by the laws of Romania. Disputes shall be resolved in the courts of Bucharest.","If any provision is found unenforceable, the remaining provisions continue in full force."],
  final: ["These Terms constitute the entire agreement between you and Orderly regarding the Platform.","We may update these Terms from time to time. We will notify you by email of material changes. Continued use after notice constitutes acceptance.","Questions? Contact us at: legal@orderly.app"],
};

export default function Terms() {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = SECTIONS.map((s, i) => {
      const el = document.getElementById(`term-${s.id}`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(i); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const scrollTo = (id) => {
    document.getElementById(`term-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="terms">
      <div className="terms__bg-orb" />

      {/* Hero */}
      <div className="terms__hero">
        <div className="terms__hero-badge">📄 Legal Document</div>
        <h1 className="terms__hero-title">Terms &amp; Conditions</h1>
        <p className="terms__hero-sub">
          Please read these Terms carefully. By using Orderly, you agree to be bound by the following terms.
        </p>
        <div className="terms__hero-meta">
          <span><strong>Version:</strong> v3.2</span>
          <span className="terms__meta-sep">·</span>
          <span><strong>Updated:</strong> February 13, 2026</span>
          <span className="terms__meta-sep">·</span>
          <span><strong>Jurisdiction:</strong> Romania, EU</span>
        </div>

        <div className="terms__stats">
          {[
            { n:"13",   l:"Sections"         },
            { n:"2026", l:"Last updated"      },
            { n:"GDPR", l:"Compliant"         },
            { n:"24/7", l:"Legal support"     },
          ].map(s => (
            <div key={s.l} className="terms__stat">
              <span className="terms__stat-n">{s.n}</span>
              <span className="terms__stat-l">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="terms__layout">
        {/* Sidebar */}
        <aside className="terms__sidebar">
          <div className="terms__sidebar-nav">
            <div className="terms__sidebar-title">Contents</div>
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                className={`terms__nav-item ${i === activeSection ? "terms__nav-item--active" : ""}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className="terms__nav-icon">{s.icon}</span>
                <span className="terms__nav-num">{s.number}</span>
                <span className="terms__nav-title">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Version history */}
          <div className="terms__sidebar-card">
            <div className="terms__sidebar-card-title">Version History</div>
            {VERSIONS.map(v => (
              <div key={v.version} className="terms__version-item">
                <div className="terms__version-top">
                  <span className="terms__version-badge">{v.version}</span>
                  <span className="terms__version-date">{v.date}</span>
                </div>
                <span className="terms__version-change">{v.changes}</span>
              </div>
            ))}
          </div>

          <a href="mailto:legal@orderly.app" className="terms__contact-btn">
            📧 Contact Legal Team
          </a>
        </aside>

        {/* Main content */}
        <main className="terms__content">
          {SECTIONS.map((s, i) => (
            <div key={s.id} id={`term-${s.id}`} className="terms__section" ref={el => sectionRefs.current[i] = el}>
              <div className="terms__section-header">
                <span className="terms__section-icon">{s.icon}</span>
                <span className="terms__section-number">{s.number}</span>
                <h2 className="terms__section-title">{s.title}</h2>
              </div>
              <div className="terms__section-body">
                {(CONTENT[s.id] || ["Content coming soon."]).map((para, pi) => (
                  <p key={pi} className="terms__para">{para}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div className="terms__end-note">
            <p>These terms were last revised on February 13, 2026. For questions, contact us at <a href="mailto:legal@orderly.app">legal@orderly.app</a>.</p>
          </div>
        </main>
      </div>
    </div>
  );
}