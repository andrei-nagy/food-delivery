import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "../UseReveal/UseReveal";
import "./AdminFeatures.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: "01", emoji: "⚙️", title: "Restaurant Management", label: "Full Control",
    c: "#E65C19",
    desc: "Customize every corner of your operation — hours, tables, menus, and staff — from one intuitive dashboard.",
    perks: ["Configure hours & holidays", "Table layout editor", "Role-based access"],
    notifs: [
      { dot: "#E65C19", text: "Menu published · live now",           time: "just now", pulse: true  },
      { dot: "#10B981", text: "3 tables freed · floor updated",       time: "2m ago",  pulse: false },
      { dot: "#E65C19", text: "Holiday hours saved",                  time: "5m ago",  pulse: false },
      { dot: "#aaa",    text: "Role: Waiter assigned to Sofia",       time: "12m ago", pulse: false },
    ],
    bars: [40,65,55,80,70,90,75],
    stats: [{ v: "3", l: "Active menus" }, { v: "12", l: "Staff accounts" }],
  },
  {
    id: "02", emoji: "🔔", title: "Real-Time Notifications", label: "Live Alerts",
    c: "#10B981", badge: "LIVE",
    desc: "Instant sound and visual alerts the moment a customer places an order. Zero delay, zero missed tables.",
    perks: ["Instant order alerts", "Custom sound profiles", "Per-role routing"],
    notifs: [
      { dot: "#10B981", text: "New order · Table 7 · 3 items",       time: "just now", pulse: true  },
      { dot: "#10B981", text: "New order · Table 2 · 1 item",        time: "1m ago",  pulse: true  },
      { dot: "#aaa",    text: "Order #84 ready for pickup",           time: "3m ago",  pulse: false },
      { dot: "#aaa",    text: "Table 5 paid & cleared",               time: "8m ago",  pulse: false },
    ],
    bars: [30,50,45,90,85,95,88],
    stats: [{ v: "156", l: "Orders today" }, { v: "0.3s", l: "Avg delay" }],
  },
  {
    id: "03", emoji: "🎧", title: "24/7 Support & Ticketing", label: "Always On",
    c: "#3B82F6",
    desc: "Round-the-clock support with an integrated ticketing system. Submit and track issues without leaving the dashboard.",
    perks: ["Integrated ticket system", "Priority escalation", "Avg 12-min response"],
    notifs: [
      { dot: "#3B82F6", text: "Ticket #142 · In progress",           time: "just now", pulse: true  },
      { dot: "#10B981", text: "Ticket #138 · Resolved ✓",            time: "14m ago", pulse: false },
      { dot: "#3B82F6", text: "Priority escalation · #140",          time: "22m ago", pulse: false },
      { dot: "#aaa",    text: "4.9★ rating left by Marco R.",        time: "1h ago",  pulse: false },
    ],
    bars: [80,60,70,55,65,75,50],
    stats: [{ v: "5", l: "Open tickets" }, { v: "12m", l: "Avg response" }],
  },
  {
    id: "04", emoji: "🛡️", title: "Security & Role Management", label: "Protected",
    c: "#7C3AED",
    desc: "Admin and Waiter roles keep data siloed. Granular permissions mean every staff member sees only what they need.",
    perks: ["Admin & Waiter roles", "Granular permissions", "Full audit log"],
    notifs: [
      { dot: "#7C3AED", text: "Security audit · All clear ✓",        time: "just now", pulse: false },
      { dot: "#10B981", text: "New login · Admin · verified",         time: "5m ago",  pulse: false },
      { dot: "#7C3AED", text: "Permission updated · Table staff",     time: "18m ago", pulse: false },
      { dot: "#aaa",    text: "847 audit events logged today",        time: "ongoing", pulse: false },
    ],
    bars: [90,85,88,92,87,95,91],
    stats: [{ v: "2", l: "Active roles" }, { v: "847", l: "Audit events" }],
  },
  {
    id: "05", emoji: "✏️", title: "Product & Menu Control", label: "Always Fresh",
    c: "#F97316",
    desc: "Add, edit, hide, or feature items in seconds. Changes go live across every customer device instantly.",
    perks: ["Instant menu updates", "Photo & price editing", "Seasonal toggles"],
    notifs: [
      { dot: "#F97316", text: "Burger Special · marked featured",    time: "just now", pulse: true  },
      { dot: "#10B981", text: "124 items · all prices verified",      time: "4m ago",  pulse: false },
      { dot: "#F97316", text: "Seasonal menu enabled",               time: "11m ago", pulse: false },
      { dot: "#aaa",    text: "8 items hidden for tonight",           time: "20m ago", pulse: false },
    ],
    bars: [55,70,60,75,85,70,80],
    stats: [{ v: "124", l: "Menu items" }, { v: "<1s", l: "Publish speed" }],
  },
  {
    id: "06", emoji: "📊", title: "Analytics & PDF Reports", label: "Deep Insights",
    c: "#E65C19", badge: "NEW",
    desc: "Track orders, revenue, best-sellers and staff performance. Generate beautiful PDF reports with one click.",
    perks: ["Sales & revenue charts", "Best-seller rankings", "One-click PDF export"],
    notifs: [
      { dot: "#E65C19", text: "Weekly report · ready to download",   time: "just now", pulse: true  },
      { dot: "#10B981", text: "Revenue +24% vs last week 📈",         time: "1h ago",  pulse: false },
      { dot: "#E65C19", text: "Burger · best seller · 34× today",    time: "ongoing", pulse: false },
      { dot: "#aaa",    text: "PDF auto-sent to owner email",         time: "Sun 08:00", pulse: false },
    ],
    bars: [45,60,55,80,95,85,100],
    stats: [{ v: "€842", l: "Today's revenue" }, { v: "+24%", l: "vs last week" }],
  },
];

