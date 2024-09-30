import React from 'react'
import './Orders.css'
import { useState } from 'react'


const Orders = ({url}) => {

  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async() => {
    const response = await axios.get(url+"/api/order/list");
    
  }
  return (
    <div>Orders</div>
  )
}

export default Orders