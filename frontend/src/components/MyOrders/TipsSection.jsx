import React from "react";
import { motion } from "framer-motion";
import { FaHandHoldingHeart } from "react-icons/fa";
import './TipsSection.css';

const TipsSection = ({
  showTipsSection,
  billRequested,
  tipPercentage,
  customTipAmount,
  getTotalOrderAmount,
  discount,
  handleTipSelection,
  handleCustomTipChange,
  setTipPercentage,
  calculateTipAmount,
  getFinalTotalAmount,
  t
}) => {
  if (!showTipsSection || billRequested) return null;

  return (
    <motion.div
      className="cart-tips-section active"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="cart-tips-title">
        <FaHandHoldingHeart className="cart-tips-icon" />
        {t("my_orders.add_tip")}
      </h2>

      <div className="cart-tips-options">
        {[0, 5, 10, 15, 20].map((percentage) => (
          <label key={percentage} className="cart-tips-option">
            <input
              type="radio"
              name="tipPercentage"
              value={percentage}
              onChange={() => handleTipSelection(percentage)}
              checked={tipPercentage === percentage && !customTipAmount}
            />
            <div className="cart-tips-option-content">
              <span className="cart-tips-percentage">
                {t("my_orders.tip_percentage", { percentage })}
              </span>
              <span className="cart-tips-amount">
                {percentage === 0
                  ? t("my_orders.no_tip")
                  : t("my_orders.tip_amount", {
                      amount: (
                        ((getTotalOrderAmount() - discount) * percentage) /
                        100
                      ).toFixed(2),
                    })}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Custom Tip Section */}
      <div className="custom-tip-section">
        <label className="custom-tip-label">
          {t("my_orders.custom_tip")}
        </label>
        <div className="custom-tip-input-wrapper">
          <div className="custom-tip-input-container">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={customTipAmount}
              onChange={handleCustomTipChange}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
              onFocus={() => {
                setTipPercentage(0);
                if (!customTipAmount) setCustomTipAmount("");
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  const numValue = Math.max(0, parseFloat(value));
                  setCustomTipAmount(numValue.toFixed(2));
                }
              }}
              className="custom-tip-input"
            />
            <span className="currency-symbol">€</span>
          </div>
          <div className="custom-tip-hint">
            {customTipAmount &&
              parseFloat(customTipAmount) > 0 &&
              `(${(
                (parseFloat(customTipAmount) /
                  (getTotalOrderAmount() - discount)) *
                100
              ).toFixed(1)}% of order)`}
          </div>
        </div>
      </div>

      {/* <div className="cart-tips-summary">
        <div className="cart-tips-summary-row">
          <span>{t("my_orders.subtotal_label")}</span>
          <span>{(getTotalOrderAmount() - discount).toFixed(2)} €</span>
        </div>

        {calculateTipAmount() > 0 && (
          <div className="cart-tips-summary-row">
            <span>{t("my_orders.tip_label")}</span>
            <span>+{calculateTipAmount().toFixed(2)} €</span>
          </div>
        )}

        <div className="cart-tips-summary-row total-with-tip">
          <span>{t("my_orders.total_with_tip")}</span>
          <span>{getFinalTotalAmount().toFixed(2)} €</span>
        </div>
      </div> */}
    </motion.div>
  );
};

export default TipsSection;