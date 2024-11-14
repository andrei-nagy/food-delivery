import React, { useContext, useEffect, useState } from 'react';
import './ModalCart.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModalCart = ({ show, onClose, cartItems, food_list, checkoutHandler }) => {
  const { url, removeFromCart, getTotalCartAmount, token, updateCartItemQuantity } = useContext(StoreContext); // Folosim updateCartItemQuantity
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.post(url + "/api/order/userOrders", {}, { headers: { token } });
      setOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  useEffect(() => {
    try {
      fetchOrders();
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  }, [url]);

  if (!show) return null;

  const isCartEmpty = Object.values(cartItems).every((count) => count === 0);

  const calculateTotal = () => {
    if (!orders || orders.length === 0) return "0.00";
    
    return orders.reduce((total, order) => {
      if (!order.items || !Array.isArray(order.items)) return total;
  
      const orderTotal = order.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
  
      return total + orderTotal;
    }, 0).toFixed(2);
  };

  const renderCartItems = () => {
    return food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        return (
          <div key={item._id} className='cart-total'>
            <div className="modal-cart-item cart-items-title cart-items-item">
              <img className='modal-cart-image' src={url + "/images/" + item.image} alt={item.name} />
              <p>{item.name}</p>
              <div className="quantity-controls">
                <button 
                  onClick={() => cartItems[item._id] > 1 && updateCartItemQuantity(item._id, cartItems[item._id] - 1)} 
                  className="quantity-button"
                >
                  -
                </button>
                <span>{cartItems[item._id]}</span>
                <button 
                  onClick={() => updateCartItemQuantity(item._id, cartItems[item._id] + 1)} 
                  className="quantity-button"
                >
                  +
                </button>
              </div>
              <p>{(item.price * cartItems[item._id]).toFixed(2)} €</p>
            </div>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="modal-overlay-order" onClick={onClose}>
      <div className="modal-content-order" onClick={(e) => e.stopPropagation()}>
        <div className="header-orders">
          {isCartEmpty ? (
            <div className="menu-button-myorders" onClick={() => onClose()}>
              <span className='back-text-button'>Go back</span>
            </div>
          ) : (
            <div className="menu-button-myorders" onClick={() => { navigate('/'); onClose(); }}>
              <span className='back-text-button'>Menu</span>
            </div>
          )}
          <div className="close-menu-button-myorders" onClick={onClose}>
            <span></span>
          </div>
        </div>

        {isCartEmpty ? (
          <div className="empty-cart-message">
            <p>No items added</p>
            <button className="view-menu-button" onClick={() => { navigate('/'); onClose(); }}>
              View Menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {renderCartItems()}
            </div>
            <div className="cart-total-details">
              <b>Total</b>
              <b>{getTotalCartAmount() === 0 ? '0.00' : getTotalCartAmount().toFixed(2)} €</b>
            </div>
            <div className='checkout-section-orders'>
              <button className="checkout-button-orders" onClick={checkoutHandler}>
                Order {getTotalCartAmount() === 0 ? '0.00' : getTotalCartAmount().toFixed(2)}€
              </button>
              <button className="actual-bill-button-orders" onClick={checkoutHandler} disabled="true">
                Actual bill: {parseFloat(calculateTotal())}€
              </button>
              <div className="payment-options">
                <img src={assets.visa_logo} alt="Visa" className="payment-option" />
                <img src={assets.mastercard_logo} alt="Mastercard" className="payment-option" />
                <img src={assets.apple_pay} alt="Apple Pay" className="payment-option" />
                <img src={assets.google_pay} alt="Google Pay" className="payment-option" />
              </div>
              <p className="payment-security-note">
                Secured payments powered by
                <img src={assets.stripe_logo} alt="Stripe Logo" className="stripe-logo" />
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalCart;
