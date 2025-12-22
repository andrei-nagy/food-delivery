import React, { useState, useEffect, useRef } from "react";
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
  // ✅ Toate hook-urile trebuie să fie la început, fără condiții înainte
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const hasInitialized = useRef(false);
  const itemCounterRef = useRef(0);
  const itemIdMap = useRef({}); // ✅ Mutat aici, înainte de orice condiție

  // ✅ Funcție pentru a grupa item-ele după order
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

  // ✅ Funcție pentru a obține item-ele disponibile
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

  // ✅ Funcție pentru a formata data
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

  // ✅ Inițializare item-e pentru selecție
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      itemCounterRef.current = 0; // Reset counter
      itemIdMap.current = {}; // Reset map
      
      const groupedOrders = groupItemsByOrder();
      const allAvailableItems = [];
      
      Object.values(groupedOrders).forEach(orderGroup => {
        const availableInOrder = getAvailableItems(orderGroup.items, paidItems);
        allAvailableItems.push(...availableInOrder);
      });
      
      console.log('📊 All available items for split:', allAvailableItems);
      
      if (allAvailableItems.length > 0) {
        const initialSelection = {};
        allAvailableItems.forEach((item) => {
          const stableId = `item_${item._id}_${item.orderId}_${itemCounterRef.current++}`;
          
          let remainingQuantity = item.quantity;
          
          if (item.paidBy && item.paidBy.length > 0) {
            const totalPaid = item.paidBy.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const itemPrice = item.price || 0;
            const paidQuantity = Math.floor(totalPaid / itemPrice);
            remainingQuantity = Math.max(0, item.quantity - paidQuantity);
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
            stableId: stableId
          };
          
          // ✅ Salvează mapping-ul
          const itemKey = `${item._id}_${item.orderId}_${item.quantity}_${item.price}`;
          itemIdMap.current[itemKey] = stableId;
        });
        
        setSelectedItems(initialSelection);
        setSelectAll(false);
        hasInitialized.current = true;
        
        console.log('🎯 Initial selection:', initialSelection);
      } else {
        console.log('⚠️ No available items for split');
        setSelectedItems({});
        setSelectAll(false);
      }
    }
  }, [isOpen, orderItems, paidItems]);

  // Resetare când se închide modalul
  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
      itemCounterRef.current = 0;
      itemIdMap.current = {};
    }
  }, [isOpen]);

  // Efect pentru a sincroniza selectAll
  useEffect(() => {
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

  const calculateSelectedTotal = () => {
    let total = 0;
    
    Object.keys(selectedItems).forEach(itemId => {
      const itemSelection = selectedItems[itemId];
      if (itemSelection?.selected) {
        const itemData = itemSelection.itemData;
        if (itemData) {
          const foodItem = findFoodItem(itemData.uniqueId);
          if (foodItem) {
            const priceInfo = getItemPriceWithDiscount(foodItem, itemData);
            const selectedQuantity = itemSelection.quantity || 1;
            const originalQuantity = itemData.quantity;
            
            const proportion = selectedQuantity / originalQuantity;
            total += priceInfo.totalPrice * proportion;
          } else {
            const selectedQuantity = itemSelection.quantity || 1;
            total += (itemData.price || 0) * selectedQuantity;
          }
        }
      }
    });
    
    return total;
  };

  const handleItemToggle = (stableId) => {
    setSelectedItems(prev => {
      if (!prev[stableId]) {
        return prev;
      }
      
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
  // ✅ Verifică dacă payment method este card
  if (!paymentMethod || paymentMethod !== "creditCard") {
    // Închide modalul și arată secțiunea de payment
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
    
    // ✅ Arată un mesaj informativ
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
      
      return {
        ...itemData,
        quantity: finalQuantity,
        originalQuantity: itemData.quantity,
        remainingQuantity: remainingQuantity,
        _id: itemData._id,
        foodId: itemData.foodId,
        baseFoodId: itemData.baseFoodId,
        price: itemData.price,
        name: itemData.name,
        image: itemData.image
      };
    });
  
  if (itemsToPay.length === 0) {
    alert("Please select at least one item to pay");
    return;
  }
  
  const selectedTotal = calculateSelectedTotal();
  console.log('💰 Sending to placeSplitBillOrder:', {
    items: itemsToPay,
    total: selectedTotal,
    paymentMethod: paymentMethod
  });
  
  placeSplitBillOrder(itemsToPay, selectedTotal);
  onClose();
};

  const handleClose = () => {
    hasInitialized.current = false;
    itemCounterRef.current = 0;
    itemIdMap.current = {};
    setSelectedItems({});
    setSelectAll(false);
    onClose();
  };

  // ✅ RETURN-ul cu condiția la sfârșit, după toate hook-urile
  if (!isOpen) return null;

  const selectedTotal = calculateSelectedTotal();
  const selectedCount = Object.values(selectedItems).filter(s => s?.selected).length;
  
  // ✅ Obținem order-ele care au item-e disponibile
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

        {/* Items List - Grupate după order */}
        <div className="split-items-list">
          {ordersWithAvailableItems.length > 0 ? (
            <div className="orders-container">
              {ordersWithAvailableItems.map((orderGroup, orderIndex) => (
                <div key={orderGroup.orderId} className="order-group-section">
                  {/* Order Header */}
                  <div className="order-header">
                    <h4 className="order-title">
                      <span>Order #{orderGroup.orderNumber || 'N/A'}</span>
                      <span className="order-time">{formatDateTime(orderGroup.orderDate)}</span>
                    </h4>
                  </div>

                  {/* Items din order */}
                  <div className="order-items-container">
                    {orderGroup.availableItems.map((item) => {
                      const itemKey = `${item._id}_${item.orderId}_${item.quantity}_${item.price}`;
                      const stableId = itemIdMap.current[itemKey];
                      
                      if (!stableId) {
                        console.error('❌ No stableId found for item:', item);
                        return null;
                      }
                      
                      const itemSelection = selectedItems[stableId];
                      const isSelected = itemSelection?.selected === true;
                      const selectedQuantity = itemSelection?.quantity || 1;
                      const remainingQuantity = itemSelection?.remainingQuantity || item.quantity;
                      const foodItem = findFoodItem(item.uniqueId);
                      const priceInfo = foodItem ? getItemPriceWithDiscount(foodItem, item) : null;
                      const isPartiallyPaid = remainingQuantity < item.quantity;
                      
                      const originalPrice = item.price * item.quantity;
                      const discountedPrice = priceInfo ? priceInfo.totalPrice : originalPrice;
                      const pricePerUnit = discountedPrice / item.quantity;
                      const selectedPrice = pricePerUnit * selectedQuantity;

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
                              {priceInfo?.hasDiscount && (
                                <span className="original-price">
                                  {originalPrice.toFixed(2)} €
                                </span>
                              )}
                              <span className="final-price">{selectedPrice.toFixed(2)} €</span>
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