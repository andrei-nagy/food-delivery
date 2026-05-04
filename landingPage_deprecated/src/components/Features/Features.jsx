import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "./Features.css";
import { features } from "../../utils/constants";
import { 
  FiZap, 
  FiStar, 
  FiTrendingUp,
  FiClock,
  FiSmile,
  FiAward,
  FiArrowRight,
  FiHeart,
  FiCompass,
  FiCoffee,
  FiCamera,
  FiUsers,
  FiCreditCard,
  FiBell
} from 'react-icons/fi';

// Floating particles component
const FloatingBackgroundParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: `particle-${i}`,
    size: Math.random() * 6 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, 255, ${Math.random() * 0.1 + 0.05})`
  }));

  return (
    <div className="floating-particles-container" id="floating-particles">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="floating-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Counter component
const AnimatedStatsCounter = ({ value, label, color, counterId }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => Math.min(c + Math.ceil(value / 50), value));
    }, 30);
    
    return () => clearInterval(interval);
  }, [value]);
  
  return (
    <motion.div 
      className={`stats-counter-item-${counterId}`}
      id={`stats-counter-${counterId}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <span className="stats-counter-value" style={{ color }}>{count.toLocaleString()}+</span>
      <span className="stats-counter-label">{label}</span>
    </motion.div>
  );
};

