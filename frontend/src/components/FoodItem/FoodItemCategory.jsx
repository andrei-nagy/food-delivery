import React, { useContext, useState, useEffect, useRef } from "react";
import "./FoodItemCategory.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

const FoodItemCategory = ({
  id,
  name,
  price,
  description,
  image,
  isBestSeller,
  isNewAdded,
  isVegan,
  category,
  discountPercentage,
  discountedPrice,
  onClick
}) => {
  const { cartItems, url, billRequested, userBlocked } = useContext(StoreContext);
  const [imageError, setImageError] = useState(false);
  
  // Combină ambele condiții pentru a bloca interacțiunea
  const isDisabled = billRequested || userBlocked;
  const hasDiscount = discountPercentage > 0;

  // ✅ CALCULEAZĂ FORȚAT discountPercentage și discountedPrice
  const rawDiscountPercentage = parseFloat(discountPercentage) || 0;
  const rawPrice = parseFloat(price) || 0;
  
  // ✅ CALCULEAZĂ discountedPrice INDIFERENT de ce vine din props
  const calculatedDiscountedPrice = rawDiscountPercentage > 0 
    ? rawPrice * (1 - rawDiscountPercentage / 100)
    : rawPrice;

  // ✅ Verifică dacă ar TREBUI să afișeze discount (indiferent de ce vine din backend)
  const shouldShowDiscount = rawDiscountPercentage > 0;

  // ✅ FUNCȚIE CORECTĂ: Caută toate variantele produsului în coș
  const getItemQuantity = () => {
    if (!cartItems || !id) return 0;
    
    let totalQuantity = 0;
    
    Object.keys(cartItems).forEach(key => {
      if (key.startsWith(id)) {
        const item = cartItems[key];
        if (typeof item === 'number') {
          totalQuantity += item;
        } else if (item && typeof item === 'object' && 'quantity' in item) {
          totalQuantity += item.quantity || 0;
        }
      }
    });
    
    return totalQuantity;
  };

  const itemQuantity = getItemQuantity();

  const handleImageError = () => {
    setImageError(true);
  };

  // Mesajul care va apărea când utilizatorul este blocat
  const getBlockedMessage = () => {
    if (userBlocked) {
      return {
        icon: "⏰",
        text: "Session Expired"
      };
    }
    if (billRequested) {
      return {
        icon: "🔒", 
        text: "Bill Requested"
      };
    }
    return null;
  };

  const blockedMessage = getBlockedMessage();

  const handleAddIconClick = (e) => {
    e.stopPropagation();
    
    if (isDisabled) {
      return;
    }
    
    // ✅ Apelează direct onClick prop fără a seta state local
    if (onClick) {
      const foodData = { 
        _id: id,
        name, 
        price: rawPrice, 
        description, 
        image, 
        isBestSeller, 
        isNewAdded, 
        isVegan, 
        category, 
        extras: [],
        discountPercentage: rawDiscountPercentage,
        discountedPrice: calculatedDiscountedPrice
      };
      onClick(foodData);
    }
  };

  const handleCounterClick = (e) => {
    e.stopPropagation();
    
    if (isDisabled) {
      return;
    }
    
    // ✅ Apelează direct onClick prop fără a seta state local
    if (onClick) {
      const foodData = { 
        _id: id,
        name, 
        price: rawPrice, 
        description, 
        image, 
        isBestSeller, 
        isNewAdded, 
        isVegan, 
        category, 
        extras: [],
        discountPercentage: rawDiscountPercentage,
        discountedPrice: calculatedDiscountedPrice
      };
      onClick(foodData);
    }
  };

  const handleCardClick = () => {
    if (isDisabled) {
      return;
    }
    
    // ✅ Apelează direct onClick prop fără a seta state local
    if (onClick) {
      const foodData = { 
        _id: id,
        name, 
        price: rawPrice, 
        description, 
        image, 
        isBestSeller, 
        isNewAdded, 
        isVegan, 
        category, 
        extras: [],
        discountPercentage: rawDiscountPercentage,
        discountedPrice: calculatedDiscountedPrice
      };
      onClick(foodData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`food-item-category ${isDisabled ? 'bill-requested-disabled' : ''}`}
        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
      >
        <div className="food-item-img-container">
          {isNewAdded && (
            <img className="new-badge" src={assets.new_icon} alt="New" />
          )}
          {isVegan && (
            <img
              className="vegan-badge"
              src={assets.vegan_icon}
              alt="Vegan"
            />
          )}
          {isBestSeller && (
            <img
              className="best-seller-badge"
              src={assets.bestseller_icon}
              alt="Best Seller"
            />
          )}
          
          {/* ✅ Afișează badge-ul bazat pe calculul FORȚAT */}
          {shouldShowDiscount && (
            <div className="discount-badge">
              -{rawDiscountPercentage}%
            </div>
          )}
          
          {isDisabled && blockedMessage && (
            <div className="bill-requested-overlay">
              <div className="bill-requested-message">
                <span className="repeat-product-bill-icon">{blockedMessage.icon}</span>
                <span>{blockedMessage.text}</span>
              </div>
            </div>
          )}
          
          <img
            className={`food-item-img ${isDisabled ? 'disabled-image' : ''} ${imageError ? 'image-error' : ''}`}
            src={imageError ? assets.image_coming_soon : (url + "/images/" + image)}
            alt={name}
            onError={handleImageError}
            onClick={handleCardClick}
          />

          {!isDisabled && itemQuantity > 0 ? (
            <AnimatePresence>
              <motion.div
                key="cart"
                className="food-item-counter-cart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                onClick={handleCounterClick}
              >
                {itemQuantity}
              </motion.div>
            </AnimatePresence>
          ) : !isDisabled ? (
            <img
              className="add"
              onClick={handleAddIconClick}
              src={assets.add_icon_white}
              alt="Add"
            />
          ) : null}
        </div>

       <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className={isDisabled ? "disabled-text" : ""}>{name}</p>
        </div>
        <div className="food-item-desc-container">
          <p
            className={`food-item-desc ${isDisabled ? "disabled-text" : ""}`}
          >
            {description.length > 70
              ? description.slice(0, 70) + "..."
              : description}
          </p>
        </div>
        <div
          className={`food-item-price-container ${
            isDisabled ? "disabled-text" : ""
          }`}
        >
          {hasDiscount ? (
            <div className="discount-price-wrapper">
              <span className="original-price">{price} €</span>
              <span className="discounted-price">{discountedPrice} €</span>
            </div>
          ) : (
            <span className="regular-price">{price} €</span>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default FoodItemCategory;