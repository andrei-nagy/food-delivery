import React, { useState } from "react";
import "./AboutUs.css";

const TEAM = [
  {
    name: "Sofia Anghel",
    role: "Co-Founder & CEO",
    bio: "Former head of operations at a Michelin-starred restaurant group. Sofia founded Orderly after experiencing firsthand the chaos of managing multiple venues with disconnected tools.",
    initials: "SA",
    accent: "#E65C19",
    fact: "Speaks 4 languages fluently",
    years: "8+ yrs in hospitality tech",
  },
  {
    name: "Mihai Popescu",
    role: "Co-Founder & CTO",
    bio: "Engineering leader who scaled platforms at two unicorn startups. Mihai built Orderly's core infrastructure from scratch in under 6 months.",
    initials: "MP",
    accent: "#6C63FF",
    fact: "Contributes to open-source weekly",
    years: "12+ yrs in software engineering",
  },
  {
    name: "Elena Rusu",
    role: "Head of Product",
    bio: "Product designer who spent years at a leading European SaaS company. Elena leads every feature decision with obsessive user-centricity.",
    initials: "ER",
    accent: "#10B981",
    fact: "Avid amateur chef & food writer",
    years: "6+ yrs in product design",
  },
];

const VALUES = [
  { title: "Hospitality-First", desc: "Every decision starts with the restaurateur in mind.", icon: "🍽️" },
  { title: "Radical Simplicity", desc: "We fight for clarity in every feature, every flow, every word.", icon: "✦" },
  { title: "Always Honest", desc: "We don't overpromise. We earn trust slowly and surely.", icon: "◈" },
  { title: "Long-Term Partners", desc: "We grow when our customers grow.", icon: "⟳" },
];

const STATS = [
  { n: "2021", l: "Founded" },
  { n: "500+", l: "Restaurants" },
  { n: "12",   l: "Team Members" },
  { n: "3",    l: "Countries" },
];

function TeamCard({ member, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`about__card ${hovered ? "about__card--hovered" : ""}`}
      style={{ "--card-accent": member.accent, animationDelay: `${index * 0.12}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="about__card-top">
        <div className="about__avatar" style={{ background: member.accent + "18", borderColor: member.accent + "30" }}>
          <span style={{ color: member.accent }}>{member.initials}</span>
        </div>
        <div>
          <div className="about__card-name">{member.name}</div>
          <div className="about__card-role" style={{ color: member.accent }}>{member.role}</div>
          <div className="about__card-years">{member.years}</div>
        </div>
      </div>

      <p className="about__card-bio">{member.bio}</p>

      <div className="about__card-fact">
        <span>💡</span>
        <span>{member.fact}</span>
      </div>

      <div
        className="about__card-bar"
        style={{ background: member.accent, transform: hovered ? "scaleX(1)" : "scaleX(0)" }}
      />
    </div>
  );
}

export default function AboutUs() {
  return (
    <main className="about" id="aboutus">
      <div className="about__bg-orb about__bg-orb--1" />
      <div className="about__bg-orb about__bg-orb--2" />

      {/* Hero */}
      <section className="about__hero">
        <div className="about__hero-inner">
          <div className="about__eyebrow">About Orderly</div>
          <h1 className="about__h1">
            Built by people who<br />
            <em className="about__h1-em">love restaurants.</em>
          </h1>
          <p className="about__hero-text">
            Orderly started from a simple frustration: great restaurants were losing time,
            money, and staff to broken tools. We set out to fix that.
          </p>

          <div className="about__stats">
            {STATS.map(s => (
              <div key={s.l} className="about__stat">
                <span className="about__stat-n">{s.n}</span>
                <span className="about__stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about__mission">
        <div className="about__mission-inner">
          <div className="about__mission-quote">"</div>
          <p className="about__mission-text">
            Our mission is to give every restaurateur the tools they need to thrive —
            without needing a degree in software to use them.
          </p>
          <div className="about__mission-sig">
            <div className="about__sig-avatars">
              {TEAM.map(m => (
                <div key={m.name} className="about__sig-av" style={{ borderColor: m.accent, background: m.accent + "18" }}>
                  <span style={{ color: m.accent }}>{m.initials}</span>
                </div>
              ))}
            </div>
            <span>The Orderly Team</span>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about__section">
        <div className="about__section-header">
          <span className="about__eyebrow">Meet the founders</span>
          <h2 className="about__section-title">The people behind Orderly</h2>
        </div>
        <div className="about__team-grid">
          {TEAM.map((m, i) => <TeamCard key={m.name} member={m} index={i} />)}
        </div>
      </section>

      {/* Values */}
      <section className="about__section">
        <div className="about__section-header">
          <span className="about__eyebrow">What we stand for</span>
          <h2 className="about__section-title">Our values</h2>
        </div>
        <div className="about__values-grid">
          {VALUES.map((v, i) => (
            <div key={v.title} className="about__value-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="about__value-icon">{v.icon}</span>
              <h3 className="about__value-title">{v.title}</h3>
              <p className="about__value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about__cta-section">
        <div className="about__cta-card">
          <h2 className="about__cta-title">Ready to join 500+ restaurants?</h2>
          <p className="about__cta-sub">Start your 14-day free trial. No credit card required.</p>
          <a href="#requestDemo" className="about__cta-btn">
            Get Started Free →
          </a>
        </div>
      </section>
    </main>
  );
}