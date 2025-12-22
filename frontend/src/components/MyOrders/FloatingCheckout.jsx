// FloatingCheckout.jsx - CU CLASE UNICE
import React from "react";
import { motion } from "framer-motion";

const FloatingCheckout = ({
  showFloatingCheckout,
  billRequested,
  isPlacingOrder,
  orderPlaced,
  getTotalOrderItemCount,
  getFinalTotalAmount,
  placeOrder,
  onSplitBillClick,
  t
}) => {
  // Ascunde complet dacă nu trebuie afișat
  if (!showFloatingCheckout || billRequested) {
    return null;
  }

  return (
    <div className="myorders-floating-buttons">
      {/* Buton Split Bill (stânga) */}
      <button
        className="myorders-floating-button myorders-split-bill-button"
        onClick={!(isPlacingOrder || orderPlaced) ? onSplitBillClick : undefined}
        disabled={isPlacingOrder || orderPlaced}
      >
        <div className="myorders-checkout-content">
          <div className="myorders-button-icon"></div>
          <div className="myorders-checkout-text">{t("my_orders.split_bill")}</div>
        </div>
      </button>

      {/* Buton Pay Order (dreapta) */}
      <button
        className={`myorders-floating-button myorders-pay-button ${
          isPlacingOrder || orderPlaced ? "myorders-placing-order" : ""
        }`}
        onClick={!(isPlacingOrder || orderPlaced) ? placeOrder : undefined}
        disabled={isPlacingOrder || orderPlaced}
      >
        <div className="myorders-checkout-content">
          {!(isPlacingOrder || orderPlaced) ? (
            <>
              <div className="myorders-item-count">{getTotalOrderItemCount()}</div>
              <div className="myorders-checkout-text">{t("my_orders.pay_order")}</div>
              <div className="myorders-checkout-total">
                {getFinalTotalAmount().toFixed(2)} €
              </div>
            </>
          ) : (
            <div className="myorders-order-placed-message">
              <motion.div
                className="myorders-smooth-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>{t("my_orders.processing_order")}...</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default FloatingCheckout;