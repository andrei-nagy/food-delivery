import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FaTimes, FaBell } from 'react-icons/fa';
import './GlobalNotifications.css';

const GlobalNotification = () => {
  const { notification, setNotification } = useContext(StoreContext);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [notificationType, setNotificationType] = useState('info');
  const [browserNotificationSupported, setBrowserNotificationSupported] = useState(false);
  const [permission, setPermission] = useState('default');


  const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
  } catch (error) {
    console.error("❌ Error playing notification sound:", error);
  }
};
  // Verifică suportul pentru Browser Notifications
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserNotificationSupported(true);
      setPermission(Notification.permission);
      
      // Cere permisiunea automat când componenta se încarcă (opțional)
      if (Notification.permission === 'default') {
        requestNotificationPermission();
      }
    }
  }, []);

const requestNotificationPermission = async () => {
  if (!browserNotificationSupported) return;
  
  try {
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      // Creează o notificare de test IMEDIAT
      new Notification('Orderly App - Test', {
        body: 'Notificările funcționează! 🎉',
        icon: '/favicon.ico',
      });
    } else if (result === 'denied') {
      console.log("❌ [DEBUG] Notification permission denied by user");
    }
  } catch (error) {
    console.error("❌ [DEBUG] Error requesting notification permission:", error);
  }
};

const sendBrowserNotification = useCallback((title, message, type = 'info') => {
  if (!browserNotificationSupported || permission !== 'granted') {
    return;
  }



  try {
    // 🔊 REDĂ SUNETUL ÎNAINTE DE NOTIFICARE
    playNotificationSound();

    const notification = new Notification(`${title}`, {
      body: message,
      tag: 'orderly-notification-' + Date.now(),
      requireInteraction: false,
      silent: false,
    });



    notification.onclick = () => {
      window.focus();
      notification.close();
    };


    notification.onerror = (error) => {
      console.error("❌ [DEBUG] Notification error:", error);
    };

    setTimeout(() => {
      notification.close();
    }, 8000);

    return notification;
  } catch (error) {
    console.error("❌ [DEBUG] Error creating browser notification:", error);
  }
}, [browserNotificationSupported, permission]);

  useEffect(() => {
  }, [notification]);

  // Determină tipul notificării
  useEffect(() => {
    if (notification) {
      const message = typeof notification === 'string' ? notification : notification.message;
      
      let type = 'info';
      if (message.includes('livrată') || message.includes('finalizată') || message.includes('livrat')) {
        type = 'delivered';
      } else if (message.includes('livrare') || message.includes('curier')) {
        type = 'delivery';
      } else if (message.includes('preparare') || message.includes('preluată')) {
        type = 'processing';
      }
      
      setNotificationType(type);

      // Trimite notificare browser
      if (browserNotificationSupported && permission === 'granted') {
        const title = getNotificationTitle(type);
        sendBrowserNotification(title, message, type);
      }
    }
  }, [notification, browserNotificationSupported, permission, sendBrowserNotification]);

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'delivered':
        return 'Comandă livrată';
      case 'delivery':
        return 'În curs de livrare';
      case 'processing':
        return 'În preparare';
      default:
        return 'Actualizare comandă';
    }
  };

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
      }, 5000);
      
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
  }, [notification, handleClose]);

  // CORECTAT: verifică doar existența notificării, nu .message
  if (!notification) return null;

  const message = typeof notification === 'string' ? notification : notification.message;

  return (
    <>
      <div className={`global-notification-overlay ${isExiting ? 'exiting' : ''}`}>
        <div className={`global-notification-modern ${isExiting ? 'exiting' : ''} ${notificationType}`}>
          {/* Buton pentru permisiune notificări */}
          {browserNotificationSupported && permission !== 'granted' && (
            <div className="notification-permission-banner">
              <FaBell className="bell-icon" />
              <span>Activează notificările pentru updates</span>
              <button 
                className="enable-notifications-btn"
                onClick={requestNotificationPermission}
              >
                Activează
              </button>
            </div>
          )}
          
          <div className="notification-header">
            <span className="notification-title">
              {getNotificationTitle(notificationType)}
              {permission === 'granted' && ' 🔔'}
            </span>
            <button 
              className="notification-close-btn-modern"
              onClick={handleClose}
              aria-label="Închide notificarea"
            >
              <FaTimes />
            </button>
          </div>
          <div className="notification-content-modern">
            <p>{message}</p>
          </div>
          <div className="notification-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalNotification;