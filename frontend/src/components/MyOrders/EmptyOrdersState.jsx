import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const EmptyOrdersState = ({ navigate, t }) => {
  return (
    <motion.div
      className="empty-cart-state"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="empty-cart-illustration-container">
        <motion.img
          className="empty-cart-illustration"
          src={assets.empty_cart3}
          alt="Empty orders"
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        />
        <motion.div
          className="empty-cart-decoration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </motion.div>
      </div>

      <motion.h2
        className="empty-cart-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {t("my_orders.no_unpaid_orders")}
      </motion.h2>

      <motion.p
        className="empty-cart-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {t("my_orders.no_orders_description")}
      </motion.p>

      <motion.button
        className="browse-menu-button"
        onClick={() => navigate("/category/All")}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 25px rgba(40, 167, 69, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <span>{t("my_orders.browse_menu")}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default EmptyOrdersState;