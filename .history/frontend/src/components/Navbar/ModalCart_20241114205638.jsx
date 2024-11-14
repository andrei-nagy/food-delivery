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
  }, [url]);

  if (!show) return null;

  const isCartEmpty = Object.values(cartItems).every((count) => count === 0);

  const updateCartItemQuantity = (itemId, quantity) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        // Dacă cantitatea este 0 sau mai mică, îndepărtează produsul din coș
        const newCartItems = { ...prevItems };
        delete newCartItems[itemId];
        return newCartItems;
      } else {
        // Dacă cantitatea este validă, actualizează cantitatea pentru acel item
        return { ...prevItems, [itemId]: quantity };
      }
    });
  };
  
  
  const calculateTotal = () => {
    if (!orders || orders.length === 0) return "0.00"; // Returnăm "0.00" dacă nu există comenzi
    
    return orders.reduce((total, order) => {
      // Verificăm dacă `order.items` există și este un array
      if (!order.items || !Array.isArray(order.items)) return total;
  
      // Calculăm totalul pentru elementele din `order.items`
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
                  onClick={() => cartItems[item._id] > 1 && updateQuantity(item._id, cartItems[item._id] - 1)} 
                  className="quantity-button"
                >
                  -
                </button>
                <span>{cartItems[item._id]}</span>
                <button 
                  onClick={() => updateQuantity(item._id, cartItems[item._id] + 1)} 
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
              <button className="actual-bill-button-orders" onClick={checkoutHandler}>
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
