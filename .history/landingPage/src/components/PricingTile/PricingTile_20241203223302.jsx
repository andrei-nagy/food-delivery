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
  additions,  // Adăugăm additionals ca prop
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
      {/* <div className="additionals-section">
        {additions.map((additional, i) => {
          return (
            <div className="pricing-additional" key={i}>
              <img className="pricing-additional__check" src={check} alt="check" />
              <p className={`text-reg button_title pricing-additional__text ${dark}`}>
                {additional}
              </p>
            </div>
          );
        })}
      </div> */}

      <button className={`pricing-cta ${dark}`}>
        <span className={`text-med button_title pricing-cta__text ${dark ? 'pricing-cta__text__white' : ''}`} onClick={scrollToRequestDemo}>{CallToAction}</span>
        {/* <img
          className={`pricing-cta__icon ${dark} ${dark ? 'pricing-cta__outline-white' : ''}`}
          src={arrowLight}
          alt="arrow"
          onClick={scrollToRequestDemo}
        /> */}
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
</svg>
      </button>
      <p className="text-tiny pricing-tile__no-card">
        {planPrice ? "No credit card required" : ""}
      </p>
    </div>
  );
};

export default PricingTile;
