import React, { useState, useEffect } from "react";
import "./NavigationTerms.css";

const NAV_LINKS = [
  { name: "Home",    href: "/" },
  { name: "Terms",   href: "#terms",   active: true },
  { name: "Cookies", href: "/cookies" },
  { name: "GDPR",    href: "/gdpr" },
  { name: "Contact", href: "/contact" },
];

export default function NavigationTerms({
  activeSection = 0,
  totalSections = 13,
  onPrint,
  onDownload,
  onNavigateHome,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progress = ((activeSection + 1) / totalSections) * 100;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`navt ${scrolled ? "navt--scrolled" : ""}`}>
      {/* Logo */}
      <a href="/" className="navt__logo" onClick={e => { e.preventDefault(); onNavigateHome?.(); }}>
        <span className="navt__logo-mark">O</span>
        <span className="navt__logo-text">rderly</span>
        <span className="navt__legal-badge">🛡️ Legal</span>
      </a>

      {/* Links */}
      <div className={`navt__links ${menuOpen ? "navt__links--open" : ""}`}>
        {NAV_LINKS.map(l => (
          l.active ? (
            <span key={l.name} className="navt__link navt__link--active">{l.name}</span>
          ) : (
            <a key={l.name} href={l.href} className="navt__link">{l.name}</a>
          )
        ))}

        {/* Progress (mobile) */}
        <div className="navt__progress-mobile">
          <span className="navt__progress-label">{activeSection + 1} / {totalSections}</span>
          <div className="navt__progress-track">
            <div className="navt__progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button className="navt__back-btn navt__back-btn--mobile" onClick={onNavigateHome}>
          ← Back to site
        </button>
      </div>

      {/* Actions */}
      <div className="navt__actions">
        <div className="navt__progress">
          <span className="navt__progress-label">{activeSection + 1}/{totalSections}</span>
          <div className="navt__progress-track">
            <div className="navt__progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button className="navt__action" onClick={onPrint} title="Print">🖨️</button>
        <button className="navt__action" onClick={onDownload} title="Download PDF">⬇️</button>
        <button className="navt__back-btn" onClick={onNavigateHome}>← Back to site</button>
      </div>

      {/* Hamburger */}
      <button className={`navt__burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>
    </nav>
  );
}