import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Pricing.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Basic",
    monthly: 39,
    yearly: 32,
    accent: "#F97316",
    desc: "Perfect for small restaurants and cafés",
    features: [
      { n: "Up to 3,000 orders/month", ok: true  },
      { n: "QR code menu & ordering",  ok: true  },
      { n: "Secure in-app payments",   ok: true  },
      { n: "Real-time order mgmt",     ok: true  },
      { n: "Basic sales analytics",    ok: true  },
      { n: "Menu & category mgmt",     ok: true  },
      { n: "Basic promo codes",        ok: true  },
      { n: "PDF sales reports",        ok: false },
      { n: "Advanced analytics",       ok: false },
      { n: "Priority 24/7 support",    ok: false },
      { n: "Diana AI Assistant",       ok: false },
    ],
  },
  {
    name: "Pro",
    monthly: 89,
    yearly: 69,
    accent: "#E65C19",
    popular: true,
    desc: "For growing restaurants that need more",
    features: [
      { n: "Unlimited orders",         ok: true },
      { n: "QR code menu & ordering",  ok: true },
      { n: "Secure in-app payments",   ok: true },
      { n: "Real-time order mgmt",     ok: true },
      { n: "Advanced sales analytics", ok: true },
      { n: "Full menu control",        ok: true },
      { n: "Advanced promo codes",     ok: true },
      { n: "Custom PDF reports",       ok: true },
      { n: "Priority 24/7 support",    ok: true },
      { n: "Diana AI Assistant",       ok: true },
    ],
  },
];

// ── Motion variants ───────────────────────────────────────────────────────────

// Header stânga: slide din stânga
const headerLeftVariants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Toggle block: slide din dreapta
const toggleBlockVariants = {
  hidden:  { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

// Card container: stagger
const cardsContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
};

// Carduri: Basic vine din stânga, Pro vine din dreapta
const cardLeftVariants = {
  hidden:  { opacity: 0, x: -50, rotate: -2 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardRightVariants = {
  hidden:  { opacity: 0, x: 50, rotate: 2 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

// Feature list items: stagger fade-in de sus în jos
const featureListVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.35 } },
};

const featureItemVariants = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Prețul: flip vertical la schimbarea perioadei
const priceFlipVariants = {
  enter: { rotateX: -90, opacity: 0 },
  center: {
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    rotateX: 90,
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

// Guarantee strip: fade + scale-up
const guaranteeVariants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.3 },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Pricing2() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="pp2" id="pricing">
      <div className="pp2__wrap">

        {/* Header + toggle row */}
        <div className="pp2__top">

          {/* Titlu: slide din stânga */}
          <motion.div
            className="pp2__top-left"
            variants={headerLeftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="pp2__kicker">
              <span className="pp2__kicker-line" />
              Simple pricing
            </div>
            <h2 className="pp2__h">
              Choose the<br />
              <em>right plan.</em>
            </h2>
          </motion.div>

          {/* Toggle: slide din dreapta */}
          <motion.div
            className="pp2__toggle-block"
            variants={toggleBlockVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="pp2__toggle-row">
              <span className={`pp2__period${!yearly ? " pp2__period--on" : ""}`}>
                Monthly
              </span>
              <motion.button
                className={`pp2__switch${yearly ? " pp2__switch--on" : ""}`}
                onClick={() => setYearly((y) => !y)}
                aria-label="Toggle billing period"
                whileTap={{ scale: 0.92 }}
              >
                <motion.span
                  className="pp2__thumb"
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
              <span className={`pp2__period${yearly ? " pp2__period--on" : ""}`}>
                Yearly
              </span>
            </div>
            <span className="pp2__save">Save 25%</span>
          </motion.div>
        </div>

        {/* Cards: Basic din stânga cu rotație, Pro din dreapta cu rotație */}
        <motion.div
          className="pp2__grid"
          variants={cardsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {PLANS.map((plan, idx) => {
            const price = yearly ? plan.yearly : plan.monthly;
            const cardVariant = idx === 0 ? cardLeftVariants : cardRightVariants;

            return (
              <motion.div
                key={plan.name}
                className={`pp2__card${plan.popular ? " pp2__card--popular" : ""}`}
                style={{ "--card-accent": plan.accent }}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                {plan.popular && (
                  <div className="pp2__badge">
                    <span className="pp2__badge-dot" />
                    Most popular
                  </div>
                )}

                <div className="pp2__plan-name">{plan.name}</div>
                <div className="pp2__plan-desc">{plan.desc}</div>

                {/* Preț cu flip vertical la toggle */}
                <div className="pp2__price-row" style={{ perspective: 400, overflow: "hidden" }}>
                  <span className="pp2__currency">$</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.name}-${yearly ? "yearly" : "monthly"}`}
                      className="pp2__price"
                      variants={priceFlipVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      style={{ display: "inline-block" }}
                    >
                      {price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="pp2__per">/mo</span>
                </div>

                <div className="pp2__annual-note">
                  {yearly
                    ? `Billed annually ($${plan.yearly * 12}/year)`
                    : "\u00a0"}
                </div>

                <div className="pp2__divider" />

                {/* Feature list: stagger fade-in */}
                <motion.ul
                  className="pp2__features"
                  variants={featureListVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {plan.features.map((f, i) => (
                    <motion.li
                      key={i}
                      className={`pp2__feat${f.ok ? " pp2__feat--on" : ""}`}
                      variants={featureItemVariants}
                    >
                      <span className="pp2__feat-icon">
                        {f.ok ? "✓" : "×"}
                      </span>
                      {f.n}
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.button
                  className={`pp2__btn${plan.popular ? " pp2__btn--primary" : ""}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  Get {plan.name}
                  <span className="pp2__btn-arr">→</span>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Guarantee strip: fade + scale-up */}
        <motion.div
          className="pp2__guarantee"
          variants={guaranteeVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {["14-day free trial", "No credit card required", "Cancel anytime"].map(
            (item, i, arr) => (
              <React.Fragment key={item}>
                <div className="pp2__g-item">{item}</div>
                {i < arr.length - 1 && <div className="pp2__g-dot" />}
              </React.Fragment>
            )
          )}
        </motion.div>

      </div>
    </section>
  );
}