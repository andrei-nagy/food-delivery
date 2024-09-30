import React, { useEffect, useState } from 'react'
import './PlaceOrder.css'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

const PlaceOrder = () => {

  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);


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


  useEffect(() => {
    console.log(data)
  }, [data])
  return (
    <form className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />

        <input name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone number' />
        <input name="tableNo" onChange={onChangeHandler} value={data.tableNo} type="text" placeholder='Table No' />
      </div>
      <div className="place-order-right">
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
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button >PROCEED TO PAYMENT</button>

        </div>
      </div>
    </form>
  )
}

export default PlaceOrder