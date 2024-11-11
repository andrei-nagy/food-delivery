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
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  return (
    <>

    <Page>
      <Header>
        <Navigation />
        <Hero />
      </Header>
      <Logos />
      <ToastContainer/>

      <HowItWorks/>
      {/* <AdminPanelShowcase/> */}
      <Features />
      <AdminFeatures/>
      {/* <AdminGallery/> */}
 
  
     
      <Pricing />
      <ContactForm/>
      <FAQ>
        <Accordion />
      </FAQ>
      
 
      {/* <Footer /> */}
    </Page>
    <GoToTopButton/>
    </>
  );
};

export default App;
