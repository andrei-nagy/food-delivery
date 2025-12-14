import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  FaTimes, 
  FaCheck, 
  FaReceipt, 
  FaMoneyBillWave,
  FaTag
} from "react-icons/fa";

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
  paidItems = [], // ⚠️ ACEȘTIA SUNT ITEM-URILE DEJA PLĂTITE (ca array separat)
  url = "",
  assets = {}
}) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  const hasInitialized = useRef(false);
  const prevIsOpenRef = useRef(isOpen);

  // ✅ LOGICA ORIGINALĂ RESTAURATĂ pentru a obține itemele disponibile
  const getAvailableItems = useRef(() => {
    console.log('🔍 [SplitBillModal] Getting available items...');
    console.log('📦 Order items:', orderItems);
    console.log('💰 Paid items:', paidItems);
    
    if (!orderItems || !Array.isArray(orderItems)) return [];
    
    // Filtrăm item-ele care NU sunt deja plătite
    return orderItems.filter(item => {
      // Verifică dacă item-ul este complet plătit prin status
      if (item.status === 'fully_paid') {
        console.log(`❌ Item ${item.name} is fully_paid by status`);
        return false;
      }
      
      // Verifică dacă item-ul este în lista de paidItems
      const isInPaidItems = paidItems.some(paidItem => {
        // Verificare mai strictă pentru matching
        return paidItem._id === item._id || 
               paidItem.foodId === item.foodId ||
               (paidItem.name === item.name && 
                Math.abs(paidItem.price - item.price) < 0.01);
      });
      
      if (isInPaidItems) {
        console.log(`❌ Item ${item.name} is in paidItems list`);
        return false;
      }
      
      // Verifică dacă item-ul are plăți parțiale (paidBy)
      if (item.paidBy && item.paidBy.length > 0) {
        const totalPaid = item.paidBy.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        const isFullyPaidByPayments = totalPaid >= itemTotal;
        
        if (isFullyPaidByPayments) {
          console.log(`❌ Item ${item.name} is fully paid by payments: ${totalPaid}/${itemTotal}`);
          return false;
        }
        
        console.log(`⚠️ Item ${item.name} is partially paid: ${totalPaid}/${itemTotal}`);
      }
      
      console.log(`✅ Item ${item.name} is available for split`);
      return true;
    });
  }).current;

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      hasInitialized.current = false;
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      const availableItems = getAvailableItems();
      
      console.log('📊 Available items for split:', availableItems);
      
      if (availableItems.length > 0) {
        const initialSelection = {};
        availableItems.forEach(item => {
          if (item.uniqueId) {
            // ✅ LOGICA ORIGINALĂ pentru cantitatea rămasă
            let remainingQuantity = item.quantity;
            
            if (item.paidBy && item.paidBy.length > 0) {
              const totalPaid = item.paidBy.reduce((sum, payment) => sum + (payment.amount || 0), 0);
              const itemPrice = item.price || 0;
              const paidQuantity = Math.floor(totalPaid / itemPrice);
              remainingQuantity = Math.max(0, item.quantity - paidQuantity);
            }
            
            initialSelection[item.uniqueId] = {
              selected: false,
              quantity: 1,
              itemData: item,
              originalQuantity: item.quantity,
              remainingQuantity: remainingQuantity,
              isPartiallyPaid: remainingQuantity < item.quantity
            };
          }
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
  }, [isOpen, getAvailableItems]);

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
          const foodItem = findFoodItem(itemId);
          if (foodItem) {
            const priceInfo = getItemPriceWithDiscount(foodItem, itemData);
            const selectedQuantity = itemSelection.quantity || 1;
            const originalQuantity = itemData.quantity;
            
            // ✅ LOGICA ORIGINALĂ pentru calcul proporțional
            const proportion = selectedQuantity / originalQuantity;
            total += priceInfo.totalPrice * proportion;
          } else {
            // Fallback dacă nu găsim foodItem
            const selectedQuantity = itemSelection.quantity || 1;
            total += (itemData.price || 0) * selectedQuantity;
          }
        }
      }
    });
    
    return total;
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (!prev[itemId]) return prev;
      
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          selected: !prev[itemId].selected
        }
      };
    });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setSelectedItems(prev => {
      if (!prev[itemId]) return prev;
      
      const maxQuantity = prev[itemId].remainingQuantity || prev[itemId].itemData.quantity || 1;
      
      if (newQuantity >= 1 && newQuantity <= maxQuantity) {
        return {
          ...prev,
          [itemId]: {
            ...prev[itemId],
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
      total: selectedTotal
    });
    
    placeSplitBillOrder(itemsToPay, selectedTotal);
    onClose();
  };

  const handleClose = () => {
    hasInitialized.current = false;
    setSelectedItems({});
    setSelectAll(false);
    onClose();
  };

  if (!isOpen) return null;

  const availableItems = getAvailableItems();
  const selectedTotal = calculateSelectedTotal();
  const selectedCount = Object.values(selectedItems).filter(s => s?.selected).length;
  const totalAvailableItems = availableItems.length;

  console.log('📊 Modal state:', {
    availableItemsCount: totalAvailableItems,
    selectedCount,
    selectedTotal,
    selectedItems
  });

  return (
    <div className="split-modal-overlay" onClick={handleClose}>
      <div className="split-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="split-modal-header">
          <div>
            <h2 className="header-title">{t("my_orders.split_bill")}</h2>
            <p className="header-subtitle">{t("my_orders.split_bill_description")}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="selection-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Items</span>
              <span className="stat-value">{selectedCount} / {availableItems.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value total">{selectedTotal.toFixed(2)} €</span>
            </div>
          </div>
          
          {availableItems.length > 0 && (
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
          {availableItems.length > 0 ? (
            <div className="items-container">
              {availableItems.map((item) => {
                const itemId = item.uniqueId;
                const itemSelection = selectedItems[itemId];
                const isSelected = itemSelection?.selected === true;
                const selectedQuantity = itemSelection?.quantity || 1;
                const remainingQuantity = itemSelection?.remainingQuantity || item.quantity;
                const foodItem = findFoodItem(itemId);
                const priceInfo = foodItem ? getItemPriceWithDiscount(foodItem, item) : null;
                const isPartiallyPaid = remainingQuantity < item.quantity;
                
                // Prețuri
                const originalPrice = item.price * item.quantity;
                const discountedPrice = priceInfo ? priceInfo.totalPrice : originalPrice;
                const pricePerUnit = discountedPrice / item.quantity;
                const selectedPrice = pricePerUnit * selectedQuantity;

                // Imagine
                const imageUrl = url + "/images/" + (foodItem?.image || item.image);

                return (
                  <div
                    key={itemId}
                    className={`split-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleItemToggle(itemId)}
                  >
                    <div className="item-check">
                      <div className={`check-circle ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <FaCheck />}
                      </div>
                    </div>
                    
                    <div className="item-image-container">
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
                    
                    <div className="item-content">
                      <h3 className="item-name">
                        {getTranslatedProductName(foodItem) || item.name}
                      </h3>
                      
                      {/* ✅ AFIȘEAZĂ CANTITATEA RĂMASĂ */}
                      {isPartiallyPaid && (
                        <div className="partial-note">
                          {remainingQuantity} of {item.quantity} remaining
                        </div>
                      )}
                      
                      {remainingQuantity > 1 && (
                        <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="qty-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(itemId, selectedQuantity - 1);
                            }}
                            disabled={selectedQuantity <= 1}
                          >
                            -
                          </button>
                          <span className="qty-display">
                            {selectedQuantity} of {remainingQuantity}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(itemId, selectedQuantity + 1);
                            }}
                            disabled={selectedQuantity >= remainingQuantity}
                          >
                            +
                          </button>
                        </div>
                      )}
                      
                      <div className="item-price">
                        {priceInfo?.hasDiscount && (
                          <span className="discount-price">
                            {originalPrice.toFixed(2)} €
                          </span>
                        )}
                        <span>{selectedPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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