import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaCreditCard, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./SessionExpiredModal.css";

const SessionExpiredModal = ({ isOpen, onClose, onExtendTime }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isExtending, setIsExtending] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);

  const extensionOptions = [
    { minutes: 30, label: "30 min" },
    { minutes: 60, label: "1 hour" },
    { minutes: 120, label: "2 hours" },
  ];

  const handleExtendTime = async () => {
    setIsExtending(true);
    try {
      const success = await onExtendTime(selectedDuration);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error extending session:", error);
    } finally {
      setIsExtending(false);
    }
  };

  const handlePayOrder = () => {
    onClose();
    navigate("/myorders");
  };

  const handleDurationSelect = (minutes) => {
    setSelectedDuration(minutes);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="session-expired-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="session-expired-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Compact */}
            <div className="session-expired-modal-header">
              <div className="session-expired-modal-title">
                <div className="session-expired-modal-icon">
                  <FaClock />
                </div>
                <div>
                  <h3>{t("session_expired")}</h3>
                </div>
              </div>
              <button
                className="session-expired-close-button"
                onClick={onClose}
              >
                <FaTimes />
              </button>
            </div>

            {/* Content Compact */}
            <div className="session-expired-modal-content">
              <div className="session-expired-message">
                <p>{t("session_ended")}</p>
              </div>

              {/* Extension Options - Compact */}
              <div className="session-expired-options">
                <h4>{t("extend_session_time")}</h4>
                <p className="session-option-description">
                  {t("choose_extra_time")}
                </p>

                <div className="session-extension-cards">
                  {extensionOptions.map((option) => (
                    <div
                      key={option.minutes}
                      className={`session-extension-card ${
                        selectedDuration === option.minutes
                          ? "session-extension-selected"
                          : ""
                      }`}
                      onClick={() => handleDurationSelect(option.minutes)}
                    >
                      <div className="session-extension-time">
                        {option.label}
                      </div>
                      <div className="session-extension-hint">
                        {option.minutes === 30 && t("quick_finish")}
                        {option.minutes === 60 && t("standard_dining")}
                        {option.minutes === 120 && t("leisurely_meal")}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className={`session-extend-button ${
                    isExtending ? "session-extend-loading" : ""
                  }`}
                  onClick={handleExtendTime}
                  disabled={isExtending}
                >
                  {isExtending ? (
                    <>
                      <div className="session-button-spinner"></div>
                      {t("extending_session")}
                    </>
                  ) : (
                    <>
                      <FaClock />
                      {t("add_minutes", { minutes: selectedDuration })}
                    </>
                  )}
                </button>
              </div>

              {/* Simple Divider */}
              <div className="session-expired-divider">
                <span>{t("or")}</span>
              </div>

              {/* Pay Order Option - Compact */}
              <div className="session-pay-order-section">
                <p className="session-pay-description">
                  {t("complete_payment")}
                </p>

                <button
                  className="session-pay-order-button"
                  onClick={handlePayOrder}
                >
                  <FaCreditCard />
                  {t("pay_order")}
                </button>

                <p className="session-note">
                  {t("cart_preserved")}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredModal;