import React from "react";
import { motion } from "framer-motion";
import "./Navigation.css";
import logo from "../../assets/logo.svg";
import arrow from "../../assets/arrow_orange.png";
import icon_phone from "../../assets/icon_phone.png"
import original_logo from "../../assets/original_logo.png";

const Navigation = () => {

  const scrollToRequestDemo = () => {
    const element = document.getElementById("requestDemo");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // Animation Variants
  const navVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 + 0.5, duration: 0.3 },
    }),
  };

  return (
    <motion.nav
      className="navigation"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <motion.div className="navigation__logo-section" variants={navVariants}>
        <img className="navigation__logo" src={original_logo} alt="logo" />
      </motion.div>

      <ul className="navigation__link-section">
        {["How it works","Features", "Admin Management", "Pricing", "FAQs"].map((link, index) => {
          const linkHref = `#${link.replace(/\s+/g, '').toLowerCase()}`;
          return (
            <motion.a
              key={link}
              href={linkHref}
              className="text-reg navigation__link font-weight-500"
              custom={index}
              variants={linkVariants}
            >
              {link}
            </motion.a>
          );
        })}

      </ul>

      <motion.button
        className="text-reg navigation__cta font-weight-500"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        onClick={scrollToRequestDemo}
      >
        Discover Orderly
        <img className="navigation__arrow" src={icon_phone} alt="icon_phone" />
      </motion.button>
    </motion.nav>
  );
};

export default Navigation;
