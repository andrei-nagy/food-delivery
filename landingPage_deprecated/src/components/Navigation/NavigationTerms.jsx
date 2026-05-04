import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./NavigationTerms.css";
import { 
  FiChevronRight, 
  FiPrinter, 
  FiDownload,
  FiShield,
  FiBookOpen,
  FiArrowLeft
} from "react-icons/fi";
import original_logo from "../../assets/original_logo.png";

const NavigationTerms = ({ 
  activeSection = 0, 
  totalSections = 13,
  onPrint,
  onDownload,
  onNavigateHome,
  onSectionChange 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePrint = () => {
    if (onPrint) onPrint();
    setIsMenuOpen(false);
  };

  const handleDownload = () => {
    if (onDownload) onDownload();
    setIsMenuOpen(false);
  };

  const handleNavigateHome = () => {
    if (onNavigateHome) onNavigateHome();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation links pentru pagina de termeni
  const navLinks = [
    { name: "Acasă", href: "/", action: handleNavigateHome },
    { name: "Termeni", href: "#terms", active: true },
    { name: "Politica Cookies", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Contact", href: "/contact" }
  ];

  // Calculăm progresul citirii
  useEffect(() => {
    const calculateProgress = () => {
      if (totalSections > 0) {
        setScrollProgress(((activeSection + 1) / totalSections) * 100);
      }
    };
    calculateProgress();
  }, [activeSection, totalSections]);

  // Animation Variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      className="navigation-terms"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      {/* Logo Section */}
      <div className="navigation-terms__logo-section">
        <motion.img
          className="navigation-terms__logo"
          src={original_logo}
          alt="Orderly Logo"
          onClick={scrollToTop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        <div className="navigation-terms__badge">
          <FiShield className="navigation-terms__badge-icon" />
          <span className="navigation-terms__badge-text">Document Legal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className={`navigation-terms__link-section ${isMenuOpen ? "menu-open" : ""}`}>
        {navLinks.map((link, index) => (
          <motion.li
            key={index}
            variants={linkVariants}
            style={{ listStyle: 'none' }}
          >
            {link.action ? (
              <button
                className={`navigation-terms__link ${link.active ? 'active' : ''}`}
                onClick={link.action}
              >
                {link.name}
              </button>
            ) : (
              <a
                href={link.href}
                className={`navigation-terms__link ${link.active ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            )}
          </motion.li>
        ))}

        {/* Progress indicator for mobile */}
        <motion.div 
          className="navigation-terms__progress"
          variants={linkVariants}
        >
          <span className="navigation-terms__progress-text">
            Progres: {activeSection + 1}/{totalSections}
          </span>
          <div className="navigation-terms__progress-bar">
            <div 
              className="navigation-terms__progress-fill"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.button
          className="navigation-terms__cta"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNavigateHome}
          variants={linkVariants}
        >
          <FiArrowLeft className="navigation-terms__cta-icon" />
          Înapoi la site
        </motion.button>
      </ul>

      {/* Desktop Actions */}
      <div className="navigation-terms__actions">
        {/* Progress indicator */}
        <div className="navigation-terms__progress">
          <span className="navigation-terms__progress-text">
            {activeSection + 1}/{totalSections}
          </span>
          <div className="navigation-terms__progress-bar">
            <div 
              className="navigation-terms__progress-fill"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <motion.button 
          className="navigation-terms__action-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrint}
        >
          <FiPrinter />
          <span className="tooltip">Printează</span>
        </motion.button>

        <motion.button 
          className="navigation-terms__action-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDownload}
        >
          <FiDownload />
          <span className="tooltip">Descarcă PDF</span>
        </motion.button>

        <motion.button 
          className="navigation-terms__action-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNavigateHome}
        >
          <FiArrowLeft />
          <span className="tooltip">Înapoi</span>
        </motion.button>
      </div>

      {/* Hamburger Menu */}
      <div className="navigation-terms__hamburger" onClick={toggleMenu}>
        <span className={isMenuOpen ? "open" : ""}></span>
        <span className={isMenuOpen ? "open" : ""}></span>
        <span className={isMenuOpen ? "open" : ""}></span>
      </div>
    </motion.nav>
  );
};

export default NavigationTerms;