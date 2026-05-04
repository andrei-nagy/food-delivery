import React from "react";
import { FaHandHoldingHeart } from "react-icons/fa";
import './TipsSection.css';

/**
 * TipsSection — redesign
 *
 * Props identice cu versiunea anterioară:
 *   showTipsSection, billRequested, tipPercentage, customTipAmount,
 *   getTotalOrderAmount, discount, handleTipSelection,
 *   handleCustomTipChange, setTipPercentage, calculateTipAmount,
 *   getFinalTotalAmount, t
 */
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
  setCustomTipAmount,
  calculateTipAmount,
  getFinalTotalAmount,
  t,
}) => {
  if (!showTipsSection || billRequested) return null;

  const base = getTotalOrderAmount() - discount;

  return (
    <div className="ts-card">

      {/* Header */}
      <div className="ts-header">
        <div className="ts-header-icon">
          <FaHandHoldingHeart size={17} color="#F97316" />
        </div>
        <div className="ts-header-text">
          <span className="ts-header-title">{t("my_orders.add_tip")}</span>
          <span className="ts-header-sub">100% merge către echipa noastră</span>
        </div>
      </div>

      {/* Pills */}
      <div className="ts-pills">
        {[0, 5, 10, 15, 20].map((pct) => {
          const isActive = tipPercentage === pct && !customTipAmount;
          const amt = pct === 0 ? null : ((base * pct) / 100).toFixed(2);
          return (
            <button
              key={pct}
              className={`ts-pill${isActive ? " ts-pill--active" : ""}`}
              onClick={() => handleTipSelection(pct)}
              type="button"
            >
              <span className="ts-pill-pct">
                {pct === 0 ? t("my_orders.no_tip") || "Fără" : `${pct}%`}
              </span>
              {amt && (
                <span className="ts-pill-amt">{amt} €</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom tip */}
      <div className="ts-custom">
        <span className="ts-custom-label">{t("my_orders.custom_tip") || "Sumă personalizată"}</span>
        <div className={`ts-custom-row${customTipAmount ? " ts-custom-row--active" : ""}`}>
          <input
            className="ts-custom-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={customTipAmount}
            onChange={handleCustomTipChange}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
            }}
            onFocus={() => {
              setTipPercentage(0);
              if (!customTipAmount) setCustomTipAmount?.("");
            }}
            onBlur={(e) => {
              const val = e.target.value;
              if (val) {
                const n = Math.max(0, parseFloat(val));
                setCustomTipAmount?.(n.toFixed(2));
              }
            }}
          />
          <span className="ts-custom-suffix">€</span>
          {customTipAmount && parseFloat(customTipAmount) > 0 && base > 0 && (
            <span className="ts-custom-pct">
              {((parseFloat(customTipAmount) / base) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default TipsSection;