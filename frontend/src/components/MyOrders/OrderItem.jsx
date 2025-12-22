import React from "react";
import { motion } from "framer-motion";
 import './OrderItem.css';

const OrderItem = ({
  item,
  foodItem,
  uniqueId,
  getItemPriceWithDiscount,
  getTranslatedProductName,
  isTranslatingProductNames,
  openFoodModal,
  url,
  assets,
  isPaid = false
}) => {
  const priceInfo = foodItem ? getItemPriceWithDiscount(foodItem, item) : null;
  
  const imageUrl = url + "/images/" + (foodItem?.image || item.image || '');

  return (
    <motion.div
      className={`order-item ${isPaid ? 'paid' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      layout
    >
      {/* Container principal */}
      <div className="order-item-content">
        
        {/* Imagine - pătrată, curată */}
        <div className="order-item-image">
          <img
            src={imageUrl}
            alt={getTranslatedProductName(foodItem) || item.name}
            className={`order-image ${isPaid ? 'paid' : ''}`}
            onError={(e) => {
              if (assets.image_coming_soon) {
                e.target.src = assets.image_coming_soon;
                e.target.style.objectFit = "cover";
              }
            }}
          />
          {isPaid && (
            <div className="order-paid-indicator">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#10B981" />
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        
        {/* Detalii produs */}
        <div className="order-item-details">
          <div className="order-item-header">
            <h3 className="order-item-name">
              {getTranslatedProductName(foodItem) || item.name}
              {isTranslatingProductNames && (
                <span className="translating-badge"></span>
              )}
            </h3>
            
            {/* Preț unitar */}
            <div className="order-item-price-row">
              {priceInfo?.hasDiscount ? (
                <>
                  <span className="order-price-discounted">
                    {priceInfo.totalPrice.toFixed(2)} €
                  </span>
                  <span className="order-price-original">
                    {(priceInfo.originalPrice * item.quantity).toFixed(2)} €
                  </span>
                  <span className="order-discount-badge">
                    -{priceInfo.discountPercentage}%
                  </span>
                </>
              ) : (
                <span className="order-price">
                  {priceInfo ? priceInfo.totalPrice.toFixed(2) : (item.price * item.quantity).toFixed(2)} €
                </span>
              )}
            </div>
          </div>
          
          {/* Note speciale */}
          {item.specialInstructions && (
            <div className="order-item-notes">
              <span className="notes-label">Note:</span>
              <span className="notes-text">{item.specialInstructions}</span>
            </div>
          )}
          
          {/* Footer cu cantitate și status */}
          <div className="order-item-footer">
            <div className="order-quantity">
              <span className="quantity-label">Quantity:</span>
              <span className="quantity-value">x{item.quantity}</span>
            </div>
            
            {isPaid && (
              <div className="order-status-badge">
                <span className="status-text">Paid</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderItem;