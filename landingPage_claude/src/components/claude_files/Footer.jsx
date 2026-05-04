import React, { useState, useEffect, useRef } from "react";
import "./Footer.css";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiFacebook, 
  FiLinkedin, 
  FiInstagram,
  FiSend,
  FiArrowRight,
  FiHeart,
  FiStar,
  FiChevronUp,
  FiTwitter,
  FiZap,
  FiSun,
  FiCoffee
} from 'react-icons/fi';
import original_logo from "../../assets/original_logo.png";
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const footerRef = useRef(null);
  
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const linkVariants = {
    initial: { x: 0 },
    hover: { 
      x: 6, 
      color: "#E65C19",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  return (
    <footer ref={footerRef} className="orderly-footer-light">
      {/* Elemente decorative delicate */}
      <div className="footer-decorative-elements">
        <motion.div 
          className="decorative-circle circle-1"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="decorative-circle circle-2"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.08, 0.18, 0.08],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="decorative-circle circle-3"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.15, 0.05],
            x: [0, 20, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Linii decorative subtile */}
        <svg className="decorative-lines" width="100%" height="100%">
          <motion.path
            d="M0,100 Q400,50 800,100 T1600,100"
            stroke="rgba(230,92,25,0.03)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="footer-content-light">
        {/* Header section cu logo și CTA */}
        <div className="footer-header-light">
          <motion.div 
            className="logo-wrapper-light"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo-glow-light" />
            <img 
              src={original_logo} 
              alt="Orderly" 
              className="footer-logo-light"
            />
          </motion.div>

          <div className="header-actions-light">

            <motion.button
              className="cta-button-light"
              onClick={() => scrollToSection('requestDemo')}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 20px rgba(230,92,25,0.2)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FiZap className="cta-icon-light" />
              <span>Start Free Trial</span>
              <FiArrowRight className="cta-arrow-light" />
            </motion.button>
          </div>
        </div>

        {/* Grid principal */}
        <div className="footer-grid-light">
          {/* Contact Column */}
          <motion.div 
            className="footer-column-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <div className="column-header-light">
              <div className="column-icon-light">
                <FiMail />
              </div>
              <h3>Contact</h3>
            </div>
            
            <div className="column-links-light">
              <motion.a 
                href="mailto:contact@orderly.ro"
                variants={linkVariants}
                initial="initial"
                whileHover="hover"
                className="footer-link-light"
              >
                <FiMail className="link-icon-light" />
                <span>contact@orderly.ro</span>
              </motion.a>
              
              <motion.a 
                href="tel:0750275575"
                variants={linkVariants}
                initial="initial"
                whileHover="hover"
                className="footer-link-light"
              >
                <FiPhone className="link-icon-light" />
                <span>0750 275 575</span>
              </motion.a>
              
              <div className="footer-link-light address-light">
                <FiMapPin className="link-icon-light" />
                <span>Bucharest, Romania</span>
              </div>

              <div className="footer-link-light">

                  <div className="social-links-light">
              <motion.a
                href="https://www.linkedin.com/company/orderly-application"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-light linkedin"
                whileHover={{ 
                  y: -4,
                  backgroundColor: "#0077B5",
                  color: "white",
                  scale: 1.1
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FiLinkedin />
              </motion.a>
              
              <motion.a
                href="#"
                className="social-link-light facebook"
                whileHover={{ 
                  y: -4,
                  backgroundColor: "#1877F2",
                  color: "white",
                  scale: 1.1
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FiFacebook />
              </motion.a>
              
              <motion.a
                href="#"
                className="social-link-light instagram"
                whileHover={{ 
                  y: -4,
                  background: "linear-gradient(45deg, #f09433, #d62976, #962fbf)",
                  color: "white",
                  scale: 1.1
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FiInstagram />
              </motion.a>
              
              <motion.a
                href="#"
                className="social-link-light twitter"
                whileHover={{ 
                  y: -4,
                  backgroundColor: "#1DA1F2",
                  color: "white",
                  scale: 1.1
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTwitter />
              </motion.a>
            </div>
              </div>
            </div>
          </motion.div>

          {/* Product Column */}
          <motion.div 
            className="footer-column-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="column-header-light">
              <div className="column-icon-light">
                <FiStar />
              </div>
              <h3>Product</h3>
            </div>
            
            <div className="column-links-light">
              {[
                { name: 'How It Works', id: 'howitworks' },
                { name: 'Features', id: 'features' },
                { name: 'Pricing', id: 'pricing' },
                { name: 'FAQs', id: 'faq' }
              ].map((item, i) => (
                <motion.button
                  key={i}
                  className="footer-link-light"
                  onClick={() => scrollToSection(item.id)}
                  variants={linkVariants}
                  whileHover="hover"
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Company Column */}
          <motion.div 
            className="footer-column-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <div className="column-header-light">
              <div className="column-icon-light">
                <FiCoffee />
              </div>
              <h3>Company</h3>
            </div>
            
            <div className="column-links-light">
              {[
                { name: 'About Us', id: 'about' },
                { name: 'Team', id: 'team' },
                { name: 'Careers', id: 'careers' },
                { name: 'Blog', id: 'blog' }
              ].map((item, i) => (
                <motion.button
                  key={i}
                  className="footer-link-light"
                  onClick={() => scrollToSection(item.id)}
                  variants={linkVariants}
                  whileHover="hover"
                >
                  {item.name}
                  {item.name === 'Careers' && (
                    <span className="badge-light">Hiring</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Connect Column */}
          <motion.div 
            className="footer-column-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <div className="column-header-light">
              <div className="column-icon-light">
                <FiHeart />
              </div>
              <h3>Legal</h3>
            </div>
            
  <div className="column-links-light">
  {[
    { name: 'Terms and conditions', path: '/terms' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'GDPR', path: '/gdpr' },
    { name: 'ANPC', path: '/anpc' }
  ].map((item, i) => (
    <motion.a
      key={i}
      href={item.path}
      className="footer-link-light"
      variants={linkVariants}
      whileHover="hover"
    >
      {item.name}
    </motion.a>
  ))}
</div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div 
          className="footer-bottom-light"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="bottom-content-light">
            <div className="copyright-light">
              <span>© {new Date().getFullYear()} Orderly</span>
              <span className="separator-light">•</span>
              <span>All rights reserved</span>
              <motion.div 
                className="heart-icon-light"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiHeart />
              </motion.div>
            </div>


          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;