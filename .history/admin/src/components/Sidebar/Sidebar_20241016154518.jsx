import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
const Sidebar = () => {
  return (
    <div className="sidebar">
        <div className="sidebar-options">
            <NavLink to="/add" className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Add Items</p>
            </NavLink>
            <NavLink to="/addcategory" className="sidebar-option">
                <img src={assets.add_icon} alt="" />
                <p>Add Category</p>
            </NavLink>
            <NavLink to="/list" className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>List Items</p>
            </NavLink>
            <NavLink to="/listcategory" className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>List Categories</p>
            </NavLink>
            <NavLink to="/orders" className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Orders</p>
            </NavLink>
            <NavLink to="/listwaiterrequests" className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Waiter Orders</p>
            </NavLink>
            {/* <NavLink to="/personalize" className="sidebar-option">
                <img src={assets.order_icon} alt="" />
                <p>Personalization</p>
            </NavLink> */}
        </div>
    </div>
  )
}

export default Sidebar