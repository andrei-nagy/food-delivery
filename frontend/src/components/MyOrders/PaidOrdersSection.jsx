import React from "react";
import { motion } from "framer-motion";
import OrderList from "./OrderList";

const PaidOrdersSection = ({
  orders,
  food_list,
  findFoodItem,
  getItemPriceWithDiscount,
  getTranslatedProductName,
  formatDateTime,
  t,
  url,
  assets
}) => {
  if (!orders || orders.length === 0) return null;

  const totalPaidAmount = orders.reduce((sum, order) => {
    return sum + (order.amount || 0);
  }, 0);

  return (
    <div className="paid-section">
      {/* Header minimalist */}
      <div className="section-header-minimal">
        <div className="section-header-content">
          <h2 className="section-title-minimal">
            <span className="section-title-icon">✓</span>
            Paid Orders
            <span className="section-count">({orders.length})</span>
          </h2>
          <p className="section-subtitle">
            These items have already been settled
          </p>
        </div>
        
        <div className="section-summary-minimal">
          <div className="summary-item">
            <span className="summary-label">Total Paid</span>
            <span className="summary-value">{totalPaidAmount.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Lista de ordine */}
      <div className="orders-list-minimal">
        <OrderList
          orders={orders}
          isPaid={true}
          food_list={food_list}
          findFoodItem={findFoodItem}
          getItemPriceWithDiscount={getItemPriceWithDiscount}
          getTranslatedProductName={getTranslatedProductName}
          formatDateTime={formatDateTime}
          t={t}
          url={url}
          assets={assets}
        />
      </div>
    </div>
  );
};

export default PaidOrdersSection;