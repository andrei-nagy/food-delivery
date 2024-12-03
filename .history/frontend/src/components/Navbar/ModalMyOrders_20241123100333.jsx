import React, { useContext, useState, useEffect } from 'react';
import './ModalMyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';

const ModalMyOrders = ({ show, onClose }) => {
    const { url, token } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [tipPercentage, setTipPercentage] = useState(0); // Default tip is 0%
    const { t, i18n } = useTranslation();
    const tableNumber = localStorage.getItem("tableNumber");


    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng); // Schimbă limba
    };


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
            const orderStatus = order.status; // Extragem statusul comenzii
            order.items.forEach((item) => {
                if (aggregated[item._id]) {
                    aggregated[item._id].quantity += item.quantity; // Adunăm cantitățile pentru același produs
                    aggregated[item._id].total += item.price * item.quantity; // Adunăm prețurile totale
                    aggregated[item._id].status[orderStatus] = (aggregated[item._id].status[orderStatus] || 0) + item.quantity; // Folosim statusul comenzii aici
                } else {
                    aggregated[item._id] = {
                        ...item,
                        quantity: item.quantity,
                        total: item.price * item.quantity,
                        status: { [orderStatus]: item.quantity } // Setăm statusul corect
                    };
                }
            });
        });

        return Object.values(aggregated); // Returnăm produsele agregate
    };


    const getStatusText = (statusCount, total) => {
        const statusElements = Object.keys(statusCount).map((status) => {
            let statusClass = '';

            // Atribuim clasa de culoare corespunzătoare fiecărui status
            if (status === 'Delivered') {
                statusClass = 'status-green';
            } else if (status === 'Food processing') {
                statusClass = 'status-yellow';
            } else {
                statusClass = 'status-default'; // În caz că apare un alt status
            }

            return (
                <span key={status} className={statusClass}>
                    {status} ({statusCount[status]}/{total})
                </span>
            );
        });

        return <>{statusElements.reduce((prev, curr) => [prev, ' / ', curr])}</>;
    };

    const renderOrdersByCommand = () => {
        return orders.map((order, orderIndex) => (
            <div key={order._id || orderIndex} className="order-section">
                {/* Afișăm data comenzii */}
                <div className="order-date">
                    <p>{formatDateTime(order.date)}</p>
                </div>

                {/* Afișăm produsele pentru această comandă */}
                {order.items.map((item) => (
                    <div key={item._id} className="order-item">
                        <img className="order-image" src={`${url}/images/${item.image}`} alt={item.name} />
                        <div className="order-details">
                            <p className="order-name">
                                {item.name} <span className="order-quantity">x {item.quantity}</span>
                            </p>
                            <p className="order-status">
                                {getStatusText({ [order.status]: item.quantity }, item.quantity)}
                            </p>
                        </div>
                        <p className="order-price">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                ))}
            </div>
        ));
    };
    const placeOrder = async (event) => {
        event.preventDefault();

        let orderItems = [];
        orders.forEach((order) => {
            order.items.forEach((item) => {
                let existingItem = orderItems.find((i) => i._id === item._id);
                if (existingItem) {
                    // Dacă produsul există deja, actualizăm cantitatea
                    existingItem.quantity += item.quantity;
                } else {
                    // Adăugăm produsul cu toate detaliile
                    orderItems.push({ ...item, quantity: item.quantity });
                }
            });
        });

        const totalAmount = calculateTotalWithTip(); // Totalul cu discount aplicat

        let orderData = {
            tableNo: tableNumber,
            userData: null,
            items: orderItems,
            amount: totalAmount,
            specialInstructions: null
        };
        console.log(orderData)

        // Plată online prin Stripe
        let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });

        console.log(response)
        if (response.data.success) {
            const { session_url } = response.data;
            window.location.replace(session_url);
        } else {
            alert("Error processing payment.");
        }

    };

    // const renderOrderItems = () => {
    //     const aggregatedProducts = aggregateProducts();

    //     return aggregatedProducts.map((item) => (
    //         <div key={item._id} className='order-item'>
    //             <img className='order-image' src={`${url}/images/${item.image}`} alt={item.name} />
    //             <div className="order-details">
    //                 <p className="order-name">{item.name} <span className='order-quantity'>x {item.quantity}</span></p>
    //                 <p className="order-status">
    //                     {getStatusText(item.status, item.quantity)}
    //                 </p>
    //             </div>
    //             <p className="order-price">{item.total.toFixed(2)} €</p>
    //         </div>
    //     ));
    // };

    return (
        <div className="modal-overlay-myorders" onClick={onClose}>
            <div className="modal-content-myorders" onClick={(e) => e.stopPropagation()}>
                <div className="header-myorders">
                    <div className="menu-button-myorders" onClick={() => { navigate('/'); onClose(); }}>
                        <span className='back-text-button'>{t('view_menu')}</span>
                    </div>
                    <div className="close-menu-button-myorders" onClick={onClose}>
                        <span></span>
                    </div>
                </div>

                {orders.length > 0 ? (
                    <>
                        {/* <div className="order-date">
                            <p>{formatDateTime(orders[0].date)}</p>  
                        </div> */}

                        <div className="order-items-myorders">
                            {renderOrdersByCommand()}
                        </div>

                        <div className='checkout-section'>
                            <div className="tip-section">
                                <p className='fontWeight500'>{t('tip_waiter')}</p>
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
                            <button className="checkout-button-myorders" onClick={placeOrder}>
                                {t('pay')} {calculateTotalWithTip()} €
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
                    </>
                ) : (
                    <div className="no-items">
                        <p>{t('no_items_ordered')}</p>
                        <button className="view-menu-button" onClick={() => { navigate('/'); onClose(); }}>View menu</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalMyOrders;
