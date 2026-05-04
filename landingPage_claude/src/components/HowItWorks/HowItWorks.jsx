import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import "./HowItWorks.css";

const QR_ON = [0,1,2,3,4,5,6,14,21,28,35,42,43,44,45,46,47,48,7,8,9,10,11,38,39,40,41,24,25,26];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const STEPS = [
  {
    accent: "#00B37E",
    tag: "Step 01",
    time: "~5 sec",
    title: "Scan & Go",
    desc: "Point your camera at the QR code at your table. No app, no account, no friction — live in under five seconds.",
    features: ["No app download", "Zero signup required", "Contactless & instant"],
    visual: (accent) => (
      <div className="hiw2__vis-card">
        <div className="hiw2__vis-label">QR Scanner</div>
        <div className="hiw2__qr-area">
          <div style={{ position: "relative" }}>
            <div className="hiw2__qr-grid">
              {Array.from({ length: 49 }, (_, i) => (
                <div key={i} className={`hiw2__qr-cell${QR_ON.includes(i) ? " on" : ""}`} />
              ))}
            </div>
            <div
              className="hiw2__qr-scan-bar"
              style={{ "--scan-accent": accent, position: "absolute", left: 0, top: "50%", width: "112px", transform: "translateY(-50%)" }}
            />
          </div>
          <div className="hiw2__qr-badge">⚡ Connected</div>
        </div>
      </div>
    ),
  },
  {
    accent: "#F97316",
    tag: "Step 02",
    time: "~30 sec",
    title: "Explore Menu",
    desc: "HD photography, allergen filters, chef's picks, and daily specials — a menu that genuinely helps you decide.",
    features: ["HD food photography", "Allergen filters", "Search & sort"],
    visual: (accent) => (
      <div className="hiw2__vis-card">
        <div className="hiw2__menu-header">
          <span className="hiw2__menu-title">Today's Menu</span>
          <span className="hiw2__menu-count">24 items</span>
        </div>
        {[
          { e: "🥩", n: "Wagyu Ribeye", p: "€42", t: "Chef's Pick" },
          { e: "🫙", n: "Burrata", p: "€18", t: "Vegan" },
          { e: "🍝", n: "Pasta Tartufo", p: "€28", t: "Popular" },
        ].map((item) => (
          <div className="hiw2__menu-row" key={item.n}>
            <div className="hiw2__menu-icon">{item.e}</div>
            <div className="hiw2__menu-name">
              {item.n}
              <span className="hiw2__menu-tag">{item.t}</span>
            </div>
            <span className="hiw2__menu-price" style={{ color: accent }}>{item.p}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    accent: "#3B82F6",
    tag: "Step 03",
    time: "~45 sec",
    title: "Place Order",
    desc: "Tap your choices, add special requests, and send. Your order arrives in the kitchen instantly — zero middle-man.",
    features: ["Live order tracking", "Special requests", "Group ordering"],
    visual: (accent) => (
      <div className="hiw2__vis-card">
        <div className="hiw2__order-header">
          <span className="hiw2__order-title">Your Order</span>
          <span
            className="hiw2__order-table-badge"
            style={{
              color: accent,
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            }}
          >
            Table 04
          </span>
        </div>
        {[
          { qty: "1×", name: "Wagyu Ribeye", price: "€42" },
          { qty: "2×", name: "Barolo 2018", price: "€64" },
        ].map((row) => (
          <div className="hiw2__order-row" key={row.name}>
            <span className="hiw2__order-qty" style={{ color: accent }}>{row.qty}</span>
            <span className="hiw2__order-item-name">{row.name}</span>
            <span className="hiw2__order-item-price">{row.price}</span>
          </div>
        ))}
        <div className="hiw2__order-total">
          <span>Total</span>
          <span>€106</span>
        </div>
        <div className="hiw2__order-sent">✓ Sent to kitchen</div>
      </div>
    ),
  },
  {
    accent: "#8B5CF6",
    tag: "Step 04",
    time: "~10 sec",
    title: "Tap to Pay",
    desc: "Split the bill, add a tip, and pay on your terms. A digital receipt lands in your inbox automatically.",
    features: ["Split bills easily", "Multiple payment methods", "Auto receipts"],
    visual: () => (
      <div className="hiw2__vis-card">
        <div className="hiw2__pay-card-inner">
          <div className="hiw2__pay-top">
            <span className="hiw2__pay-brand">Orderly Pay</span>
            <div className="hiw2__pay-dots">
              <span /><span /><span />
            </div>
          </div>
          <div className="hiw2__pay-amount">€106</div>
          <div className="hiw2__pay-methods">
            {["Card", "Apple Pay", "Google"].map((m, i) => (
              <div key={m} className={`hiw2__pay-method${i === 1 ? " is-active" : ""}`}>{m}</div>
            ))}
          </div>
          <div className="hiw2__pay-ssl">256-bit SSL encryption</div>
        </div>
      </div>
    ),
  },
  {
    accent: "#EC4899",
    tag: "Step 05",
    time: "~15 sec",
    title: "Quick Actions",
    desc: "Need napkins? Another round? Call a waiter or reorder your favourite dish — all from the Actions panel.",
    features: ["Call a waiter", "Reorder items", "Leave feedback"],
    visual: () => (
      <div className="hiw2__vis-card">
        <div className="hiw2__actions-grid">
          {[
            { e: "🙋", n: "Call Waiter" },
            { e: "🔄", n: "Reorder" },
            { e: "⭐", n: "Rate Us" },
            { e: "🧾", n: "Receipt" },
          ].map((a) => (
            <div className="hiw2__action-btn" key={a.n}>
              <div className="hiw2__action-icon">{a.e}</div>
              <span className="hiw2__action-label">{a.n}</span>
            </div>
          ))}
        </div>
        <div className="hiw2__action-notice">🙋 Waiter is on the way!</div>
      </div>
    ),
  },
];

export default function HowItWorks2() {
  const [active, setActive] = useState(0);
  const s = STEPS[active];

  const advance = useCallback(() => {
    setActive((p) => (p + 1) % STEPS.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 4000);
    return () => clearInterval(id);
  }, [advance]);

  const handleStep = (i) => {
    setActive(i);
  };

  return (
    <motion.section
      className="hiw2"
      id="howitworks"
      style={{ "--step-accent": s.accent }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.div
        className="hiw2__container"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >

        <motion.header className="hiw2__header" variants={itemVariants}>
          <div className="hiw2__label">
            <span className="hiw2__label-line" />
            How it works
            <span className="hiw2__label-line" />
          </div>
          <h2 className="hiw2__title">
            Seated to served,<br />
            <em>effortlessly</em>
          </h2>
          <p className="hiw2__subtitle">Five steps. Under two minutes. Zero friction.</p>
        </motion.header>

        <motion.nav className="hiw2__nav" variants={itemVariants}>
          {STEPS.map((st, i) => (
            <button
              key={st.tag}
              className={`hiw2__nav-btn${i === active ? " is-active" : ""}`}
              style={{ "--step-accent": st.accent }}
              onClick={() => handleStep(i)}
            >
              <span className="hiw2__nav-num">{st.tag.replace("Step ", "0").replace(" 0", "").slice(-2).padStart(2, "0")}</span>
              <span className="hiw2__nav-label">{st.title}</span>
            </button>
          ))}
        </motion.nav>

        <motion.div className="hiw2__stage" variants={itemVariants}>

          <div className="hiw2__info">
            <div className="hiw2__info-top">
              <div className="hiw2__step-meta">
                <span
                  className="hiw2__step-tag"
                  style={{
                    color: s.accent,
                    background: `color-mix(in srgb, ${s.accent} 10%, transparent)`,
                  }}
                >
                  {s.tag}
                </span>
                <span className="hiw2__step-time">{s.time}</span>
              </div>

              <h3 className="hiw2__step-title">{s.title}</h3>
              <p className="hiw2__step-desc">{s.desc}</p>

              <ul className="hiw2__feats">
                {s.features.map((f) => (
                  <li key={f}>
                    <span
                      className="hiw2__feat-check"
                      style={{ "--step-accent": s.accent }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hiw2__ctrl-row">
              <button
                className="hiw2__ctrl"
                onClick={() => handleStep(Math.max(0, active - 1))}
                disabled={active === 0}
                aria-label="Previous step"
              >
                ←
              </button>
              <span className="hiw2__ctrl-count">
                <strong style={{ color: s.accent }}>{active + 1}</strong>
                {" / "}
                {STEPS.length}
              </span>
              <button
                className="hiw2__ctrl"
                onClick={() => handleStep(Math.min(STEPS.length - 1, active + 1))}
                disabled={active === STEPS.length - 1}
                aria-label="Next step"
              >
                →
              </button>
            </div>
          </div>

          <div className="hiw2__visual-pane" key={active}>
            {s.visual(s.accent)}
          </div>

        </motion.div>

        <motion.div className="hiw2__progress" variants={itemVariants}>
          {STEPS.map((st, i) => (
            <button
              key={st.tag}
              className={`hiw2__progress-seg${i <= active ? " is-done" : ""}`}
              style={i <= active ? { background: s.accent } : {}}
              onClick={() => handleStep(i)}
              aria-label={`Go to ${st.title}`}
            />
          ))}
        </motion.div>

        <motion.div className="hiw2__cta" variants={itemVariants}>
          <a href="#requestDemo" className="hiw2__cta-btn">
            Start for free →
          </a>
          <p className="hiw2__cta-note">
            <strong>2,000+</strong> restaurants · No credit card required
          </p>
        </motion.div>

      </motion.div>
    </motion.section>
  );
}