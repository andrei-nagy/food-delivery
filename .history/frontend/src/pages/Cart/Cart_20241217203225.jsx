import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from 'axios'
const Cart = () => {
  const { cartItems, token, food_list, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);

  // Stare pentru PromoCode și reducere
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0); // Valoarea reducerii
  const [promoError, setPromoError] = useState(""); // Mesaj de eroare dacă codul e invalid
  const [specialInstructions, setSpecialInstructions] = useState(""); // Stare pentru instrucțiuni speciale
  const [paymentMethod, setPaymentMethod] = useState('');
  const tableNumber = localStorage.getItem("tableNumber") ? localStorage.getItem("tableNumber") : null;

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tableNo: "",
  });
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
  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const totalAmount = getTotalCartAmount() - discount; // Totalul cu discount aplicat

  
  let orderData = {
    tableNo: tableNumber,
    userData: data,
    items: orderItems,
    amount: totalAmount,
    specialInstructions: specialInstructions
  };

  // Verificăm metoda de plată selectată
  if (paymentMethod === 'creditCard') {

    // Plată online prin Stripe
    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    console.log({
      url: url,
      orderData: orderData,
      response: response
    })

    if (response.data.success) {
      const { session_url } = response.data;
      window.location.replace(session_url);
    } else {
      alert("Error processing payment.");
    }
  } else if (paymentMethod === 'cashPOS') {

    // Plasare comanda fără Stripe (pentru Cash/POS)
    let response = await axios.post(url + "/api/order/place-cash", orderData, { headers: { token } });
    console.log({
      url: url,
      orderData: orderData,
      response: response
    })
    if (response.data.success) {
      const { orderId, session_url } = response.data;

      // toast.success("Order placed successfully!");
      navigate("/thank-you", {
        state: {
          tableNo: orderData.tableNo,
          orderId: orderId // Trimitem orderId în state
        }
      });
      // Setăm flag-ul pentru reload
      localStorage.setItem("isReloadNeeded", "true");
      toast.success("Order placed successfully!");

    } else {
      alert("Error placing order.");
    }
  } else {
    alert("Please select a payment method.");
  }
};
  const navigate = useNavigate();

  
  return (
    <div className='cart'>
                  <h2 className='order-summary'>Your order summary</h2>

      <div className="cart-items">
        <div className="cart-items-title-cart">
          <p>Qty</p>
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          {/* <p>Quantity</p> */}
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
                  <p>{cartItems[item._id]} x</p>
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{item.price} €</p>
                  {/* <p>{cartItems[item._id]}</p> */}
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
              <h3 className='payment-method-title'>Select your payment method:</h3>
              <label className='label-payment-method'>
                <input className='payment-method' type="radio" name="paymentMethod" value="creditCard" onChange={handlePaymentMethodChange} />
                Pay online by credit card
              </label>
              <label className='label-payment-method'>
                <input className='payment-method' type="radio" name="paymentMethod" value="cashPOS" onChange={handlePaymentMethodChange} />
                Pay cash / POS
              </label>
            </div>
            <form onSubmit={placeOrder} className="place-order">
          {/* <button onClick={() => navigate('/order', { state: { discount, promoCode, specialInstructions } })}>PROCEED TO CHECKOUT</button> */}
          <button type='submit'>
              {paymentMethod === 'creditCard' ? 'PROCEED TO PAYMENT' : 'PLACE ORDER'}
            </button>
            </form>
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
