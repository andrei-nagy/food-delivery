import { useState, useEffect } from "react";
import original_logo from "../../assets/original_logo.png";
import "./Navigation.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const LINKS = [
  { label: "How it works", href: "#howitworks",      num: "01" },
  { label: "Features",     href: "#features",        num: "02" },
  { label: "Admin",        href: "#adminmanagement", num: "03" },
  { label: "Pricing",      href: "#pricing",         num: "04" },
  { label: "About Us",     href: "#aboutus",         num: "05" },
  { label: "FAQs",         href: "#faqs",            num: "06" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navigation2() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [active,    setActive]    = useState(null);

  // scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // lock body when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // section tracking
  useEffect(() => {
    const ids = LINKS.map(l => l.href.slice(1));
    const obs = ids.map((id, i) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(i); },
        { threshold: 0.3 }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, []);

  // close on ESC
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const go = (href, i) => {
    if (i != null) setActive(i);
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`nav2${scrolled ? " nav2--scrolled" : ""}`}>

        {/* Logo */}
        <a href="/" className="nav2__logo" aria-label="Orderly home">
          <img src={original_logo} alt="Orderly" className="nav2__logo-img" />
        </a>

        {/* Desktop links */}
        <div className="nav2__links">
          {LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              className={`nav2__link${active === i ? " nav2__link--on" : ""}`}
              onClick={e => { e.preventDefault(); go(l.href, i); }}
            >
              {/* <span className="nav2__link-num">{l.num}</span> */}
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="nav2__actions">
          <button className="nav2__cta" onClick={() => go("#requestDemo")}>
            Get started →
          </button>
          <button
            className={`nav2__burger${menuOpen ? " nav2__burger--open" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={`nav2__drawer${menuOpen ? " nav2__drawer--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav2__drawer-bg" onClick={() => setMenuOpen(false)} />

        <div className="nav2__drawer-panel" role="dialog" aria-modal="true">
          <div className="nav2__drawer-header">
            <img src={original_logo} alt="Orderly" className="nav2__drawer-logo" />
            <button
              className="nav2__drawer-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="nav2__drawer-links">
            {LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className={`nav2__drawer-link${active === i ? " nav2__drawer-link--on" : ""}`}
                onClick={e => { e.preventDefault(); go(l.href, i); }}
              >
                <span className="nav2__drawer-num">{l.num}</span>
                <span>{l.label}</span>
                <span className="nav2__drawer-arr">→</span>
              </a>
            ))}
          </nav>

          <div className="nav2__drawer-foot">
            <button
              className="nav2__cta nav2__cta--full"
              onClick={() => go("#requestDemo")}
            >
              Get started free →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}