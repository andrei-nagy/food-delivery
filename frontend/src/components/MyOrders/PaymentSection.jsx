import React from "react";
 
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
} from "react-icons/fa";
import { assets } from "../../assets/assets";

const PaymentSection = ({
  billRequested,
  paymentMethod,
  paymentError,
  handlePaymentMethodChange,
  t
}) => {
  if (billRequested) return null;

  return (
    <div className="cart-payment-section" id="payment-method-section">
      <h2 className="cart-payment-title">
        {t("my_orders.select_payment_method")}
      </h2>

      {paymentError && (
        <div className="cart-payment-error">{paymentError}</div>
      )}

      <div className="cart-payment-options">
        <label className="cart-payment-option">
          <input
            type="radio"
            name="paymentMethod"
            value="creditCard"
            onChange={handlePaymentMethodChange}
            checked={paymentMethod === "creditCard"}
          />
          <div className="cart-payment-option-content">
            <div className="cart-payment-icon">
              <FaCreditCard />
            </div>
            <div className="cart-payment-details">
              <span className="cart-payment-option-title">
                {t("my_orders.credit_debit_card")}
              </span>
              <span className="cart-payment-option-subtitle">
                {t("my_orders.pay_online")}
              </span>
            </div>
          </div>
        </label>

        <label className="cart-payment-option">
          <input
            type="radio"
            name="paymentMethod"
            value="cashPOS"
            onChange={handlePaymentMethodChange}
            checked={paymentMethod === "cashPOS"}
          />
          <div className="cart-payment-option-content">
            <div className="cart-payment-icon">
              <FaMoneyBillWave />
            </div>
            <div className="cart-payment-details">
              <span className="cart-payment-option-title">
                {t("my_orders.cash_pos")}
              </span>
              <span className="cart-payment-option-subtitle">
                {t("my_orders.pay_at_table")}
              </span>
            </div>
          </div>
        </label>
      </div>

      <div className="cart-payment-security">
        <div className="cart-payment-security-info">
          <FaLock className="cart-lock-icon" />
          <span>{t("my_orders.secure_payment")}</span>
        </div>
        <div className="cart-payment-providers">
          <div className="cart-provider-logos">
            <img
              src={assets.visa_logo}
              alt="Visa"
              className="cart-provider-logo"
            />
            <img
              src={assets.mastercard_logo}
              alt="Mastercard"
              className="cart-provider-logo"
            />
            <img
              src={assets.apple_pay}
              alt="Apple Pay"
              className="cart-provider-logo"
            />
            <img
              src={assets.google_pay}
              alt="Google Pay"
              className="cart-provider-logo"
            />
          </div>
          <img
            src={assets.stripe_logo}
            alt="Stripe"
            className="cart-stripe-logo"
          />
        </div>
      </div>

      <div className="cart-payment-features">
        <div className="cart-payment-feature">
          {t("my_orders.ssl_encrypted")}
        </div>
        <div className="cart-payment-feature">
          {t("my_orders.pci_compliant")}
        </div>
        <div className="cart-payment-feature">
          {t("my_orders.secure_3d")}
        </div>
        <div className="cart-payment-feature">
          {t("my_orders.money_back")}
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;