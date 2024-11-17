import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);

  // Stare pentru PromoCode și reducere
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0); // Valoarea reducerii
  const [promoError, setPromoError] = useState(""); // Mesaj de eroare dacă codul e invalid
  const [specialInstructions, setSpecialInstructions] = useState(""); // Stare pentru instrucțiuni speciale
  const [paymentMethod, setPaymentMethod] = useState('');

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };


  // Lista de coduri promoționale valide și valoarea lor de reducere
  const promoCodes = {
    "DISCOUNT10": 10, // 10% reducere
    "SAVE5": 5, // 5 lei reducere
    "OFF20": 20 // 20 lei reducere
  };

  const userEnteredPromoCode = promoCode;

  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode]);
      setPromoError(""); // Resetează eroarea
    } else {
      toast.error("Invalid Promo Code");
      setDiscount(0);
    }
  };

  const handlePromoCodeChange = (event) => {
    const promoCodeInput = event.target.value;
    setPromoCode(promoCodeInput);
  };

  const navigate = useNavigate();

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title-cart">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title-cart cart-items-item">
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{item.price} €</p>
                  <p>{cartItems[item._id]}</p>
                  <p>{item.price * cartItems[item._id]} €</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />
              </div>

              
            );
          }
          return null;
        })}
      </div>
   
          {/* Textarea pentru instrucțiuni speciale */}
          <div className="special-instructions">
        
            <h2 className='special-instructions'>Special instructions</h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Enter any special instructions about your order"
              rows={4}
            />
          </div>
        
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Sub-total</p>
              <p>{getTotalCartAmount()} €</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Promo Code</p>
              <p>{userEnteredPromoCode && discount > 0 ? userEnteredPromoCode + " (" + discount + " €)" : 0}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() - discount} €</b>
            </div>
          </div>
          <div>
              <h3>Select your payment method:</h3>
              <label className='label-payment-method'>
                <input className='payment-method' type="radio" name="paymentMethod" value="creditCard" onChange={handlePaymentMethodChange} />
                Pay online by credit card
              </label>
              <label className='label-payment-method'>
                <input className='payment-method' type="radio" name="paymentMethod" value="cashPOS" onChange={handlePaymentMethodChange} />
                Pay cash / POS
              </label>
            </div>
            
          {/* <button onClick={() => navigate('/order', { state: { discount, promoCode, specialInstructions } })}>PROCEED TO CHECKOUT</button> */}
          <button type='submit'>
              {paymentMethod === 'creditCard' ? 'PROCEED TO PAYMENT' : 'PLACE ORDER'}
            </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
              />
              <button className='promo-code-button' type="button" onClick={applyPromoCode}>Apply</button>
            </div>
          </div>

      
        </div>
        
      </div>
    </div>
  );
};

export default Cart;
