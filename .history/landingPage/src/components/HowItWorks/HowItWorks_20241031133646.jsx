import React from "react";
import { motion } from "framer-motion";
import "./HowItWorks.css";
import { features } from "../../utils/constants";

const HowItWorks = () => {
  // Animation Variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <motion.section
      className="features"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <div className="features__heading-container">
        <h2 className="h2 features__heading">
          How{" "}
          <span className="h2 features__text-gradient">easy</span>
          it works!
        </h2>
        <p className="text-reg features__subheading">
          Orderly is a complete digital solution for the hospitality industry, combining easy-to-use QR code ordering with advanced management tools.
        </p>
      </div>
      <div className="features__feature-container">
        {features.map((obj, i) => {
          return (
            <motion.div
              className={`feature ${obj.gridArea}`}
              key={i}
              custom={i}
              variants={featureVariants}
              initial="hidden"
              animate="visible"
            >
              <img
                className="feature__icon"
                src={obj.image}
                alt={obj.heading}
              />
              <p className="text-large feature__heading">{obj.heading}</p>
              <p className="text-reg feature__description">{obj.description}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="features__overlay-gradient"></div>
    </motion.section>
  );
};

export default HowItWorks;
