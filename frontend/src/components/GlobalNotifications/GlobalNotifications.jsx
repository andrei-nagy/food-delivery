import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FaTimes } from 'react-icons/fa';
import './GlobalNotifications.css';

const GlobalNotification = () => {
  const { notification, setNotification } = useContext(StoreContext);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Folosim useCallback pentru a memora funcția handleClose
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setNotification(null);
      setIsVisible(false);
    }, 300);
  }, [setNotification]);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsExiting(false);
      
      // Setează un timer pentru închiderea automată după 5 secunde
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 5000); // 5 secunde - același timp ca progress bar-ul
      
      return () => clearTimeout(autoCloseTimer);
    } else {
      // Start exit animation
      setIsExiting(true);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [notification, handleClose]); // Adăugăm handleClose la dependencies

  if (!isVisible) return null;

  return (
    <div className={`global-notification-overlay ${isExiting ? 'exiting' : ''}`}>
      <div className={`global-notification-modern ${isExiting ? 'exiting' : ''}`}>
        <div className="notification-header">
          <span className="notification-title">Actualizare comandă</span>
          <button 
            className="notification-close-btn-modern"
            onClick={handleClose}
            aria-label="Închide notificarea"
          >
            <FaTimes />
          </button>
        </div>
        <div className="notification-content-modern">
          <p>{notification}</p>
        </div>
        <div className="notification-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default GlobalNotification;