import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { toast } from "react-toastify"
const Cart = () => {

  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext)

  // Stare pentru PromoCode și reducere
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);  // Valoarea reducerii
  const [promoError, setPromoError] = useState(""); // Mesaj de eroare dacă codul e invalid

  // Lista de coduri promoționale valide și valoarea lor de reducere
  const promoCodes = {
    "DISCOUNT10": 10, // 10% reducere
    "SAVE5": 5, // 5 lei reducere
    "OFF20": 20 // 20 lei reducere
  };
  // PromoCode-ul introdus de utilizator, stocat într-o variabilă
  const userEnteredPromoCode = promoCode;  // Variabila unde e stocat codul


  // Functie pentru a aplica codul promoțional
  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      // Dacă codul promoțional este valid
      setDiscount(promoCodes[promoCode]);
      setPromoError(""); // Resetează eroarea
    } else {
      // Dacă codul promoțional este invalid
      toast.error("Invalid Promo Code");
      setDiscount(0);
    }
  };
  const handlePromoCodeChange = (event) => {
    const promoCodeInput = event.target.value;  // Variabila care stochează codul promo introdus
    setPromoCode(promoCodeInput);  // Actualizează promoCode în state
  }


  const navigate = useNavigate()
  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
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
            {
              return (
                <div key={item._id}>
                  <div className="cart-items-title cart-items-item">
                    <img src={url + "/images/" + item.image} alt="" />
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <p>{cartItems[item._id]}</p>
                    <p>${item.price * cartItems[item._id]}</p>
                    <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                  </div>
                  <hr />
                </div>
              )
            }
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Sub-total</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Promo Code</p>
              <p>{userEnteredPromoCode ? userEnteredPromoCode + " (" + discount + " RON)" : 0}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2 - discount}</b>
            </div>
          </div>
          <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>

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
  )
}

export default Cart