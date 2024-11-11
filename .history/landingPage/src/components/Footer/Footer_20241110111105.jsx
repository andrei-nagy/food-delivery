import React from "react";
import "./Footer.css";
import logo from "../../assets/logo.svg";
import arrow from "../../assets/colored-arrow.svg";
import original_logo from "../../assets/original_logo.png";
import { motion } from "framer-motion";
import icon_phone from "../../assets/icon_phone.png"

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
            <img className="footer__original_logo" src={original_logo} alt="icon" />

          </div>
          
        </div>
     
      </div>
      <div className="footer__banner">
        <p className="text-small footer__copywright">
          Powered by  {" "}
          <span className="rights_footer__text-gradient">Orderly</span>.
           All Rights Reserved.

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
