import React, { useContext, useEffect, useState } from 'react';
import './ModalCart.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const ModalCart = ({ show, onClose, cartItems, food_list, checkoutHandler }) => {
  const { url, removeFromCart, getTotalCartAmount, token } = useContext(StoreContext);
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
  })

  if (!show) return null;


    // Calculează suma totală a comenzii
    const calculateTotal = () => {
      return orders.reduce((total, order) => {
          return total + order.items.reduce((itemTotal, item) => {
              return itemTotal + (item.price * item.quantity);
          }, 0);
      }, 0).toFixed(2); // Returnează suma totală cu două zecimale
  };

  const renderCartItems = () => {
    return food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        return (
          <div key={item._id} className='cart-total'>
            <div className="modal-cart-item cart-items-title cart-items-item">
              <img className='modal-cart-image' src={url + "/images/" + item.image} alt={item.name} />
              <p>{item.name} x {cartItems[item._id]}</p>
              <p>{(item.price * cartItems[item._id]).toFixed(2)} €</p> {/* Adăugat toFixed(2) */}
              <img onClick={() => removeFromCart(item._id)} src={assets.remove_icon_red} className='remove-order-button' alt="Remove" />
            </div>
          </div>
        );
      }
      return null; // Evităm returnarea elementelor nevalide
    });
  };

  return (
    <div className="modal-overlay-order" onClick={onClose}> {/* Adaugăm funcționalitate pe overlay */}
      <div className="modal-content-order" onClick={(e) => e.stopPropagation()}> {/* Oprim propagarea click-ului pe modal */}
        <div className="header-orders">
          <div className="menu-button-myorders" onClick={() => { navigate('/'); onClose(); }}>
            <span className='back-text-button'>Menu</span>

          </div>
          <div className="view-bill-orders" >
            <span>Actual bill:</span>

          </div>
          <div className="close-menu-button-myorders" onClick={onClose}>
            <span></span>

          </div>

          {/* <h2>My Orders</h2> */}
        </div>
        <div className="cart-items">
          {renderCartItems()}
        </div>
        <div className="cart-total-details">
          <b>Total</b>
          <b>{getTotalCartAmount() === 0 ? '0.00' : getTotalCartAmount().toFixed(2)} €</b> {/* Aplica toFixed(2) aici */}
        </div>
        <div className='checkout-section-orders'>
          {/* Butonul Pay cu totalul final */}
          <button className="checkout-button-orders" onClick={checkoutHandler}>
            Order {getTotalCartAmount() === 0 ? '0.00' : getTotalCartAmount().toFixed(2)}€
          </button>
          <button className="actual-bill-button-orders" onClick={checkoutHandler}>
            Actual bill:  {parseFloat(calculateTotal())}€
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
      </div>
    </div>
  );
};

export default ModalCart;
