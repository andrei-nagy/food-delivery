import React from "react";
import { motion } from "framer-motion";
import "./Hero.css";
import arrow from "../../assets/arrow.svg";
import abstractShapes from "../../assets/abstract-shapes.png";
import phoneMockup from "../../assets/iphone_portrait1.png";
import mockup from "../../assets/mockup.png";

const Hero = () => {
  return (
    <section className="hero">
      <motion.div
        className="hero__column"
        initial={{ opacity: 0, x: -50 }}  // Start slightly off-screen to the left
        animate={{ opacity: 1, x: 0 }}   // Move to its final position
        transition={{ duration: 0.8, ease: "easeOut" }}  // Smooth transition
      >
        <h1 className="h1 hero__heading">
          <span className="hero__heading-gradient">Effortless</span>
          dining experiences{" "}
          <br />
          <span className="hero__heading-gradient">powerful management</span>
          insights
        </h1>
        <p className="text-reg hero__subheading font-weight-500">
          Elevate customer experience and optimize management with   <span className="hero__heading-gradient">Orderly</span>
        </p>
        <div className="hero__input-container">
          <input
            className="hero__input"
            type="email"
            placeholder="Enter your email"
          />
          <button className="text-reg hero__submit font-weight-500">
            Sign up
            <img className="hero__arrow" src={arrow} alt="arrow" />
          </button>
        </div>
      </motion.div>

      <div className="hero__column">
        <motion.img
          className="hero__graphic"
          src={mockup}
          alt="abstract shapes"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          // whileHover={{ scale: 1.05 }}
        />
      </div>
    </section>
  );
};

export default Hero;
