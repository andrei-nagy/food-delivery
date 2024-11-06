import React from "react";
import "./FAQ.css";
import { motion } from 'framer-motion';

const FAQ = ({ children }) => {

     // Variabile de animație
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
  return (
    <motion.section
    className="faq"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={sectionVariants}
    id="faq"
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
      <div className="faq__heading-section">
        <h2 className="h2 faq__heading">Frequently Asked Questions</h2>
        <p className="text-reg faq__description">
          We've compiled a list of the most frequently asked questions about
          SmartNotes to help you get the information you need. If you have any
          other questions, feel free to reach out to our support team.
        </p>
      </div>
      {children}
    <motion.section>
  );
};

export default FAQ;
