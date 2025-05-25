import React, { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './CartItems.css';

const CartItem = ({ item, quantity, removeFromCart, updateCartItemQuantity, removeItemCompletely, url }) => {
    const [startX, setStartX] = useState(null);
    const [currentX, setCurrentX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const threshold = 75;
  
    const handleTouchStart = (e) => {
      setStartX(e.touches[0].clientX);
      setIsDragging(true);
    };
  
    const handleTouchMove = (e) => {
      if (!isDragging || startX === null) return;
      const x = e.touches[0].clientX;
      const delta = x - startX;
      if (delta < 0) {
        setCurrentX(delta); // doar spre stânga
      }
    };
  
    const handleTouchEnd = () => {
      if (Math.abs(currentX) > threshold) {
        setCurrentX(-window.innerWidth); // animăm complet spre stânga
        setTimeout(() => {
          removeItemCompletely(item._id);
        }, 300);
      } else {
        setCurrentX(0); // revine la poziția inițială
      }
  
      setStartX(null);
      setIsDragging(false);
    };
  
    const handleDecrement = () => {
      if (!isDragging && quantity > 1) {
        updateCartItemQuantity(item._id, quantity - 1);
      }
    };
  
    const handleIncrement = () => {
      if (!isDragging) {
        updateCartItemQuantity(item._id, quantity + 1);
      }
    };
  
    return (
        <div
          className="cart-swipe-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="cart-total-order"
            style={{ transform: `translateX(${currentX}px)` }}
          >
            <div className="cart-swipe-background">Removed</div>
      
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
        </div>
      );
      
  };
  
  export default CartItem;