const METRICS = [
  { emoji: "📡", val: "99%",  lbl: "Uptime",        c: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  { emoji: "🎧", val: "24/7", lbl: "Support",       c: "#E65C19", bg: "rgba(230,92,25,0.1)"   },
  { emoji: "⚡", val: "50ms", lbl: "Response",      c: "#F97316", bg: "rgba(249,115,22,0.1)"  },
  { emoji: "🔌", val: "100+", lbl: "Integrations",  c: "#7C3AED", bg: "rgba(124,58,237,0.1)"  },
];

// ── Motion variants ───────────────────────────────────────────────────────────

// Secțiunea principală: fade up la intrare în viewport
const sectionVariants = {
  hidden:  { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// Header: stagger children fade-up
const headerContainerVariants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const headerChildVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

// Tab bar: slide in de sus
const tabBarVariants = {
  hidden:  { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const tabVariants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Stage (hero card + feed): slide horizontal la schimbarea tab-ului
// Direcția se calculează dinamic prin `custom`
const stageContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Hero card: alunecă din stânga/dreapta în funcție de direcție
const heroVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    transition: { duration: 0.28, ease: "easeIn" },
  }),
};

// Feed card: alunecă opus eroului (din dreapta/stânga)
const feedVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.06 } },
  exit:   (dir) => ({
    opacity: 0,
    x: dir > 0 ? 40 : -40,
    transition: { duration: 0.28, ease: "easeIn" },
  }),
};

