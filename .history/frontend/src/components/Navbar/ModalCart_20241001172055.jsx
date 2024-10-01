import React from 'react';
import './ModalCart.css';

const ModalCart = ({ show, onClose, cartItems, food_list, checkoutHandler }) => {
  if (!show) return null;

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
    <div className="modal-overlay" onClick={onClose}> {/* Adaugăm funcționalitate pe overlay */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Oprim propagarea click-ului pe modal */}
        <h2>My Cart</h2>
        <button className="close-button" onClick={onClose}>Close</button>
        <div className="cart-items">
          {renderCartItems()}
        </div>
        <button className="checkout-button" onClick={() => { checkoutHandler; onClose;}} >Checkout</button>
      </div>
    
    </div>
  );
};

export default ModalCart;
