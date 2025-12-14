import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import "./Header.css";
import { assets } from "../../assets/assets";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import SessionExpiredModal from "../SessionExpiredModal/SessionExpiredModal";
import { FaReceipt, FaTimes, FaLock } from "react-icons/fa";

// ✅ Import react-toastify
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = () => {
  const tableNumber = localStorage.getItem("tableNumber");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const { url, userBlocked, forceStatusCheck, billRequested, resetBillRequest, getTimeSinceBillRequest } = useContext(StoreContext);

  const images = [
    assets.header_img1,
    assets.header_img2,
    assets.header_img3,
    assets.header_img4,
  ];

  const [backgroundImage, setBackgroundImage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const { t, i18n } = useTranslation();

  // ✅ REF PENTRU A PREVENI DESCHIDEREA DUPLĂ
  const modalOpenedRef = useRef(false);
  const initialRenderRef = useRef(true);

  // ✅ STATE NOU - verifică dacă există deja o prelungire în curs
  const [extensionInProgress, setExtensionInProgress] = useState(false);

  const extensionOptions = [
    { minutes: 30, label: "30 minutes", popular: true },
    { minutes: 60, label: "1 hour", popular: false },
    { minutes: 120, label: "2 hours", popular: false },
  ];

  // ✅ FUNCȚIE NOUĂ - verifică dacă există o prelungire în curs pe server
  const checkExtensionInProgress = async () => {
    if (!userId || !token) return false;

    try {
      const response = await axios.get(`${url}/api/user/extension-status`, {
        headers: { token },
        params: { userId }
      });
      
      if (response.data.success && response.data.extensionInProgress !== undefined) {
        return response.data.extensionInProgress;
      }
      return false;
    } catch (error) {
      console.error("Error checking extension status:", error);
      return false;
    }
  };

  // ✅ FUNCȚIE NOUĂ - setează starea de prelungire în curs pe server
  const setExtensionInProgressOnServer = async (inProgress) => {
    if (!userId || !token) return;

    try {
      const response = await axios.post(`${url}/api/user/set-extension-status`, 
        { 
          userId, 
          extensionInProgress: inProgress 
        },
        { headers: { token } }
      );
      
      if (!response.data.success) {
        console.error("Failed to set extension status:", response.data.message);
      }
    } catch (error) {
      console.error("Error setting extension status:", error);
    }
  };

  // Funcție pentru a gestiona extend-ul din SessionExpiredModal
  const handleExtendSessionExpired = async (minutes) => {
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return false;
    }

    // ✅ VERIFICĂ DACĂ EXISTĂ DEJA O PRELUNGIRE ÎN CURS
    const existingExtension = await checkExtensionInProgress();
    if (existingExtension) {
      toast.error(t("extension_already_in_progress"));
      return false;
    }

    try {
      // ✅ SETEAZĂ CĂ EXISTĂ O PRELUNGIRE ÎN CURS
      await setExtensionInProgressOnServer(true);
      setExtensionInProgress(true);

      const response = await axios.post(
        `${url}/api/user/extend-session-expired`,
        {
          userId: userId,
          minutes: minutes,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        const newExpiry = new Date(response.data.newExpiry);
        setTokenExpiry(newExpiry);

        // ✅ FORȚEAZĂ ACTUALIZAREA TIMPULUI IMEDIAT
        calculateAndSetTime(newExpiry);

        if (forceStatusCheck) {
          setTimeout(() => {
            forceStatusCheck();
          }, 500);
        }

        setTimeout(() => {
          fetchTokenExpiry();
        }, 1000);

        toast.success(t("session_reactivated", { minutes }));
        
        // ✅ RESETEAZĂ REF-UL CÂND MODAL-UL SE ÎNCHIDE
        modalOpenedRef.current = false;
        setShowSessionExpiredModal(false);
        return true;
      } else {
        // ✅ DACA OPERAȚIA A EȘUAT DIN CAUZA CA USERUL NU E ACTIV
        if (response.data.message && response.data.message.includes("not active")) {
          toast.error(t("user_not_active"));
          // FORȚEAZĂ RE-LOGIN
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          window.location.reload();
        } else {
          toast.error(t("failed_reactivate", { message: response.data.message }));
        }
        return false;
      }
    } catch (error) {
      toast.error(t("error_reactivating"));
      return false;
    } finally {
      // ✅ RESETEAZĂ STARE PRELUNGIRE ÎN CURS
      await setExtensionInProgressOnServer(false);
      setExtensionInProgress(false);
    }
  };

  const fetchTokenExpiry = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(url + "/api/user/list", {
        headers: { token },
      });

      if (response.data.success && Array.isArray(response.data.users)) {
        const currentUser = response.data.users.find(
          (user) =>
            user.tableNumber &&
            user.tableNumber.toString() === tableNumber &&
            user.isActive === true &&
            user.tokenExpiry
        );

        if (currentUser && currentUser.tokenExpiry) {
          const newExpiry = new Date(currentUser.tokenExpiry);
          setTokenExpiry(newExpiry);
        } else {
          setTokenExpiry(null);
        }
      }
    } catch (error) {
      setTokenExpiry(null);
    }
  };

  // ✅ FUNCȚIE SEPARATĂ PENTRU CALCULUL TIMPULUI
  const calculateAndSetTime = (expiryDate = tokenExpiry) => {
    if (!expiryDate) {
      setTimeLeft("");
      return;
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry - now;

    if (difference <= 0) {
      setTimeLeft(t("time_expired"));
    } else {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m`);
      } else {
        setTimeLeft("0m");
      }
    }
  };

  const calculateTimeLeft = () => {
    if (!tokenExpiry) return "";

    const now = new Date();
    const expiry = new Date(tokenExpiry);
    const difference = expiry - now;

    if (difference <= 0) {
      return t("time_expired");
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
    return "0m";
  };

  const extendTime = async () => {
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    // ✅ VERIFICĂ DACĂ EXISTĂ DEJA O PRELUNGIRE ÎN CURS
    const existingExtension = await checkExtensionInProgress();
    if (existingExtension) {
      toast.error(t("extension_already_in_progress"));
      return;
    }

    setIsExtending(true);

    try {
      // ✅ SETEAZĂ CĂ EXISTĂ O PRELUNGIRE ÎN CURS
      await setExtensionInProgressOnServer(true);
      setExtensionInProgress(true);

      const endpoint = userBlocked
        ? "/api/user/extend-session-expired"
        : "/api/user/extend-time";

      const response = await axios.post(
        `${url}${endpoint}`,
        {
          userId: userId,
          minutes: selectedDuration,
        },
        {
          headers: { token },
        }
      );

      // ✅ VERIFICĂ DACA USERUL ESTE ÎNCĂ ACTIV
      if (response.data.success) {
        const newExpiry = new Date(response.data.newExpiry);
        setTokenExpiry(newExpiry);

        // ✅ FORȚEAZĂ ACTUALIZAREA TIMPULUI IMEDIAT
        calculateAndSetTime(newExpiry);

        if (forceStatusCheck) {
          setTimeout(() => {
            forceStatusCheck();
          }, 500);
        }

        // ✅ RE-FETCH PENTRU CONFIRMARE
        await fetchTokenExpiry();

        toast.success(
          userBlocked 
            ? t("session_reactivated", { minutes: selectedDuration })
            : t("session_extended", { minutes: selectedDuration })
        );

        // ✅ ÎNTÂRZIE ÎNCHIDEREA MODAL-ULUI PENTRU A VEDEA ACTUALIZAREA
        setTimeout(() => {
          setShowTimeModal(false);
        }, 500);
        
      } else {
        // ✅ DACA OPERAȚIA A EȘUAT DIN CAUZA CA USERUL NU E ACTIV
        if (response.data.message && response.data.message.includes("not active")) {
          toast.error(t("user_not_active"));
          // FORȚEAZĂ RE-LOGIN
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          window.location.reload();
        } else {
          toast.error(t("failed_extend", { message: response.data.message }));
        }
      }
    } catch (error) {
      console.error("Extend time error:", error);
      toast.error(t("error_extending"));
    } finally {
      setIsExtending(false);
      setSelectedDuration(30);
      
      // ✅ RESETEAZĂ STARE PRELUNGIRE ÎN CURS
      await setExtensionInProgressOnServer(false);
      setExtensionInProgress(false);
    }
  };

  const handleTableButtonClick = async () => {
    // ✅ VERIFICĂ DACĂ EXISTĂ DEJA O PRELUNGIRE ÎN CURS ÎNAINTE DE A DESCHIDE MODALUL
    const existingExtension = await checkExtensionInProgress();
    if (existingExtension) {
      toast.error(t("extension_already_in_progress"));
      return;
    }

    if ((userBlocked || timeLeft === t("time_expired")) && !showSessionExpiredModal && !modalOpenedRef.current) {
      modalOpenedRef.current = true;
      setShowSessionExpiredModal(true);
    } else {
      setShowTimeModal(true);
    }
  };

  const handleDurationSelect = (minutes) => {
    setSelectedDuration(minutes);
  };

  // ✅ EFECT NOU - verifică periodic dacă există o prelungire în curs
  useEffect(() => {
    if ((userBlocked || showSessionExpiredModal || showTimeModal) && userId) {
      const checkInterval = setInterval(async () => {
        const existingExtension = await checkExtensionInProgress();
        if (existingExtension && !extensionInProgress) {
          // Dacă există o prelungire în curs pe alt dispozitiv, închide modalul
          setShowSessionExpiredModal(false);
          setShowTimeModal(false);
          toast.info(t("extension_in_progress_on_other_device"));
        }
      }, 2000); // verifică la fiecare 2 secunde

      return () => clearInterval(checkInterval);
    }
  }, [userBlocked, showSessionExpiredModal, showTimeModal, userId, extensionInProgress]);

  // Efect pentru a verifica token expiry
  useEffect(() => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);

    if (token) {
      fetchTokenExpiry();
    }
  }, [token, tableNumber, url]);

  // ✅ EFECT ÎMBUNĂTĂȚIT PENTRU CALCULUL TIMPULUI
  useEffect(() => {
    if (tokenExpiry) {
      const updateTime = () => {
        calculateAndSetTime();
      };

      // Actualizează imediat
      updateTime();

      // Setează interval pentru actualizări continue
      const timer = setInterval(updateTime, 1000);

      return () => {
        clearInterval(timer);
      };
    } else {
      setTimeLeft("");
    }
  }, [tokenExpiry]);

  // ✅ EFFECT CORECTAT - PREVINE DESCHIDEREA DUPLĂ
  useEffect(() => {
    // ✅ IGNORĂ PRIMUL RENDER
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // ✅ DESCHIDE MODAL DOAR DACĂ:
    // 1. userBlocked este true
    // 2. Modalul nu este deja deschis
    // 3. Nu am deschis deja modalul anterior
    // 4. Nu există o prelungire în curs
    if (userBlocked && !showSessionExpiredModal && !modalOpenedRef.current) {
      // Verifică dacă există o prelungire în curs înainte de a deschide
      checkExtensionInProgress().then(existingExtension => {
        if (!existingExtension) {
          modalOpenedRef.current = true;
          setShowSessionExpiredModal(true);
        } else {
          toast.error(t("extension_already_in_progress"));
        }
      });
    }
  }, [userBlocked]);

  // ✅ EFFECT - Închide modal când userBlocked devine false
  useEffect(() => {
    if (!userBlocked && showSessionExpiredModal) {
      modalOpenedRef.current = false;
      setShowSessionExpiredModal(false);
    }
  }, [userBlocked, showSessionExpiredModal]);

  // ✅ EFFECT - Reset ref când componenta se demontează
  useEffect(() => {
    return () => {
      modalOpenedRef.current = false;
      initialRenderRef.current = true;
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Session Expired Banner */}
        {userBlocked && (
          <div className="repeat-order-bill-warning">
            <div className="repeat-order-bill-warning-content">
              <span className="repeat-order-bill-warning-icon">⏰</span>
              <div className="repeat-order-bill-warning-text">
                <strong>{t("session_expired")}</strong>
                <span>{t("session.expired_message")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bill Requested Banner - DESIGN NOU SIMPLU ȘI COMPACT */}
        {billRequested && (
          <motion.div
            className="header-bill-requested-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="header-bill-content">
              <div className="header-bill-icon-text">
                <FaReceipt className="header-bill-icon" />
                <div className="header-bill-text">
                  <span className="header-bill-title">{t("my_orders.bill_request_sent")}</span>
                  <span className="header-bill-subtitle">
                    {t("my_orders.waiter_notified", { time: getTimeSinceBillRequest() })}
                  </span>
                </div>
              </div>
              <button
                className="header-bill-cancel-btn"
                onClick={resetBillRequest}
                title={t("my_orders.cancel_request")}
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}

        <div
          className="header header-radius"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url(${backgroundImage}) no-repeat center/cover`,
          }}
        >
          <div className="header-contents">
            <h2>{t("order_your_food")}</h2>
            <p>{t("your_food_description")}</p>
            <div className="header-buttons">
              <button
                className={`header-table-button ${
                  timeLeft && !userBlocked ? "with-timer" : ""
                }`}
                onClick={handleTableButtonClick}
              >
                <div className="header-button-content">
                  <div className="header-main-line">
                    <span className="header-table-text">
                      {t("table")} {tableNumber}
                    </span>
                    {timeLeft && !userBlocked && timeLeft !== t("time_expired") && (
                      <span className="header-timer-text">
                        • {timeLeft} <span className="header-hourglass-icon">⏳</span>
                      </span>
                    )}
                    {(userBlocked || timeLeft === t("time_expired")) && (
                      <span className="header-timer-text expired">
                        • {t("time_expired")} <span className="header-hourglass-icon">⏰</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal pentru extindere timp */}
      <AnimatePresence mode="wait">
        {showTimeModal && (
          <motion.div
            className="header-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => !extensionInProgress && setShowTimeModal(false)}
          >
            <motion.div
              className={`header-time-modal ${extensionInProgress ? 'extension-in-progress' : ''}`}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Extension in progress overlay */}
              {extensionInProgress && (
                <div className="extension-in-progress-overlay">
                  <FaLock className="extension-lock-icon" />
                  <span>{t("extension_in_progress")}</span>
                </div>
              )}

              {/* Header Section */}
              <div className="header-modal-header">
                <div className="header-modal-title-section">
                  <div className="header-modal-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="header-modal-title-content">
                    <h3 className="header-modal-main-title">{t("extend_session")}</h3>
                    <p className="header-modal-subtitle">{t("table")} {tableNumber}</p>
                  </div>
                </div>
                <motion.button
                  className="header-close-button"
                  onClick={() => !extensionInProgress && setShowTimeModal(false)}
                  whileHover={!extensionInProgress ? { scale: 1.05, rotate: 90 } : {}}
                  whileTap={!extensionInProgress ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  disabled={extensionInProgress}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>

              {/* Timer Display */}
              <div className="header-timer-display-section">
                <div className="header-timer-circle">
                  <div className="header-timer-content">
                    <div className="header-time-main">{timeLeft}</div>
                    <div className="header-time-label">{t("remaining")}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="header-modal-description-section">
                <p>{t("extend_session_prompt")}</p>
              </div>

              {/* Extension Options */}
              <div className="header-extension-section">
                <h4 className="header-extension-title">{t("select_duration")}</h4>
                <div className="header-extension-grid">
                  {extensionOptions.map((option, index) => (
                    <motion.div
                      key={option.minutes}
                      className={`header-extension-option ${
                        selectedDuration === option.minutes ? "header-option-selected" : ""
                      } ${option.popular ? "header-option-popular" : ""} ${
                        extensionInProgress ? 'header-option-disabled' : ''
                      }`}
                      onClick={() => !extensionInProgress && handleDurationSelect(option.minutes)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.1 + index * 0.1,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      whileHover={!extensionInProgress ? { 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      } : {}}
                      whileTap={!extensionInProgress ? { scale: 0.98 } : {}}
                    >
                      {option.popular && (
                        <motion.div 
                          className="header-popular-tag"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                        >
                          {t("most_popular")}
                        </motion.div>
                      )}
                      <div className="header-option-content">
                        <div className="header-option-icon">
                          {option.minutes === 30 ? "⏱️" : option.minutes === 60 ? "⏰" : "⌛"}
                        </div>
                        <div className="header-option-details">
                          <div className="header-option-time">{option.label}</div>
                        </div>
                      </div>
                      <div className="header-option-check">
                        <div className="header-check-circle">
                          {selectedDuration === option.minutes && (
                            <motion.svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                            </motion.svg>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Section */}
              <div className="header-action-section">
                <motion.button
                  className={`header-action-button ${
                    isExtending ? "header-action-loading" : ""
                  } ${extensionInProgress ? 'header-action-disabled' : ''}`}
                  onClick={extensionInProgress ? undefined : extendTime}
                  disabled={isExtending || extensionInProgress}
                  whileHover={(!isExtending && !extensionInProgress) ? { scale: 1.02, y: -2 } : {}}
                  whileTap={(!isExtending && !extensionInProgress) ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {isExtending ? (
                    <>
                      <div className="header-button-loader"></div>
                      {t("extending")}
                    </>
                  ) : extensionInProgress ? (
                    <>
                      <FaLock className="header-button-lock" />
                      {t("extension_in_progress")}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="M12 6v6l4 2" strokeLinecap="round"/>
                      </svg>
                      {t("add_minutes", { minutes: selectedDuration })}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Expired Modal */}
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onClose={() => {
          modalOpenedRef.current = false;
          setShowSessionExpiredModal(false);
        }}
        onExtendTime={handleExtendSessionExpired}
        extensionInProgress={extensionInProgress}
        checkExtensionInProgress={checkExtensionInProgress}
      />
    </>
  );
};

export default Header;