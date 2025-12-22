import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import "./SplitBillModal.css";

const SplitBillModal = ({
  isOpen,
  onClose,
  orderItems,
  findFoodItem,
  getItemPriceWithDiscount,
  getTranslatedProductName,
  placeSplitBillOrder,
  t,
  paymentMethod,
  paidItems = [],
  url = "",
  assets = {}
}) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const hasInitialized = useRef(false);
  const itemCounterRef = useRef(0);
  const itemIdMap = useRef({});
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);

  const groupItemsByOrder = () => {
    if (!orderItems || !Array.isArray(orderItems)) return {};
    
    const grouped = {};
    
    orderItems.forEach(item => {
      const orderId = item.orderId;
      if (!grouped[orderId]) {
        grouped[orderId] = {
          orderId: orderId,
          orderNumber: item.orderNumber,
          orderDate: item.orderDate,
          items: []
        };
      }
      grouped[orderId].items.push(item);
    });
    
    return grouped;
  };

  const getAvailableItems = (items, paidItemsList) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.filter(item => {
      if (item.status === 'fully_paid') return false;
      
      const isInPaidItems = paidItemsList.some(paidItem => {
        return paidItem._id === item._id || 
               paidItem.foodId === item.foodId ||
               (paidItem.name === item.name && 
                Math.abs(paidItem.price - item.price) < 0.01);
      });
      
      if (isInPaidItems) return false;
      
      if (item.paidBy && item.paidBy.length > 0) {
        const totalPaid = item.paidBy.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        const isFullyPaidByPayments = totalPaid >= itemTotal;
        
        if (isFullyPaidByPayments) return false;
      }
      
      return true;
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB");
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} ${formattedTime}`;
  };

  const findFoodItemForItem = (item) => {
    if (item.uniqueId) {
      const found = findFoodItem(item.uniqueId);
      if (found) return found;
    }
    
    if (item._id) {
      const found = findFoodItem(item._id);
      if (found) return found;
    }
    
    if (item.baseFoodId) {
      const found = findFoodItem(item.baseFoodId);
      if (found) return found;
    }
    
    if (item.foodId) {
      const found = findFoodItem(item.foodId);
      if (found) return found;
    }
    
    if (item.name) {
      const found = findFoodItem(item.name);
      if (found) return found;
    }
    
    return null;
  };

  const calculateItemPriceForQuantity = useCallback((item, quantity) => {
    const foodItem = findFoodItemForItem(item);
    
    if (!foodItem) {
      return (item.price || 0) * quantity;
    }
    
    const priceInfo = getItemPriceWithDiscount(foodItem, item);
    
    if (!priceInfo) {
      return (item.price || 0) * quantity;
    }
    
    const unitPriceWithDiscount = priceInfo.unitPrice;
    
    return unitPriceWithDiscount * quantity;
  }, [findFoodItem, getItemPriceWithDiscount]);

  const getItemKey = (item) => {
    return `${item._id}_${item.orderId}_${item.quantity}_${item.price}_${item.foodId}`;
  };

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      itemCounterRef.current = 0;
      itemIdMap.current = {};
      
      const groupedOrders = groupItemsByOrder();
      const allAvailableItems = [];
      
      Object.values(groupedOrders).forEach(orderGroup => {
        const availableInOrder = getAvailableItems(orderGroup.items, paidItems);
        allAvailableItems.push(...availableInOrder);
      });
      
      if (allAvailableItems.length > 0) {
        const initialSelection = {};
        
        allAvailableItems.forEach((item) => {
          const itemKey = getItemKey(item);
          const stableId = `item_${itemCounterRef.current++}`;
          
          itemIdMap.current[itemKey] = stableId;
          
          let remainingQuantity = item.quantity;
          
          if (item.paidBy && item.paidBy.length > 0) {
            const totalPaid = item.paidBy.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const foodItem = findFoodItemForItem(item);
            
            if (foodItem) {
              const priceInfo = getItemPriceWithDiscount(foodItem, item);
              if (priceInfo && priceInfo.unitPrice > 0) {
                const pricePerUnit = priceInfo.unitPrice;
                const paidQuantity = Math.floor(totalPaid / pricePerUnit);
                remainingQuantity = Math.max(0, item.quantity - paidQuantity);
              } else {
                const itemPrice = item.price || 0;
                const paidQuantity = Math.floor(totalPaid / itemPrice);
                remainingQuantity = Math.max(0, item.quantity - paidQuantity);
              }
            } else {
              const itemPrice = item.price || 0;
              const paidQuantity = Math.floor(totalPaid / itemPrice);
              remainingQuantity = Math.max(0, item.quantity - paidQuantity);
            }
          }
          
          const foodItem = findFoodItemForItem(item);
          let itemPrice = item.price || 0;
          let originalPrice = itemPrice;
          let hasDiscount = false;
          let discountPercentage = 0;
          let unitPriceWithDiscount = itemPrice;
          
          if (foodItem) {
            const priceInfo = getItemPriceWithDiscount(foodItem, item);
            if (priceInfo) {
              unitPriceWithDiscount = priceInfo.unitPrice;
              originalPrice = priceInfo.originalPrice;
              hasDiscount = priceInfo.hasDiscount;
              discountPercentage = priceInfo.discountPercentage;
            }
          }
          
          initialSelection[stableId] = {
            selected: false,
            quantity: 1,
            itemData: item,
            originalQuantity: item.quantity,
            remainingQuantity: remainingQuantity,
            isPartiallyPaid: remainingQuantity < item.quantity,
            orderId: item.orderId,
            orderNumber: item.orderNumber,
            stableId: stableId,
            unitPriceWithDiscount: unitPriceWithDiscount,
            unitPriceOriginal: originalPrice,
            hasDiscount: hasDiscount,
            discountPercentage: discountPercentage,
            itemKey: itemKey
          };
        });
        
        setSelectedItems(initialSelection);
        setSelectAll(false);
        hasInitialized.current = true;
      } else {
        setSelectedItems({});
        setSelectAll(false);
      }
    }
  }, [isOpen, orderItems, paidItems]);

  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
      itemCounterRef.current = 0;
      itemIdMap.current = {};
      setSelectedTotal(0);
      setSelectedCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let total = 0;
    let count = 0;
    
    Object.keys(selectedItems).forEach(itemId => {
      const itemSelection = selectedItems[itemId];
      if (itemSelection?.selected) {
        const selectedQuantity = itemSelection.quantity || 1;
        const unitPrice = itemSelection.unitPriceWithDiscount || 
                         itemSelection.itemData.price || 0;
        
        total += unitPrice * selectedQuantity;
        count++;
      }
    });
    
    setSelectedTotal(total);
    setSelectedCount(count);
    
    const selectedKeys = Object.keys(selectedItems);
    if (selectedKeys.length > 0) {
      const allSelected = selectedKeys.every(
        itemId => selectedItems[itemId]?.selected === true
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems]);

  const handleItemToggle = (stableId) => {
    setSelectedItems(prev => {
      if (!prev[stableId]) return prev;
      
      return {
        ...prev,
        [stableId]: {
          ...prev[stableId],
          selected: !prev[stableId].selected
        }
      };
    });
  };

  const handleQuantityChange = (stableId, newQuantity) => {
    setSelectedItems(prev => {
      if (!prev[stableId]) return prev;
      
      const maxQuantity = prev[stableId].remainingQuantity || prev[stableId].itemData.quantity || 1;
      
      if (newQuantity >= 1 && newQuantity <= maxQuantity) {
        return {
          ...prev,
          [stableId]: {
            ...prev[stableId],
            quantity: newQuantity
          }
        };
      }
      return prev;
    });
  };

  const handleSelectAll = () => {
    const allSelected = Object.keys(selectedItems).every(
      itemId => selectedItems[itemId]?.selected === true
    );
    const newSelectAll = !allSelected;
    
    const updatedSelection = {};
    Object.keys(selectedItems).forEach(itemId => {
      updatedSelection[itemId] = {
        ...selectedItems[itemId],
        selected: newSelectAll
      };
    });
    
    setSelectedItems(updatedSelection);
  };

  const handlePaySelected = () => {
    if (!paymentMethod || paymentMethod !== "creditCard") {
      onClose();
      setTimeout(() => {
        const paymentSection = document.getElementById("payment-method-section");
        if (paymentSection) {
          paymentSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
      
      setTimeout(() => {
        alert("Split bill is only available with card payment. Please select 'Card Payment' as your payment method.");
      }, 150);
      
      return;
    }
    
    const itemsToPay = Object.keys(selectedItems)
      .filter(itemId => selectedItems[itemId]?.selected)
      .map(itemId => {
        const itemSelection = selectedItems[itemId];
        const itemData = itemSelection.itemData;
        const selectedQuantity = itemSelection.quantity || 1;
        const remainingQuantity = itemSelection.remainingQuantity || itemData.quantity;
        
        const finalQuantity = Math.min(selectedQuantity, remainingQuantity);
        
        const unitPriceWithDiscount = itemSelection.unitPriceWithDiscount || 
                                     itemData.price || 0;
        
        const originalPrice = itemSelection.unitPriceOriginal || 
                             itemData.price || 0;
        
        const hasDiscount = itemSelection.hasDiscount || false;
        const discountPercentage = itemSelection.discountPercentage || 0;
        
        const totalPriceForQuantity = unitPriceWithDiscount * finalQuantity;
        
        return {
          ...itemData,
          quantity: finalQuantity,
          originalQuantity: itemData.quantity,
          remainingQuantity: remainingQuantity,
          _id: itemData._id,
          foodId: itemData.foodId,
          baseFoodId: itemData.baseFoodId,
          price: unitPriceWithDiscount,
          originalPriceValue: originalPrice,
          totalPrice: totalPriceForQuantity,
          hasDiscount: hasDiscount,
          discountPercentage: discountPercentage,
          name: itemData.name,
          image: itemData.image,
          isDiscountedPriceApplied: true
        };
      });
    
    if (itemsToPay.length === 0) {
      alert("Please select at least one item to pay");
      return;
    }
    
    console.log('💰 FINAL - Sending to placeSplitBillOrder:', {
      itemsCount: itemsToPay.length,
      total: selectedTotal,
      paymentMethod: paymentMethod,
      itemsDetails: itemsToPay.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.totalPrice,
        hasDiscount: item.hasDiscount,
        discountPercentage: item.discountPercentage
      }))
    });
    
    placeSplitBillOrder(itemsToPay, selectedTotal);
    handleClose();
  };

  const handleClose = () => {
    hasInitialized.current = false;
    itemCounterRef.current = 0;
    itemIdMap.current = {};
    setSelectedItems({});
    setSelectAll(false);
    setSelectedTotal(0);
    setSelectedCount(0);
    onClose();
  };

  if (!isOpen) return null;
  
  const groupedOrders = groupItemsByOrder();
  const ordersWithAvailableItems = Object.values(groupedOrders)
    .map(orderGroup => ({
      ...orderGroup,
      availableItems: getAvailableItems(orderGroup.items, paidItems)
    }))
    .filter(orderGroup => orderGroup.availableItems.length > 0);

  const totalAvailableItems = ordersWithAvailableItems.reduce(
    (total, order) => total + order.availableItems.length, 0
  );

  return (
    <div className="split-modal-overlay" onClick={handleClose}>
      <div className="split-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="split-modal-header">
          <div>
            <h2 className="header-title">{t("my_orders.split_bill")}</h2>
            <p className="header-subtitle">{t("my_orders.split_bill_description")}</p>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        {/* Summary */}
        <div className="selection-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Items</span>
              <span className="stat-value">{selectedCount} / {totalAvailableItems}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value total">{selectedTotal.toFixed(2)} €</span>
            </div>
          </div>
          
          {totalAvailableItems > 0 && (
            <button 
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              <div className={`checkbox ${selectAll ? 'checked' : ''}`}>
                {selectAll && <FaCheck />}
              </div>
              <span>{selectAll ? "Deselect All" : "Select All"}</span>
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="split-items-list">
          {ordersWithAvailableItems.length > 0 ? (
            <div className="orders-container">
              {ordersWithAvailableItems.map((orderGroup, orderIndex) => (
                <div key={orderGroup.orderId || orderIndex} className="order-group-section">
                  <div className="order-header">
                    <h4 className="order-title">
                      <span>Order #{orderGroup.orderNumber || 'N/A'}</span>
                      <span className="order-time">{formatDateTime(orderGroup.orderDate)}</span>
                    </h4>
                  </div>

                  <div className="order-items-container">
                    {orderGroup.availableItems.map((item) => {
                      const itemKey = getItemKey(item);
                      const stableId = itemIdMap.current[itemKey];
                      
                      if (!stableId) {
                        return null;
                      }
                      
                      const itemSelection = selectedItems[stableId];
                      
                      if (!itemSelection) {
                        return null;
                      }
                      
                      const isSelected = itemSelection.selected === true;
                      const selectedQuantity = itemSelection.quantity || 1;
                      const remainingQuantity = itemSelection.remainingQuantity || item.quantity;
                      const foodItem = findFoodItemForItem(item);
                      const isPartiallyPaid = remainingQuantity < item.quantity;
                      
                      const unitPriceWithDiscount = itemSelection.unitPriceWithDiscount || item.price || 0;
                      const unitPriceOriginal = itemSelection.unitPriceOriginal || item.price || 0;
                      const hasDiscount = itemSelection.hasDiscount || false;
                      const discountPercentage = itemSelection.discountPercentage || 0;
                      
                      const originalPriceForSelected = unitPriceOriginal * selectedQuantity;
                      const discountedPriceForSelected = unitPriceWithDiscount * selectedQuantity;

                      const imageUrl = url + "/images/" + (foodItem?.image || item.image);

                      return (
                        <div
                          key={stableId}
                          className={`split-item-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleItemToggle(stableId)}
                        >
                          <div className="item-checkbox">
                            <div className={`checkbox-circle ${isSelected ? 'checked' : ''}`}>
                              {isSelected && <FaCheck />}
                            </div>
                          </div>
                          
                          <div className="item-image-wrapper">
                            <img
                              src={imageUrl}
                              alt={getTranslatedProductName(foodItem) || item.name}
                              className="item-image"
                              onError={(e) => {
                                if (assets.image_coming_soon) {
                                  e.target.src = assets.image_coming_soon;
                                  e.target.style.objectFit = "cover";
                                }
                              }}
                            />
                          </div>
                          
                          <div className="item-details">
                            <h3 className="item-name">
                              {getTranslatedProductName(foodItem) || item.name}
                            </h3>
                            
                            {isPartiallyPaid && (
                              <div className="partial-badge">
                                {remainingQuantity} of {item.quantity} remaining
                              </div>
                            )}
                            
                            {/* ✅ STRUCTURA ORIGINALĂ pentru quantity controls */}
                            {remainingQuantity > 1 && (
                              <div className="split-qty-compact" onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="split-qty-btn-compact"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(stableId, selectedQuantity - 1);
                                  }}
                                  disabled={selectedQuantity <= 1}
                                >
                                  -
                                </button>
                                <span className="split-qty-value-compact">
                                  {selectedQuantity} / {remainingQuantity}
                                </span>
                                <button
                                  className="split-qty-btn-compact"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(stableId, selectedQuantity + 1);
                                  }}
                                  disabled={selectedQuantity >= remainingQuantity}
                                >
                                  +
                                </button>
                              </div>
                            )}
                            
                            <div className="item-price-section">
                              {hasDiscount && discountPercentage > 0 && (
                                <div className="discount-price-display">
                                  <span className="original-price-line">
                                    {originalPriceForSelected.toFixed(2)} €
                                  </span>
                                  <span className="discounted-price">
                                    {discountedPriceForSelected.toFixed(2)} €
                                  </span>
                                  <span className="discount-percentage-badge">
                                    -{discountPercentage}%
                                  </span>
                                </div>
                              )}
                              {!hasDiscount && (
                                <span className="regular-price">
                                  {discountedPriceForSelected.toFixed(2)} €
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>All Items Paid</h3>
              <p>There are no items available for splitting</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="split-modal-footer">
          <button 
            className="cancel-btn"
            onClick={handleClose}
          >
            Cancel
          </button>
          
          <button
            className="pay-btn"
            onClick={handlePaySelected}
            disabled={selectedCount === 0}
          >
            <span>Pay Selected</span>
            <span className="pay-amount">{selectedTotal.toFixed(2)} €</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitBillModal;