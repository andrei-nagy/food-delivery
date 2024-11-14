import React, { useContext, useState, useEffect } from 'react';
import './ModalMyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios';

const ModalMyOrders = ({ show, onClose }) => {
    const { url, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [orderDate, setOrderDate] = useState(null); // Adăugăm o stare pentru data generală a comenzii

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.post(url + "/api/order/userOrders", {}, { headers: { token } });
                setOrders(response.data.data);
                
                // Setăm data primei comenzi dacă există
                if (response.data.data.length > 0) {
                    setOrderDate(response.data.data[0].date);
                }
            } catch (error) {
                console.error("Error fetching orders", error);
            }
        };
        
        if (show) {
            fetchOrders();
        }
    }, [show, url, token]);

    if (!show) return null;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
        const formattedTime = date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }); // Format: HH:MM
        return `${formattedDate} ${formattedTime}`;
    };

    const renderOrders = () => {
        return orders.map((order) => (
            <div key={order._id} className='order-item'>
                {/* <img className='order-image' src={`${url}/images/${order.image}`} alt={order.name} /> */}
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
                {orderDate && (
                    <div className="order-date">
                        <p>{formatDateTime(orderDate)}</p> {/* Afișăm data generală a comenzii */}
                    </div>
                )}
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
