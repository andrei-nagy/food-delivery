import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import original_logo from "../../assets/original_logo.png";
import "./Footer.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { name: "How It Works", id: "howitworks" },
  { name: "Features",     id: "features"   },
  { name: "Pricing",      id: "pricing"    },
  { name: "FAQs",         id: "faq"        },
];

const COMPANY_LINKS = [
  { name: "About Us", id: "about"   },
  { name: "Team",     id: "team"    },
  { name: "Careers",  id: "careers", badge: "Hiring" },
  { name: "Blog",     id: "blog"    },
];

const LEGAL_LINKS = [
  { name: "Terms & Conditions", path: "/terms"   },
  { name: "Privacy",            path: "/privacy" },
  { name: "GDPR",               path: "/gdpr"    },
  { name: "ANPC",               path: "/anpc"    },
];

const SOCIALS = [
  { label: "in", href: "https://www.linkedin.com/company/orderly-application" },
  { label: "fb", href: "#" },
  { label: "ig", href: "#" },
  { label: "tw", href: "#" },
];

// ── Motion variants ───────────────────────────────────────────────────────────

// Footer întreg: wipe de jos în sus (reveal ca o cortină)
const footerVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Top row: logo + CTA din direcții opuse
const topRowVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const logoVariants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const ctaBtnVariants = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

// Grid coloane: fiecare coloană cade din sus cu stagger
const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const colVariants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Link-uri din coloane: stagger fade-in
const linksVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const linkItemVariants = {
  hidden:  { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Social icons: pop-in cu spring staggerat
const socialsVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const socialItemVariants = {
  hidden:  { opacity: 0, scale: 0.5, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 280, damping: 18 },
  },
};

// Bottom bar: fade simplu
const bottomVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay: 0.4 } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer2() {
  return (
    <motion.footer
      className="ftr2"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="ftr2__wrap">

        {/* Top row: logo din stânga, CTA din dreapta */}
        <motion.div
          className="ftr2__top"
          variants={topRowVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.img
            src={original_logo}
            alt="Orderly"
            className="ftr2__logo"
            variants={logoVariants}
          />
          <motion.a
            href="#requestDemo"
            className="ftr2__cta-btn"
            variants={ctaBtnVariants}
            onClick={(e) => { e.preventDefault(); scrollTo("requestDemo"); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            Start free trial →
          </motion.a>
        </motion.div>

        {/* Four-column grid: coloane cad din sus cu stagger */}
        <motion.div
          className="ftr2__grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
        >

          {/* Contact */}
          <motion.div className="ftr2__col" variants={colVariants}>
            <div className="ftr2__col-head">
              <span className="ftr2__col-head-dot" />
              Contact
            </div>
            <div className="ftr2__contact-item">
              <div className="ftr2__contact-label">Email</div>
              <div className="ftr2__contact-val">contact@orderly.ro</div>
            </div>
            <div className="ftr2__contact-item">
              <div className="ftr2__contact-label">Phone</div>
              <div className="ftr2__contact-val">0750 275 575</div>
            </div>
            <div className="ftr2__contact-item">
              <div className="ftr2__contact-label">Location</div>
              <div className="ftr2__contact-val">Bucharest, Romania</div>
            </div>

            {/* Social icons: pop-in cu rotație + spring */}
            <motion.div
              className="ftr2__socials"
              variants={socialsVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {SOCIALS.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  className="ftr2__social"
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={socialItemVariants}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 350, damping: 18 }}
                >
                  {s.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Product */}
          <motion.div className="ftr2__col" variants={colVariants}>
            <div className="ftr2__col-head">
              <span className="ftr2__col-head-dot" />
              Product
            </div>
            <motion.div
              className="ftr2__links"
              variants={linksVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {PRODUCT_LINKS.map((l) => (
                <motion.button
                  key={l.id}
                  className="ftr2__link"
                  onClick={() => scrollTo(l.id)}
                  variants={linkItemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {l.name}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Company */}
          <motion.div className="ftr2__col" variants={colVariants}>
            <div className="ftr2__col-head">
              <span className="ftr2__col-head-dot" />
              Company
            </div>
            <motion.div
              className="ftr2__links"
              variants={linksVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {COMPANY_LINKS.map((l) => (
                <motion.button
                  key={l.id}
                  className="ftr2__link"
                  onClick={() => scrollTo(l.id)}
                  variants={linkItemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {l.name}
                  {l.badge && <span className="ftr2__link-badge">{l.badge}</span>}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Legal */}
          <motion.div className="ftr2__col" variants={colVariants}>
            <div className="ftr2__col-head">
              <span className="ftr2__col-head-dot" />
              Legal
            </div>
            <motion.div
              className="ftr2__links"
              variants={linksVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {LEGAL_LINKS.map((l) => (
                <motion.div
                  key={l.path}
                  variants={linkItemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link to={l.path} className="ftr2__link">
                    {l.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </motion.div>

        {/* Bottom bar: fade simplu */}
        <motion.div
          className="ftr2__bottom"
          variants={bottomVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="ftr2__copy">
            <span>© {new Date().getFullYear()} Orderly</span>
            <span className="ftr2__copy-sep" />
            <span>All rights reserved</span>
          </div>
          <motion.button
            className="ftr2__back-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            ↑ Back to top
          </motion.button>
        </motion.div>

      </div>
    </motion.footer>
  );
}