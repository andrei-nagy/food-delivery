import React, { useContext, useEffect, useState } from 'react';
import './Verify.css';
import { StoreContext } from '../../context/StoreContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Verify = () => {
  const { url } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const orderId = urlParams.get('orderId');
        const orderIds = urlParams.get('orderIds');

        if (success === "false") {
          setVerificationStatus('failed');
          setIsLoading(false);
          return;
        }

        const response = await axios.post(`${url}/api/order/verify`, {
          success,
          orderId,
          orderIds
        });

        if (response.data.success) {
          setVerificationStatus('success');
          localStorage.removeItem('cartItems');
          window.dispatchEvent(new Event('storage'));
        } else {
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [url]);

  // Efect separat pentru countdown
  useEffect(() => {
    if (!isLoading && verificationStatus === 'success') {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, verificationStatus]);

  // Efect separat pentru navigare - acesta rezolvă eroarea
  useEffect(() => {
    if (countdown === 0 && verificationStatus === 'success') {
      navigate("/");
    }
  }, [countdown, verificationStatus, navigate]);

  if (isLoading) {
    return (
      <div className="verify-fullscreen">
        <div className="verify-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed' || verificationStatus === 'error') {
    return (
      <div className="verify-fullscreen payment-failed">
        <div className="verify-container failed-container">
          {/* Header Section */}
          <motion.div 
            className="status-header failed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="status-icon failed">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FEE2E2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1>Payment Failed</h1>
            <p className="status-subtitle">We couldn't process your payment</p>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            className="content-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="info-card">
              <div className="info-icon">🛒</div>
              <div className="info-content">
                <h3>Your cart is preserved</h3>
                <p>All items are still in your cart. You can try again or modify your order.</p>
              </div>
            </div>

            <div className="action-buttons">
              <motion.button
                onClick={() => navigate("/cart")}
                className="btn primary-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Return to Cart</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
              
              <motion.button
                onClick={() => navigate("/")}
                className="btn secondary-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Shopping
              </motion.button>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div 
            className="help-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p className="help-text">
              Need help? <span className="help-link">Contact support</span>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // SUCCESS PAGE - White background with orange accents
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
            Order Confirmed
          </motion.h1>
          
          <motion.p 
            className="apple-subtitle-white"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Thank you for your purchase
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
              <p>Your order is being prepared and will be ready soon.</p>
              <p className="success-emoji-orange">Enjoy your meal! 🍽️</p>
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
              <p className="countdown-text-white">Returning to home page</p>
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
              Return Home Now
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
          <p>Order details have been sent to your email</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;