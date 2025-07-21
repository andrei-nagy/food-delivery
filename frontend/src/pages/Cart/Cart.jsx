import React, { useContext, useState, useEffect, useRef } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaEdit, FaTrash } from "react-icons/fa";

const Cart = () => {
  const {
    cartItems,
    token,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    updateCartItemQuantity,
    removeItemCompletely,
  } = useContext(StoreContext);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState(""); // <- adăugat state pentru eroare
  const [editingItemId, setEditingItemId] = useState(null);
  const controlRef = useRef(null);
  const [showFloating, setShowFloating] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber") || null;
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tableNo: "",
  });

  const promoCodes = {
    DISCOUNT10: 10,
    SAVE5: 5,
    OFF20: 20,
  };

  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode]);
    } else {
      toast.error("Invalid Promo Code");
      setDiscount(0);
    }
  };

  const handlePromoCodeChange = (event) => {
    setPromoCode(event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    if (paymentError) setPaymentError(""); // șterge eroarea când alegi ceva
  };

  const placeOrder = async (event) => {
    console.log("Token:", token)
    event.preventDefault();

    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      // scroll la secțiunea payment method:
      const paymentTitle = document.querySelector(".payment-method-title");
      if (paymentTitle) {
        paymentTitle.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    } else {
      setPaymentError("");
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    const totalAmount = getTotalCartAmount() - discount;

    let orderData = {
      tableNo: tableNumber,
      userData: data,
      items: orderItems,
      amount: totalAmount,
      specialInstructions: specialInstructions,
    };

    if (paymentMethod === "creditCard") {
      let response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });
      if (response.data.success) {
        window.location.replace(response.data.session_url);
      } else {
        alert("Error processing payment.");
      }
    } else if (paymentMethod === "cashPOS") {
      let response = await axios.post(
        url + "/api/order/place-cash",
        orderData,
        { headers: { token } }
      );
      if (response.data.success) {
        navigate("/thank-you", {
          state: {
            tableNo: orderData.tableNo,
            orderId: response.data.orderId,
          },
        });
        localStorage.setItem("isReloadNeeded", "true");
      } else {
          console.log('Response from place-cash:', response.data);

        alert("Error placing order.");
      }
    }
  };

  // Click în afara quantity-control
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlRef.current && !controlRef.current.contains(event.target)) {
        setEditingItemId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const threshold = document.body.offsetHeight - 150; // prag la 150px de finalul paginii

      if (scrollPosition > threshold) {
        setShowFloating(true);
      } else {
        setShowFloating(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="cart">
        <h2 className="order-summary">Your order summary</h2>
        <div className="cart-summary-list">
          {food_list.map((item) => {
            const quantity = cartItems[item._id];

            if (quantity > 0) {
              return (
                <div
                  className={`cart-summary-item ${
                    editingItemId === item._id ? "active-blur" : ""
                  }`}
                  key={item._id}
                >
                  <img
                    src={url + "/images/" + item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />

                  <div className="cart-item-info">
                    <p className="cart-item-name">
                      {item.name}{" "}
                      <span className="cart-item-qty">x{quantity}</span>
                    </p>{" "}
                    <p className="cart-item-total">
                      {(item.price * quantity).toFixed(2)} €
                    </p>
                  </div>

                  <div
                    className="cart-item-buttons"
                    style={{ position: "relative" }}
                  >
                    <div
                      className="cart-qty-badge"
                      onClick={() => {
                        setEditingItemId(item._id);
                        // Auto-hide după 4 secunde
                        setTimeout(() => {
                          setEditingItemId(null);
                        }, 4000);
                      }}
                      title="Edit quantity"
                    >
                      {quantity}
                    </div>

                    <AnimatePresence>
                      {editingItemId === item._id && (
                        <>
                          <div
                            className="quantity-overlay"
                            onClick={() => setEditingItemId(null)}
                          />
                          <motion.div
                            ref={controlRef}
                            className="quantity-modal"
                            initial={{
                              opacity: 0,
                              scale: 0.95,
                              x: "-50%",
                              y: "-50%",
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              x: "-50%",
                              y: "-50%",
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.95,
                              x: "-50%",
                              y: "-50%",
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <button
                              onClick={() =>
                                updateCartItemQuantity(item._id, quantity - 1)
                              }
                              className="quantity-btn-order"
                            >
                              <FaMinus />
                            </button>
                            <span className="quantity-order">{quantity}</span>
                            <button
                              onClick={() =>
                                updateCartItemQuantity(item._id, quantity + 1)
                              }
                              className="quantity-btn-order"
                            >
                              <FaPlus />
                            </button>
                            <button
                              className="remove-item-btn-inline"
                              onClick={() => removeItemCompletely(item._id)}
                              title="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        <hr></hr>
        <div className="add-more-wrapper">
          <button
            className="add-more-products"
            onClick={() => navigate("/category/All")}
          >
            Add more products +
          </button>
        </div>

        <div className="special-instructions">
          <h2 className="special-instructions">Special instructions</h2>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Enter any special instructions about your order"
            rows={4}
          />
        </div>

        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Total</h2>
            <div>
              <div className="cart-total-details">
                <p>Sub-total</p>
                <p>{getTotalCartAmount()} €</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Promo Code</p>
                <p>
                  {promoCode && discount > 0
                    ? `${promoCode} (${discount} €)`
                    : 0}
                </p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>
                  {getTotalCartAmount() === 0
                    ? 0
                    : getTotalCartAmount() - discount}{" "}
                  €
                </b>
              </div>
            </div>

            <h3 className="payment-method-title">
              Select your payment method:
            </h3>
            {paymentError && (
              <p className="payment-error-message">{paymentError}</p>
            )}

            <label className="label-payment-method">
              <input
                className="payment-method"
                type="radio"
                name="paymentMethod"
                value="creditCard"
                onChange={handlePaymentMethodChange}
              />
              Pay online by credit card
            </label>
            <label className="label-payment-method">
              <input
                className="payment-method"
                type="radio"
                name="paymentMethod"
                value="cashPOS"
                onChange={handlePaymentMethodChange}
              />
              Pay cash / POS
            </label>

            <form
              onSubmit={placeOrder}
              className={`place-order ${showFloating ? "hide" : "show"}`}
            >
              <button type="submit">
                {paymentMethod === "creditCard"
                  ? "PROCEED TO PAYMENT"
                  : "PLACE ORDER"}
              </button>
            </form>
          </div>

          <div className="cart-promocode">
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input
                type="text"
                value={promoCode}
                onChange={handlePromoCodeChange}
                placeholder="Enter promo code"
              />
              <button
                className="promo-code-button"
                type="button"
                onClick={applyPromoCode}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="floating-checkout" onClick={placeOrder}>
        <div className="floating-checkout-left">
          <span className="floating-checkout-count">
            {Object.values(cartItems).reduce((a, b) => a + b, 0)}
          </span>{" "}
          <span className="floating-checkout-cta">
            {paymentMethod === "creditCard"
              ? "Proceed to Payment"
              : "Place Order"}
          </span>
          <span className="floating-checkout-total">
            {(getTotalCartAmount() - discount).toFixed(2)} €
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
