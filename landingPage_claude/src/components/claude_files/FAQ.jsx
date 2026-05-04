import React, { useState } from "react";
import "./FAQ.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHelpCircle,
  FiMail,
  FiMessageSquare,
  FiArrowRight,
  FiPlus,
  FiMinus,
} from "react-icons/fi";

const FAQAccordion = ({ number, question, answer, isActive, onClick }) => {
  return (
    <div
      className={`faq-accordion ${isActive ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      id="faqs"
    >
      <div className="accordion-header">
        <div className="accordion-number">{number}</div>
        <h3 className="accordion-question">{question}</h3>
        <div className="accordion-icon">
          {isActive ? <FiMinus /> : <FiPlus />}
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="accordion-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="content-inner">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [activeAccordion, setActiveAccordion] = useState(0);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqItems = [
    {
      question: "How do I get started with Orderly?",
      answer: (
        <div className="answer-content">
          <p>
            Orderly is a streamlined restaurant app designed to simplify the
            dining experience for both customers and staff. With a quick QR
            scan, customers can:
          </p>
          <ul>
            <li>
              <span>Browse the digital menu</span> directly from their phone
            </li>
            <li>
              <span>Place orders instantly</span> without waiting for staff
            </li>
            <li>
              <span>Pay securely</span> in just a few taps
            </li>
            <li>
              <span>Send orders in real-time</span> to the waitstaff’s admin
              panel
            </li>
          </ul>
          <p>
            By reducing wait times and automating order flow, Orderly ensures
            faster service, smoother operations, and a more efficient restaurant
            experience overall.
          </p>
        </div>
      ),
    },
    {
      question: "What are the key features of Orderly?",
      answer: (
       <div className="answer-content">
  <p>
    Orderly offers a range of powerful features designed to improve restaurant operations and elevate the customer experience. Its core capabilities allow restaurants to:
  </p>
  <ul>
    <li><span>Enable QR code scanning</span> so customers can instantly access the digital menu</li>
    <li><span>Allow direct ordering</span> through the app without waiting for staff</li>
    <li><span>Provide secure in-app payments</span> for a faster checkout process</li>
    <li><span>Reduce errors</span> by sending orders directly to the admin panel in real-time</li>
    <li><span>Increase order frequency</span> through an intuitive and easy-to-use interface</li>
  </ul>
  <p>
    By saving time for both customers and staff, Orderly creates a smoother workflow and enhances the overall dining experience.
  </p>
</div>

      ),
    },
    {
      question: "What are the key features of Orderly Admin Panel?",
      answer: (
       <div className="answer-content">
  <p>
    Orderly provides a simple and efficient management system, supported by a powerful analytics tool that gives full control over restaurant operations. With Orderly, administrators can:
  </p>
  <ul>
    <li><span>Manage menus and categories</span> by adding, editing, or updating items anytime</li>
    <li><span>View customer orders in real-time</span> and update their status instantly</li>
    <li><span>Create promo codes</span> for specific products or for the total order value</li>
    <li><span>Access detailed sales and product statistics</span> for better decision-making</li>
    <li><span>Generate PDF reports</span> with customized data and insights</li>
    <li><span>Customize restaurant settings</span> including images, logo, and VAT information</li>
    <li><span>Generate QR codes directly</span> from the app for fast table setup</li>
  </ul>
  <p>
    By combining operational control with real-time insights, Orderly helps restaurants run more efficiently and make data-driven decisions with ease.
  </p>
</div>

      ),
    },
    {
      question: "How much does Orderly cost?",
      answer: (
       <div className="answer-content">
  <p>
    Getting started with Orderly is simple and tailored to your restaurant’s needs. Here’s how the process works:
  </p>
  <ul>
    <li><span>Fill out the contact form</span> to express your interest in Orderly</li>
    <li><span>Connect with our team</span> to discuss your restaurant’s specific requirements</li>
    <li><span>Receive a personalized offer</span> based on your business size and goals</li>
    <li><span>Schedule a live demo</span> to see exactly how Orderly works in real time</li>
  </ul>
  <p>
    Our team will guide you through every step, ensuring you choose the best solution and understand the full value Orderly can bring to your restaurant.
  </p>
</div>

      ),
    },
    {
      question: "Who is Orderly for?",
      answer: (
       <div className="answer-content">
  <p>
    Orderly is built for restaurants that want to simplify operations and improve the dining experience. It is a strong fit for:
  </p>
  <ul>
    <li><span>Restaurant owners</span> looking to optimize workflows and reduce operational friction</li>
    <li><span>Managers</span> who need real-time control over orders and performance</li>
    <li><span>Staff members</span> aiming to deliver faster and more accurate service</li>
    <li><span>Restaurants of any type</span> that want to improve order management and increase efficiency</li>
    <li><span>Customers</span> who prefer a seamless way to browse, order, and pay from their smartphones</li>
  </ul>
  <p>
    Whether you run a small café or a large restaurant, Orderly helps create a smoother service flow and a more convenient experience for everyone involved.
  </p>
</div>

      ),
    },
    {
      question: "If I have any type of issue, can you support me?",
      answer: (
       <div className="answer-content">
  <p>
    Yes, Orderly offers reliable support to ensure your restaurant runs smoothly at all times. You can:
  </p>
  <ul>
    <li><span>Access 24/7 support</span> through the built-in ticketing system in the admin panel</li>
    <li><span>Submit support requests</span> directly from your dashboard for faster resolution</li>
    <li><span>Contact us by email</span> for additional assistance</li>
    <li><span>Reach out to our team</span> whenever you need guidance or technical help</li>
  </ul>
  <p>
    Our goal is to provide timely and effective support, so you can focus on delivering a great experience to your customers.
  </p>
</div>

      ),
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-subtitle">
            <FiHelpCircle className="subtitle-icon" />
            Frequently Asked Questions
          </div>

          <h2 className="section-title">
            Questions?{" "}
            <span className="section-title features__text-gradient">
              Answers.
            </span>
          </h2>

          <p className="section-description">
            Got questions? Here are clear answers to help you understand how
            Orderly simplifies restaurant ordering.
          </p>
        </motion.div>

        <div className="faq-content">
          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FAQAccordion
                  number={`0${index + 1}`}
                  question={item.question}
                  answer={item.answer}
                  isActive={activeAccordion === index}
                  onClick={() => toggleAccordion(index)}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="support-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="cta-content">
              <FiMessageSquare className="cta-icon" />
              <div className="cta-text">
                <h3>Still have questions?</h3>
                <p>Our support team is here to help you 24/7</p>
              </div>
              <button
                className="cta-button"
                onClick={() => {
                  const requestDemoSection =
                    document.getElementById("requestDemo");
                  if (requestDemoSection) {
                    requestDemoSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Contact us
                <FiArrowRight className="button-icon" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