// Main Features Component
const Features = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const featureIcons = [
    <FiZap />, <FiStar />, <FiTrendingUp />, 
    <FiClock />, <FiSmile />, <FiAward />,
    <FiCompass />, <FiCoffee />, <FiCamera />,
    <FiUsers />, <FiCreditCard />, <FiBell />
  ];

  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', 
    '#14B8A6', '#F59E0B', '#EF4444',
    '#6366F1', '#D946EF', '#F97316',
    '#06B6D4', '#84CC16', '#A855F7'
  ];

  // Interactive mouse follower
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.section
      className="reimagined-features-section"
      id="reimagined-features"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* Interactive background */}
      <div className="features-gradient-background" id="features-gradient-bg">
        <div 
          className="gradient-spotlight-effect" 
          id="gradient-spotlight"
          style={{ 
            left: mousePosition.x - 250, 
            top: mousePosition.y - 250,
          }} 
        />
      </div>
      
      <FloatingBackgroundParticles />
      
      <div className="features-content-container" id="features-container">
        {/* Animated Header */}
        <motion.div 
          className="features-header-wrapper"
          id="features-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="features-badge"
            id="features-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHeart className="features-badge-icon" />
            <span>Why choose Orderly?</span>
          </motion.div>
          
          <h2 className="features-main-title" id="features-main-title">
            Everything you need to{' '}
            <span className="features-gradient-text" id="features-gradient-text">
              elevate
            </span>
            <br />your restaurant experience
          </h2>
          
          <p className="features-subtitle-text" id="features-subtitle">
            Beautifully designed features that work together seamlessly
          </p>
          
          {/* Live counters */}
          <div className="live-stats-container" id="live-stats">
            <AnimatedStatsCounter value={2500} label="Restaurants" color="#3B82F6" counterId="1" />
            <AnimatedStatsCounter value={15000} label="Daily Orders" color="#8B5CF6" counterId="2" />
            <AnimatedStatsCounter value={98} label="Satisfaction %" color="#EC4899" counterId="3" />
          </div>
        </motion.div>

        {/* Features Grid with proper vertical spacing */}
        <div className="features-grid-layout" id="features-grid">
          {features.map((feature, index) => {
            const color = colors[index % colors.length];
            const isActive = activeFeature === index;
            
            return (
              <motion.div 
                className="feature-grid-item" 
                key={index}
                id={`feature-item-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className={`feature-card-content ${isActive ? 'active-feature-card' : ''}`}
                  id={`feature-card-${index}`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  {/* Animated icon with floating effect */}
                  <motion.div 
                    className="feature-icon-wrapper"
                    id={`feature-icon-wrapper-${index}`}
                    style={{ 
                      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                      borderColor: `${color}30`
                    }}
                    animate={isActive ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="feature-icon-element"
                      id={`feature-icon-${index}`}
                      style={{ color }}
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      {feature.image ? (
                        <img src={feature.image} alt={feature.heading} className="feature-custom-image"/>
                      ) : (
                        featureIcons[index % featureIcons.length]
                      )}
                    </motion.div>
                    
                    {/* Pulsing ring */}
                    <motion.div 
                      className="feature-icon-ring"
                      id={`feature-ring-${index}`}
                      style={{ borderColor: `${color}40` }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Card content */}
                  <div className="feature-text-content" id={`feature-text-${index}`}>
                    <motion.div 
                      className="feature-number-indicator"
                      id={`feature-number-${index}`}
                      style={{ color: `${color}30` }}
                    >
                      {(index + 1).toString().padStart(2, '0')}
                    </motion.div>
                    
                    <h3 className="feature-title-text" id={`feature-title-${index}`}>{feature.heading}</h3>
                    <p className="feature-description-text" id={`feature-desc-${index}`}>{feature.description}</p>
                    
                    {/* Interactive feature stats */}
                    <div className="feature-stats-container" id={`feature-stats-${index}`}>
                      <motion.div 
                        className="feature-stat-bar"
                        id={`feature-stat-bar-${index}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.random() * 40 + 60}%` }}
                        viewport={{ once: true }}
                        style={{ backgroundColor: color }}
                      />
                      <span className="feature-stat-label" id={`feature-stat-label-${index}`}>Usage +{Math.floor(Math.random() * 30 + 70)}%</span>
                    </div>
                    
                    {/* Animated learn more button */}
                    <motion.a 
                      href="#learn-more" 
                      className="feature-learn-more-link"
                      id={`feature-link-${index}`}
                      style={{ color }}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Learn more</span>
                      <FiArrowRight className="feature-link-arrow" id={`feature-arrow-${index}`} />
                    </motion.a>
                  </div>

                  {/* Simple active state indicator - no hover effects */}
                  {isActive && (
                    <div 
                      className="feature-card-active-indicator"
                      id={`feature-active-${index}`}
                      style={{ 
                        background: `radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)` 
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Statistics Section */}
        <motion.div 
          className="features-statistics-panel"
          id="features-statistics"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="statistics-grid" id="statistics-grid">
            <motion.div 
              className="statistics-card"
              id="stat-card-1"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="statistics-icon" id="stat-icon-1">⚡</div>
              <div className="statistics-number" id="stat-number-1">2.5s</div>
              <div className="statistics-label" id="stat-label-1">Average order time</div>
            </motion.div>
            
            <motion.div 
              className="statistics-card"
              id="stat-card-2"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="statistics-icon" id="stat-icon-2">🌟</div>
              <div className="statistics-number" id="stat-number-2">4.9/5</div>
              <div className="statistics-label" id="stat-label-2">Customer rating</div>
            </motion.div>
            
            <motion.div 
              className="statistics-card"
              id="stat-card-3"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="statistics-icon" id="stat-icon-3">💳</div>
              <div className="statistics-number" id="stat-number-3">€2.5M+</div>
              <div className="statistics-label" id="stat-label-3">Processed daily</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trust Banner */}
        <motion.div 
          className="trust-showcase-banner"
          id="trust-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="trust-banner-content" id="trust-content">
            <div className="trust-avatars-container" id="trust-avatars">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <motion.div 
                  key={`avatar-${i}`} 
                  className="trust-avatar-circle"
                  id={`trust-avatar-${i}`}
                  whileHover={{ y: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  style={{ zIndex: 5 - i }}
                >
                  {['👨‍🍳', '👩‍💼', '🧑‍🍳', '👨‍💻', '👩‍🌾'][i]}
                </motion.div>
              ))}
            </div>
            <div className="trust-text-content" id="trust-text">
              <strong>2,000+</strong> restaurant owners trust Orderly
            </div>
          </div>
          
          <div className="trust-rating-container" id="trust-rating">
            <div className="trust-stars-wrapper" id="trust-stars">
              {[...Array(5)].map((_, i) => (
                <motion.span 
                  key={`star-${i}`} 
                  className="trust-star-icon"
                  id={`trust-star-${i}`}
                  initial={{ opacity: 0.3, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  ★
                </motion.span>
              ))}
            </div>
            <span className="trust-rating-badge" id="trust-rating-badge">4.9/5 from 1,200+ reviews</span>
          </div>
          
          {/* Animated background gradient */}
          <motion.div 
            className="trust-gradient-background"
            id="trust-gradient"
            animate={{
              background: [
                "linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899)",
                "linear-gradient(90deg, #8B5CF6, #EC4899, #3B82F6)",
                "linear-gradient(90deg, #EC4899, #3B82F6, #8B5CF6)",
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Features;