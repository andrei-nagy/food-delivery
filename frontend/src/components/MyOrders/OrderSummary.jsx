import React from "react";
import PromoCodeSection from "./PromoCodeSection";
import './OrderSummary.css';

const OrderSummary = ({
  billRequested,
  getOriginalSubtotal,
  getTotalProductDiscountAmount,
  getTotalOrderAmount,
  isPromoApplied,
  discount,
  getFinalTotalAmount,
  promoCode,
  setPromoCode,
  applyPromoCode,
  removePromoCode,
  promoError,
  appliedPromoCode,
  calculateTipAmount,
  t
}) => {
  const tipAmount = calculateTipAmount ? calculateTipAmount() : 0;
  
  return (
    <div className="order-summary-section-cart">
      <h2 className="section-title">{t("my_orders.order_summary")}</h2>

      {/* Promo Code Section */}
      {!billRequested && (
        <PromoCodeSection
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          applyPromoCode={applyPromoCode}
          removePromoCode={removePromoCode}
          promoError={promoError}
          appliedPromoCode={appliedPromoCode}
          isPromoApplied={isPromoApplied}
          t={t}
        />
      )}

      <div className="summary-details">
        <div className="summary-row">
          <span>{t("my_orders.subtotal")}</span>
          <span>{getOriginalSubtotal().toFixed(2)} €</span>
        </div>

        {/* Product discounts section */}
        {getTotalProductDiscountAmount() > 0 && (
          <div className="summary-row discount-row">
            <span className="discount-label">
              {t("my_orders.product_discounts")}
            </span>
            <span className="discount-amount">
              -{getTotalProductDiscountAmount().toFixed(2)} €
            </span>
          </div>
        )}

        {/* Promo code discount section */}
        {isPromoApplied && (
          <div className="summary-row promo-discount">
            <span className="promo-label">
              {t("my_orders.promo_discount")}
            </span>
            <span className="promo-discount-amount">
              -{discount.toFixed(2)}€
            </span>
          </div>
        )}

        {/* Tips section - BLACK COLOR */}
        {tipAmount > 0 && (
          <div className="summary-row tips-row">
            <span className="tips-label">{t("my_orders.tip_label")}</span>
            <span className="tips-amount">+{tipAmount.toFixed(2)} €</span>
          </div>
        )}

        {/* Total saved section */}
        {(getTotalProductDiscountAmount() > 0 || isPromoApplied) && (
          <div className="summary-row saved-amount">
            <span className="saved-label">
              {t("my_orders.total_saved")}
            </span>
            <span className="saved-amount-value">
              {(getTotalProductDiscountAmount() + discount).toFixed(2)} €
            </span>
          </div>
        )}

        <div className="summary-divider"></div>
        <div className="summary-row total">
          <span>{t("my_orders.total")}</span>
          <span>{getFinalTotalAmount().toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;