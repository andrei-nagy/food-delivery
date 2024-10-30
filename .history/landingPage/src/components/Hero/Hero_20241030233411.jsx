import React from "react";
import "./Hero.css";
import arrow from "../../assets/arrow.svg";
import abstractShapes from "../../assets/abstract-shapes.png";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__column">
        <h1 className="h1 hero__heading">
          <span className="hero__heading-gradient">Effortless</span>
          dining experiences{" "}<br></br>
          <span className="hero__heading-gradient">powerful management</span>
          insights 
        </h1>
        <p className="text-reg hero__subheading">
        Elevate customer experience and optimize management with Orderly
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
      </div>
      <div className="hero__column">
        <img
          className="hero__graphic"
          src={abstractShapes}
          alt="abstract shapes"
        />
      </div>
    </section>
  );
};

export default Hero;
