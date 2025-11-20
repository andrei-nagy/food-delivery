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
          <p>{t('thank_you.finalizing_order')}</p>
        </div>
      </div>
    );
  }

   return (
     <div className="verify-fullscreen apple-success-white">
       <div className="apple-container-white">
         {/* Success Header */}
         <motion.div 
           className="apple-header-white success"
           initial={{ scale: 0.9, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
         >
           <motion.div 
             className="apple-icon-white success"
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
           >
             <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
               <circle cx="12" cy="12" r="10" fill="rgba(52, 199, 89, 0.1)"/>
               <path d="M8 12L11 15L16 8" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </motion.div>
           
           <motion.h1 
             className="apple-title-white success"
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.3, duration: 0.5 }}
           >
             {t('thank_you.order_confirmed')}
           </motion.h1>
           
           <motion.p 
             className="apple-subtitle-white"
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.4, duration: 0.5 }}
           >
             {t('thank_you.thank_you_purchase')}
           </motion.p>
         </motion.div>
 
         {/* Success Content */}
         <motion.div 
           className="apple-content-white"
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.5, duration: 0.5 }}
         >
           <div className="apple-success-details-white">
             <motion.div 
               className="success-message-white"
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.6, duration: 0.5 }}
             >
               <p>{t('thank_you.order_preparing')}</p>
               <p className="success-emoji-orange">{t('thank_you.enjoy_meal')}</p>
             </motion.div>
 
             {/* Countdown */}
             <motion.div 
               className="apple-countdown-white"
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.8, duration: 0.5 }}
             >
               <div className="countdown-circle-white">
                 <span>{countdown}</span>
               </div>
               <p className="countdown-text-white">{t('thank_you.returning_home')}</p>
             </motion.div>
           </div>
 
           {/* Action Button */}
           <motion.div 
             className="apple-actions-white"
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.9, duration: 0.5 }}
           >
             <motion.button
               onClick={() => navigate("/")}
               className="apple-btn-success-orange"
               whileHover={{ scale: 1.02, backgroundColor: "#34C759" }}
               whileTap={{ scale: 0.98 }}
               transition={{ type: "spring", stiffness: 400, damping: 17 }}
             >
               {t('thank_you.return_home_now')}
             </motion.button>
           </motion.div>
         </motion.div>
 
         {/* Footer */}
         <motion.div 
           className="apple-footer-white"
           initial={{ y: 10, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 1.1, duration: 0.5 }}
         >
           <p>{t('thank_you.order_details_sent')}</p>
         </motion.div>
       </div>
     </div>
   );
};

export default ThankYou;