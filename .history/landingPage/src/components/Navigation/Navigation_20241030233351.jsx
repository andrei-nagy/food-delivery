import React from "react";
import "./Navigation.css";
import logo from "../../assets/logo.svg";
import arrow from "../../assets/arrow.svg";
import original_logo from "../../assets/original_logo.png"

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="navigation__logo-section">
        <img className="navigation__logo" src={original_logo} alt="logo" />
        {/* <h3 className="navigation__name"></h3> */}
      </div>
      <ul className="navigation__link-section">
        <a href="#" className="text-reg navigation__link font-weight-500">
          Features
        </a>
        <a href="#" className="text-reg navigation__link font-weight-500">
          Pricing
        </a>
        <a href="#" className="text-reg navigation__link font-weight-500">
          Support
        </a>
      </ul>
      <button className="text-reg navigation__cta">
        Get Started
        <img className="navigation__arrow" src={arrow} alt="arrow" />
      </button>
    </nav>
  );
};

export default Navigation;
