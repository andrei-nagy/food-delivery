import React, { useContext, useState, useEffect } from 'react';
import './ModalMyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const ModalMyOrders = ({ show, onClose }) => {
    const { url, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [tipPercentage, setTipPercentage] = useState(0); // Default tip is 0%
    
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

    // Calculează suma totală a comenzii
    const calculateTotal = () => {
        return orders.reduce((total, order) => {
            return total + order.items.reduce((itemTotal, item) => {
                return itemTotal + (item.price * item.quantity);
            }, 0);
        }, 0).toFixed(2); // Returnează suma totală cu două zecimale
    };

    // Calculează totalul cu bacșiș
    const calculateTotalWithTip = () => {
        const total = parseFloat(calculateTotal());
        const tip = total * (tipPercentage / 100);
        return (total + tip).toFixed(2);
    };

    // Agregarea produselor în funcție de ID-ul lor
    const aggregateProducts = () => {
        const aggregated = {};

        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (aggregated[item._id]) {
                    aggregated[item._id].quantity += item.quantity; // Adunăm cantitățile pentru același produs
                    aggregated[item._id].total += item.price * item.quantity; // Adunăm prețurile totale
                    aggregated[item._id].status[item.status] = (aggregated[item._id].status[item.status] || 0) + 1; // Contorizăm statusurile
                } else {
                    aggregated[item._id] = { 
                        ...item, 
                        quantity: item.quantity, 
                        total: item.price * item.quantity,
                        status: { [item.status]: item.quantity } // Înregistrăm statusul pentru fiecare produs
                    };
                }
            });
        });

        return Object.values(aggregated); // Returnează produsele agregate
    };

    // Functie pentru a calcula statusul
    const getStatusText = (statusCount, total) => {
        console.log(statusCount);
        console.log(total)
        const deliveredCount = statusCount['Delivered'] || 0;
        const processingCount = statusCount['Food processing'] || 0;

        if (deliveredCount === total) {
            return <span className="status-green">Delivered ({deliveredCount}/{total})</span>;
        } else if (processingCount === total) {
            return <span className="status-yellow">Food processing ({processingCount}/{total})</span>;
        } else {
            return (
                <>
                    <span className="status-green">Delivered ({deliveredCount}/{total})</span>
                    {' / '}
                    <span className="status-yellow">Food processing ({processingCount}/{total})</span>
                </>
            );
        }
    };

    const renderOrderItems = () => {
        const aggregatedProducts = aggregateProducts();
        console.log(aggregatedProducts)
        return aggregatedProducts.map((item) => (
            <div key={item._id} className='order-item'>
                <img className='order-image' src={`${url}/images/${item.image}`} alt={item.name} />
                <div className="order-details">
                    <p className="order-name">{item.name} <span className='order-quantity'>x {item.quantity}</span></p>
                    <p className="order-status">
                        {getStatusText(item.status, item.quantity)}
                    </p>
                </div>
                <p className="order-price">{item.total.toFixed(2)} €</p>
            </div>
        ));
    };

    return (
        <div className="modal-overlay-myorders" onClick={onClose}>
            <div className="modal-content-myorders" onClick={(e) => e.stopPropagation()}>
                <div className="header-myorders">
                    <div className="menu-button-myorders" onClick={() => { navigate('/'); onClose(); }}>
                        <span className='back-text-button'>Menu</span>
                    </div>
                    <div className="close-menu-button-myorders" onClick={onClose}>
                        <span></span>
                    </div>
                </div>
                {orders.length > 0 && (
                    <div className="order-date">
                        <p>{formatDateTime(orders[0].date)}</p> {/* Display date of the first order */}
                    </div>
                )}

                <div className="order-items-myorders">
                    {renderOrderItems()}
                </div>

                <div className='checkout-section'>
                    <div className="tip-section">
                        <p className='fontWeight500'>Would you like to tip your waiter?</p>
                        <div className="tip-options">
                            {[0, 5, 10, 15, 20].map((tip) => (
                                <button
                                    key={tip}
                                    className={`tip-option fontWeight500 ${tip === tipPercentage ? 'selected' : ''}`}
                                    onClick={() => setTipPercentage(tip)}
                                >
                                    {tip}%
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="checkout-button-myorders" onClick={() => alert('Proceeding to checkout...')}>
                        Pay {calculateTotalWithTip()} €
                    </button>
                    <div className="payment-options">
                        <img src={assets.visa_logo} alt="Visa" className="payment-option" />
                        <img src={assets.mastercard_logo} alt="Mastercard" className="payment-option" />
                        <img src={assets.apple_pay} alt="Apple Pay" className="payment-option" />
                        <img src={assets.google_pay} alt="Google Pay" className="payment-option" />
                    </div>
                    <p className="payment-security-note">
                        Secured payments powered by
                        <img src={assets.stripe_logo} alt="Stripe Logo" className="stripe-logo" />
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModalMyOrders;
