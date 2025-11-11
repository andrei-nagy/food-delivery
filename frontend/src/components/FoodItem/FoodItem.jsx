import React, { useContext, useState, useRef } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

const FoodItem = ({
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
}) => {
  const { cartItems, addToCart, removeFromCart, url, billRequested } =
    useContext(StoreContext);
  const [showCounterControls, setShowCounterControls] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timerRef = useRef(null);

  // Verifică dacă produsul are discount
  const hasDiscount = discountPercentage > 0;

  // ✅ FUNCȚIE CORECTĂ: Caută toate variantele produsului în coș
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

    if (billRequested) {
      return;
    }

    setShowCounterControls(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowCounterControls(false);
    }, 3500);
  };

  const handleClick = () => {
    if (billRequested) {
      return;
    }
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

    if (billRequested) {
      return;
    }

    addToCart(_id, 1);
    handleCounterClick(e);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();

    if (billRequested) {
      return;
    }

    removeFromCart(_id, 1);
    handleCounterClick(e);
  };

  const handleSimpleCounterClick = (e) => {
    e.stopPropagation();

    if (billRequested) {
      return;
    }

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

  const handleAddIconClick = (e) => {
    e.stopPropagation();

    if (billRequested) {
      return;
    }

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

  return (
    <div
      className={`food-item ${billRequested ? "bill-requested-disabled" : ""}`}
      onClick={handleClick}
      style={{ cursor: billRequested ? "not-allowed" : "pointer" }}
    >
      <div className="food-item-img-container">
        {isNewAdded && (
          <img className="new-badge" src={assets.new_icon} alt="New" />
        )}
        {isVegan && (
          <img className="vegan-badge" src={assets.vegan_icon} alt="Vegan" />
        )}
        {isBestSeller && (
          <img
            className="best-seller-badge"
            src={assets.bestseller_icon}
            alt="Best Seller"
          />
        )}

        {/* Badge pentru discount */}
        {hasDiscount && (
          <div className="discount-badge">-{discountPercentage}%</div>
        )}

        {billRequested && (
          <div className="bill-requested-overlay">
            <div className="bill-requested-message">
              <span className="repeat-product-bill-icon">🔒</span>
              <span>Bill Requested</span>
            </div>
          </div>
        )}

        <img
          className={`food-item-img ${billRequested ? "disabled-image" : ""} ${
            imageError ? "image-error" : ""
          }`}
          src={imageError ? assets.image_coming_soon : url + "/images/" + image}
          alt={name}
          onError={handleImageError}
        />

        {!billRequested && itemQuantity > 0 ? (
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
                  alt="Remove"
                />
                <p>{itemQuantity}</p>
                <img
                  onClick={handleAddToCart}
                  src={assets.add_icon_green}
                  alt="Add"
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
                onClick={handleSimpleCounterClick}
              >
                {itemQuantity}
              </motion.div>
            )}
          </AnimatePresence>
        ) : !billRequested ? (
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
          <p className={billRequested ? "disabled-text" : ""}>{name}</p>
        </div>
        <div className="food-item-desc-container">
          <p
            className={`food-item-desc ${billRequested ? "disabled-text" : ""}`}
          >
            {description.length > 70
              ? description.slice(0, 70) + "..."
              : description}
          </p>
        </div>
        <div
          className={`food-item-price-container ${
            billRequested ? "disabled-text" : ""
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
  );
};

export default FoodItem;
