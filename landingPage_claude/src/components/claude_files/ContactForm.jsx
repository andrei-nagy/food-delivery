import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "./ContactForm.css";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiUsers,
  FiStar,
  FiAward,
  FiCheckCircle,
  FiArrowRight,
  FiSend,
  FiSmartphone,
} from "react-icons/fi";

// Variante simple de animație - doar fade up
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1], // același ease-out ca în CSS
    }
  }
};

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const ContactDemo = () => {
  const [formData, setFormData] = useState({
    name: "",
    restaurantName: "",
    message: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Folosim useInView pentru a detecta când secțiunea este vizibilă
  const isInView = useInView(sectionRef, { 
    once: true, 
    amount: 0.1,
    margin: "-50px 0px" 
  });

  // Setează isVisible când secțiunea intră în view
  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    emailjs
      .send(
        "service_orderly.ro",
        "template_nue6nny",
        {
          name: formData.name,
          restaurantName: formData.restaurantName,
          message: formData.message,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
        },
        "Rw7daoMmQiW-EUsnH"
      )
      .then(() => {
        toast.success("✓ Thank you! We'll contact you within 24 hours.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          style: { background: "#10B981", color: "white" },
        });

        setFormData({
          name: "",
          restaurantName: "",
          contactPhone: "",
          contactEmail: "",
          message: "",
        });
      })
      .catch((error) => {
        console.error("Email error:", error);
        toast.error("Please try again or contact us directly.", {
          position: "top-right",
          autoClose: 5000,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <section
      ref={sectionRef}
      className={`contact-demo-wrapper ${isVisible ? "contact-demo-wrapper--visible" : ""}`}
      id="request-demo"
      aria-label="Request a demo"
    >
      {/* Background orbs (fără motion - păstrăm CSS animation) */}
      <div className="cd-orb cd-orb--1" aria-hidden="true" />
      <div className="cd-orb cd-orb--2" aria-hidden="true" />

      <div className="cd-container">
        {/* Header cu motion */}
        <motion.header 
          className="cd-header"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
        >
          <div className="cd-eyebrow">
            <span className="cd-eyebrow-pulse" />
            Get Started
          </div>
          <h2 className="cd-headline">
            Transform your restaurant with{" "}
            <em className="cd-headline-gradient">Orderly</em>
          </h2>
          <p className="cd-subhead">
            Schedule your personalized demo and discover the future of
            restaurant management.
          </p>
        </motion.header>

        {/* Main grid cu stagger pentru carduri */}
        <motion.div 
          className="cd-grid"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left Card - Info */}
          <motion.div 
            className="cd-info-card"
            variants={fadeUpVariants}
          >
            <div className="cd-info-icon-box">
              <FiSmartphone className="cd-info-icon" />
            </div>

            <h3 className="cd-info-title">Let's talk about your restaurant</h3>
            <p className="cd-info-desc">
              Tell us about your vision, and we'll create a customized solution
              that fits your unique needs.
            </p>

            <div className="cd-features-list">
              <div className="cd-feature-item">
                <div className="cd-feature-icon-box">
                  <FiMail className="cd-feature-icon" />
                </div>
                <div className="cd-feature-details">
                  <strong>Email</strong>
                  <span>contact@orderly.ro</span>
                </div>
              </div>

              <div className="cd-feature-item">
                <div className="cd-feature-icon-box">
                  <FiPhone className="cd-feature-icon" />
                </div>
                <div className="cd-feature-details">
                  <strong>Phone</strong>
                  <span>0750 275 575</span>
                </div>
              </div>

              <div className="cd-feature-item">
                <div className="cd-feature-icon-box">
                  <FiMapPin className="cd-feature-icon" />
                </div>
                <div className="cd-feature-details">
                  <strong>Location</strong>
                  <span>Bucharest, Romania</span>
                </div>
              </div>

              <div className="cd-feature-item">
                <div className="cd-feature-icon-box">
                  <FiClock className="cd-feature-icon" />
                </div>
                <div className="cd-feature-details">
                  <strong>Response time</strong>
                  <span>&lt; 24 hours</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="cd-stats-row">
              <div className="cd-stat-block">
                <FiUsers className="cd-stat-icon" />
                <div className="cd-stat-content">
                  <span className="cd-stat-value">500+</span>
                  <span className="cd-stat-label">Restaurants</span>
                </div>
              </div>

              <div className="cd-stat-divider" />

              <div className="cd-stat-block">
                <FiStar className="cd-stat-icon" />
                <div className="cd-stat-content">
                  <span className="cd-stat-value">4.9</span>
                  <span className="cd-stat-label">Rating</span>
                </div>
              </div>

              <div className="cd-stat-divider" />

              <div className="cd-stat-block">
                <FiAward className="cd-stat-icon" />
                <div className="cd-stat-content">
                  <span className="cd-stat-value">98%</span>
                  <span className="cd-stat-label">Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="cd-testimonial">
              <div className="cd-testimonial-quote">"</div>
              <p className="cd-testimonial-text">
                Orderly transformed our operations. We've increased table
                turnover by 30% and our customers love the seamless experience.
              </p>
              <div className="cd-testimonial-author">
                <strong>— Ana Popescu</strong>
                <span>La Belle Table</span>
              </div>
            </div>
          </motion.div>

          {/* Right Card - Form */}
          <motion.div 
            className="cd-form-card"
            variants={fadeUpVariants}
          >
            <div className="cd-form-header">
              <h3>Request Your Demo</h3>
              <p>Fill out the form and we'll get back to you within 24 hours</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cd-form-group">
                <label htmlFor="cd-name">
                  Your Full Name <span className="cd-required-star">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="cd-name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                  disabled={isSubmitting}
                />
                <div className="cd-input-highlight" />
              </div>

              <div className="cd-form-group">
                <label htmlFor="cd-restaurant">
                  Restaurant Name <span className="cd-required-star">*</span>
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  id="cd-restaurant"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="Bistro Paris"
                  required
                  disabled={isSubmitting}
                />
                <div className="cd-input-highlight" />
              </div>

              <div className="cd-form-row">
                <div className="cd-form-group">
                  <label htmlFor="cd-email">
                    Email <span className="cd-required-star">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    id="cd-email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="john@restaurant.com"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="cd-input-highlight" />
                </div>

                <div className="cd-form-group">
                  <label htmlFor="cd-phone">
                    Phone <span className="cd-required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    id="cd-phone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+40 771 486 918"
                    required
                    disabled={isSubmitting}
                  />
                  <div className="cd-input-highlight" />
                </div>
              </div>

              <div className="cd-form-group">
                <label htmlFor="cd-message">
                  Your Goals & Needs <span className="cd-required-star">*</span>
                </label>
                <textarea
                  name="message"
                  id="cd-message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your restaurant, number of tables, current challenges, and what you hope to achieve with Orderly..."
                  required
                  disabled={isSubmitting}
                  rows={4}
                />
                <div className="cd-input-highlight" />
              </div>

              <div className="cd-benefits-row">
                <div className="cd-benefit-chip">
                  <FiCheckCircle className="cd-chip-icon" />
                  <span>No commitment</span>
                </div>
                <div className="cd-benefit-chip">
                  <FiCheckCircle className="cd-chip-icon" />
                  <span>Customized demo</span>
                </div>
                <div className="cd-benefit-chip">
                  <FiCheckCircle className="cd-chip-icon" />
                  <span>24h response</span>
                </div>
              </div>

              <button
                type="submit"
                className="cd-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="cd-spinner" viewBox="0 0 24 24">
                      <circle
                        className="cd-spinner-circle"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="cd-spinner-path"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending Request...
                  </>
                ) : (
                  <>
                    Request Personalized Demo
                    <FiArrowRight className="cd-btn-icon" />
                  </>
                )}
              </button>

              <div className="cd-form-note">
                2,000+ restaurants trust Orderly
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactDemo;