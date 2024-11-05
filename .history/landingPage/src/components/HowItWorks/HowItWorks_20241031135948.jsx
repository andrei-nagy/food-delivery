import React from "react";
import { motion } from "framer-motion";
import "./HowItWorks.css";
import mockup from "../../assets/mockup.png"; // Exemplu de imagine

const roadmapSteps = [
  {
    title: "Scan QR Code",
    description: "Start by scanning the QR code at the table.",
    image: mockup,
  },
  {
    title: "Explore Menu",
    description: "Browse the menu with images and detailed descriptions.",
    image: mockup,
  },
  {
    title: "Place Order",
    description: "Choose your favorite dishes and place an order.",
    image: mockup,
  },
  {
    title: "Enjoy Your Meal",
    description: "Sit back, relax, and enjoy your meal as it’s prepared.",
    image: mockup,
  },
];

const HowItWorks = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.2, duration: 0.4 },
    }),
  };

  const arrowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, repeat: Infinity, repeatType: "reverse" } },
  };

  return (
    <motion.section
      className="roadmap"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      id="howitworks"
    >
      <div className="roadmap__heading-container">
        <h2 className="h2 roadmap__heading">
          Your Journey with <span className="roadmap__text-gradient">Orderly</span>
        </h2>
        <p className="text-reg roadmap__subheading">
          Follow these steps to experience seamless dining with our app.
        </p>
      </div>

      <div className="roadmap__heading-container">
        <h2 className="h2 roadmap__heading">
        Your Journey with{" "}
          <span className="h2 roadmap__text-gradient">Orderly.</span>
        </h2>
        <p className="text-reg roadmap__subheading">
        Follow these steps to experience seamless dining with our app.
        </p>
      </div>


      <div className="roadmap__steps-container">
        {roadmapSteps.map((step, i) => (
          <React.Fragment key={i}>
            {/* Step Component */}
            <motion.div
              className="roadmap__step"
              custom={i}
              variants={stepVariants}
            >
              <p className="text-large roadmap__step-title">{step.title}</p>
              <img className="roadmap__step-image" src={step.image} alt={step.title} />
              <p className="text-reg roadmap__step-description">{step.description}</p>
            </motion.div>

            {/* Arrow between steps */}
            {i < roadmapSteps.length - 1 && (
              <motion.div
                className="roadmap__arrow"
                variants={arrowVariants}
              >
                ➔ {/* Poți schimba cu o săgeată SVG pentru un efect mai bun */}
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.section>
  );
};

export default HowItWorks;
