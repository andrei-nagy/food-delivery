import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import './BillRequestedNotification.css';


const BillRequestedNotification = ({ 
  billRequested, 
  getTimeSinceBillRequest, 
  resetBillRequest, 
  t 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleReset = () => {
    setIsExiting(true);
    setTimeout(() => {
      resetBillRequest();
      setIsExiting(false);
    }, 300);
  };

  if (!billRequested) return null;

  return (
    <motion.div
      className={`bill-requested-notification ${isExiting ? 'exiting' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="notification-content">
        <FaCheckCircle className="notification-icon" />
        <div className="notification-text">
          <h3>{t("my_orders.bill_request_sent")}</h3>
          <p>
            {t("my_orders.waiter_notified", {
              time: getTimeSinceBillRequest(),
            })}
          </p>
        </div>
      </div>
      <button
        className="reset-request-button"
        onClick={handleReset}
        title={t("my_orders.cancel_request")}
      >
        <FaClock />
        <span>{t("my_orders.cancel_request")}</span>
      </button>
    </motion.div>
  );
};

export default BillRequestedNotification;