// src/components/Home/Home.jsx
import React from "react";
import "./Home.css";

// components
import Header from "../Header/Header";
import Hero from "../Hero/Hero";
import Logos from "../Logos/Logos";
import Features from "../Features/Features";
import Pricing from "../Pricing/Pricing";
import FAQ from "../FAQ/FAQ";
import Accordion from "../Accordion/Accordion";
import Navigation from "../Navigation/Navigation";
import HowItWorks from "../HowItWorks/HowItWorks";
import GoToTopButton from "../goToTopButton/goToTopButton";
import AdminFeatures from "../AdminFeatures/AdminFeatures";
import ContactForm from "../ContactForm/ContactForm";
// import Footer from "../Footer/Footer"; ← Șterge Footer de aici
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  return (
    <>
      <Header>
        <Navigation />
        <Hero />
      </Header>
      <ToastContainer/>
      <HowItWorks/>
      <Features />
      <AdminFeatures/>
      <Pricing />
      <ContactForm/>
      <FAQ>
        <Accordion />
      </FAQ>
      <GoToTopButton/>
    </>
  );
};

export default Home;