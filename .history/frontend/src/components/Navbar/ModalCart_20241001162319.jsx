// ModalCart.jsx
import React from 'react';
import './ModalCart.css'; // Stilurile pentru modal

const ModalCart = ({ show, onClose, cartItems, food_list }) => {
  if (!show) {
    return null; // Modalul nu este afișat
  }

  const renderCartItems = () => {
    return food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        return (
          <div key={item._id} className="modal-cart-item">
            <p>{item.name} x {cartItems[item._id]}</p>
            <p>{item.price * cartItems[item._id]} RON</p>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>My Cart</h2>
        <button className="close-button" onClick={onClose}>Close</button>
        <div className="cart-items">
          {renderCartItems()}
        </div>
      </div>
    </div>
  );
};

export default ModalCart;