import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "./OrderItem";
import './OrderList.css';

const OrderList = ({ 
  orders, 
  isPaid = false,
  food_list, 
  findFoodItem, 
  getItemPriceWithDiscount, 
  getTranslatedProductName, 
  isTranslatingProductNames, 
  formatDateTime, 
  openFoodModal, 
  url,
  assets
}) => {
  if (!orders || orders.length === 0) return null;

  return (
    <div className={`orders-list-minimal`}>
      <AnimatePresence>
        {orders.map((order, orderIndex) => (
          <motion.div
            key={order._id || `order-${orderIndex}`}
            className="order-group-minimal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: orderIndex * 0.05 }}
          >
            {/* Header grupa ordine */}
            <div className="order-group-header">
              <h4 className="order-group-title">
                <span>Order #{order.orderNumber || 'N/A'}</span>
                <span className="order-date">{formatDateTime(order.date)}</span>
              </h4>
            </div>

            {/* Items din ordine */}
            <div className="order-group-items">
              {order.items.map((item, itemIndex) => {
                const uniqueId = `${order._id}_${item._id}_${itemIndex}`;
                const foodItem = food_list.find(
                  (food) => food._id === item.baseFoodId || food._id === item.foodId
                );

                return (
                  <React.Fragment key={uniqueId}>
                    <OrderItem
                      item={item}
                      foodItem={foodItem}
                      uniqueId={uniqueId}
                      findFoodItem={findFoodItem}
                      getItemPriceWithDiscount={getItemPriceWithDiscount}
                      getTranslatedProductName={getTranslatedProductName}
                      isTranslatingProductNames={isTranslatingProductNames}
                      openFoodModal={isPaid ? null : openFoodModal}
                      url={url}
                      assets={assets}
                      isPaid={isPaid}
                    />
                    {itemIndex < order.items.length - 1 && (
                      <div className="order-divider" />
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Footer order group - total */}
              <div className="order-group-footer">
                <div className="order-total-minimal">
                  <span className="order-total-label">Order Total:</span>
                  <span className="order-total-amount">
                    {order.amount?.toFixed(2) || '0.00'} €
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;