import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import "./AdminFeatures.css";
import {
  FiCheckSquare, FiBell, FiHeadphones,
  FiShield, FiEdit, FiBarChart2,
  FiActivity, FiZap, FiCpu,
} from "react-icons/fi";

// ─── DATA ──────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "01",
    icon: <FiCheckSquare />, emoji: "⚙️",
    title: "Restaurant Management",
    label: "Full Control",
    desc: "Customize every corner of your operation — hours, tables, menus, and staff — from one intuitive dashboard built for speed and clarity.",
    perks: ["Configure hours & holidays", "Table layout editor", "Role-based access"],
    perkIcons: ["🕐", "🗺️", "🔑"],
    badge: null,
    c: "#E65C19", cl: "#FFF2EB",
    notifs: [
      { dot: "#E65C19", text: "Menu published · live now", time: "just now", pulse: true },
      { dot: "#10B981", text: "3 tables freed · floor updated", time: "2m ago", pulse: false },
      { dot: "#E65C19", text: "Holiday hours saved", time: "5m ago", pulse: false },
      { dot: "#6B7280", text: "Role: Waiter assigned to Sofia", time: "12m ago", pulse: false },
    ],
    bars: [40, 65, 55, 80, 70, 90, 75],
    stats: [{ val: "3", lbl: "Active menus" }, { val: "12", lbl: "Staff accounts" }],
  },
  {
    id: "02",
    icon: <FiBell />, emoji: "🔔",
    title: "Real-Time Notifications",
    label: "Live Alerts",
    desc: "Instant sound and visual alerts land the moment a customer places an order. Zero delay, zero missed tables, complete kitchen confidence.",
    perks: ["Instant order alerts", "Custom sound profiles", "Per-role routing"],
    perkIcons: ["🔔", "🔊", "📡"],
    badge: "LIVE", badgeColor: "#10B981",
    c: "#10B981", cl: "#ECFDF5",
    notifs: [
      { dot: "#10B981", text: "New order · Table 7 · 3 items", time: "just now", pulse: true },
      { dot: "#10B981", text: "New order · Table 2 · 1 item", time: "1m ago", pulse: true },
      { dot: "#6B7280", text: "Order #84 ready for pickup", time: "3m ago", pulse: false },
      { dot: "#6B7280", text: "Table 5 paid & cleared", time: "8m ago", pulse: false },
    ],
    bars: [30, 50, 45, 90, 85, 95, 88],
    stats: [{ val: "156", lbl: "Orders today" }, { val: "0.3s", lbl: "Avg delay" }],
  },
  {
    id: "03",
    icon: <FiHeadphones />, emoji: "🎧",
    title: "24/7 Support & Ticketing",
    label: "Always On",
    desc: "Round-the-clock support with an integrated ticketing system. Submit, track, and close issues without ever leaving the dashboard.",
    perks: ["Integrated ticket system", "Priority escalation", "Avg 12-min response"],
    perkIcons: ["🎫", "🚀", "⏱️"],
    badge: null,
    c: "#3B82F6", cl: "#EFF6FF",
    notifs: [
      { dot: "#3B82F6", text: "Ticket #142 · In progress", time: "just now", pulse: true },
      { dot: "#10B981", text: "Ticket #138 · Resolved ✓", time: "14m ago", pulse: false },
      { dot: "#3B82F6", text: "Priority escalation · Ticket #140", time: "22m ago", pulse: false },
      { dot: "#6B7280", text: "4.9★ rating left by Marco R.", time: "1h ago", pulse: false },
    ],
    bars: [80, 60, 70, 55, 65, 75, 50],
    stats: [{ val: "5", lbl: "Open tickets" }, { val: "12m", lbl: "Avg response" }],
  },
  {
    id: "04",
    icon: <FiShield />, emoji: "🛡️",
    title: "Security & Role Management",
    label: "Protected",
    desc: "Admin and Waiter roles keep data siloed and safe. Granular permissions mean every staff member only sees what they need.",
    perks: ["Admin & Waiter roles", "Granular permissions", "Full audit log"],
    perkIcons: ["👤", "🔐", "📋"],
    badge: null,
    c: "#7C3AED", cl: "#F5F3FF",
    notifs: [
      { dot: "#7C3AED", text: "Security audit · All clear ✓", time: "just now", pulse: false },
      { dot: "#10B981", text: "New login · Admin · verified", time: "5m ago", pulse: false },
      { dot: "#7C3AED", text: "Permission updated · Table staff", time: "18m ago", pulse: false },
      { dot: "#6B7280", text: "847 audit events logged today", time: "ongoing", pulse: false },
    ],
    bars: [90, 85, 88, 92, 87, 95, 91],
    stats: [{ val: "2", lbl: "Active roles" }, { val: "847", lbl: "Audit events" }],
  },
  {
    id: "05",
    icon: <FiEdit />, emoji: "✏️",
    title: "Product & Menu Control",
    label: "Always Fresh",
    desc: "Add, edit, hide, or feature items in seconds. Changes go live across every customer device instantly — no refresh required.",
    perks: ["Instant menu updates", "Photo & price editing", "Seasonal toggles"],
    perkIcons: ["⚡", "📸", "🌿"],
    badge: null,
    c: "#F97316", cl: "#FFF7ED",
    notifs: [
      { dot: "#F97316", text: "Burger Special · marked featured", time: "just now", pulse: true },
      { dot: "#10B981", text: "124 items · all prices verified", time: "4m ago", pulse: false },
      { dot: "#F97316", text: "Seasonal menu enabled", time: "11m ago", pulse: false },
      { dot: "#6B7280", text: "8 items hidden for tonight", time: "20m ago", pulse: false },
    ],
    bars: [55, 70, 60, 75, 85, 70, 80],
    stats: [{ val: "124", lbl: "Menu items" }, { val: "<1s", lbl: "Publish speed" }],
  },
  {
    id: "06",
    icon: <FiBarChart2 />, emoji: "📊",
    title: "Analytics & PDF Reports",
    label: "Deep Insights",
    desc: "Track orders, revenue, best-sellers, and staff performance. Generate beautiful PDF reports with one click — weekly or on-demand.",
    perks: ["Sales & revenue charts", "Best-seller rankings", "One-click PDF export"],
    perkIcons: ["📈", "🏆", "📄"],
    badge: "NEW", badgeColor: "#E65C19",
    c: "#E65C19", cl: "#FFF2EB",
    notifs: [
      { dot: "#E65C19", text: "Weekly report · ready to download", time: "just now", pulse: true },
      { dot: "#10B981", text: "Revenue +24% vs last week 📈", time: "1h ago", pulse: false },
      { dot: "#E65C19", text: "Burger · best seller · 34× today", time: "ongoing", pulse: false },
      { dot: "#6B7280", text: "PDF auto-sent to owner email", time: "Sun 08:00", pulse: false },
    ],
    bars: [45, 60, 55, 80, 95, 85, 100],
    stats: [{ val: "€842", lbl: "Today's revenue" }, { val: "+24%", lbl: "vs last week" }],
  },
];

