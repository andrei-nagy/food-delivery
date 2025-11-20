import React, { useContext, useState, useRef } from "react";
import "./FoodItemBestSeller.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const FoodItemBestSeller = ({
  _id,
  name,
  price,
  description,
  image,
  isBestSeller,
  isNewAdded,
  isVegan,
  discountPercentage,
  discountedPrice,
  openModal,
  swiperRef,
}) => {
  const { t } = useTranslation();
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    url, 
    billRequested,
    userBlocked 
  } = useContext(StoreContext);
  const [showCounterControls, setShowCounterControls] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timerRef = useRef(null);

  const isDisabled = billRequested || userBlocked;
  const hasDiscount = discountPercentage > 0;

  const getItemQuantity = () => {
    if (!cartItems || !_id) return 0;

    let totalQuantity = 0;
    Object.keys(cartItems).forEach((key) => {
      if (key.startsWith(_id)) {
        const item = cartItems[key];
        if (typeof item === "number") {
          totalQuantity += item;
        } else if (item && typeof item === "object" && "quantity" in item) {
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

  const handleCounterClick = (e) => {
    e.stopPropagation();
    if (isDisabled) return;

    setShowCounterControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowCounterControls(false);
    }, 3500);
  };

  const pauseSwiper = () => {
    if (swiperRef?.current?.autoplay) {
      swiperRef.current.autoplay.stop();
      setTimeout(() => {
        swiperRef.current?.autoplay?.start();
      }, 5000);
    }
  };

  const handleClick = () => {
    if (isDisabled) return;
    openModal({
      _id,
      name,
      price,
      description,
      image,
      discountPercentage,
      discountedPrice,
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isDisabled) return;

    addToCart(_id, 1);
    pauseSwiper();
    handleCounterClick(e);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    if (isDisabled) return;

    removeFromCart(_id, 1);
    pauseSwiper();
    handleCounterClick(e);
  };

  const handlePlusButtonClick = (e) => {
    e.stopPropagation();
    if (isDisabled) return;

    openModal({
      _id,
      name,
      price,
      description,
      image,
      discountPercentage,
      discountedPrice,
    });
  };

  const handleCounterClickOpenModal = (e) => {
    e.stopPropagation();
    if (isDisabled) return;

    if (!showCounterControls) {
      openModal({
        _id,
        name,
        price,
        description,
        image,
        discountPercentage,
        discountedPrice,
      });
    } else {
      handleCounterClick(e);
    }
  };

  const getBlockedMessage = () => {
    if (userBlocked) {
      return {
        icon: "⏰",
        text: t("food_item.session_expired")
      };
    }
    if (billRequested) {
      return {
        icon: "🔒", 
        text: t("food_item.bill_requested")
      };
    }
    return null;
  };

  const blockedMessage = getBlockedMessage();

  return (
    <div
      className={`food-item-best ${
        isDisabled ? "bill-requested-disabled" : ""
      }`}
      onClick={handleClick}
      style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
    >
      <div className="food-item-img-container">
        {isNewAdded && (
          <img 
            className="new-badge" 
            src={assets.new_icon} 
            alt={t("food_item.new")} 
          />
        )}
        {isVegan && (
          <img 
            className="vegan-badge" 
            src={assets.vegan_icon} 
            alt={t("food_item.vegan")} 
          />
        )}
        {isBestSeller && (
          <img
            className="best-seller-badge"
            src={assets.bestseller_icon}
            alt={t("food_item.best_seller")}
          />
        )}

        {hasDiscount && (
          <div className="discount-badge">
            {t("food_item.discount", { percentage: discountPercentage })}
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
          className={`food-item-img ${isDisabled ? "disabled-image" : ""} ${
            imageError ? "image-error" : ""
          }`}
          src={imageError ? assets.image_coming_soon : url + "/images/" + image}
          alt={name}
          onError={handleImageError}
        />

        {!isDisabled && itemQuantity > 0 ? (
          <AnimatePresence>
            {showCounterControls ? (
              <motion.div
                key="counter"
                className="food-item-counter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <img
                  onClick={handleRemoveFromCart}
                  src={assets.remove_icon_red}
                  alt={t("food_item.remove_from_cart")}
                />
                <p>{itemQuantity}</p>
                <img
                  onClick={handleAddToCart}
                  src={assets.add_icon_green}
                  alt={t("food_item.add_to_cart")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="cart"
                className="food-item-counter-cart"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={handleCounterClickOpenModal}
              >
                {itemQuantity}
              </motion.div>
            )}
          </AnimatePresence>
        ) : !isDisabled ? (
          <img
            className="add"
            onClick={handlePlusButtonClick}
            src={assets.add_icon_white}
            alt={t("food_item.add_to_cart")}
          />
        ) : null}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className={isDisabled ? "disabled-text" : ""}>{name}</p>
        </div>
        <p
          className={`food-item-desc fixed-height ${
            isDisabled ? "disabled-text" : ""
          }`}
        >
          {description.length > 100
            ? t("food_item.description_truncated", { 
                description: description.slice(0, 100) 
              })
            : description}
        </p>
        <div
          className={`food-item-price-container ${
            isDisabled ? "disabled-text" : ""
          }`}
        >
          {hasDiscount ? (
            <div className="discount-price-wrapper">
              <span className="original-price">
                {t("food_item.price_original", { price })}
              </span>
              <span className="discounted-price">
                {t("food_item.price_discounted", { price: discountedPrice })}
              </span>
            </div>
          ) : (
            <span className="regular-price">
              {t("food_item.price_original", { price })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItemBestSeller;