import React, { useEffect, useState } from 'react'
import './PlaceOrder.css'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'

const PlaceOrder = () => {

  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const location = useLocation();
  const discount = location.state?.discount || 0;  // Preia discountul
  const promoCode = location.state?.promoCode || '';  // Preia promo-code-ul
  const tableNumber = localStorage.getItem("tableNumber") ? localStorage.getItem("tableNumber") : null;

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tableNo: "",

  })


  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    })
 
    const totalAmount = getTotalCartAmount() + 2 - discount;  // Totalul cu discount aplicat
    console.log('Total amount to be paid: ', totalAmount);  // Adăugat pentru debug
    console.log('Discount: ', discount);
    console.log('Total cart amount: ', getTotalCartAmount());
    
    let orderData = {
      tableNo: tableNumber,
      userData: data,
      items: orderItems,
      amount: totalAmount
    };
    console.log('orderData  ', orderData);  // Adăugat pentru debug

    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    console.log(response.data)
    if (response.data.success) {
      const { session_url } = response.data;
      window.location.replace(session_url);
    } else {
      alert("Error");
      
    }
  }

  const navigate = useNavigate();

  useEffect(() =>{
    if(!token){
      navigate("/cart")
    } else if(getTotalCartAmount() === 0){
      navigate('/cart')
    }
  }, [token])

  return (
    <div className='row'>
    <form onSubmit={placeOrder} className="place-order">
   
      <div className="place-order-left col-md-12">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />

        <input required name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone number' />
      </div>
      <div className="place-order-right col-md-12">
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
              <p>{promoCode && discount > 0 ? promoCode + " (" + discount + " RON)" : 0}</p>
            </div>
            
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2 - discount}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>

        </div>
      </div>
      
   
    </form>
    </div>
  )
}

export default PlaceOrder