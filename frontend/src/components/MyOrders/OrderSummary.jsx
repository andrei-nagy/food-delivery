import React from "react";
import PromoCodeSection from "./PromoCodeSection";
import './OrderSummary.css';

/**
 * OrderSummary — redesign
 * Props identice cu versiunea anterioară.
 */
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
  t,
}) => {
  const tipAmount      = calculateTipAmount ? calculateTipAmount() : 0;
  const totalSaved     = (getTotalProductDiscountAmount?.() || 0) + (discount || 0);
  const hasSavings     = totalSaved > 0;

  return (
    <div className="os-card">

      {/* Header */}
      <div className="os-header">
        <span className="os-title">{t("my_orders.order_summary")}</span>
      </div>

      {/* Promo code — integrat ca strip */}
      {!billRequested && (
        <div className="os-promo-strip">
          <span className="os-promo-emoji">🏷️</span>
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
        </div>
      )}

      {/* Rânduri */}
      <div className="os-rows">
        <div className="os-row">
          <span className="os-row-label">{t("my_orders.subtotal")}</span>
          <span className="os-row-value">{getOriginalSubtotal().toFixed(2)} €</span>
        </div>

        {getTotalProductDiscountAmount() > 0 && (
          <div className="os-row">
            <span className="os-row-label">{t("my_orders.product_discounts")}</span>
            <span className="os-row-value os-row-value--green">
              -{getTotalProductDiscountAmount().toFixed(2)} €
            </span>
          </div>
        )}

        {isPromoApplied && (
          <div className="os-row">
            <span className="os-row-label">{t("my_orders.promo_discount")}</span>
            <span className="os-row-value os-row-value--green">
              -{discount.toFixed(2)} €
            </span>
          </div>
        )}

        {tipAmount > 0 && (
          <div className="os-row">
            <span className="os-row-label">{t("my_orders.tip_label")}</span>
            <span className="os-row-value os-row-value--orange">
              +{tipAmount.toFixed(2)} €
            </span>
          </div>
        )}
      </div>

      {/* Banner economisit */}
      {hasSavings && (
        <div className="os-saved-banner">
          <span className="os-saved-label">🎉 {t("my_orders.total_saved")}</span>
          <span className="os-saved-value">{totalSaved.toFixed(2)} €</span>
        </div>
      )}

      {/* Divider + Total */}
      <div className="os-divider" />
      <div className="os-total-row">
        <span className="os-total-label">{t("my_orders.total")}</span>
        <span className="os-total-value">{getFinalTotalAmount().toFixed(2)} €</span>
      </div>

    </div>
  );
};

export default OrderSummary;