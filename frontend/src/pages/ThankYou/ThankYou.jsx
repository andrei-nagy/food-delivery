import React, { useContext, useEffect, useState } from 'react';
import './ThankYou.css';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ThankYou = () => {
  const { url } = useContext(StoreContext);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const orderId = location.state?.orderId;
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get('reloaded') === 'true';
    
    if (!hasReloaded) {
      localStorage.removeItem('cartItems');
      window.dispatchEvent(new Event('storage'));
      
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('reloaded', 'true');
      window.location.href = newUrl.toString();
      return;
    }

    const fetchRating = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${url}/api/order/${orderId}/rating`);
        if (response.data.success && response.data.rating > 0) {
          setRating(response.data.rating);
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          const cleanUrl = new URL(window.location);
          cleanUrl.searchParams.delete('reloaded');
          window.history.replaceState({}, '', cleanUrl.toString());
          
          setTimeout(() => navigate("/"), 0);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, url, navigate]);

  const handleRating = async (value) => {
    if (rating > 0) return;
    
    setRating(value);
    toast.info(`Thank you for your ${value}-star rating!`);

    try {
      await axios.post(`${url}/api/order/update-rating`, {
        orderId: orderId,
        rating: value
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.6
      }
    }
  };

  const starVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.8
      }
    },
    hover: {
      scale: 1.2,
      transition: {
        duration: 0.2
      }
    },
    tapped: {
      scale: 0.9,
      transition: {
        duration: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="thank-you-fullscreen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Finalizing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="thank-you-fullscreen"
    >
      <motion.div 
        className="thank-you-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success Header */}
        <motion.div 
          className="success-header"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            className="success-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.8
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(52, 199, 89, 0.1)"/>
              <path d="M8 12L11 15L16 8" stroke="#38a169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          
          <motion.h1 variants={itemVariants}>
            {t('thank_you_title')}
          </motion.h1>
          
          <motion.p variants={itemVariants}>
            {t('order_placed')}
          </motion.p>
        </motion.div>

        {/* Success Content */}
        <motion.div className="success-content" variants={itemVariants}>
          <div className="success-message">
            <p className="bon-appetit">Bon appétit! 🍽️</p>
          </div>

          {/* Countdown */}
          <motion.div 
            className="countdown-section"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="countdown-circle">
              <span>{countdown}</span>
            </div>
            <p>Returning home in {countdown}s</p>
          </motion.div>

          {/* Rating Section */}
          <motion.div 
            className="rating-section"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="rating-header">
              <h3>Rate Your Experience</h3>
            </div>
            
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  className={rating >= star ? "star filled" : "star"}
                  onClick={() => rating === 0 && handleRating(star)}
                  style={{ cursor: rating > 0 ? "default" : "pointer" }}
                  variants={starVariants}
                  whileHover={rating === 0 ? "hover" : ""}
                  whileTap={rating === 0 ? "tapped" : ""}
                >
                  ★
                </motion.span>
              ))}
            </div>
            
            {rating > 0 && (
              <motion.p 
                className="rating-thank-you"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Thank you! ⭐
              </motion.p>
            )}
          </motion.div>

          {/* Action Button */}
          <motion.div 
            className="action-section"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <motion.button
              onClick={() => navigate("/")}
              className="home-button"
              whileHover={{ scale: 1.02, backgroundColor: "#30b352" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Return Home
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="footer"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <p>See you soon!</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ThankYou;