import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "../UseReveal/UseReveal";
import "./FAQ.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: "How do I get started with Orderly?",
    answer: (
      <div className="faq2__answer">
        <p>Orderly is a streamlined restaurant app designed to simplify the dining experience. With a quick QR scan, customers can:</p>
        <ul>
          <li><span>Browse the digital menu</span> directly from their phone</li>
          <li><span>Place orders instantly</span> without waiting for staff</li>
          <li><span>Pay securely</span> in just a few taps</li>
          <li><span>Send orders in real-time</span> to the waitstaff's admin panel</li>
        </ul>
        <p>By reducing wait times and automating order flow, Orderly ensures faster service and a more efficient restaurant experience overall.</p>
      </div>
    ),
  },
  {
    question: "What are the key features of Orderly?",
    answer: (
      <div className="faq2__answer">
        <p>Orderly offers powerful features designed to improve restaurant operations and elevate the customer experience:</p>
        <ul>
          <li><span>Enable QR code scanning</span> so customers can instantly access the digital menu</li>
          <li><span>Allow direct ordering</span> through the app without waiting for staff</li>
          <li><span>Provide secure in-app payments</span> for a faster checkout process</li>
          <li><span>Reduce errors</span> by sending orders directly to the admin panel in real-time</li>
          <li><span>Increase order frequency</span> through an intuitive and easy-to-use interface</li>
        </ul>
      </div>
    ),
  },
  {
    question: "What are the key features of Orderly Admin Panel?",
    answer: (
      <div className="faq2__answer">
        <p>Orderly provides a simple and efficient management system with powerful analytics. Administrators can:</p>
        <ul>
          <li><span>Manage menus and categories</span> by adding, editing, or updating items anytime</li>
          <li><span>View customer orders in real-time</span> and update their status instantly</li>
          <li><span>Create promo codes</span> for specific products or for the total order value</li>
          <li><span>Access detailed sales and product statistics</span> for better decision-making</li>
          <li><span>Generate PDF reports</span> with customized data and insights</li>
          <li><span>Generate QR codes directly</span> from the app for fast table setup</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How much does Orderly cost?",
    answer: (
      <div className="faq2__answer">
        <p>Getting started with Orderly is simple and tailored to your restaurant's needs:</p>
        <ul>
          <li><span>Fill out the contact form</span> to express your interest in Orderly</li>
          <li><span>Connect with our team</span> to discuss your specific requirements</li>
          <li><span>Receive a personalized offer</span> based on your business size and goals</li>
          <li><span>Schedule a live demo</span> to see exactly how Orderly works in real time</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Who is Orderly for?",
    answer: (
      <div className="faq2__answer">
        <p>Orderly is built for restaurants that want to simplify operations and improve the dining experience:</p>
        <ul>
          <li><span>Restaurant owners</span> looking to optimize workflows and reduce friction</li>
          <li><span>Managers</span> who need real-time control over orders and performance</li>
          <li><span>Staff members</span> aiming to deliver faster and more accurate service</li>
          <li><span>Customers</span> who prefer a seamless way to browse, order, and pay</li>
        </ul>
      </div>
    ),
  },
  {
    question: "If I have any type of issue, can you support me?",
    answer: (
      <div className="faq2__answer">
        <p>Yes, Orderly offers reliable support to ensure your restaurant runs smoothly at all times:</p>
        <ul>
          <li><span>Access 24/7 support</span> through the built-in ticketing system in the admin panel</li>
          <li><span>Submit support requests</span> directly from your dashboard for faster resolution</li>
          <li><span>Contact us by email</span> for additional assistance</li>
          <li><span>Reach out to our team</span> whenever you need guidance or technical help</li>
        </ul>
      </div>
    ),
  },
];

// ── Motion variants ───────────────────────────────────────────────────────────

// Header: "typewriter" stagger — fiecare element intră cu întârziere progresivă
const headerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
};

const kickerVariants = {
  hidden:  { opacity: 0, letterSpacing: "0.4em", filter: "blur(4px)" },
  visible: {
    opacity: 1,
    letterSpacing: "0.15em",
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const titleVariants = {
  hidden:  { opacity: 0, y: 32, skewY: 3 },
  visible: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const subtitleVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Grid de întrebări: stagger fade-up cu decalaj
const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28, scaleY: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// Răspuns accordion: expand vertical cu fade
// Folosim height auto via AnimatePresence
const answerVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.28, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

// Icon toggle (+/-): rotatie
const toggleIconVariants = {
  closed: { rotate: 0,   scale: 1   },
  open:   { rotate: 135, scale: 1.1 },
};

// CTA: fade-up cu spring
const ctaVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 20, delay: 0.15 },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function FAQ2() {
  const ref = useReveal();
  const [open, setOpen] = useState(0);

  const toggle = (i) => setOpen((prev) => (prev === i ? null : i));

  return (
    <section className="faq2" id="faq" ref={ref}>
      <div className="faq2__wrap">

        {/* Header: blur+letterSpacing pe kicker, skew pe titlu */}
        <motion.header
          className="faq2__header"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div className="faq2__kicker" variants={kickerVariants}>
            <span className="faq2__kicker-line" />
            FAQ
            <span className="faq2__kicker-line" />
          </motion.div>
          <motion.h2 className="faq2__h" variants={titleVariants}>
            Questions?<br /><em>Answers.</em>
          </motion.h2>
          <motion.p className="faq2__sub" variants={subtitleVariants}>
            Got questions? Here are clear answers to help you understand how Orderly simplifies restaurant ordering.
          </motion.p>
        </motion.header>

        {/* Grid cu stagger fade-up */}
        <motion.div
          className="faq2__grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className={`faq2__item${open === i ? " faq2__item--open" : ""}`}
              variants={itemVariants}
              layout
            >
              {/* Butonul întrebării cu hover lift */}
              <motion.button
                className="faq2__btn"
                onClick={() => toggle(i)}
                aria-expanded={open === i}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="faq2__num">0{i + 1}</span>
                <span className="faq2__q">{item.question}</span>

                {/* Iconul +/- cu rotație */}
                <motion.span
                  className="faq2__toggle"
                  aria-hidden="true"
                  variants={toggleIconVariants}
                  animate={open === i ? "open" : "closed"}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{ display: "inline-block", originX: "50%", originY: "50%" }}
                >
                  +
                </motion.span>
              </motion.button>

              {/* Răspuns: expand/collapse cu AnimatePresence */}
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    className="faq2__body faq2__body--open"
                    key="answer"
                    variants={answerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    style={{ overflow: "hidden" }}
                  >
                    <div className="faq2__inner">{item.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA: spring fade-up */}
        <motion.div
          className="faq2__cta"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
        >
          <div className="faq2__cta-text">
            <div className="faq2__cta-title">Still have questions?</div>
            <div className="faq2__cta-sub">Our support team is here to help you 24/7</div>
          </div>
          <motion.button
            className="faq2__cta-btn"
            onClick={() => {
              document.getElementById("requestDemo")?.scrollIntoView({ behavior: "smooth" });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            Contact us →
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}