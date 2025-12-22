import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { StoreContext } from "../../context/StoreContext";
import "./OrderCompleted.css";

const OrderCompleted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url, clearCart } = useContext(StoreContext);
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlockedSession, setIsBlockedSession] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // ✅ STATE-URI NOI PENTRU CHITANȚA PE EMAIL
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [receiptError, setReceiptError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId") || location.state?.orderId;
  const autoRedirected = searchParams.get("autoRedirected") === "true" || location.state?.autoRedirected || false;

  // ✅ EFECT pentru sesiune blocată
  useEffect(() => {
    if (autoRedirected) {
      setIsBlockedSession(true);
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
    }
  }, [autoRedirected]);

  // ✅ EFECT pentru datele comenzii
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isBlockedSession || autoRedirected) {
        setOrderDetails({
          status: "completed",
          paymentMethod: "completed",
          items: [],
          totalAmount: 0,
          orderNumber: "SESSION-COMPLETED",
          createdAt: new Date().toISOString(),
          subtotal: 0,
          tax: 0,
          tableNumber: localStorage.getItem("tableNumber") || "N/A"
        });
        setIsLoading(false);
        return;
      }

      if (!orderId && !isBlockedSession && !autoRedirected) {
        navigate("/");
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        if (!token && !isBlockedSession) {
          navigate("/");
          return;
        }

        if (orderId) {
          const response = await fetch(`${url}/api/order/${orderId}`, {
            headers: { token }
          });

          if (response.ok) {
            const data = await response.json();
            setOrderDetails(data.order);
            
            if (data.success && clearCart) {
              clearCart();
            }
          } else {
            throw new Error("Failed to fetch order details");
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrderDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, url, clearCart, navigate, isBlockedSession, autoRedirected]);

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleString();
    
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartNewSession = () => {
    setShowConfirmModal(true);
  };
  
  const handleHomeSession = () => {
    navigate('/');
  };

  // ✅ FUNCȚIE NOUĂ PENTRU DESCHIDEREA MODAL-ULUI DE CHITANȚĂ
  const handleSendReceiptClick = () => {
    setShowReceiptModal(true);
    setEmailError('');
    setReceiptSent(false);
    setReceiptError('');
  };

  // ✅ FUNCȚIE NOUĂ PENTRU TRIMITEREA CHITANȚEI PE EMAIL
  const handleSendReceipt = async () => {
    // Validare email
    if (!email.trim()) {
      setEmailError('Introduceți adresa de email');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Introduceți o adresă de email validă');
      return;
    }
    
    setIsSendingReceipt(true);
    setEmailError('');
    setReceiptError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nu sunteți autentificat');
      }
      
      const response = await fetch(`${url}/api/order/send-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token
        },
        body: JSON.stringify({
          orderId: orderId,
          customerEmail: email
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReceiptSent(true);
        // Închide modal-ul după 2 secunde
        setTimeout(() => {
          setShowReceiptModal(false);
          setEmail('');
        }, 2000);
      } else {
        setReceiptError(data.message || 'Eroare la trimiterea chitanței');
      }
    } catch (error) {
      console.error('Eroare:', error);
      setReceiptError('Eroare de conexiune. Încercați din nou.');
    } finally {
      setIsSendingReceipt(false);
    }
  };

  const confirmNewSession = () => {
    const tableNumber = localStorage.getItem("tableNumber") || orderDetails?.tableNumber || "";
    
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("tableNumber");
    
    setShowConfirmModal(false);
    
    if (tableNumber) {
      navigate(`/register?table=${tableNumber}`);
    } else {
      navigate("/welcome");
    }
  };
  
  const cancelNewSession = () => {
    setShowConfirmModal(false);
  };

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="ocu-loading-screen">
        <div className="ocu-loading-content">
          <div className="ocu-loading-spinner"></div>
          <p className="ocu-loading-text">Se încarcă detaliile comenzii...</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (!orderDetails) {
    return (
      <div className="ocu-main-container ocu-error-mode">
        <div className="ocu-content-wrapper">
          <div className="ocu-header-section ocu-error-header">
            <div className="ocu-icon-wrapper ocu-error-icon">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="rgba(255, 59, 48, 0.1)"/>
                <path d="M8 8L16 16M8 16L16 8" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="ocu-main-title ocu-error-title">Comandă negăsită</h1>
            <p className="ocu-subtitle-text ocu-error-subtitle">
              Nu am putut găsi detaliile comenzii.
            </p>
          </div>
          
          <div className="ocu-actions-container">
            <button 
              className="ocu-primary-button ocu-error-button"
              onClick={() => navigate("/")}
            >
              Înapoi la meniu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MODAL DE CONFIRMARE PENTRU NEW SESSION */}
      {showConfirmModal && (
        <motion.div
          className="ocu-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="ocu-modal-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="ocu-modal-header">
              <div className="ocu-modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(52, 199, 89, 0.1)"/>
                  <path d="M12 8V12M12 16H12.01" stroke="#34C759" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="ocu-modal-title">Start New Session</h3>
              <p className="ocu-modal-subtitle">
                Ești sigur că vrei să pornești o nouă sesiune?
              </p>
            </div>

            <div className="ocu-modal-content">
              <p className="ocu-modal-message">
                Aceasta va încheia sesiunea curentă și te va redirecționa către meniul nostru pentru a comanda din nou.
              </p>
              
              <div className="ocu-modal-details">
                <div className="ocu-modal-detail">
                  <span className="ocu-modal-detail-label">Masa curentă:</span>
                  <span className="ocu-modal-detail-value">
                    #{orderDetails.tableNumber || localStorage.getItem("tableNumber") || "N/A"}
                  </span>
                </div>
                <div className="ocu-modal-detail">
                  <span className="ocu-modal-detail-label">Sesiune:</span>
                  <span className="ocu-modal-detail-value">
                    {isBlockedSession ? "Completată" : "Activă"}
                  </span>
                </div>
              </div>
            </div>

            <div className="ocu-modal-actions">
              <button
                className="ocu-modal-button ocu-modal-cancel"
                onClick={cancelNewSession}
              >
                Anulează
              </button>
              <button
                className="ocu-modal-button ocu-modal-confirm"
                onClick={confirmNewSession}
              >
                Confirmă
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ MODAL PENTRU TRIMITEREA CHITANȚEI PE EMAIL */}
      {showReceiptModal && (
        <motion.div
          className="ocu-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="ocu-modal-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="ocu-modal-header">
              <div className="ocu-modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(232, 101, 20, 0.1)"/>
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5-8-5V6l8 5 8-5z" 
                        fill="#e86514"/>
                </svg>
              </div>
              <h3 className="ocu-modal-title">Trimite Chitanța pe Email</h3>
              <p className="ocu-modal-subtitle">
                Introduceți adresa de email unde doriți să primiți chitanța
              </p>
            </div>

            <div className="ocu-modal-content">
              {receiptSent ? (
                <div className="ocu-rcpt-success">
                  <div className="ocu-rcpt-success-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="rgba(52, 199, 89, 0.1)"/>
                      <path d="M8 12L11 15L16 8" stroke="#34C759" strokeWidth="2" 
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="ocu-rcpt-success-text">
                    ✅ Chitanța a fost trimisă cu succes!
                  </p>
                  <p className="ocu-rcpt-success-subtext">
                    Verificați căsuța de email și folderul Spam.
                  </p>
                </div>
              ) : (
                <>
                  <div className="ocu-rcpt-form-group">
                    <label htmlFor="emailInput" className="ocu-rcpt-form-label">
                      Adresa de Email
                    </label>
                    <input
                      type="email"
                      id="emailInput"
                      className={`ocu-rcpt-form-input ${emailError ? 'ocu-rcpt-input-error' : ''}`}
                      placeholder="nume@exemplu.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                        setReceiptError('');
                      }}
                      disabled={isSendingReceipt}
                    />
                    {emailError && (
                      <p className="ocu-rcpt-error-message">{emailError}</p>
                    )}
                    {receiptError && (
                      <p className="ocu-rcpt-error-message">{receiptError}</p>
                    )}
                  </div>
                  
                  <div className="ocu-rcpt-order-preview">
                    <h4>Detalii Comandă:</h4>
                    <div className="ocu-rcpt-preview-details">
                      <div className="ocu-rcpt-preview-row">
                        <span>Număr Comandă:</span>
                        <span className="ocu-rcpt-preview-value">
                          {orderDetails?.orderNumber?.slice(-8).toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className="ocu-rcpt-preview-row">
                        <span>Total:</span>
                        <span className="ocu-rcpt-preview-value ocu-rcpt-total-highlight">
                          {orderDetails?.totalAmount?.toFixed(2) || '0.00'} €
                        </span>
                      </div>
                      <div className="ocu-rcpt-preview-row">
                        <span>Data:</span>
                        <span className="ocu-rcpt-preview-value">
                          {formatDate(orderDetails?.createdAt)}
                        </span>
                      </div>
                      <div className="ocu-rcpt-preview-row">
                        <span>Masa:</span>
                        <span className="ocu-rcpt-preview-value">
                          {orderDetails?.tableNumber || localStorage.getItem("tableNumber") || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="ocu-modal-actions">
              {!receiptSent && (
                <>
                  <button
                    className="ocu-modal-button ocu-modal-cancel"
                    onClick={() => {
                      setShowReceiptModal(false);
                      setEmail('');
                      setEmailError('');
                      setReceiptError('');
                    }}
                    disabled={isSendingReceipt}
                  >
                    Anulează
                  </button>
                  <button
                    className="ocu-modal-button ocu-modal-confirm"
                    onClick={handleSendReceipt}
                    disabled={isSendingReceipt}
                  >
                    {isSendingReceipt ? (
                      <>
                        <span className="ocu-rcpt-spinner-small"></span>
                        Se trimite...
                      </>
                    ) : (
                      'Trimite Chitanța'
                    )}
                  </button>
                </>
              )}
              {receiptSent && (
                <button
                  className="ocu-modal-button ocu-modal-confirm"
                  onClick={() => {
                    setShowReceiptModal(false);
                    setEmail('');
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ✅ BLOCKED SESSION VIEW */}
      {isBlockedSession || autoRedirected ? (
        <div className="ocu-main-container">
          <div className="ocu-content-wrapper">
            <motion.div 
              className="ocu-header-section ocu-success-header"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="ocu-icon-wrapper ocu-success-icon"
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
                className="ocu-main-title ocu-success-title"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Sesiune Finalizată
              </motion.h1>
              
              <motion.p 
                className="ocu-subtitle-text ocu-success-subtitle"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Toate comenzile au fost procesate cu succes
              </motion.p>
            </motion.div>

            {/* Session Details */}
            <motion.div 
              className="ocu-content-section"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="ocu-details-section">
                <motion.div 
                  className="ocu-order-card"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="ocu-order-header">
                    <span className="ocu-order-label">Masa</span>
                    <span className="ocu-order-number">
                      #{orderDetails?.tableNumber || "N/A"}
                    </span>
                  </div>
                  
                  <div className="ocu-info-grid">
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">Status</span>
                      <span className="ocu-info-value ocu-session-status">
                        Finalizat
                      </span>
                    </div>
                    
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">Tip</span>
                      <span className="ocu-info-value">
                        Restaurant
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="ocu-message-container"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <p className="ocu-message-text">
                    Vă mulțumim că ați ales restaurantul nostru!
                  </p>
                  <p className="ocu-bon-appetit">
                    Pentru o nouă sesiune, scanați codul QR de pe masă.
                  </p>
                </motion.div>

                {/* Status Message */}
                <motion.div 
                  className="ocu-status-message"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="ocu-status-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34C759"/>
                    </svg>
                  </div>
                  <p className="ocu-status-text">
                    Sesiunea a fost încheiată cu succes
                  </p>
                </motion.div>
              </div>

              {/* Action Buttons pentru sesiune - DOAR 2 BUTOANE */}
              <motion.div 
                className="ocu-actions-container"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <motion.button
                  onClick={handleStartNewSession}
                  className="ocu-primary-button ocu-view-orders-button"
                  whileHover={{ scale: 1.02, backgroundColor: "#30b352" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Start New Session
                </motion.button>
                  {/* <motion.button
    onClick={handleSendReceiptClick}
    className="ocu-secondary-button ocu-send-receipt-button"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    📧 Trimite Chitanța pe Email
  </motion.button> */}
                <motion.button
                  onClick={handleHomeSession}
                  className="ocu-secondary-button ocu-new-session-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Home
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      ) : (
        // ✅ NORMAL ORDER COMPLETED VIEW
        <div className="ocu-main-container">
          <div className="ocu-content-wrapper">
            {/* Success Header */}
            <motion.div 
              className="ocu-header-section ocu-success-header"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="ocu-icon-wrapper ocu-success-icon"
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
                className="ocu-main-title ocu-success-title"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Comandă Confirmată
              </motion.h1>
              
              <motion.p 
                className="ocu-subtitle-text ocu-success-subtitle"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Vă mulțumim pentru comandă!
              </motion.p>
            </motion.div>

            {/* Success Content */}
            <motion.div 
              className="ocu-content-section"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="ocu-details-section">
                {/* Order Details Card */}
                <motion.div 
                  className="ocu-order-card"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="ocu-order-header">
                    <span className="ocu-order-label">Comanda #</span>
                    <span className="ocu-order-number">
                      {orderDetails.orderNumber?.slice(-8).toUpperCase() || "N/A"}
                    </span>
                  </div>
                  
                  <div className="ocu-info-grid">
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">Masă</span>
                      <span className="ocu-info-value">
                        {orderDetails.tableNumber || localStorage.getItem("tableNumber") || "N/A"}
                      </span>
                    </div>
                    
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">Ora</span>
                      <span className="ocu-info-value">
                        {formatDate(orderDetails.createdAt).split(',')[1].trim()}
                      </span>
                    </div>
                    
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">Total</span>
                      <span className="ocu-info-value ocu-total-highlight">
                        {orderDetails.totalAmount?.toFixed(2) || "0.00"} €
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="ocu-message-container"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <p className="ocu-message-text">
                    Comanda dvs. a fost recepționată și este în curs de preparare.
                  </p>
                  <p className="ocu-bon-appetit">Poftă bună! 🍽️</p>
                </motion.div>

                {/* Status Message */}
                <motion.div 
                  className="ocu-status-message"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="ocu-status-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#34C759"/>
                    </svg>
                  </div>
                  <p className="ocu-status-text">
                    Comanda este în procesare
                  </p>
                </motion.div>
              </div>

              {/* ✅ Action Buttons - 3 BUTOANE SEPARATE */}
              <motion.div 
                className="ocu-actions-container"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {/* 1. BUTON START NEW SESSION */}
                <motion.button
                  onClick={handleStartNewSession}
                  className="ocu-primary-button ocu-view-orders-button"
                  whileHover={{ scale: 1.02, backgroundColor: "#30b352" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Start New Session
                </motion.button>
                
                {/* 2. BUTON TRIMITERE CHITANȚĂ PE EMAIL */}
                {/* <motion.button
                  onClick={handleSendReceiptClick}
                  className="ocu-secondary-button ocu-send-receipt-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  📧 Trimite Chitanța pe Email
                </motion.button> */}
                
                {/* 3. BUTON HOME */}
                <motion.button
                  onClick={handleHomeSession}
                  className="ocu-secondary-button ocu-home-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Home
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.div 
              className="ocu-footer-section"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <p className="ocu-footer-text">
                Detaliile comenzii au fost trimise la bucătărie. Vă vom anunța când este gata.
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCompleted;