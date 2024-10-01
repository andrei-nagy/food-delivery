import React from 'react';
import './ModalCart.css';

const ModalCart = ({ show, onClose, cartItems, food_list }) => {
  if (!show) return null; // Ascunde modalul dacă nu este deschis

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
        {/* Butonul de închidere */}
        <button className="close-button" onClick={onClose}>Close</button>
        <div className="cart-items">
          {renderCartItems()}
        </div>
        <hr />
        <div className="cart-total">
          <b>Total: {cartItems.reduce((acc, itemId) => {
            const item = food_list.find(i => i._id === itemId);
            return acc + (item ? item.price * cartItems[itemId] : 0);
          }, 0)} RON</b>
        </div>
      </div>
    </div>
  );
};

export default ModalCart;
