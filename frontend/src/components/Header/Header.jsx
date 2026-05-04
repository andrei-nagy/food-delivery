import React, { useEffect, useState, useRef } from "react";
import "./Header.css";
import { assets } from "../../assets/assets";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { FaReceipt, FaTimes } from "react-icons/fa";

const Header = () => {
  const tableNumber = localStorage.getItem("tableNumber");
  const token = localStorage.getItem("token");

  const {
    url,
    userBlocked,
    billRequested,
    resetBillRequest,
    getTimeSinceBillRequest
  } = useContext(StoreContext);

  const images = [
    assets.header_img1,
    assets.header_img2,
    assets.header_img3,
    assets.header_img4,
  ];

  const [backgroundImage, setBackgroundImage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [tokenExpiry, setTokenExpiry] = useState(null);

  const { t } = useTranslation();

  const initialRenderRef = useRef(true);

  // ─────────────────────────────────────────────
  // FETCH TOKEN EXPIRY
  // ─────────────────────────────────────────────
  const fetchTokenExpiry = async () => {
    if (!token) return;

    try {
      const response = await axios.get(url + "/api/user/list", {
        headers: { token },
      });

      if (response.data.success && Array.isArray(response.data.users)) {
        const currentUser = response.data.users.find(
          (user) =>
            user.tableNumber &&
            user.tableNumber.toString() === tableNumber &&
            user.isActive === true &&
            user.tokenExpiry
        );

        if (currentUser?.tokenExpiry) {
          setTokenExpiry(new Date(currentUser.tokenExpiry));
        } else {
          setTokenExpiry(null);
        }
      }
    } catch {
      setTokenExpiry(null);
    }
  };

  // ─────────────────────────────────────────────
  // CALCUL TIME
  // ─────────────────────────────────────────────
  const calculateAndSetTime = (expiryDate = tokenExpiry) => {
    if (!expiryDate) {
      setTimeLeft("");
      return;
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;

    if (diff <= 0) {
      setTimeLeft(t("time_expired"));
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m`);
    } else if (minutes > 0) {
      setTimeLeft(`${minutes}m`);
    } else {
      setTimeLeft("0m");
    }
  };

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  useEffect(() => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);

    if (token) fetchTokenExpiry();
  }, [token, tableNumber, url]);

  // ─────────────────────────────────────────────
  // TIMER UPDATE
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!tokenExpiry) {
      setTimeLeft("");
      return;
    }

    const update = () => calculateAndSetTime();

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  // ─────────────────────────────────────────────
  // PREVENT FIRST RENDER SIDE EFFECT
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
    }
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* SESSION EXPIRED */}
        {userBlocked && (
          <div className="repeat-order-bill-warning">
            <div className="repeat-order-bill-warning-content">
              <span className="repeat-order-bill-warning-icon">⏰</span>
              <div className="repeat-order-bill-warning-text">
                <strong>{t("session_expired")}</strong>
                <span>{t("session.expired_message")}</span>
              </div>
            </div>
          </div>
        )}

        {/* BILL REQUESTED */}
        {billRequested && (
          <motion.div
            className="header-bill-requested-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="header-bill-content">
              <div className="header-bill-icon-text">
                <FaReceipt className="header-bill-icon" />
                <div className="header-bill-text">
                  <span className="header-bill-title">
                    {t("my_orders.bill_request_sent")}
                  </span>
                  <span className="header-bill-subtitle">
                    {t("my_orders.waiter_notified", {
                      time: getTimeSinceBillRequest(),
                    })}
                  </span>
                </div>
              </div>
              <button
                className="header-bill-cancel-btn"
                onClick={resetBillRequest}
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}

        {/* HEADER */}
        <div
          className="header header-radius"
          style={{
            background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url(${backgroundImage}) center/cover no-repeat`,
          }}
        >
          <div className="header-contents">
            <h2>{t("order_your_food")}</h2>
            <p>{t("your_food_description")}</p>

            <div className="header-buttons">
              <button className="header-table-button">
                <div className="header-main-line">
                  <span className="header-table-text">
                    {t("table")} {tableNumber}
                  </span>
{/* 
                  {timeLeft && !userBlocked && timeLeft !== t("time_expired") && (
                    <span className="header-timer-text">
                      • {timeLeft} ⏳
                    </span>
                  )}

                  {(userBlocked || timeLeft === t("time_expired")) && (
                    <span className="header-timer-text expired">
                      • {t("time_expired")} ⏰
                    </span>
                  )} */}
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Header;