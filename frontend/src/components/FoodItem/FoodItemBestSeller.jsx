import React, { useContext, useState, useRef } from "react";
import "./FoodItemBestSeller.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

const FoodItemBestSeller = ({
  _id,
  name,
  price,
  description,
  image,
  isBestSeller,
  isNewAdded,
  isVegan,
  openModal,
  swiperRef, // 🔑 primim referința la swiper
}) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const [showCounterControls, setShowCounterControls] = useState(false);
  const timerRef = useRef(null);

  const handleCounterClick = (e) => {
    e.stopPropagation();
    setShowCounterControls(true);

    // 🔑 resetăm timerul la fiecare click
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowCounterControls(false);
    }, 3500);
  };

  // 🔑 helper ca să oprești sliderul când user-ul adaugă în coș
  const pauseSwiper = () => {
    if (swiperRef?.current?.autoplay) {
      swiperRef.current.autoplay.stop();
      setTimeout(() => {
        swiperRef.current?.autoplay?.start();
      }, 5000); // după 5s îl pornim iar
    }
  };

  const handleClick = () => {
    openModal({ _id, name, price, description, image });
  };

  return (
    <div
      className="food-item-best"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
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
        <img
          className="food-item-img"
          src={url + "/images/" + image}
          alt={name}
        />

        {cartItems && cartItems[_id] > 0 ? (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(_id, 1);
                    pauseSwiper();
                    handleCounterClick(e);
                  }}
                  src={assets.remove_icon_red}
                  alt="Remove"
                />
                <p>{cartItems[_id]}</p>
                <img
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(_id, 1);
                    pauseSwiper();
                    handleCounterClick(e);
                  }}
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
                onClick={handleCounterClick}
              >
                {cartItems[_id]}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <img
            className="add"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(_id, 1);
              pauseSwiper();
              handleCounterClick(e);
            }}
            src={assets.add_icon_white}
            alt="Add"
          />
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <p className="food-item-price">{price} €</p>
        </div>
        <p className="food-item-desc">
          {description.length > 150
            ? description.slice(0, 150) + "..."
            : description}
        </p>
      </div>
    </div>
  );
};

export default FoodItemBestSeller;
