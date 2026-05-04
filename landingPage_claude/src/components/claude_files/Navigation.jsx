import { useState, useEffect, useRef } from "react";
import "./Navigation.css";
import original_logo from "../../assets/original_logo.png";
import icon_phone from "../../assets/icon_phone.png";

const LINKS = [
  { label: "How it works",     href: "#howitworks",      icon: "◎" },
  { label: "Features",         href: "#features",        icon: "◈" },
  { label: "Admin",            href: "#adminmanagement", icon: "◉" },
  { label: "Pricing",          href: "#pricing",         icon: "◇" },
  { label: "About Us",         href: "#aboutus",         icon: "◐" },
  { label: "FAQs",             href: "#faqs",            icon: "◌" },
];

export default function Navigation() {
  const [scrolled, setScrolled]           = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [hoveredIdx, setHoveredIdx]       = useState(null);  // transient hover
  const [activeSection, setActiveSection] = useState(null);  // scroll-based + click

  const [hoverIndicator, setHoverIndicator]       = useState({ left: 5, width: 0, opacity: 0 });
  const [selectedIndicator, setSelectedIndicator] = useState({ left: 5, width: 0, opacity: 0 });

  const pillRef = useRef(null);
  const btnRefs = useRef([]);

  /* ── Scroll listener ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* ── Move selected indicator whenever activeSection changes ── */
  useEffect(() => {
    if (activeSection === null) return;
    const btn  = btnRefs.current[activeSection];
    const pill = pillRef.current;
    if (btn && pill) {
      const pillRect = pill.getBoundingClientRect();
      const btnRect  = btn.getBoundingClientRect();
      setSelectedIndicator({
        left:    btnRect.left - pillRect.left,
        width:   btnRect.width,
        opacity: 1,
      });
    }
  }, [activeSection]);

  /* ── IntersectionObserver: auto-highlight active section on scroll ── */
  useEffect(() => {
    const sectionIds = LINKS.map(l => l.href.replace("#", ""));
    const observers  = [];

    sectionIds.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(idx); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  /* ── Hover pill movement ── */
  const handleHover = (idx) => {
    setHoveredIdx(idx);
    const btn  = btnRefs.current[idx];
    const pill = pillRef.current;
    if (btn && pill) {
      const pillRect = pill.getBoundingClientRect();
      const btnRect  = btn.getBoundingClientRect();
      setHoverIndicator({ left: btnRect.left - pillRect.left, width: btnRect.width, opacity: 1 });
    }
  };

  const handleLeave = () => {
    setHoveredIdx(null);
    setHoverIndicator(s => ({ ...s, opacity: 0 }));
  };

  /* ── Click: set as active section immediately, then scroll ── */
  const handleNav = (href, idx = null) => {
    if (idx !== null) setActiveSection(idx);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  /* Hover wins for styling; fall back to activeSection */
  const displayActive = hoveredIdx !== null ? hoveredIdx : activeSection;

  const getDelay = (i) => `${i * 0.05 + 0.1}s`;

  return (
    <>
      <nav className={`xnav ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <a href="/" className="xnav__logo-wrap">
          <span className="xnav__logo-glow" />
          <img src={original_logo} alt="Orderly" className="xnav__logo" />
        </a>

        {/* Desktop pill nav */}
        <div className="xnav__pill-wrap">
          <div
            className="xnav__pill"
            ref={pillRef}
            onMouseLeave={handleLeave}
          >
            {/* Persistent selected indicator — always visible when a section is active */}
            <div
              className="xnav__pill-indicator xnav__pill-indicator--selected"
              style={{
                left:    selectedIndicator.left,
                width:   selectedIndicator.width,
                opacity: selectedIndicator.opacity,
              }}
            />

            {/* Hover indicator — fades in on top when hovering */}
            <div
              className="xnav__pill-indicator xnav__pill-indicator--hover"
              style={{
                left:    hoverIndicator.left,
                width:   hoverIndicator.width,
                opacity: hoverIndicator.opacity,
              }}
            />

            {LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                ref={el => btnRefs.current[i] = el}
                className={`xnav__pill-btn ${displayActive === i ? "active" : ""}`}
                onClick={e => { e.preventDefault(); handleNav(l.href, i); }}
                onMouseEnter={() => handleHover(i)}
              >
                <span className="xnav__pill-icon">{l.icon}</span>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="xnav__actions">
          <a href="#signin" className="xnav__signin">Sign in</a>
          <button
            className="xnav__cta"
            onClick={() => handleNav("#requestDemo")}
          >
            Get started
            <img src={icon_phone} alt="" className="xnav__cta-icon" />
          </button>

          {/* Hamburger */}
          <button
            className={`xnav__burger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="xnav__burger-bar" />
            <span className="xnav__burger-bar" />
            <span className="xnav__burger-bar" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay + panel */}
      <div className={`xnav__screen ${menuOpen ? "open" : ""}`}>
        <div className="xnav__screen-bg" onClick={() => setMenuOpen(false)} />
        <div className={`xnav__panel ${menuOpen ? "open" : ""}`}>
          <div className="xnav__panel-links">
            {LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`xnav__panel-link ${activeSection === i ? "active" : ""}`}
                onClick={e => { e.preventDefault(); handleNav(l.href, i); }}
                style={{ transitionDelay: menuOpen ? getDelay(i) : "0s" }}
              >
                <span className="xnav__panel-link-left">
                  <span className="xnav__panel-link-icon">{l.icon}</span>
                  {l.label}
                </span>
                <span className="xnav__panel-link-arrow">→</span>
              </a>
            ))}
          </div>

          <div className="xnav__panel-divider" />

          <div className="xnav__panel-bottom">
            <a href="#signin" className="xnav__panel-signin">Sign in</a>
            <button
              className="xnav__panel-cta"
              onClick={() => handleNav("#requestDemo")}
            >
              Get started free
              <span className="xnav__panel-cta-icon">✦</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}