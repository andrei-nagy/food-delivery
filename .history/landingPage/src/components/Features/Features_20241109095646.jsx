import React from "react";
import { motion } from "framer-motion";
import "./Features.css";
import { features } from "../../utils/constants";

const Features = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
    whileHover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)" },
  };

  return (
    <motion.section
      className="features"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
      id="features"
    >
      <div className="features__heading-container">
        <h2 className="h2 features__heading">
          Discover the Power of{" "}
          <span className="h2 features__text-gradient">Orderly.</span>
        </h2>
        <p className="text-reg features__subheading">
          A seamless digital solution to elevate your dining experience and streamline management.
        </p>
      </div>

      <div className="features__feature-container">
        {features.map((feature, index) => (
          <motion.div
            className="feature"
            key={index}
            custom={index}
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="whileHover"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="feature__icon">
              <img src={feature.image} alt={feature.heading} />
            </div>
            <p className="text-large feature__heading">{feature.heading}</p>
            <p className="text-reg feature__description">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Features;
