import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Features.css";

// ── Data ─────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  { val: "2.5s",    label: "Avg order time",       color: "#00B37E" },
  { val: "4.9/5",   label: "Customer rating",       color: "#F97316" },
  { val: "€2.5M+",  label: "Processed daily",       color: "#8B5CF6" },
  { val: "12 min",  label: "Avg support response",  color: "#3B82F6" },
  { val: "99.9%",   label: "Uptime SLA",            color: "#EC4899" },
  { val: "Zero",    label: "App downloads needed",  color: "#00B37E" },
  { val: "1-click", label: "PDF report export",     color: "#F97316" },
  { val: "14",      label: "Allergen filters",      color: "#8B5CF6" },
];

const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

const HEADER_STATS = [
  { n: "2,500+", l: "Restaurants",  color: "#00B37E" },
  { n: "15k",    l: "Daily orders", color: "#3B82F6" },
  { n: "98%",    l: "Satisfaction", color: "#F97316" },
];

const CATEGORIES = [
  { id: "all",   label: "All features", accent: "#6B7280" },
  { id: "ops",   label: "Operations",   accent: "#3B82F6" },
  { id: "guest", label: "Guest",        accent: "#00B37E" },
  { id: "money", label: "Payments",     accent: "#8B5CF6" },
  { id: "data",  label: "Analytics",    accent: "#F97316" },
  { id: "mgmt",  label: "Management",   accent: "#EC4899" },
];

const FEATURES = [
  {
    cat: "ops",   accent: "#3B82F6", icon: "⚡", num: "01",
    title: "QR Code Ordering",
    desc: "Guests scan, browse and order instantly from their phone — no app, no queue, no friction at all.",
    bullets: ["No app download required", "Works on any smartphone", "Live in under 5 seconds"],
  },
  {
    cat: "ops",   accent: "#3B82F6", icon: "🔁", num: "02",
    title: "Real-Time Kitchen Sync",
    desc: "Orders reach the kitchen the second they're placed. No paper tickets, no delays, no errors.",
    bullets: ["Instant ticket printing", "Zero manual relay", "Order history logged"],
  },
  {
    cat: "mgmt",  accent: "#EC4899", icon: "✏️", num: "03",
    title: "Smart Menu Manager",
    desc: "Edit prices, toggle items live, push specials to every device in under a second from your dashboard.",
    bullets: ["Live publish — no refresh", "Drag-and-drop reorder", "Scheduled specials"],
  },
  {
    cat: "money", accent: "#8B5CF6", icon: "💳", num: "04",
    title: "Integrated Payments",
    desc: "Accept any card or wallet. Split bills, collect tips and auto-send digital receipts seamlessly.",
    bullets: ["Apple Pay & Google Pay", "Custom tip suggestions", "Instant digital receipts"],
  },
  {
    cat: "ops",   accent: "#3B82F6", icon: "🗺️", num: "05",
    title: "Live Table Overview",
    desc: "See every table's status at a glance — open, occupied, awaiting payment or cleared.",
    bullets: ["Colour-coded status map", "Turn-time estimates", "Floor plan editor"],
  },
  {
    cat: "data",  accent: "#F97316", icon: "📊", num: "06",
    title: "Revenue Analytics",
    desc: "Track sales, best-sellers and staff performance in one beautiful view updated in real time.",
    bullets: ["Hourly sales heatmap", "Top-item leaderboard", "Staff performance scores"],
  },
  {
    cat: "mgmt",  accent: "#EC4899", icon: "🔑", num: "07",
    title: "Staff & Role Control",
    desc: "Assign Admin or Waiter roles with granular permissions and a complete, searchable audit log.",
    bullets: ["Per-screen permissions", "Shift-based access", "Full audit trail"],
  },
  {
    cat: "money", accent: "#8B5CF6", icon: "🎟️", num: "08",
    title: "Promos & Discounts",
    desc: "Create campaigns, set expiry dates and measure redemption rates — all without leaving the dashboard.",
    bullets: ["% or flat discount codes", "Expiry date controls", "Redemption analytics"],
  },
  {
    cat: "guest", accent: "#00B37E", icon: "🌿", num: "09",
    title: "Allergy Filters",
    desc: "Guests filter by allergen or dietary preference. You stay compliant with zero extra configuration.",
    bullets: ["14 major allergens", "Vegan / halal / kosher tags", "Always up to date"],
  },
  {
    cat: "data",  accent: "#F97316", icon: "📄", num: "10",
    title: "PDF Sales Reports",
    desc: "One-click PDF exports with beautiful layouts. Weekly summaries land in your inbox every Monday.",
    bullets: ["Branded PDF templates", "Scheduled email delivery", "Custom date ranges"],
  },
  {
    cat: "mgmt",  accent: "#EC4899", icon: "🎧", num: "11",
    title: "24/7 Support Desk",
    desc: "Submit and track support tickets directly from your dashboard. Average first response under 12 minutes.",
    bullets: ["In-app ticket system", "Live chat escalation", "<12 min avg response"],
  },
  {
    cat: "ops",   accent: "#3B82F6", icon: "🏢", num: "12",
    title: "Multi-Venue Ready",
    desc: "Manage all your locations under one account and switch between venues in a single tap.",
    bullets: ["Unlimited venues", "Per-location menus", "Consolidated reporting"],
  },
];

const BOTTOM_STATS = [
  { icon: "⚡", n: "2.5s",   l: "Average order time", accent: "#00B37E" },
  { icon: "🌟", n: "4.9/5",  l: "Customer rating",    accent: "#F97316" },
  { icon: "💳", n: "€2.5M+", l: "Processed daily",    accent: "#3B82F6" },
];

// ── Motion variants ───────────────────────────────────────────────────────────

// Header: fade up cu stagger
const headerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.05 },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