// Metrics: fade up staggerat
const metricsContainerVariants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const metricItemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// CTA: fade simplu
const ctaVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.15 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminFeatures2() {
  const ref = useReveal();
  const [active, setActive]     = useState(0);
  const [direction, setDirection] = useState(0); // +1 → dreapta, -1 → stânga

  const f = FEATURES[active];
  const maxBar = Math.max(...f.bars);

  const goTo = useCallback((next) => {
    setDirection(next > active ? 1 : -1);
    setActive(next);
  }, [active]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goTo(Math.min(FEATURES.length - 1, active + 1));
      if (e.key === "ArrowLeft")  goTo(Math.max(0, active - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  return (
    <motion.section
      className="af2"
      id="adminmanagement"
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div className="af2__wrap">

        {/* Header cu stagger fade-up */}
        <motion.header
          className="af2__header"
          variants={headerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div className="af2__kicker" variants={headerChildVariants}>
            <span className="af2__kicker-line" />
            Admin Panel
            <span className="af2__kicker-line" />
          </motion.div>
          <motion.h2 className="af2__h" variants={headerChildVariants}>
            Total control,<br /><em>beautifully simple.</em>
          </motion.h2>
          <motion.p className="af2__sub" variants={headerChildVariants}>
            Six powerful features that give you complete oversight of your restaurant from one dashboard.
          </motion.p>
        </motion.header>

        {/* Tab bar: slide in de sus cu stagger pe fiecare pill */}
        <motion.nav
          className="af2__tabs"
          aria-label="Admin features"
          variants={tabBarVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {FEATURES.map((feat, i) => (
            <motion.button
              key={feat.id}
              className={`af2__tab${i === active ? " af2__tab--on" : ""}`}
              style={{ "--tab-c": feat.c }}
              onClick={() => goTo(i)}
              variants={tabVariants}
              whileTap={{ scale: 0.93 }}
            >
              {feat.emoji} {feat.title.split(" ")[0]}
              {feat.badge && (
                <span className="af2__tab-badge" style={{ background: feat.c }}>
                  {feat.badge}
                </span>
              )}
            </motion.button>
          ))}
        </motion.nav>

        {/* Stage: hero + feed alunecă orizontal la fiecare schimbare de tab */}
        <div className="af2__stage" style={{ "--tab-c": f.c }}>
          <AnimatePresence mode="popLayout" custom={direction}>

            {/* Hero card — alunecă din dreapta/stânga */}
            <motion.div
              key={`hero-${active}`}
              className="af2__hero"
              custom={direction}
              variants={heroVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="af2__hero-toprow">
                <div
                  className="af2__pill"
                  style={{ background: `color-mix(in srgb, ${f.c} 10%, transparent)`, color: f.c }}
                >
                  {f.emoji} {f.label}
                </div>
                <span className="af2__hero-id" style={{ color: f.c }}>FEATURE {f.id}</span>
              </div>

              <h3 className="af2__hero-title">{f.title}</h3>
              <p className="af2__hero-desc">{f.desc}</p>

              <ul className="af2__perks">
                {f.perks.map((p) => (
                  <li key={p}>
                    <span className="af2__perk-dot" style={{ background: f.c }} />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="af2__nav">
                <button
                  className="af2__nav-btn"
                  onClick={() => goTo(Math.max(0, active - 1))}
                  disabled={active === 0}
                  aria-label="Previous feature"
                >←</button>
                <span className="af2__nav-count" style={{ color: f.c }}>
                  {active + 1} / {FEATURES.length}
                </span>
                <button
                  className="af2__nav-btn"
                  onClick={() => goTo(Math.min(FEATURES.length - 1, active + 1))}
                  disabled={active === FEATURES.length - 1}
                  aria-label="Next feature"
                >→</button>
              </div>

              <div className="af2__ghost" style={{ color: f.c }}>{f.id}</div>
            </motion.div>

          </AnimatePresence>

          <AnimatePresence mode="popLayout" custom={direction}>

            {/* Feed card — alunecă opus eroului */}
            <motion.div
              key={`feed-${active}`}
              className="af2__feed"
              custom={direction}
              variants={feedVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <span className="af2__feed-title">Live Activity</span>
              <span className="af2__feed-sub">Real-time feed</span>

              <div className="af2__notifs">
                {f.notifs.map((n, i) => (
                  <div key={i} className="af2__notif">
                    <span
                      className={`af2__notif-dot${n.pulse ? " af2__notif-dot--pulse" : ""}`}
                      style={{ background: n.dot }}
                    />
                    <span className="af2__notif-text">{n.text}</span>
                    <span className="af2__notif-time">{n.time}</span>
                  </div>
                ))}
              </div>

              <div className="af2__chips">
                {f.stats.map((s) => (
                  <div key={s.l} className="af2__chip">
                    <span className="af2__chip-val" style={{ color: f.c }}>{s.v}</span>
                    <span className="af2__chip-lbl">{s.l}</span>
                  </div>
                ))}
              </div>

              <div className="af2__chart">
                {f.bars.map((h, bi) => (
                  <div
                    key={bi}
                    className="af2__bar"
                    style={{
                      height: `${(h / maxBar) * 100}%`,
                      background: bi === f.bars.length - 1
                        ? f.c
                        : `color-mix(in srgb, ${f.c} 20%, transparent)`,
                      border: `0.5px solid ${f.c}${bi === f.bars.length - 1 ? "ff" : "44"}`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

          </AnimatePresence>
        </div>

        {/* Metrics: fade-up staggerat la intrarea în viewport */}
        <motion.div
          className="af2__metrics"
          variants={metricsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {METRICS.map((m) => (
            <motion.div
              key={m.lbl}
              className="af2__metric"
              variants={metricItemVariants}
            >
              <div className="af2__metric-icon" style={{ background: m.bg }}>{m.emoji}</div>
              <div>
                <div className="af2__metric-val" style={{ color: m.c }}>{m.val}</div>
                <div className="af2__metric-lbl">{m.lbl}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA: fade simplu */}
        <motion.div
          className="af2__cta"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
        >
          <a href="#demo" className="af2__cta-btn">Explore the Admin Panel →</a>
          <span className="af2__cta-note">Full 14-day trial · No credit card required</span>
        </motion.div>

      </div>
    </motion.section>
  );
}