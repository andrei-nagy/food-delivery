import React, { useContext, useState, useRef } from "react";
import "./FoodItemBestSeller.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItemBestSeller = ({
  id,
  name,
  price,
  description,
  image,
  isBestSeller,
  isNewAdded,
  isVegan,
  openModal,
}) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const [showCounterControls, setShowCounterControls] = useState(false);
  const timerRef = useRef(null);

  const handleCounterClick = (e) => {
    e.stopPropagation();
    setShowCounterControls(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowCounterControls(false);
    }, 5000);
  };
  const handleClick = () => {
    openModal({ id, name, price, description, image });
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

        {cartItems && cartItems[id] > 0 ? (
          showCounterControls ? (
            <div className="food-item-counter" onClick={handleCounterClick}>
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCart(id, 1);
                }}
                src={assets.remove_icon_red}
                alt="Remove"
              />
              <p>{cartItems[id]}</p>
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(id, 1);
                }}
                src={assets.add_icon_green}
                alt="Add"
              />
            </div>
          ) : (
            <div
              className="food-item-counter-cart"
              onClick={handleCounterClick}
            >
              {cartItems[id]}
            </div>
          )
        ) : (
          <img
            className="add"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(id, 1);
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
          {description.length > 70
            ? description.slice(0, 70) + "..."
            : description}
        </p>
      </div>
    </div>
  );
};

export default FoodItemBestSeller;
