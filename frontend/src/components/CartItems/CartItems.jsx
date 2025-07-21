import React, { useState, useRef, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './CartItems.css';

const CartItem = ({
  item,
  quantity,
  removeFromCart,
  updateCartItemQuantity,
  removeItemCompletely,
  url
}) => {
  const [startX, setStartX] = useState(null);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [threshold, setThreshold] = useState(75); // va fi recalculat după mount

  const itemRef = useRef(null);

  useEffect(() => {
    if (itemRef.current) {
      const width = itemRef.current.getBoundingClientRect().width;
      setThreshold(width * 0.45); // 90% din lățimea elementului
    }
  }, []);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    if (startX === null) return;
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - startX;
    if (deltaX < 0) {  // swipe stânga doar
      setCurrentX(deltaX);
      if (Math.abs(deltaX) > 10) setIsSwiping(true);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) {
      resetSwipe();
      return;
    }

    if (Math.abs(currentX) > threshold) {
      // trigger remove complet
      removeItemCompletely(item._id);
    }

    resetSwipe();
  };

  const resetSwipe = () => {
    setStartX(null);
    setCurrentX(0);
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

  // calculează opacitatea fundalului roșu pe baza distanței swipe (max 1 la threshold)
  const opacity = Math.min(Math.abs(currentX) / threshold, 1);

  return (
    <div
      className="cart-item-wrapper"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={itemRef}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        className="cart-swipe-background"
        style={{
          opacity,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'red',
          color: 'white',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingRight: '20px',
          fontWeight: 'bold',
          borderRadius: '8px',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        Removed
      </div>

      <div
        className="cart-total-order"
        style={{
          transform: `translateX(${currentX}px)`,
          position: 'relative',
          zIndex: 1,
          transition: isSwiping ? 'none' : 'transform 0.3s ease'
        }}
      >
        <div className="modal-cart-item cart-items-title cart-items-item">
          <img
            className="modal-cart-image"
            src={`${url}/images/${item.image}`}
            alt={item.name}
          />
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