// Filtru pills: drop down + fade
const filtersVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// Grid carduri: fade + scale in, cu stagger
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
  exit:   { transition: { staggerChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -12,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

// Stats de jos: fade up
const statsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Header ────────────────────────────────────────────────────────────────────

function FeaturesHeader() {
  return (
    <header className="ft2__header">
      <motion.div
        className="ft2__header-inner"
        variants={headerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="ft2__header-grid">
          <motion.div className="ft2__header-left" variants={headerItemVariants}>
            <div className="ft2__kicker">
              <span className="ft2__kicker-line" />
              Why choose Orderly?
            </div>
            <h2 className="ft2__h">
              Everything<br />you need
              <em>to elevate your<br />restaurant.</em>
            </h2>
          </motion.div>

          <motion.div className="ft2__header-right" variants={headerItemVariants}>
            <p className="ft2__sub">
              Beautifully designed features that work together seamlessly —
              built for the modern dining experience.
            </p>
            <div className="ft2__header-stats">
              {HEADER_STATS.map((s) => (
                <motion.div
                  key={s.l}
                  className="ft2__header-stat"
                  variants={headerItemVariants}
                >
                  <span className="ft2__header-stat-n" style={{ color: s.color }}>{s.n}</span>
                  <span className="ft2__header-stat-l">{s.l}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="ft2__ticker-wrap" aria-hidden="true">
        <div className="ft2__ticker">
          {TICKER_DOUBLED.map((item, i) => (
            <div key={i} className="ft2__tick-item">
              <span className="ft2__tick-dot" style={{ background: item.color }} />
              <span className="ft2__tick-val">{item.val}</span>
              <span className="ft2__tick-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ feature, isOpen, onToggle }) {
  const { accent, icon, num, title, desc, bullets } = feature;

  return (
    <motion.div
      className={`ft2__card${isOpen ? " ft2__card--open" : ""}`}
      style={{ "--card-accent": accent }}
      onClick={onToggle}
      variants={cardVariants}
      layout
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="ft2__card-top">
        <div className="ft2__card-icon">{icon}</div>
        <span className="ft2__card-num">{num}</span>
      </div>

      <h3 className="ft2__card-title">{title}</h3>
      <p className="ft2__card-desc">{desc}</p>

      <div className="ft2__card-toggle">
        <span className="ft2__card-link">Explore feature</span>
        <span className="ft2__card-chevron">▾</span>
      </div>

      <div className={`ft2__drawer${isOpen ? " ft2__drawer--open" : ""}`}>
        <div className="ft2__drawer-inner">
          <ul className="ft2__drawer-items">
            {bullets.map((b) => (
              <li key={b} className="ft2__drawer-item">
                <span className="ft2__drawer-check" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Features2() {
  const [activeCat, setActiveCat] = useState("all");
  const [openCard, setOpenCard]   = useState(null);

  const handleCatChange = useCallback((id) => {
    setActiveCat(id);
    setOpenCard(null);
  }, []);

  const handleToggle = useCallback((num) => {
    setOpenCard((prev) => (prev === num ? null : num));
  }, []);

  const visible =
    activeCat === "all"
      ? FEATURES
      : FEATURES.filter((f) => f.cat === activeCat);

  return (
    <section className="ft2" id="features">

      <FeaturesHeader />

      <div className="ft2__wrap">

        {/* Filtru pills cu drop-down + stagger */}
        <motion.nav
          className="ft2__filters"
          aria-label="Feature categories"
          variants={filtersVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {CATEGORIES.map((c) => {
            const count =
              c.id === "all"
                ? FEATURES.length
                : FEATURES.filter((f) => f.cat === c.id).length;
            return (
              <motion.button
                key={c.id}
                className={`ft2__pill${activeCat === c.id ? " ft2__pill--active" : ""}`}
                style={{ "--pill-accent": c.accent }}
                onClick={() => handleCatChange(c.id)}
                aria-pressed={activeCat === c.id}
                variants={pillVariants}
                whileTap={{ scale: 0.94 }}
              >
                <span className="ft2__pill-dot" />
                {c.label}
                <span className="ft2__pill-count">{count}</span>
              </motion.button>
            );
          })}
        </motion.nav>

        {/* Grid cu AnimatePresence → cardurile intră/ies cu scale */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            className="ft2__grid"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {visible.length === 0 ? (
              <motion.p
                className="ft2__empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No features in this category.
              </motion.p>
            ) : (
              visible.map((f) => (
                <FeatureCard
                  key={f.num}
                  feature={f}
                  isOpen={openCard === f.num}
                  onToggle={() => handleToggle(f.num)}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stats de jos cu fade up staggered */}
        <motion.div
          className="ft2__stats"
          variants={statsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {BOTTOM_STATS.map((s) => (
            <motion.div
              key={s.l}
              className="ft2__stat"
              style={{ "--stat-accent": s.accent }}
              variants={statItemVariants}
            >
              <span className="ft2__stat-icon">{s.icon}</span>
              <span className="ft2__stat-n">{s.n}</span>
              <span className="ft2__stat-l">{s.l}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust bar cu fade simplu */}
        <motion.div
          className="ft2__trust"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, margin: "-30px" }}
        >
          <div className="ft2__trust-avs">
            {["👨‍🍳", "👩‍💼", "🧑‍🍳", "👨‍💻", "👩‍🌾"].map((av, i) => (
              <span key={i} className="ft2__trust-av">{av}</span>
            ))}
          </div>
          <p className="ft2__trust-text">
            <strong>2,000+</strong> restaurant owners trust Orderly
          </p>
          <div className="ft2__trust-rating">
            <span className="ft2__trust-stars">★★★★★</span>
            <span>4.9 / 5 from 1,200+ reviews</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}