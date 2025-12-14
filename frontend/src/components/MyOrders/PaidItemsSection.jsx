import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaCreditCard, FaMoneyBillWave, FaTag, FaChevronDown } from "react-icons/fa";
import './PaidItemsSection.css';

const PaidItemsSection = ({
  paidItems,
  food_list,
  findFoodItem,
  getItemPriceWithDiscount,
  getTranslatedProductName,
  formatDateTime,
  t,
  url,
  assets
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!paidItems || paidItems.length === 0) return null;

  const totalPaidAmount = paidItems.reduce((sum, item) => {
    const foodItem = food_list.find(food => food._id === item.baseFoodId || food._id === item.foodId);
    const priceInfo = foodItem ? getItemPriceWithDiscount(foodItem, item) : null;
    return sum + (priceInfo ? priceInfo.totalPrice : (item.price * item.quantity));
  }, 0);

  return (
    <div className="paid-items-accordion">
  {/* Accordion Header - întotdeauna vizibil */}
  <div 
    className="paid-accordion-header"
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <div className="paid-accordion-header-main">
      <div className="paid-accordion-icon-wrapper">
        <FaCheckCircle className="paid-accordion-icon" />
      </div>
      <div className="paid-accordion-info">
        <h3 className="paid-accordion-title">
          {t("my_orders.already_paid")}
        </h3>
        <div className="paid-accordion-stats">
          <span className="paid-accordion-item-count">{paidItems.length} {t("my_orders.items")}</span>
          <span className="paid-accordion-separator">•</span>
 <div className="paid-accordion-controls">
      <div className="paid-accordion-total">
        <span className="paid-accordion-total-label">{t("my_orders.total_paid")}:</span>
        <span className="paid-accordion-total-value">{totalPaidAmount.toFixed(2)} €</span>
      </div>
      <div className={`paid-accordion-chevron ${isExpanded ? 'paid-accordion-chevron-expanded' : ''}`}>
        <FaChevronDown />
      </div>
    </div>        </div>
      </div>
    </div>
    
   
  </div>

      {/* Accordion Content - se expandează/colapsează */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="accordion-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="paid-items-list">
              <AnimatePresence>
                {paidItems.map((item, index) => {
                  const foodItem = food_list.find(food => 
                    food._id === item.baseFoodId || food._id === item.foodId
                  );
                  const priceInfo = foodItem ? getItemPriceWithDiscount(foodItem, item) : null;
                  const paymentMethod = item.paidBy?.[0]?.paymentMethod || 'unknown';
                  
                  const imageUrl = url + "/images/" + (foodItem?.image || item.image || '');

                  return (
                    <motion.div
                      key={`paid-${item._id}-${index}`}
                      className="order-item paid"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="order-item-content">
                        
                        {/* Imagine */}
                        <div className="order-item-image">
                          <img
                            src={imageUrl}
                            alt={getTranslatedProductName(foodItem) || item.name}
                            className="order-image paid"
                            onError={(e) => {
                              if (assets.image_coming_soon) {
                                e.target.src = assets.image_coming_soon;
                                e.target.style.objectFit = "cover";
                              }
                            }}
                          />
                          {/* Indicator plătit */}
                          <div className="order-paid-indicator">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" fill="#10B981" />
                              <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Detalii produs */}
                        <div className="order-item-details">
                          <div className="order-item-header">
                            <h3 className="order-item-name">
                              {getTranslatedProductName(foodItem) || item.name}
                            </h3>
                            
                            {/* Preț */}
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
                          
                          {/* Informații adiționale */}
                          <div className="paid-item-extra-info">
                            <div className="paid-item-meta">
                              <span className="order-number">Order #{item.orderNumber}</span>
                              <span className="order-date">{formatDateTime(item.orderDate)}</span>
                            </div>
                            
                            <div className="paid-payment-info">
                              <div className={`payment-method-badge ${paymentMethod}`}>
                                {paymentMethod === 'card' ? (
                                  <FaCreditCard className="method-icon" />
                                ) : paymentMethod === 'cash' ? (
                                  <FaMoneyBillWave className="method-icon" />
                                ) : null}
                                <span className="method-text">
                                  {paymentMethod === 'card' ? t("my_orders.card") :
                                   paymentMethod === 'cash' ? t("my_orders.cash") :
                                   t("my_orders.paid")}
                                </span>
                              </div>
                              
                              {item.paidBy?.[0]?.paymentDate && (
                                <div className="payment-time">
                                  {new Date(item.paidBy[0].paymentDate).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Footer cu cantitate */}
                          <div className="order-item-footer">
                            <div className="order-quantity">
                              <span className="quantity-label">Quantity:</span>
                              <span className="quantity-value">x{item.quantity}</span>
                            </div>
                            
                            <div className="order-status-badge paid">
                              <span className="status-text">{t("my_orders.paid")}</span>
                            </div>
                          </div>
                          
                          {/* Note speciale */}
                          {item.specialInstructions && (
                            <div className="order-item-notes">
                              <span className="notes-label">Note:</span>
                              <span className="notes-text">{item.specialInstructions}</span>
                            </div>
                          )}
                          
                          {/* Payment breakdown pentru plăți multiple */}
                          {item.paidBy && item.paidBy.length > 1 && (
                            <div className="payment-breakdown">
                              <div className="breakdown-title">
                                {t("my_orders.payment_breakdown")}:
                              </div>
                              <div className="breakdown-items">
                                {item.paidBy.map((payment, idx) => (
                                  <div key={idx} className="breakdown-item">
                                    <span className="breakdown-method">
                                      {payment.paymentMethod === 'card' ? '💳' : '💵'}
                                    </span>
                                    <span className="breakdown-amount">
                                      {payment.amount?.toFixed(2)} €
                                    </span>
                                    <span className="breakdown-date">
                                      {payment.paymentDate 
                                        ? new Date(payment.paymentDate).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })
                                        : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaidItemsSection;