import React, { useEffect, useState } from 'react';
import './Header.css';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useContext } from 'react';
import { StoreContext } from "../../context/StoreContext";

const Header = () => {
  const tableNumber = localStorage.getItem("tableNumber");
  const token = localStorage.getItem("token");
  const { url } = useContext(StoreContext);

  const images = [
    assets.header_img1,
    assets.header_img2,
    assets.header_img3,
    assets.header_img4,
  ];

  const [backgroundImage, setBackgroundImage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const { t, i18n } = useTranslation();

  // Funcție pentru a obține data expirării token-ului
  const fetchTokenExpiry = async () => {
    if (!token) {
      return;
    }
    
    try {
      const response = await axios.get(url + '/api/user/list', {
        headers: { token }
      });
      
      if (response.data.success && Array.isArray(response.data.users)) {
        const currentUser = response.data.users.find(user => 
          user.tableNumber && 
          user.tableNumber.toString() === tableNumber && 
          user.tokenExpiry &&
          user.isActive === true
        );

        if (currentUser && currentUser.tokenExpiry) {
          setTokenExpiry(new Date(currentUser.tokenExpiry));
        }
      }
    } catch (error) {
      console.error("Error fetching token expiry:", error);
    }
  };

  // Funcție pentru a calcula timpul rămas
  const calculateTimeLeft = () => {
    if (!tokenExpiry) return '';

    const now = new Date();
    const expiry = new Date(tokenExpiry);
    const difference = expiry - now;

    if (difference <= 0) {
      return t('time_expired');
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } 
    return '0m';
  };

  // Funcție pentru prelungirea timpului (doar vizual pentru moment)
  const extendTime = async () => {
    setIsExtending(true);
    
    // Simulează o cerere de prelungire
    setTimeout(() => {
      if (tokenExpiry) {
        // Adaugă 30 de minute vizual (fără update în backend)
        const newExpiry = new Date(tokenExpiry);
        newExpiry.setMinutes(newExpiry.getMinutes() + 30);
        setTokenExpiry(newExpiry);
        
        // Afișează mesaj de succes
        alert("Time extended by 30 minutes! (Visual only - backend update not implemented)");
      }
      setIsExtending(false);
      setShowTimeModal(false);
    }, 1500);
  };

  const handleTableButtonClick = () => {
    if (timeLeft) {
      setShowTimeModal(true);
    }
  };

  useEffect(() => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);
    
    if (token) {
      fetchTokenExpiry();
    }
  }, [token, tableNumber, url]);

  useEffect(() => {
    if (tokenExpiry) {
      // Actualizează imediat
      setTimeLeft(calculateTimeLeft());
      
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [tokenExpiry]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <div className='header header-radius' style={{ background: `url(${backgroundImage}) no-repeat center/cover` }}>
          <div className="header-contents">
            <h2>{t('order_your_food')}</h2>
            <p>{t('your_food_description')}</p>
            <div className="header-buttons">
              <button 
                className={`table-button ${timeLeft ? 'with-timer' : ''}`}
                onClick={handleTableButtonClick}
              >
                <div className="button-content">
                  <div className="main-line">
                    <span className="table-text">{t('table')} {tableNumber}</span>
                    {timeLeft && (
                      <span className="timer-text">• {timeLeft} <span className="hourglass-icon">⏳</span></span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal pentru timp - OUTSIDE header */}
      <AnimatePresence>
        {showTimeModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTimeModal(false)}
          >
            <motion.div
              className="time-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Table {tableNumber} - Time Information</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowTimeModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="time-info">
                  <div className="current-time">
                    <span className="time-label">Current time remaining:</span>
                    <span className="time-value">{timeLeft}</span>
                  </div>
                  <p className="time-description">
                    This is how long your ordering link will remain active. 
                    You can extend the time if you need more time to order.
                  </p>
                </div>
                
                <div className="extend-section">
                  <button 
                    className={`extend-button ${isExtending ? 'extending' : ''}`}
                    onClick={extendTime}
                    disabled={isExtending}
                  >
                    {isExtending ? (
                      <>
                        <div className="loading-spinner"></div>
                        Extending...
                      </>
                    ) : (
                      <>
                        <span className="extend-icon">⏱️</span>
                        Extend Time by 30 Minutes
                      </>
                    )}
                  </button>
                  <p className="extend-note">
                    Note: This is currently a visual demonstration only. 
                    Backend integration is required for permanent time extension.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;