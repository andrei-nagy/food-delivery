import React, { useContext, useState, useEffect } from "react";
import "./ModalMyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaTimes } from "react-icons/fa";

const ModalMyOrders = ({ show, onClose }) => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [tipPercentage, setTipPercentage] = useState(0);
  const { t } = useTranslation();
  const tableNumber = localStorage.getItem("tableNumber");
  const navigate = useNavigate();

  const [data, setData] = useState({ tableNo: "" });

  // ── Fetch unpaid orders on open ──────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.post(
          url + "/api/order/userOrders",
          {},
          { headers: { token } }
        );
        const unpaidOrders = response.data.data.filter((order) => !order.payment);
        setOrders(unpaidOrders);
        setData((d) => ({ ...d, tableNo: tableNumber }));
      } catch (error) {
        console.error("Error fetching orders", error);
      }
    };

    if (show) fetchOrders();
  }, [show, url, tableNumber]);

  if (!show) return null;

  // ── Helpers ──────────────────────────────────────────────
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB");
    const formattedTime = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${formattedDate} · ${formattedTime}`;
  };

  const calculateTotal = () =>
    orders
      .reduce((total, order) =>
        total + order.items.reduce((itemTotal, item) => itemTotal + item.price * item.quantity, 0), 0)
      .toFixed(2);

  const calculateTotalWithTip = () => {
    const total = parseFloat(calculateTotal());
    const tip = total * (tipPercentage / 100);
    return (total + tip).toFixed(2);
  };

  const orderIds = orders.map((order) => order._id);

  const getStatusText = (statusCount, total) => {
    const statusElements = Object.keys(statusCount).map((status) => {
      let statusClass = "status-default";
      if (status === "Delivered")        statusClass = "status-green";
      else if (status === "Food processing") statusClass = "status-yellow";

      return (
        <span key={status} className={statusClass}>
          {status} ({statusCount[status]}/{total})
        </span>
      );
    });
    return <>{statusElements.reduce((prev, curr) => [prev, " / ", curr])}</>;
  };

  // ── Render order rows by command ─────────────────────────
  const renderOrdersByCommand = () =>
    orders.map((order, orderIndex) => (
      <div key={order._id || `order-${orderIndex}`} className="order-section">
        <div className="order-date">
          <p>{formatDateTime(order.date)}</p>
        </div>
        {order.items.map((item, itemIndex) => (
          <div key={item._id || `item-${orderIndex}-${itemIndex}`} className="order-item">
            <img
              className="order-image"
              src={`${url}/images/${item.image}`}
              alt={item.name}
            />
            <div className="order-details">
              <p className="order-name">
                {item.name}{" "}
                <span className="order-quantity">× {item.quantity}</span>
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

  // ── Place order ──────────────────────────────────────────
  const placeOrder = async (event) => {
    event.preventDefault();

    try {
      let orderItems = [];
      orders.forEach((order) => {
        order.items.forEach((item) => {
          let existingItem = orderItems.find((i) => i._id === item._id);
          if (existingItem) existingItem.quantity += item.quantity;
          else orderItems.push({ ...item, quantity: item.quantity });
        });
      });

      const totalAmount = calculateTotalWithTip();

      let orderData = {
        tableNo: tableNumber,
        userData: data,
        items: orderItems,
        amount: totalAmount,
        specialInstructions: null,
        orders: orderIds,
      };

      let response = await axios.post(url + "/api/order/pay-order", orderData, {
        headers: { token },
      });

      if (response.data.success) {
        window.location.replace(response.data.session_url);
      } else {
        alert("Error processing payment.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error processing payment. Check console for details.");
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="modal-overlay-myorders" onClick={onClose}>
      <div className="modal-content-myorders" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="header-myorders">
          <div className="menu-button-myorders" onClick={onClose}>
            <FaArrowLeft />
          </div>
          <h2 className="modal-title">Orders</h2>
          <div className="close-menu-button-myorders" onClick={onClose}>
            <FaTimes />
          </div>
        </div>

        {orders.length > 0 ? (
          <>
            {/* ── Scrollable items ── */}
            <div className="order-items-myorders">
              {renderOrdersByCommand()}
            </div>

            {/* ── Checkout ── */}
            <div className="checkout-section">
              {/* Running total */}
              <div className="order-total-line">
                <span className="order-total-label">Total</span>
                <span className="order-total-amount">{calculateTotalWithTip()} €</span>
              </div>

              {/* Tip */}
              <div className="tip-section">
                <span className="fontWeight500">{t("tip_waiter")}</span>
                <div className="tip-options">
                  {[0, 5, 10, 15, 20].map((tip) => (
                    <button
                      key={tip}
                      className={`tip-option fontWeight500 ${tip === tipPercentage ? "selected" : ""}`}
                      onClick={() => setTipPercentage(tip)}
                    >
                      {tip}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay CTA */}
              <button className="checkout-button-myorders" onClick={placeOrder}>
                {t("pay")} {calculateTotalWithTip()} €
              </button>

              {/* Payment logos */}
              <div className="payment-options">
                <img src={assets.visa_logo}       alt="Visa"        className="payment-option" />
                <img src={assets.mastercard_logo}  alt="Mastercard"  className="payment-option" />
                <img src={assets.apple_pay}        alt="Apple Pay"   className="payment-option" />
                <img src={assets.google_pay}       alt="Google Pay"  className="payment-option" />
              </div>
              <p className="payment-security-note">
                Secured payments powered by
                <img src={assets.stripe_logo} alt="Stripe Logo" className="stripe-logo" />
              </p>
            </div>
          </>
        ) : (
          <div className="no-items">
            <p>{t("no_items_ordered")}</p>
            <button
              className="view-menu-button"
              onClick={() => { navigate("/category/All"); onClose(); }}
            >
              View menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalMyOrders;