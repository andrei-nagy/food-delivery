import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import "./AboutUs.css";

const team = [
  {
    name: "Sofia Anghel",
    role: "Co-Founder & CEO",
    bio: "Former head of operations at a Michelin-starred restaurant group. Sofia founded Orderly after experiencing firsthand the chaos of managing multiple venues with disconnected tools. She leads with empathy and precision.",
    image: null,
    initials: "SA",
    accent: "#E65C19",
    social: { linkedin: "#", twitter: "#" },
    fact: "Speaks 4 languages fluently",
    years: "8+ yrs in hospitality tech",
  },
  {
    name: "Mihai Popescu",
    role: "Co-Founder & CTO",
    bio: "Engineering leader who scaled platforms at two unicorn startups. Mihai is obsessed with performance and elegant architecture. He built Orderly's core infrastructure from scratch in under 6 months.",
    image: null,
    initials: "MP",
    accent: "#3B82F6",
    social: { linkedin: "#", github: "#" },
    fact: "Contributes to open-source weekly",
    years: "12+ yrs in software engineering",
  },
  {
    name: "Elena Rusu",
    role: "Head of Product",
    bio: "Product designer and strategist who spent years at a leading European SaaS company. Elena leads every feature decision with obsessive user-centricity, bringing a deep understanding of what restaurateurs truly need.",
    image: null,
    initials: "ER",
    accent: "#10B981",
    social: { linkedin: "#", dribbble: "#" },
    fact: "Avid amateur chef & food writer",
    years: "6+ yrs in product design",
  },
];

const values = [
  { title: "Hospitality-First", desc: "We're built by people who've worked the floor. Every decision starts with the restaurateur in mind.", icon: "🍽️" },
  { title: "Radical Simplicity", desc: "Complexity kills adoption. We fight for clarity in every feature, every flow, every word.", icon: "✦" },
  { title: "Always Honest", desc: "We don't overpromise. We share the roadmap, acknowledge limitations, and earn trust slowly and surely.", icon: "◈" },
  { title: "Long-Term Partners", desc: "We grow when our customers grow. Their success is the only metric that matters to us.", icon: "⟳" },
];

const TeamCard = ({ member, index }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="about-team-card"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ '--card-accent': member.accent }}
    >
      <div className="about-card-top">
        <div className="about-avatar">
          <span className="about-avatar-initials" style={{ color: member.accent }}>
            {member.initials}
          </span>
          <motion.div
            className="about-avatar-ring"
            animate={hovered ? { scale: 1.1, opacity: 1 } : { scale: 1, opacity: 0.4 }}
            transition={{ duration: 0.3 }}
            style={{ borderColor: member.accent }}
          />
        </div>
        <div className="about-card-header">
          <h3 className="about-card-name">{member.name}</h3>
          <span className="about-card-role" style={{ color: member.accent }}>{member.role}</span>
          <span className="about-card-years">{member.years}</span>
        </div>
      </div>

      <p className="about-card-bio">{member.bio}</p>

      <div className="about-card-fact">
        <span className="about-fact-icon">💡</span>
        <span>{member.fact}</span>
      </div>

      <motion.div
        className="about-card-bar"
        style={{ background: member.accent }}
        animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
};

const AboutUs = () => {
  const heroRef = useRef(null);
  const valuesRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.2 });

  return (
    <main className="about-root">
      {/* Background */}
      <div className="about-bg-orb about-bg-orb-1" />
      <div className="about-bg-orb about-bg-orb-2" />
      <div className="about-grid-overlay" />

      {/* Hero section */}
      <section className="about-hero" ref={heroRef}>
        <motion.div
          className="about-hero-inner"
          initial={{ opacity: 0, y: 40 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="about-eyebrow">
            <span className="about-eyebrow-dot" />
            About Orderly
          </div>

          <h1 className="about-headline">
            Built by people who
            <span className="about-headline-break" />
            <em className="about-headline-em">love restaurants.</em>
          </h1>

          <p className="about-hero-text">
            Orderly started from a simple frustration: great restaurants were losing time,
            money, and staff to broken tools. We set out to fix that — by building the
            platform we always wished existed.
          </p>

          <div className="about-hero-stats">
            {[
              { n: "2021", l: "Founded" },
              { n: "500+", l: "Restaurants" },
              { n: "12", l: "Team Members" },
              { n: "3", l: "Countries" },
            ].map((s) => (
              <div key={s.l} className="about-hero-stat">
                <span className="about-hero-stat-n">{s.n}</span>
                <span className="about-hero-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Mission strip */}
      <section className="about-mission">
        <motion.div
          className="about-mission-inner"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="about-mission-text">
            <span className="about-mission-quote">"</span>
            Our mission is to give every restaurateur the tools they need to thrive —
            without needing a degree in software to use them.
            <span className="about-mission-quote">"</span>
          </p>
          <div className="about-mission-sig">
            <div className="about-sig-avatars">
              {team.map((m) => (
                <div key={m.name} className="about-sig-avatar" style={{ borderColor: m.accent }}>
                  <span style={{ color: m.accent }}>{m.initials}</span>
                </div>
              ))}
            </div>
            <span className="about-sig-text">The Orderly Team</span>
          </div>
        </motion.div>
      </section>

      {/* Team section */}
      <section className="about-team">
        <div className="about-section-header">
          <motion.span
            className="about-section-label"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Meet the founders
          </motion.span>
          <motion.h2
            className="about-section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            The people behind Orderly
          </motion.h2>
        </div>

        <div className="about-team-grid">
          {team.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </section>

      {/* Values section */}
      <section className="about-values" ref={valuesRef}>
        <div className="about-section-header">
          <motion.span
            className="about-section-label"
            initial={{ opacity: 0, y: 16 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            What we stand for
          </motion.span>
          <motion.h2
            className="about-section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Our values
          </motion.h2>
        </div>

        <div className="about-values-grid">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="about-value-card"
              initial={{ opacity: 0, y: 30 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <span className="about-value-icon">{v.icon}</span>
              <h3 className="about-value-title">{v.title}</h3>
              <p className="about-value-desc">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="about-cta-section">
        <motion.div
          className="about-cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="about-cta-title">Ready to join 500+ restaurants?</h2>
          <p className="about-cta-sub">Start your 14-day free trial. No credit card required.</p>
          <motion.a
            href="#requestDemo"
            className="about-cta-btn"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started Free →
          </motion.a>
        </motion.div>
      </section>
    </main>
  );
};

export default AboutUs;