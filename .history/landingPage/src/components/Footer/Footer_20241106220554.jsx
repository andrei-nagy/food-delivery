import React from "react";
import "./Footer.css";
import logo from "../../assets/logo.svg";
import arrow from "../../assets/colored-arrow.svg";
import original_logo from "../../assets/original_logo.png";
import { motion } from "framer-motion";

const Footer = () => {
  const scrollToRequestDemo = () => {
    const element = document.getElementById("requestDemo");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content-left">
          <div className="footer__company-container">
            <img className="navigation__logo" src={original_logo} alt="icon" />

          </div>
          <div className="footer__input-container">
           
      <motion.button
        className="text-reg navigation__cta font-weight-500"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        onClick={scrollToRequestDemo}
      >
        Request a demo
        <img className="navigation__arrow" src={icon_phone} alt="icon_phone" />
      </motion.button>
          </div>
        </div>
        <div className="footer__content-right">
          <div className="footer__link-col">
            <p className="text-reg footer__col-heading">Product</p>
            <a href="#" className="text-small footer__link">
              About
            </a>
            <a href="#" className="text-small footer__link">
              Features
            </a>
            <a href="#" className="text-small footer__link">
              Pricing
            </a>
            <a href="#" className="text-small footer__link">
              Integrations
            </a>
            <a href="#" className="text-small footer__link">
              FAQs
            </a>
          </div>
          <div className="footer__link-col">
            <p className="text-reg footer__col-heading">Company</p>
            <a href="#" className="text-small footer__link">
              Our Story
            </a>
            <a href="#" className="text-small footer__link">
              Team
            </a>
            <a href="#" className="text-small footer__link">
              Careers
            </a>
            <a href="#" className="text-small footer__link">
              Press
            </a>
            <a href="#" className="text-small footer__link">
              Contact Us
            </a>
          </div>
          <div className="footer__link-col">
            <p className="text-reg footer__col-heading">Resources</p>
            <a href="#" className="text-small footer__link">
              Blog
            </a>
            <a href="#" className="text-small footer__link">
              Webinars
            </a>
            <a href="#" className="text-small footer__link">
              Case Studies
            </a>
            <a href="#" className="text-small footer__link">
              Templates
            </a>
            <a href="#" className="text-small footer__link">
              Help Center
            </a>
          </div>
          <div className="footer__link-col">
            <p className="text-reg footer__col-heading">Legal</p>
            <a href="#" className="text-small footer__link">
              Terms of Service
            </a>
            <a href="#" className="text-small footer__link">
              Privacy Policy
            </a>
            <a href="#" className="text-small footer__link">
              Cookie Policy
            </a>
            <a href="#" className="text-small footer__link">
              Acceptable Use
            </a>
            <a href="#" className="text-small footer__link">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
      <div className="footer__banner">
        <p className="text-small footer__copywright">
          Powered by Orderly. All Rights Reserved.

        </p>
        <div className="footer__external-links">
          <button className="footer__external-link facebook"></button>
          <button
            className="footer__external-link linkedin"
            onClick={() => window.open("https://www.linkedin.com/company/orderly-application", "_blank")}
          >
          </button>
          <button className="footer__external-link instagram"></button>
          <button className="footer__external-link youtube"></button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
