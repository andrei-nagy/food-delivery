import React from "react";
import "./App.css";

//images
import doubleQoute from "../../assets/double-quote.svg";

// fonts
import "../../fonts/fonts.css";

// components
import Page from "../Page/Page";
import Header from "../Header/Header";
import Hero from "../Hero/Hero";
import Logos from "../Logos/Logos";
import Testimonial from "../Testimonial/Testimonial";
import Features from "../Features/Features";
import Video from "../Video/Video";
import Pricing from "../Pricing/Pricing";
import FAQ from "../FAQ/FAQ";
import CTA from "../CTA/CTA";
import Footer from "../Footer/Footer";
import Accordion from "../Accordion/Accordion";
import Navigation from "../Navigation/Navigation";
import FeatureImages from "../FeatureImages/FeatureImages";
import HowItWorks from "../HowItWorks/HowItWorks";
import GoToTopButton from "../goToTopButton/goToTopButton";
import AdminPanelShowcase from "../ManagementAdminPanel/ManagementAdminPanel";
import AdminFeatures from "../AdminFeatures/AdminFeatures";
import AdminGallery from "../AdminFeatures/AdminGallery";
import ContactForm from "../ContactForm/ContactForm";
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
    <ToastContainer/>
    <Page>
      <Header>
        <Navigation />
        <Hero />
      </Header>
      <Logos />
      {/* <Testimonial>
        <h5 className="h5 testimonial__heading">
        Orderly simplifies dining with QR-based ordering and gives managers real-time control over sales and operations.        </h5>
        <div className="testimonial__author-section">
          <p className="text-reg testimonial__author">Sarah Johnson</p>
          <p className="text-reg testimonial__organization">
            TechSavvy Solutions
          </p>
        </div>
        <img className="testimonial__quotes" src={doubleQoute} alt="quote" />
      </Testimonial> */}
      {/* <FeatureImages/> */}
      <HowItWorks/>
      {/* <AdminPanelShowcase/> */}
      <Features />
      <AdminFeatures/>
      {/* <AdminGallery/> */}
      <ContactForm/>
      <Testimonial>
        <h5 className="h5 testimonial__heading">
        A digital platform for quick customer orders and smart management of restaurant operations.
        </h5>
        <div className="testimonial__author-section">
          <p className="text-reg testimonial__author">Sarah Johnson</p>
          <p className="text-reg testimonial__organization">
            TechSavvy Solutions
          </p>
        </div>
        <img className="testimonial__quotes" src={doubleQoute} alt="quote" />
      </Testimonial>
      <Video />
      <Testimonial>
        <h5 className="h5 testimonial__heading">
        Fast, contactless ordering paired with efficient management tools for modern venues.
        </h5>
        <div className="testimonial__author-section">
          <p className="text-reg testimonial__author">Sarah Johnson</p>
          <p className="text-reg testimonial__organization">
            TechSavvy Solutions
          </p>
        </div>
        <img className="testimonial__quotes" src={doubleQoute} alt="quote" />
      </Testimonial>
      <Pricing />
      <Testimonial>
        <h5 className="h5 testimonial__heading">
        Easy ordering for customers, intelligent insights for your business.
        </h5>
        <div className="testimonial__author-section">
          <p className="text-reg testimonial__author">Sarah Johnson</p>
          <p className="text-reg testimonial__organization">
            TechSavvy Solutions
          </p>
        </div>
        <img className="testimonial__quotes" src={doubleQoute} alt="quote" />
      </Testimonial>
      <FAQ>
        <Accordion />
      </FAQ>
      <Testimonial>
        <h5 className="h5 testimonial__heading">
        Empower guests to order with ease; empower managers to optimize effortlessly.
        </h5>
        <div className="testimonial__author-section">
          <p className="text-reg testimonial__author">Sarah Johnson</p>
          <p className="text-reg testimonial__organization">
            TechSavvy Solutions
          </p>
        </div>
        <img className="testimonial__quotes" src={doubleQoute} alt="quote" />
      </Testimonial>
      <CTA />
      <Footer />
    </Page>
    <GoToTopButton/>
    </>
  );
};

export default App;
