import React, { useContext, useState, useEffect } from 'react';
import './ModalMyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ModalMyOrders = ({ show, onClose }) => {
    const { url, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

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

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
        const formattedTime = date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }); // Format: HH:MM
        return `${formattedDate} ${formattedTime}`;
    };

    const renderOrderItems = () => {
        return orders.flatMap((order) =>
            order.items.map((item) => (
                <div key={item._id} className='order-item'>
                    <img className='order-image' src={`${url}/images/${item.image}`} alt={item.name} />
                    <div className="order-details">
                        <p className="order-name">{item.name}</p>
                        <p className="order-quantity">x {item.quantity}</p>
                        <p className="order-status">Status: {order.status}</p>
                    </div>
                    <p className="order-price">{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
            ))
        );
    };

    return (
        <div className="modal-overlay-myorders" onClick={onClose}>
            <div className="modal-content-myorders" onClick={(e) => e.stopPropagation()}>
            <div className="header-myorders">
                    <div className="menu-button" onClick={() => navigate('/')}>
                        {/* <img src={assets.menu3_png} alt="Menu Icon" /> */}
                        <span>Go back</span>
                    </div>
                    <h2>My Orders</h2>
                </div>
                {orders.length > 0 && (
                    <div className="order-date">
                        <p>{formatDateTime(orders[0].date)}</p> {/* Display date of the first order */}
                    </div>
                )}
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="order-items-myorders">
                    {renderOrderItems()}
                </div>
                <button className="checkout-button-myorders" onClick={() => alert('Proceeding to checkout...')}>Pay</button>
            </div>
        </div>
    );
};

export default ModalMyOrders;
