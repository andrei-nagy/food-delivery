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
    id="requestDemo"
  >
    <div className="features__heading-container">
      <h2 className="h2 features__heading">
      Ready to start your journey with{" "}
        <span className="h2 features__text-gradient">Orderly?</span>
      </h2>
      <p className="text-reg features__subheading">
      Unlock the full digital potential of your restaurant with Orderly's App & Admin Management Panel—your all-in-one solution for seamless control, real-time insights, and powerful customization.
      </p>
    </div>
    <section className="pricing">
      <div className="pricing__heading-section">
        <h3 className="h3 pricing__heading">Pricing & Plans</h3>
        <p className="text-reg pricing__subheading">
          With lots of unique blocks, you can easily build a page without
          coding. Build your next landing page.
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
    </section>
    </motion.section>
  );
};

export default Pricing;
