import React from "react";
import "./PricingTile.css";
import check from "../../assets/icon_verified.png";
import arrowDark from "../../assets/arrow.svg";
import arrowLight from "../../assets/colored-arrow.svg";

const PricingTile = ({
  plan,
  planIcon,
  planPrice,
  planPeriod,
  bullets,
  additionals,  // Adăugăm additionals ca prop
  CallToAction,
  darkMode,
}) => {
  const dark = darkMode ? "dark" : "";
  const price =
    planPeriod === "/ monthly" ? planPrice + "€" : planPrice * 12 + "€";

  const scrollToRequestDemo = () => {
    const element = document.getElementById("requestDemo");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`pricing-tile ${dark}`}>
      <div className="plan-section">
        <p className="text-small price_title plan-section__plan">{plan}</p>
      </div>
      <div className="pricing-section">
        <h2 className={`h2 pricing-section__price ${dark}`}>
          {planPrice ? price : "Custom"}
        </h2>
        <p className={`text-reg button_title pricing-section__period ${dark}`}>
          {planPrice ? planPeriod : ""}
        </p>
      </div>
      <div className="bullets-section">
        {bullets.map((bullet, i) => {
          return (
            <div className="pricing-bullet" key={i}>
              <img className="pricing-bullet__check" src={check} alt="check" />
              <p className={`text-reg button_title pricing-bullet__text ${dark}`}>
                {bullet}
              </p>
            </div>
          );
        })}
      </div>

      {/* Adăugăm secțiunea additionals */}
      <div className="additionals-section">
        {additionals.map((additional, i) => {
          return (
            <div className="pricing-additional" key={i}>
              <img className="pricing-additional__check" src={check} alt="check" />
              <p className={`text-reg button_title pricing-additional__text ${dark}`}>
                {additional}
              </p>
            </div>
          );
        })}
      </div>

      <button className={`pricing-cta ${dark}`}>
        <span className="text-med button_title pricing-cta__text" onClick={scrollToRequestDemo}>{CallToAction}</span>
        <img
          className={`pricing-cta__icon ${dark}`}
          src={arrowLight}
          alt="arrow"
          onClick={scrollToRequestDemo}
        />
      </button>
      <p className="text-tiny pricing-tile__no-card">
        {planPrice ? "No credit card required" : ""}
      </p>
    </div>
  );
};

export default PricingTile;
