import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import "./HowItWorks.css";
import mockup from "../../assets/mobile_view1.png";
import explore_menu from "../../assets/mobile_view2.png";
import place_order from "../../assets/mobile_view3.png";
import thank_you from "../../assets/mobile_view5.png";
import call_action from "../../assets/mobile_view6.png";

// ─── DATA ──────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "01",
    title: "Scan & Go",
    description: "Point your camera at the QR code at your table. No app, no account, no friction — you're live in under five seconds.",
    image: mockup,
    accent: "#E84545",
    tag: "~5 sec",
    features: ["No app download", "Zero signup", "Contactless"],
    chips: [
      { emoji: "⚡", text: "Instant", sub: "Connected" },
      { emoji: "🔒", text: "Secure", sub: "Encrypted" },
      { emoji: "✨", text: "No app needed", sub: "" }
    ]
  },
  {
    id: "02",
    title: "Explore Menu",
    description: "HD photography, allergen filters, chef's picks, and daily specials. A menu that genuinely helps you decide.",
    image: explore_menu,
    accent: "#F97316",
    tag: "~30 sec",
    features: ["HD food photos", "Allergen filters", "Search & sort"],
    chips: [
      { emoji: "🍽️", text: "120+ Items", sub: "Updated daily" },
      { emoji: "🌿", text: "Allergen safe", sub: "Filtered" },
      { emoji: "⭐", text: "Chef's picks", sub: "" }
    ]
  },
  {
    id: "03",
    title: "Place Order",
    description: "Tap your choices, add special requests, and send. Your order arrives in the kitchen instantly — zero middle-man.",
    image: place_order,
    accent: "#10B981",
    tag: "~45 sec",
    features: ["Live order tracking", "Special requests", "Group ordering"],
    chips: [
      { emoji: "🍳", text: "In kitchen", sub: "Confirmed" },
      { emoji: "⏱️", text: "Est. 12 min", sub: "Prep time" },
      { emoji: "✅", text: "Order sent", sub: "" }
    ]
  },
  {
    id: "04",
    title: "Tap to Pay",
    description: "Split the bill, add a tip, and pay on your terms. A digital receipt is automatically sent to your inbox.",
    image: thank_you,
    accent: "#6C63FF",
    tag: "~10 sec",
    features: ["Split bills", "Multiple methods", "Auto receipts"],
    chips: [
      { emoji: "🔐", text: "256-bit SSL", sub: "Bank grade" },
      { emoji: "🧾", text: "Receipt sent", sub: "Instantly" },
      { emoji: "💳", text: "Any card", sub: "" }
    ]
  },
  {
    id: "05",
    title: "Quick Actions",
    description: "Need napkins? Another round? Call a waiter or reorder your favourite dish — all from the Actions panel.",
    image: call_action,
    accent: "#EC4899",
    tag: "~15 sec",
    features: ["Call a waiter", "Reorder items", "Leave feedback"],
    chips: [
      { emoji: "🙋", text: "Waiter called", sub: "On the way" },
      { emoji: "⭐", text: "Rate us", sub: "Feedback" },
      { emoji: "🔄", text: "Reorder", sub: "" }
    ]
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const [imgKey, setImgKey] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const sectionRef = useRef(null);
  const touchStartX = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileButtonRef = useRef(null);
  
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      sectionRef.current?.classList.add('hiw--entered');
    }
  }, [isInView]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setActive(p => Math.min(STEPS.length - 1, p + 1));
      if (e.key === "ArrowLeft") setActive(p => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset image on step change
  useEffect(() => {
    setImgReady(false);
    setImgKey((k) => k + 1);
  }, [active]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Dacă meniul este deschis și click-ul NU este pe meniu și NU este pe buton
      if (showMobileMenu && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(e.target) &&
          mobileButtonRef.current && 
          !mobileButtonRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  // Touch handlers
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const onTouchMove = (e) => {
    if (!touchStartX.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 20) {
      e.preventDefault();
    }
  };
  
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) setActive(p => Math.min(STEPS.length - 1, p + 1));
    if (dx > 50) setActive(p => Math.max(0, p - 1));
    touchStartX.current = null;
  };

  // Drag handlers
  const onDragStart = (e) => {
    setDragStart(e.clientX);
  };

  const onDragEnd = (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart;
    if (dx < -50) setActive(p => Math.min(STEPS.length - 1, p + 1));
    if (dx > 50) setActive(p => Math.max(0, p - 1));
    setDragStart(null);
  };

  // Toggle mobile menu
  const toggleMobileMenu = (e) => {
    e.stopPropagation(); // Prevenim propagarea evenimentului
    setShowMobileMenu(!showMobileMenu);
  };

  // Select step and close menu
  const selectStep = (index) => {
    setActive(index);
    setShowMobileMenu(false);
  };

  const step = STEPS[active];

  return (
    <section
      ref={sectionRef}
      className="hiw"
      style={{ "--accent": step.accent }}
      id="howitworks"
      aria-label="How Orderly works"
    >
      {/* Background blob */}
      <div className="hiw__bg-blob" aria-hidden="true" />

      {/* Header */}
      <header className="hiw__header">
        <span className="hiw__eyebrow">⚡ How it works</span>
        <h2 className="hiw__title">
          Seated to served,{' '}
          <span className="hiw__title-accent">effortlessly</span>
        </h2>
        <p className="hiw__subtitle">
          Five frictionless steps. Under two minutes total. No staff interruptions.
        </p>
      </header>

      {/* Mobile step selector */}
      <div className="hiw__mobile-selector">
        <button 
          ref={mobileButtonRef}
          className="hiw__mobile-current"
          onClick={toggleMobileMenu}
          aria-expanded={showMobileMenu}
        >
          <span className="hiw__mobile-current-dot" style={{ background: step.accent }} />
          <span>Step {active + 1}: {step.title}</span>
          <span className={`hiw__mobile-arrow ${showMobileMenu ? 'hiw__mobile-arrow--up' : ''}`}>▼</span>
        </button>
        
        {showMobileMenu && (
          <div className="hiw__mobile-menu" ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className={`hiw__mobile-item ${i === active ? 'hiw__mobile-item--active' : ''}`}
                onClick={() => selectStep(i)}
                style={{ '--item-accent': s.accent }}
              >
                <span className="hiw__mobile-item-dot" style={{ background: s.accent }} />
                <div className="hiw__mobile-item-content">
                  <span className="hiw__mobile-item-title">{s.title}</span>
                  <span className="hiw__mobile-item-tag">{s.tag}</span>
                </div>
                {i === active && <span className="hiw__mobile-item-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step indicators - hidden on mobile */}
      <nav className="hiw__steps" aria-label="Step navigation">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`hiw__step ${i === active ? "hiw__step--active" : ""}`}
            onClick={() => setActive(i)}
            aria-current={i === active ? "step" : undefined}
          >
            <span className="hiw__step-dot" style={{ background: i === active ? s.accent : undefined }}>
              {s.id}
            </span>
            <span className="hiw__step-label">{s.title}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <div className="hiw__content">
        {/* Left column */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hiw__info"
        >
          <span className="hiw__badge" style={{ background: step.accent + "20", color: step.accent }}>
            STEP {step.id} · {step.tag}
          </span>
          
          <h3 className="hiw__heading">{step.title}</h3>
          <p className="hiw__description">{step.description}</p>

          <ul className="hiw__features">
            {step.features.map((f, i) => (
              <li key={f}>
                <span className="hiw__feature-icon" style={{ background: step.accent + "20" }}>
                  {["📱", "🌿", "📍", "➗", "🙋"][i]}
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="hiw__nav">
            <button
              className="hiw__nav-btn"
              onClick={() => setActive(p => Math.max(0, p - 1))}
              disabled={active === 0}
              aria-label="Previous step"
            >
              ←
            </button>
            <span className="hiw__counter">
              {active + 1} / {STEPS.length}
            </span>
            <button
              className="hiw__nav-btn"
              onClick={() => setActive(p => Math.min(STEPS.length - 1, p + 1))}
              disabled={active === STEPS.length - 1}
              aria-label="Next step"
            >
              →
            </button>
          </div>
          
          {/* Swipe hint for mobile */}
          <div className="hiw__swipe-hint">
            <span className="hiw__swipe-icon">↔️</span>
            <span>Swipe to navigate</span>
          </div>
        </motion.div>

        {/* Right column - Phone */}
        <div className="hiw__phone-wrapper">
          {/* Floating chips */}
          {step.chips.map((chip, i) => (
            <div key={i} className={`hiw__chip hiw__chip--${i}`}>
              <span className="hiw__chip-emoji">{chip.emoji}</span>
              <div>
                <div className="hiw__chip-text">{chip.text}</div>
                {chip.sub && <div className="hiw__chip-sub">{chip.sub}</div>}
              </div>
            </div>
          ))}

          {/* Phone frame with drag/swipe support */}
          <div
            className="hiw__phone"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onDragStart}
            onMouseUp={onDragEnd}
            onMouseLeave={() => setDragStart(null)}
          >
            {/* Progress indicator */}
            <div className="hiw__phone-progress">
              <div 
                className="hiw__phone-progress-bar" 
                style={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            <div className="hiw__phone-screen">
              {!imgReady && (
                <div className="hiw__skeleton">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="hiw__skeleton-line" />
                  ))}
                </div>
              )}
              <img
                key={imgKey}
                src={step.image}
                alt={step.title}
                className="hiw__phone-img"
                style={{ opacity: imgReady ? 1 : 0 }}
                onLoad={() => setImgReady(true)}
                draggable={false}
              />
              
              {/* Tap zones for mobile */}
              <div className="hiw__phone-tap-zones">
                <div 
                  className="hiw__phone-tap-left" 
                  onClick={() => setActive(p => Math.max(0, p - 1))}
                  aria-label="Previous step"
                />
                <div 
                  className="hiw__phone-tap-right" 
                  onClick={() => setActive(p => Math.min(STEPS.length - 1, p + 1))}
                  aria-label="Next step"
                />
              </div>
            </div>
            
            <div className="hiw__phone-footer" style={{ background: step.accent + "10" }}>
              <span className="hiw__phone-dot" style={{ background: step.accent }} />
              <span className="hiw__phone-text">{step.title} · {step.tag}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="hiw__cta">
        <a href="#demo" className="hiw__cta-btn">
          Start for free <span>→</span>
        </a>
        <p className="hiw__cta-note">2,000+ restaurants · No credit card required</p>
      </div>
    </section>
  );
}