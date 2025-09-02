import React, { useContext, useEffect, useState } from 'react';
import './ThankYou.css';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  const { url } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const tableNo = location.state?.tableNo || {};
  const orderId = location.state?.orderId;
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Verificăm dacă URL-ul conține deja parametrul de reload
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get('reloaded') === 'true';
    
    if (!hasReloaded) {
      // Curățăm localStorage pentru coș
      localStorage.removeItem('cartItems');
      
      // Forțăm o re-renderizare a aplicației
      window.dispatchEvent(new Event('storage'));
      
      // Adăugăm parametru în URL pentru a forța reload-ul real
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('reloaded', 'true');
      
      // Facem un reload real cu parametru în URL
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

    // Set up the countdown timer
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          // Curățăm parametrul din URL înainte de navigare
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
    toast.info(`You rated ${value} stars! Thank you for your feedback!`);

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
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
        duration: 0.4
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
      scale: 1.1,
      transition: {
        duration: 0.2
      }
    },
    tapped: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="thank-you-fullscreen">
        <div className="thank-you-container">
          <div className="loading-spinner">Finalizing your order...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="thank-you-fullscreen"
    >
      <motion.div 
        className="thank-you-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants}>{t('thank_you_title')}</motion.h1>
        <motion.br variants={itemVariants} />
        <motion.p variants={itemVariants}>{t('order_placed')}</motion.p>
        <motion.br variants={itemVariants} />
        <motion.p variants={itemVariants}>{t('order_placed_description_first')}</motion.p>
        <motion.br variants={itemVariants} />
        <motion.p variants={itemVariants}>{t('order_placed_description_2')}</motion.p>
        <motion.br variants={itemVariants} />
        <motion.p variants={itemVariants}>Bon appétit! 🍽️</motion.p>
        <motion.br variants={itemVariants} />

        {/* Countdown message */}
        <motion.div 
          className="countdown-message"
          variants={itemVariants}
        >
          <p>You will be redirected to the homepage in {countdown} seconds...</p>
        </motion.div>
        <motion.br variants={itemVariants} />

        <motion.div 
          className="rate-application"
          variants={itemVariants}
        >
          <p><strong>{t('rate_out_application')}</strong></p>
          <br />
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
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              You have already rated this order: {rating} stars
            </motion.p>
          )}
        </motion.div>
        <motion.br variants={itemVariants} />

        {/* <motion.div 
          className="thank-you-buttons"
          variants={itemVariants}
        >
          <Link to={`/category/All`}>
            <motion.button
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              {t('view_our_menu')}
            </motion.button>
          </Link>
        </motion.div> */}
      </motion.div>
    </motion.div>
  );
};

export default ThankYou;