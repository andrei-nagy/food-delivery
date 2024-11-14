import React, { useContext, useState, useEffect } from 'react';
import './ModalMyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios';

const ModalMyOrders = ({ show, onClose }) => {
    const { url } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.post(url + "/api/order/userOrders", {}, { headers: { token } });
                setOrders(response.data.data);
            } catch (error) {
                console.error("Error fetching orders", error);
            }
        };
        
        if (show) {
            fetchOrders();
        }
    }, [show, url]);

    if (!show) return null;

    const renderOrders = () => {
        return orders.map((order) => (
            <div key={order._id} className='order-item'>
                <img className='order-image' src={`${url}/images/${order.image}`} alt={order.name} />
                <div className="order-details">
                    <p className="order-name">{order.name}</p>
                    <p className="order-amount">Quantity: {order.amount}</p>
                    <p className="order-status">Status: {order.status}</p>
                </div>
                <p className="order-price">{order.price * order.amount} €</p>
            </div>
        ));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>My Orders</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="order-items">
                    {renderOrders()}
                </div>
                <button className="checkout-button" onClick={() => alert('Proceeding to checkout...')}>Checkout</button>
            </div>
        </div>
    );
};

export default ModalMyOrders;
