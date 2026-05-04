import React, { useState } from "react";
import "./Pricing.css";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiTag, FiStar, FiDollarSign } from 'react-icons/fi';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Basic",
      price: {
        monthly: 39,
        yearly: 32
      },
      description: "Perfect for small restaurants and cafés",
      features: [
        { name: "Up to 3,000 orders/month", included: true },
        { name: "QR code menu & ordering", included: true },
        { name: "Secure in-app payments", included: true },
        { name: "Real-time order management", included: true },
        { name: "Basic sales analytics", included: true },
        { name: "Menu & category management", included: true },
        { name: "Basic promo codes", included: true },
        { name: "PDF sales reports", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority 24/7 support", included: false },
        { name: "Diana AI Assistant", included: false },
      ]
    },
    {
      name: "Pro",
      price: {
        monthly: 89,
        yearly: 69
      },
      description: "For growing restaurants that need more",
      features: [
        { name: "Unlimited orders", included: true },
        { name: "QR code menu & ordering", included: true },
        { name: "Secure in-app payments", included: true },
        { name: "Real-time order management", included: true },
        { name: "Advanced sales analytics", included: true },
        { name: "Full menu control", included: true },
        { name: "Advanced promo codes", included: true },
        { name: "Custom PDF reports", included: true },
        { name: "Priority 24/7 support", included: true },
        { name: "Diana AI Assistant", included: true },
      ],
      popular: true
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="pp-wrapper" id="pricing">
      <div className="pp-bg-pattern" aria-hidden="true" />

      <motion.div 
        className="pp-container"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div 
          className="pp-header"
          variants={fadeInUp}
        >
          <div className="pp-tag">
            <FiDollarSign className="pp-tag-icon" />
            Simple pricing
          </div>
          <h2 className="pp-title">
            Choose the perfect{" "}
            <span className="pp-title-gradient">plan</span>
          </h2>
          <p className="pp-subtitle">
            Transparent pricing, no hidden fees
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div 
          className="pp-billing"
          variants={fadeInUp}
        >
          <span className={`pp-period ${!isYearly ? 'pp-period--active' : ''}`}>
            Monthly
          </span>
          
          <motion.label 
            className="pp-toggle"
            whileTap={{ scale: 0.95 }}
          >
            <input 
              type="checkbox" 
              className="pp-toggle-input" 
              onChange={(e) => setIsYearly(e.target.checked)}
              checked={isYearly}
              aria-label="Toggle yearly billing"
            />
            <motion.span 
              className="pp-toggle-track"
              animate={isYearly ? { x: 20 } : { x: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.label>
          
          <span className={`pp-period ${isYearly ? 'pp-period--active' : ''}`}>
            Yearly
          </span>
          
          <motion.span 
            className="pp-savings"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <FiTag className="pp-savings-icon" />
            Save 25%
          </motion.span>
        </motion.div>

        {/* Pricing cards */}
        <div className="pp-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`pp-card ${plan.popular ? 'pp-card--popular' : ''}`}
              variants={{
                initial: { opacity: 0, y: 30 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.15 }
                }
              }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)",
                transition: { duration: 0.2 }
              }}
            >
           {plan.popular && (
  <div className="pp-badge-wrapper">
    <motion.div 
      className="pp-badge"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <FiStar className="pp-badge-icon" />
      Most Popular
    </motion.div>
  </div>
)}
              
              <div className="pp-card-header">
                <h3 className="pp-plan-name">{plan.name}</h3>
                <p className="pp-plan-desc">{plan.description}</p>
              </div>

              <motion.div 
                className="pp-price-wrap"
                key={isYearly ? 'yearly' : 'monthly'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="pp-price">
                  ${isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="pp-price-period">/month</span>
              </motion.div>

              {isYearly && (
                <motion.span 
                  className="pp-note"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Billed annually (${plan.price.yearly * 12}/year)
                </motion.span>
              )}

              <ul className="pp-features">
                {plan.features.map((feature, idx) => (
                  <motion.li 
                    key={idx} 
                    className="pp-feature"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.03) }}
                    whileHover={{ x: 3 }}
                  >
                    {feature.included ? (
                      <FiCheck className="pp-feature-icon pp-feature-icon--included" />
                    ) : (
                      <FiX className="pp-feature-icon pp-feature-icon--excluded" />
                    )}
                    <span className={!feature.included ? 'pp-feature-text--excluded' : ''}>
                      {feature.name}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.button 
                className={`pp-button ${plan.popular ? 'pp-button--popular' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                Get {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div 
          className="pp-guarantee"
          variants={fadeInUp}
        >
          <p>✨ 14-day free trial • No credit card required • Cancel anytime</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Pricing;