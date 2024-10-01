import React from 'react'
import './Orders.css'
import { useState } from 'react'
import { toast } from "react-toastify"
import { useEffect } from 'react'
import axios from "axios"
import { assets } from '../../assets/assets'
 

const Orders = ({ url }) => {

  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    const response = await axios.get(url + "/api/order/list");
    if (response.data.success) {
      setOrders(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error("Error")
    }
  }


  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/order/status", {
      orderId,
      status: event.target.value
    });
    if(response.data.success){
      toast.success("Status updated successfully.")
      await fetchAllOrders();
    } 
  }


  useEffect(() => {
    fetchAllOrders();
  }, [])


  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className='order-item'>
            <img src={assets.parcel_icon} alt="" />
            <p className='order-item-orderNo'>{order.orderNumber ? "No. #" + order.orderNumber : null}</p>
            <div>
              <p className='order-item-food'>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>
           
            </div>
            <p className='order-item-name'>{order.userData.firstName + " " + order.userData.lastName}</p>
              <div className="order-item-table">
                <p>Table No: {order.tableNo}</p>
              </div>
            <p className="order-item-phone">{order.userData.phone}</p>
            <p className='order-item-items'>Items : {order.items.length}</p>
            <p className='order-item-amount'>€{order.amount}</p>
            <select className='order-item-select' onChange={(event) => statusHandler(event, order._id)} value={order.status}>
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>

          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders