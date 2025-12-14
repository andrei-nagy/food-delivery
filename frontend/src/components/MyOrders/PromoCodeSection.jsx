import React from "react";
import { FaTag, FaCheck } from "react-icons/fa";
 
const PromoCodeSection = ({
  promoCode,
  setPromoCode,
  applyPromoCode,
  removePromoCode,
  promoError,
  appliedPromoCode,
  isPromoApplied,
  t
}) => {
  return (
    <div className="promo-code-section">
      <div className="promo-code-input-container">
        <div className="promo-input-wrapper">
          <FaTag className="promo-icon" />
          <input
            type="text"
            className="promo-code-input"
            placeholder={t("my_orders.enter_promo_code")}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled={isPromoApplied}
          />
          {!isPromoApplied ? (
            <button
              className="apply-promo-button"
              onClick={applyPromoCode}
            >
              {t("my_orders.apply")}
            </button>
          ) : (
            <button
              className="remove-promo-button"
              onClick={removePromoCode}
            >
              {t("my_orders.remove")}
            </button>
          )}
        </div>
        {promoError && (
          <div className="promo-error-message">{promoError}</div>
        )}
        {isPromoApplied && (
          <div className="promo-success-message">
            <FaCheck className="success-icon" />
            <span
              dangerouslySetInnerHTML={{
                __html: t("my_orders.promo_success", {
                  code: appliedPromoCode,
                }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodeSection;