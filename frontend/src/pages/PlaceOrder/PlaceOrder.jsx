import React, { useEffect, useState } from 'react';
import './PlaceOrder.css';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();

  const discount             = location.state?.discount             || 0;
  const promoCode            = location.state?.promoCode            || '';
  const tableNumber          = localStorage.getItem("tableNumber")  || null;
  const specialInstructions  = location.state?.specialInstructions  || '';

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tableNo: "",
  });

  const [paymentMethod, setPaymentMethod] = useState('');

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(d => ({ ...d, [name]: value }));
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    const totalAmount = getTotalCartAmount() - discount;

    const orderData = {
      tableNo: tableNumber,
      userData: data,
      items: orderItems,
      amount: totalAmount,
      specialInstructions,
    };

    if (paymentMethod === 'creditCard') {
      const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        window.location.replace(response.data.session_url);
      } else {
        alert("Error processing payment.");
      }

    } else if (paymentMethod === 'cashPOS') {
      const response = await axios.post(url + "/api/order/place-cash", orderData, { headers: { token } });

      if (response.data.success) {
        const shortId = String(response.data.orderId || "").slice(-6).toUpperCase();

        localStorage.setItem("isReloadNeeded", "true");

        // Trimite event pentru toast-ul de confirmare (același mecanism ca la livrare)
        window.dispatchEvent(new CustomEvent("order:placed", {
          detail: { shortId }
        }));

        // Navighează pe home după un scurt delay ca toastul să fie vizibil
        setTimeout(() => navigate("/"), 400);

      } else {
        alert("Error placing order.");
      }

    } else {
      alert("Please select a payment method.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <div className='row'>
      <form onSubmit={placeOrder} className="place-order">
        <div className="place-order-left col-md-12">
          <p className="title">Delivery Information</p>
          <div className="multi-fields">
            <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
            <input required name="lastName"  onChange={onChangeHandler} value={data.lastName}  type="text" placeholder='Last Name' />
          </div>
          <input required name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
          <input required name="phone" onChange={onChangeHandler} value={data.phone} type="text"  placeholder='Phone number' />
        </div>

        <div className="place-order-right col-md-12">
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
                <p>{promoCode && discount > 0 ? `${promoCode} (${discount} €)` : 0}</p>
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

            <button type='submit'>
              {paymentMethod === 'creditCard' ? 'PROCEED TO PAYMENT' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;