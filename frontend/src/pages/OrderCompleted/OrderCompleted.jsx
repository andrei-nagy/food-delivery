import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import { generateReceiptPDF } from "./GenerateReceiptPDF";
import "./OrderCompleted.css";

const OrderCompleted = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { url, clearCart } = useContext(StoreContext);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const [orderDetails,     setOrderDetails]     = useState(null);
  const [isLoading,        setIsLoading]         = useState(true);
  const [isBlockedSession, setIsBlockedSession]  = useState(false);
  const [showConfirmModal, setShowConfirmModal]  = useState(false);

  // receipt
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone,  setDownloadDone]  = useState(false);
  const [receiptError,  setReceiptError]  = useState("");

  // ── traduceri ──────────────────────────────────────────────────
  const [tx, setTx] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  const searchParams   = new URLSearchParams(location.search);
  const orderId        = searchParams.get("orderId") || location.state?.orderId;
  const autoRedirected =
    searchParams.get("autoRedirected") === "true" ||
    location.state?.autoRedirected ||
    false;

  const tableNumber = localStorage.getItem("tableNumber") || "";

  // ── traducere texte UI ─────────────────────────────────────────
  const translateUI = useCallback(async (lang) => {
    if (lang === "ro") { setTx({}); return; }
    setIsTranslating(true);
    try {
      const ro = [
        // loading / eroare
        "Se încarcă detaliile comenzii...",
        "Comandă negăsită",
        "Nu am putut găsi detaliile comenzii.",
        "Înapoi la meniu",
        // header sesiune blocată
        "Sesiune Finalizată",
        "Toate comenzile au fost procesate cu succes",
        // header comandă normală
        "Comandă Confirmată",
        "Vă mulțumim pentru comandă!",
        // card
        "Masa",
        "Comanda #",
        "Status",
        "Tip",
        "Masă",
        "Ora",
        "Total",
        "Finalizat",
        "Restaurant",
        // mesaje
        "Vă mulțumim că ați ales restaurantul nostru!",
        "Pentru o nouă sesiune, scanați codul QR de pe masă.",
        "Sesiunea a fost încheiată cu succes",
        "Comanda dvs. a fost recepționată și este în curs de preparare.",
        "Poftă bună! 🍽️",
        "Comanda este în procesare",
        "Detaliile comenzii au fost trimise la bucătărie. Vă vom anunța când este gata.",
        // butoane
        "Start New Session",
        "Descarcă Chitanța PDF",
        "Se generează PDF...",
        "Chitanță descărcată!",
        "Home",
        // modal
        "Start New Session",
        "Ești sigur că vrei să pornești o nouă sesiune?",
        "Aceasta va încheia sesiunea curentă și te va redirecționa către meniu.",
        "Masa curentă:",
        "Sesiune:",
        "Completată",
        "Activă",
        "Anulează",
        "Confirmă",
        // eroare chitanță
        "Nu am putut găsi datele comenzii.",
        "Eroare la generarea PDF-ului.",
      ];

      const resp = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ro&tl=${lang}&dt=t&q=${encodeURIComponent(ro.join(" ||| "))}`
      );
      if (!resp.ok) return;
      const data  = await resp.json();
      const parts = (data[0]?.map((x) => x[0]).join("") || "").split(" ||| ");

      const get = (i) => parts[i]?.trim() || ro[i];

      setTx({
        loading:               get(0),
        notFoundTitle:         get(1),
        notFoundDesc:          get(2),
        backToMenu:            get(3),
        sessionTitle:          get(4),
        sessionSubtitle:       get(5),
        orderTitle:            get(6),
        orderSubtitle:         get(7),
        tableLabel:            get(8),
        orderLabel:            get(9),
        statusLabel:           get(10),
        typeLabel:             get(11),
        tableField:            get(12),
        timeField:             get(13),
        totalField:            get(14),
        statusDone:            get(15),
        typeValue:             get(16),
        thankYouMsg:           get(17),
        scanQrMsg:             get(18),
        sessionClosed:         get(19),
        orderInPrep:           get(20),
        bonAppetit:            get(21),
        orderProcessing:       get(22),
        orderSentMsg:          get(23),
        btnNewSession:         get(24),
        btnDownload:           get(25),
        btnGenerating:         get(26),
        btnDownloaded:         get(27),
        btnHome:               get(28),
        modalTitle:            get(29),
        modalSubtitle:         get(30),
        modalMessage:          get(31),
        modalTableLabel:       get(32),
        modalSessionLabel:     get(33),
        modalSessionDone:      get(34),
        modalSessionActive:    get(35),
        modalCancel:           get(36),
        modalConfirm:          get(37),
        receiptNotFound:       get(38),
        receiptError:          get(39),
      });
    } catch (e) { console.error(e); }
    finally { setIsTranslating(false); }
  }, []);

  useEffect(() => {
    translateUI(currentLanguage);
  }, [currentLanguage, translateUI]);

  // helper — returnează traducerea sau fallback-ul în română
  const tr = (key, fallback) =>
    currentLanguage !== "ro" && tx[key] ? tx[key] : fallback;

  // ── blocked-session ───────────────────────────────────────────
  useEffect(() => {
    if (autoRedirected) {
      setIsBlockedSession(true);
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
    }
  }, [autoRedirected]);
// ── adaugă/elimină clasa pe body pentru fallback CSS ──
useEffect(() => {
  document.body.classList.add("ocu-open");
  return () => {
    document.body.classList.remove("ocu-open");
  };
}, []);
  // ── fetch order ───────────────────────────────────────────────
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isBlockedSession || autoRedirected) {
        setOrderDetails({
          status: "completed",
          paymentMethod: "completed",
          items: [],
          totalAmount: 0,
          orderNumber: "SESSION-COMPLETED",
          createdAt: new Date().toISOString(),
          tableNumber: tableNumber || "N/A",
        });
        setIsLoading(false);
        return;
      }

      if (!orderId) { navigate("/"); return; }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const response = await fetch(`${url}/api/order/${orderId}`, {
          headers: { token },
        });
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.order);
          if (data.success && clearCart) clearCart();
        } else {
          throw new Error("Failed to fetch order");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setOrderDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, url, clearCart, navigate, isBlockedSession, autoRedirected]); // eslint-disable-line

  const formatDate = (d) => {
    if (!d) return new Date().toLocaleString();
    return new Date(d).toLocaleString("ro-RO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // ── descarcă chitanță ─────────────────────────────────────────
  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    setDownloadDone(false);
    setReceiptError("");

    try {
      let allServerOrders = [];
      try {
        const resp = await axios.get(`${url}/api/order/list`);
        if (resp.data?.success && Array.isArray(resp.data.data)) {
          allServerOrders = resp.data.data;
        }
      } catch (listErr) {
        console.warn("[Receipt] /api/order/list failed:", listErr.message);
      }

      let primaryOrder = allServerOrders.find(
        (o) => o._id === orderId || String(o._id) === String(orderId)
      );

      if (!primaryOrder && orderDetails) {
        primaryOrder = {
          _id:           orderDetails._id || orderId,
          orderNumber:   orderDetails.orderNumber,
          date:          orderDetails.createdAt || orderDetails.date,
          status:        orderDetails.status || "completed",
          paymentMethod: orderDetails.paymentMethod,
          tableNo:       orderDetails.tableNo || orderDetails.tableNumber || tableNumber,
          amount:        orderDetails.totalAmount || orderDetails.amount,
          items:         orderDetails.items || [],
          promoCode:     orderDetails.promoCode,
          promoDiscount: orderDetails.promoDiscount || 0,
        };
      }

      if (!primaryOrder) {
        setReceiptError(tr("receiptNotFound", "Nu am putut găsi datele comenzii."));
        setIsDownloading(false);
        return;
      }

      const primaryDate  = new Date(primaryOrder.date || primaryOrder.createdAt);
      const WINDOW_MS    = 8 * 60 * 60 * 1000;
      const primaryTable = primaryOrder.tableNo || primaryOrder.tableNumber || tableNumber;

      const sessionOrders = allServerOrders.filter((o) => {
        if (!primaryTable) return o._id === primaryOrder._id;
        const sameTable = String(o.tableNo) === String(primaryTable) ||
                          String(o.tableNumber) === String(primaryTable);
        if (!sameTable) return false;
        const oDate = new Date(o.date || o.createdAt);
        return Math.abs(oDate - primaryDate) <= WINDOW_MS;
      });

      const seen = new Set();
      const ordersForPDF = [primaryOrder, ...sessionOrders].filter((o) => {
        if (seen.has(String(o._id))) return false;
        seen.add(String(o._id));
        return true;
      });

      await generateReceiptPDF({
        orders:         ordersForPDF,
        tableNumber:    primaryTable,
        restaurantName: "Orderly",
      });

      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    } catch (err) {
      console.error("Receipt generation error:", err);
      setReceiptError(tr("receiptError", "Eroare la generarea PDF-ului."));
    } finally {
      setIsDownloading(false);
    }
  };

  // ── session helpers ───────────────────────────────────────────
  const handleStartNewSession = () => setShowConfirmModal(true);
  const handleHomeSession     = () => navigate("/");

  const confirmNewSession = () => {
    const tbl = tableNumber || orderDetails?.tableNumber || orderDetails?.tableNo || "";
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("tableNumber");
    setShowConfirmModal(false);
    if (tbl) navigate(`/register?table=${tbl}`);
    else navigate("/welcome");
  };
  const cancelNewSession = () => setShowConfirmModal(false);

  // ── loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="ocu-loading-screen">
        <div className="ocu-loading-content">
          <div className="ocu-loading-spinner" />
          <p className="ocu-loading-text">
            {tr("loading", "Se încarcă detaliile comenzii...")}
          </p>
        </div>
      </div>
    );
  }

  // ── eroare ────────────────────────────────────────────────────
  if (!orderDetails) {
    return (
      <div className="ocu-main-container ocu-error-mode">
        <div className="ocu-content-wrapper">
          <div className="ocu-header-section ocu-error-header">
            <div className="ocu-icon-wrapper ocu-error-icon">
              <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="rgba(255,59,48,.1)" />
                <path d="M8 8L16 16M8 16L16 8" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="ocu-main-title ocu-error-title">
              {tr("notFoundTitle", "Comandă negăsită")}
            </h1>
            <p className="ocu-subtitle-text ocu-error-subtitle">
              {tr("notFoundDesc", "Nu am putut găsi detaliile comenzii.")}
            </p>
          </div>
          <div className="ocu-actions-container">
            <button className="ocu-primary-button ocu-error-button" onClick={() => navigate("/")}>
              {tr("backToMenu", "Înapoi la meniu")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── confirm modal ─────────────────────────────────────────────
  const ConfirmModal = (
    <motion.div
      className="ocu-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="ocu-modal-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="ocu-modal-header">
          <div className="ocu-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(52,199,89,.1)" />
              <path d="M12 8V12M12 16H12.01" stroke="#34C759" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="ocu-modal-title">{tr("modalTitle", "Start New Session")}</h3>
          <p className="ocu-modal-subtitle">
            {tr("modalSubtitle", "Ești sigur că vrei să pornești o nouă sesiune?")}
          </p>
        </div>
        <div className="ocu-modal-content">
          <p className="ocu-modal-message">
            {tr("modalMessage", "Aceasta va încheia sesiunea curentă și te va redirecționa către meniu.")}
          </p>
          <div className="ocu-modal-details">
            <div className="ocu-modal-detail">
              <span className="ocu-modal-detail-label">
                {tr("modalTableLabel", "Masa curentă:")}
              </span>
              <span className="ocu-modal-detail-value">
                #{orderDetails.tableNumber || orderDetails.tableNo || tableNumber || "N/A"}
              </span>
            </div>
            <div className="ocu-modal-detail">
              <span className="ocu-modal-detail-label">
                {tr("modalSessionLabel", "Sesiune:")}
              </span>
              <span className="ocu-modal-detail-value">
                {isBlockedSession
                  ? tr("modalSessionDone", "Completată")
                  : tr("modalSessionActive", "Activă")
                }
              </span>
            </div>
          </div>
        </div>
        <div className="ocu-modal-actions">
          <button className="ocu-modal-button ocu-modal-cancel" onClick={cancelNewSession}>
            {tr("modalCancel", "Anulează")}
          </button>
          <button className="ocu-modal-button ocu-modal-confirm" onClick={confirmNewSession}>
            {tr("modalConfirm", "Confirmă")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // ── butoane acțiuni ───────────────────────────────────────────
  const ActionButtons = (
    <motion.div
      className="ocu-actions-container"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      {/* 1 — New session
      <motion.button
        onClick={handleStartNewSession}
        className="ocu-primary-button ocu-view-orders-button"
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {tr("btnNewSession", "Start New Session")}
      </motion.button> */}

      {/* 2 — Download receipt */}
      <motion.button
        onClick={handleDownloadReceipt}
        disabled={isDownloading}
        className={`ocu-secondary-button ocu-download-receipt-button${downloadDone ? " ocu-download-done" : ""}`}
        whileHover={{ scale: isDownloading ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {isDownloading ? (
          <>
            <span className="ocu-rcpt-spinner-small" />
            {tr("btnGenerating", "Se generează PDF...")}
          </>
        ) : downloadDone ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,.15)" />
              <path d="M8 12L11 15L16 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {tr("btnDownloaded", "Chitanță descărcată!")}
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, flexShrink: 0 }}>
              <path d="M12 3v13M7 11l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {tr("btnDownload", "Descarcă Chitanța PDF")}
          </>
        )}
      </motion.button>

      {receiptError && (
        <p style={{ fontSize: "0.8rem", color: "#ef4444", textAlign: "center", margin: "4px 0 0" }}>
          {receiptError}
        </p>
      )}

      {/* 3 — Home */}
      <motion.button
        onClick={handleHomeSession}
        className="ocu-secondary-button ocu-home-button"
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {tr("btnHome", "Home")}
      </motion.button>
    </motion.div>
  );

  // ══════════════════════════════════════════════════════════════
  return (
    <>
      {showConfirmModal && ConfirmModal}

      {/* ── SESIUNE BLOCATĂ ── */}
      {isBlockedSession || autoRedirected ? (
        <div className="ocu-main-container">
          <div className="ocu-content-wrapper">
            <motion.div
              className="ocu-header-section ocu-success-header"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="ocu-icon-wrapper ocu-success-icon"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(52,199,89,.1)" />
                  <path d="M8 12L11 15L16 8" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <motion.h1 className="ocu-main-title ocu-success-title"
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}>
                {tr("sessionTitle", "Sesiune Finalizată")}
              </motion.h1>
              <motion.p className="ocu-subtitle-text ocu-success-subtitle"
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}>
                {tr("sessionSubtitle", "Toate comenzile au fost procesate cu succes")}
              </motion.p>
            </motion.div>

            <motion.div className="ocu-content-section"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}>
              <div className="ocu-details-section">
                <motion.div className="ocu-order-card"
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}>
                  <div className="ocu-order-header">
                    <span className="ocu-order-label">{tr("tableLabel", "Masa")}</span>
                    <span className="ocu-order-number">
                      #{orderDetails?.tableNumber || orderDetails?.tableNo || tableNumber || "N/A"}
                    </span>
                  </div>
                  <div className="ocu-info-grid">
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">{tr("statusLabel", "Status")}</span>
                      <span className="ocu-info-value ocu-session-status">
                        {tr("statusDone", "Finalizat")}
                      </span>
                    </div>
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">{tr("typeLabel", "Tip")}</span>
                      <span className="ocu-info-value">{tr("typeValue", "Restaurant")}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="ocu-message-container"
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}>
                  <p className="ocu-message-text">
                    {tr("thankYouMsg", "Vă mulțumim că ați ales restaurantul nostru!")}
                  </p>
                  <p className="ocu-bon-appetit">
                    {tr("scanQrMsg", "Pentru o nouă sesiune, scanați codul QR de pe masă.")}
                  </p>
                </motion.div>

                <motion.div className="ocu-status-message"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}>
                  <div className="ocu-status-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34C759"/>
                    </svg>
                  </div>
                  <p className="ocu-status-text">
                    {tr("sessionClosed", "Sesiunea a fost încheiată cu succes")}
                  </p>
                </motion.div>
              </div>
              {ActionButtons}
            </motion.div>
          </div>
        </div>

      ) : (
        /* ── COMANDĂ NORMALĂ ── */
        <div className="ocu-main-container">
          <div className="ocu-content-wrapper">
            <motion.div
              className="ocu-header-section ocu-success-header"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="ocu-icon-wrapper ocu-success-icon"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(52,199,89,.1)" />
                  <path d="M8 12L11 15L16 8" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <motion.h1 className="ocu-main-title ocu-success-title"
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}>
                {tr("orderTitle", "Comandă Confirmată")}
              </motion.h1>
              <motion.p className="ocu-subtitle-text ocu-success-subtitle"
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}>
                {tr("orderSubtitle", "Vă mulțumim pentru comandă!")}
              </motion.p>
            </motion.div>

            <motion.div className="ocu-content-section"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}>
              <div className="ocu-details-section">
                <motion.div className="ocu-order-card"
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}>
                  <div className="ocu-order-header">
                    <span className="ocu-order-label">{tr("orderLabel", "Comanda #")}</span>
                    <span className="ocu-order-number">
                      {orderDetails.orderNumber?.slice(-8).toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div className="ocu-info-grid">
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">{tr("tableField", "Masă")}</span>
                      <span className="ocu-info-value">
                        {orderDetails.tableNo || orderDetails.tableNumber || tableNumber || "N/A"}
                      </span>
                    </div>
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">{tr("timeField", "Ora")}</span>
                      <span className="ocu-info-value">
                        {formatDate(orderDetails.createdAt).split(",")[1]?.trim() || "—"}
                      </span>
                    </div>
                    <div className="ocu-info-item">
                      <span className="ocu-info-label">{tr("totalField", "Total")}</span>
                      <span className="ocu-info-value ocu-total-highlight">
                        {(orderDetails.totalAmount ?? orderDetails.amount ?? 0).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="ocu-message-container"
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}>
                  <p className="ocu-message-text">
                    {tr("orderInPrep", "Comanda dvs. a fost recepționată și este în curs de preparare.")}
                  </p>
                  <p className="ocu-bon-appetit">
                    {tr("bonAppetit", "Poftă bună! 🍽️")}
                  </p>
                </motion.div>

                <motion.div className="ocu-status-message"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}>
                  <div className="ocu-status-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34C759"/>
                    </svg>
                  </div>
                  <p className="ocu-status-text">
                    {tr("orderProcessing", "Comanda este în procesare")}
                  </p>
                </motion.div>
              </div>

              {ActionButtons}
            </motion.div>

            <motion.div className="ocu-footer-section"
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}>
              <p className="ocu-footer-text">
                {tr("orderSentMsg", "Detaliile comenzii au fost trimise la bucătărie. Vă vom anunța când este gata.")}
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCompleted;