import React, { useState } from "react";
import "./Pricing.css";
import PricingTile from "../PricingTile/PricingTile";
import { pricingData } from "../../utils/constants";
import { motion } from 'framer-motion';

const Pricing = () => {
  const [planPeriod, setPlanPeriod] = useState("/ monthly");

  const planPeriodToggle = () => {
    planPeriod === "/ monthly"
      ? setPlanPeriod("/ yearly")
      : setPlanPeriod("/ monthly");
  };
   // Variabile de animație
   const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <motion.section
    className="adminFeatures"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={sectionVariants}
    id="pricing"
  >
    <div className="features__heading-container">
      <h2 className="h2 features__heading">
      Pricing &{" "}
        <span className="h2 features__text-gradient">Plans</span>
      </h2>
      <p className="text-reg features__subheading">
      Discover flexible pricing plans tailored to help your business streamline operations and enhance customer experience with Orderly.
      </p>
    </div>
 
      <div className="pricing__billing-section">
        <p className="text-med pricing__period-text">Monthly</p>
        <label className="toggle">
          <input className="toggle__input" type="checkbox" />
          <span className="toggle__circle" onClick={planPeriodToggle}></span>
        </label>
        <p className="text-med pricing__period-text">Yearly</p>
        <span className="text-small pricing__savings">Save 25%</span>
      </div>
      <div className="pricing__tile-section">
        {pricingData.map((tile, i) => {
          return <PricingTile key={i} {...tile} planPeriod={planPeriod} />;
        })}
      </div>

    </motion.section>
  );
};

export default Pricing;
