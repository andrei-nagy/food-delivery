import React, { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

const CartItem = ({ item, quantity, removeFromCart, updateCartItemQuantity, url }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const threshold = 75;

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const deltaX = startX - currentX;
    if (deltaX > threshold) {
      removeFromCart(item._id);
    }
  };

  return (
    <div className='cart-total-order'>
      <div
        className="modal-cart-item cart-items-title cart-items-item"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img className='modal-cart-image' src={url + "/images/" + item.image} alt={item.name} />
        <p>{item.name}</p>
        <div className="quantity-control-order">
          <button
            onClick={() => quantity > 1 && updateCartItemQuantity(item._id, quantity - 1)}
            className="quantity-btn-order"
          >
            <FaMinus />
          </button>
          <span className="quantity-order">{quantity}</span>
          <button
            onClick={() => updateCartItemQuantity(item._id, quantity + 1)}
            className="quantity-btn-order"
          >
            <FaPlus />
          </button>
        </div>
        <p>{(item.price * quantity).toFixed(2)} €</p>
      </div>
    </div>
  );
};

export default CartItem;
