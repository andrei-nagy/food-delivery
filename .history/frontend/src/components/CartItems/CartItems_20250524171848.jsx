import React, { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './CartItems.css';

const CartItem = ({ item, quantity, removeFromCart, updateCartItemQuantity, removeItemCompletely, url }) => {
  const [startX, setStartX] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeToRemove, setSwipeToRemove] = useState(false);
  const threshold = 75;

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    if (startX !== null && Math.abs(currentX - startX) > 10) {
      setIsSwiping(true);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping || startX === null) return;

    const deltaX = startX - e.changedTouches[0].clientX;
    if (deltaX > threshold) {
      setSwipeToRemove(true); // Start animatie
      setTimeout(() => {
        removeItemCompletely(item._id); // Stergere după animatie
      }, 400); // să se potrivească cu durata CSS
    }

    setStartX(null);
    setIsSwiping(false);
  };

  const handleDecrement = () => {
    if (!isSwiping && quantity > 1) {
      updateCartItemQuantity(item._id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (!isSwiping) {
      updateCartItemQuantity(item._id, quantity + 1);
    }
  };

  return (
    <div
      className={`cart-total-order ${swipeToRemove ? 'cart-swipe-remove' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="modal-cart-item cart-items-title cart-items-item">
        <img className="modal-cart-image" src={url + "/images/" + item.image} alt={item.name} />
        <p>{item.name}</p>
        <div className="quantity-control-order">
          <button onClick={handleDecrement} className="quantity-btn-order">
            <FaMinus />
          </button>
          <span className="quantity-order">{quantity}</span>
          <button onClick={handleIncrement} className="quantity-btn-order">
            <FaPlus />
          </button>
        </div>
        <p>{(item.price * quantity).toFixed(2)} €</p>
      </div>
    </div>
  );
};

export default CartItem;