const METRICS = [
  { icon: <FiActivity />, iconBg: "#ECFDF5", iconColor: "#10B981", end: 99,  suffix: "%",  lbl: "Uptime" },
  { icon: <FiHeadphones />, iconBg: "#FFF2EB", iconColor: "#E65C19", end: 24, suffix: "/7", lbl: "Support" },
  { icon: <FiZap />,      iconBg: "#FFF7ED", iconColor: "#F97316", end: 50,  suffix: "ms", lbl: "Response" },
  { icon: <FiCpu />,      iconBg: "#F5F3FF", iconColor: "#7C3AED", end: 100, suffix: "+",  lbl: "Integrations" },
];

// Animation variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    }
  }
};

// ─── COUNT-UP HOOK ──────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    setVal(0);
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [active, target, duration]);
  return val;
}

// ─── METRIC CARD ───────────────────────────────────────────────────────────
function MetricCard({ icon, iconBg, iconColor, end, suffix, lbl, inView }) {
  const count = useCountUp(end, inView);
  return (
    <div className="af__metric">
      <div className="af__metric-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div>
        <span className="af__metric-val">{count}{suffix}</span>
        <span className="af__metric-lbl">{lbl}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function AdminFeatures() {
  const [active, setActive] = useState(0);
  const [metricsInView, setMetricsInView] = useState(false);
  const sectionRef = useRef(null);
  const metricsRef = useRef(null);
  const touchStartX = useRef(null);

  const isInView = useInView(sectionRef, { 
    once: true, 
    amount: 0.1,
    margin: "-50px 0px" 
  });

  useEffect(() => {
    if (isInView) {
      sectionRef.current?.classList.add('af--entered');
    }
  }, [isInView]);

  // Metrics in-view for count-up
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setMetricsInView(true); },
      { threshold: 0.4 }
    );
    if (metricsRef.current) obs.observe(metricsRef.current);
    return () => obs.disconnect();
  }, []);

  // Keyboard nav
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") setActive((p) => Math.min(FEATURES.length - 1, p + 1));
      if (e.key === "ArrowLeft")  setActive((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) setActive((p) => Math.min(FEATURES.length - 1, p + 1));
    if (dx > 50) setActive((p) => Math.max(0, p - 1));
    touchStartX.current = null;
  };

  const f = FEATURES[active];

  return (
    <section
      ref={sectionRef}
      className="af"
      id="adminmanagement"
      aria-label="Admin features"
    >
      {/* BG */}
      <div className="af__bg" aria-hidden="true">
        <div className="af__bg-grid" />
        <div className="af__bg-blob af__bg-blob--1" />
        <div className="af__bg-blob af__bg-blob--2" />
      </div>

      {/* HEADER - doar fade up simplu */}
      <motion.header 
        className="af__header"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeUpVariants}
      >
        <div className="af__eyebrow">
          <span className="af__eyebrow-dot" />
          Admin Management
        </div>
        <h2 className="af__headline">
          Command your restaurant,<br />
          <em>effortlessly</em>
        </h2>
        <p className="af__subhead">
          One dashboard. Complete control over orders, staff, menus, and analytics — all in real time.
        </p>
      </motion.header>

      {/* STATUS STRIP - doar fade up */}
      <motion.div 
        className="af__status-strip"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeUpVariants}
      >
        <div className="af__status-pill">
          <div className="af__status-item">
            <span className="af__status-dot af__status-dot--green" />
            System: <span className="af__status-val">&nbsp;Fully Operational</span>
          </div>
          <div className="af__status-item">
            <span className="af__status-dot af__status-dot--orange" />
            Orders: <span className="af__status-val">&nbsp;156 today</span>
          </div>
          <div className="af__status-item">
            <span className="af__status-dot af__status-dot--green" />
            Uptime: <span className="af__status-val">&nbsp;99.9%</span>
          </div>
        </div>
      </motion.div>

      {/* BENTO GRID */}
      <div
        className="af__bento"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* HERO CARD */}
        <div
          className="af__card af__card--hero"
          style={{ "--c": f.c, "--cl": f.cl }}
          key={`hero-${active}`}
        >
          <div className="af__card-bar" />
          <div className="af__hero-label" style={{ background: f.cl, color: f.c }}>
            <span>{f.emoji}</span>{f.label}
          </div>
          <span className="af__hero-num" style={{ color: f.c }}>FEATURE {f.id}</span>
          <h3 className="af__hero-title">{f.title}</h3>
          <p className="af__hero-desc">{f.desc}</p>
          <ul className="af__hero-perks">
            {f.perks.map((p, i) => (
              <li key={p} className="af__hero-perk">
                <span className="af__hero-perk-dot" style={{ background: f.c }} />
                <span style={{ marginRight: 4 }}>{f.perkIcons[i]}</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="af__hero-nav">
            <button
              className="af__nav-btn"
              style={{ "--c": f.c }}
              onClick={() => setActive((p) => Math.max(0, p - 1))}
              disabled={active === 0}
              aria-label="Previous feature"
            >
              <span>←</span>
            </button>
            <span className="af__nav-counter">
              <strong style={{ color: f.c }}>{active + 1}</strong> / {FEATURES.length}
            </span>
            <button
              className="af__nav-btn"
              style={{ "--c": f.c }}
              onClick={() => setActive((p) => Math.min(FEATURES.length - 1, p + 1))}
              disabled={active === FEATURES.length - 1}
              aria-label="Next feature"
            >
              <span>→</span>
            </button>
            <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ink-60)", fontFamily: "'DM Mono',monospace" }}>
              ← → keys
            </span>
          </div>
          <div className="af__hero-bg-num" style={{ color: f.c }}>{f.id}</div>
        </div>

        {/* TALL NOTIFICATION CARD */}
        <div
          className="af__card af__card--tall"
          style={{ "--c": f.c, "--cl": f.cl }}
          key={`notif-${active}`}
        >
          <div className="af__card-bar" />
          <p className="af__notif-title">Live Activity</p>
          <p className="af__notif-sub">Real-time feed</p>
          <div className="af__notif-stack">
            {f.notifs.map((n, i) => (
              <div className="af__notif-row" key={i}>
                <span
                  className={`af__notif-dot ${n.pulse ? "af__notif-dot--pulse" : ""}`}
                  style={{ background: n.dot }}
                />
                <span style={{ flex: 1, fontSize: 12 }}>{n.text}</span>
                <span className="af__notif-time">{n.time}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {f.stats.map((s) => (
              <div
                key={s.lbl}
                style={{
                  flex: 1, padding: "12px 14px",
                  background: f.cl, borderRadius: 14,
                  border: `1px solid ${f.c}22`,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 900, color: f.c, letterSpacing: "-0.04em", display: "block" }}>
                  {s.val}
                </span>
                <span style={{ fontSize: 10, color: "var(--ink-60)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em" }}>
                  {s.lbl}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SM CARDS */}
        {FEATURES.slice(0, 2).map((feat, fi) => {
          const idx = (active + fi + 1) % FEATURES.length;
          const fp = FEATURES[idx];
          return (
            <div
              key={fp.id + fi}
              className={`af__card af__card--sm ${idx === active ? "af__card--active" : ""}`}
              style={{ "--c": fp.c, "--cl": fp.cl }}
              onClick={() => setActive(idx)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActive(idx)}
              aria-pressed={idx === active}
            >
              <div className="af__card-bar" />
              {fp.badge && (
                <span className="af__mini-badge" style={{ background: fp.badgeColor || fp.c }}>
                  {fp.badge}
                </span>
              )}
              <div className="af__mini-icon" style={{ background: fp.cl, color: fp.c }}>
                {fp.icon}
              </div>
              <div className="af__mini-title">{fp.title}</div>
              <div className="af__mini-desc">{fp.perks[0]} · {fp.perks[1]}</div>
            </div>
          );
        })}

        {/* WIDE STAT CARDS */}
        {FEATURES.map((feat, fi) => (
          <div
            key={`wide-${feat.id}`}
            className={`af__card af__card--wide ${fi === active ? "af__card--active" : ""}`}
            style={{ "--c": feat.c, "--cl": feat.cl }}
            onClick={() => setActive(fi)}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActive(fi)}
            aria-pressed={fi === active}
          >
            <div className="af__card-bar" />
            {feat.badge && (
              <span className="af__mini-badge" style={{ background: feat.badgeColor || feat.c }}>
                {feat.badge}
              </span>
            )}
            <div className="af__wide-inner">
              <div className="af__wide-icon" style={{ background: feat.cl, color: feat.c }}>
                {feat.icon}
              </div>
              <div>
                <span className="af__wide-val" style={{ color: fi === active ? feat.c : "var(--ink)" }}>
                  {feat.stats[0].val}
                </span>
                <span className="af__wide-lbl">{feat.stats[0].lbl}</span>
                <span className="af__wide-trend">{feat.title.split(" ")[0]}</span>
              </div>
            </div>
            <div className="af__bars">
              {feat.bars.map((h, bi) => (
                <div
                  key={bi}
                  className="af__bar"
                  style={{
                    height: `${(h / Math.max(...feat.bars)) * 100}%`,
                    background: bi === feat.bars.length - 1 ? feat.c : feat.cl,
                    border: `1px solid ${feat.c}${bi === feat.bars.length - 1 ? "FF" : "33"}`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* METRICS ROW */}
      <div className="af__metrics" ref={metricsRef}>
        {METRICS.map((m, i) => (
          <MetricCard key={i} {...m} inView={metricsInView} />
        ))}
      </div>

      {/* CTA - doar fade up */}
      <motion.div 
        className="af__cta"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeUpVariants}
      >
        <a href="#demo" className="af__cta-btn">
          <span>Explore the Admin Panel</span>
          <span>→</span>
        </a>
        <p className="af__cta-note">Full 14-day trial · No credit card required</p>
      </motion.div>
    </section>
  );
}