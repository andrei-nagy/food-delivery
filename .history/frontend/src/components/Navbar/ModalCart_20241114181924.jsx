import React, { useContext } from 'react';
import './ModalCart.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

// const ModalCart = () => {
    const ModalCart = ({ show, onClose, cartItems, food_list, checkoutHandler }) => {

    const {url, removeFromCart, getTotalCartAmount } = useContext(StoreContext);


  if (!show) return null;

  const renderCartItems = () => {
    return food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        return (
          <div key={item._id} className='cart-total'>
            <div className="modal-cart-item cart-items-title cart-items-item">
              <img className='modal-cart-image' src={url + "/images/" + item.image} alt={item.name} />
              <p>{item.name} x {cartItems[item._id]}</p>
              <p>{item.price * cartItems[item._id]} €</p>
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
        <h2>My Cart</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="cart-items">
          {renderCartItems()}
        
        </div>
        <div className="cart-total-details">
              <b>Total</b>
              <b>{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount()} €</b>
            </div>
            <div className='checkout-section'>
                 
                    {/* Butonul Pay cu totalul final */}
                    <button className="checkout-button-myorders" onClick={checkoutHandler}>
                        Order {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount()}€
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

        <button className="checkout-button" onClick={checkoutHandler} >View Cart</button>
      </div>
    
    </div>
  );
};

export default ModalCart;
