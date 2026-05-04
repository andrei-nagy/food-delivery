import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import "./ActiveOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";
import axios from "axios";
import DeliveryToast from "../DeliveryToast/DeliveryToast";
import { useOrderToast } from "../OrderToast/OrderToast";

const STATUS_STEPS = ["received", "preparing", "delivered"];
const STATUS_MAP = {
  "Food Processing":  "received",
  "In Preparare":     "preparing",
  "In progress":      "preparing",
  "Out for delivery": "preparing",
  "Delivered":        "delivered",
  "Livrat":           "delivered",
};
const POLL_MS = 8000;

/* ══════════════════════════════════════════════════
   VARIANTA 1 — Accordion unic
══════════════════════════════════════════════════ */
const V1 = ({ orders, currency, exitingIds, translatedLabels, translatedItems }) => {
  const [open, setOpen] = useState(false);

  const lbl = (key, fallback) => translatedLabels[key] || fallback;

  const getStepLabel = (s) => {
    if (s === "received")  return lbl("received",  "Primit");
    if (s === "preparing") return lbl("preparing", "În preparare");
    return lbl("delivered", "Livrat");
  };

  const total       = orders.reduce((sum, o) => sum + (o.totalAmount ?? o.amount ?? 0), 0);
  const activeCount = orders.filter(o => STATUS_MAP[o.status] !== "delivered").length;

  return (
    <div className="ao-v1">
      <button className="ao-v1-header" onClick={() => setOpen(v => !v)}>
        <div className="ao-v1-header-left">
          {activeCount > 0
            ? <span className="ao-live-dot-wrap"><span className="ao-live-ring"/><span className="ao-live-core"/></span>
            : <span className="ao-done-dot"/>
          }
          <span className="ao-v1-label">{lbl("activeMany", "Comenzi active")}</span>
          <span className="ao-v1-count">{activeCount}</span>
        </div>
        <svg
          className={`ao-v1-chev ${open ? 'ao-v1-chev--open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="ao-v1-body">
          {orders.map(order => {
            const stepKey     = STATUS_MAP[order.status] || "received";
            const shortId     = String(order.orderNumber || order._id).slice(-6).toUpperCase();
            const orderTotal  = (order.totalAmount ?? order.amount ?? 0).toFixed(2);
            const isDelivered = stepKey === "delivered";
            const isExiting   = exitingIds.has(order._id);

            const items   = order.items || [];
            const preview = items.slice(0, 2).map(it =>
              `${it.quantity}× ${translatedItems[it.name] || it.name}`
            ).join("  ·  ") + (items.length > 2 ? `  +${items.length - 2}` : "");

            return (
              <div
                key={order._id}
                className={`ao-v1-row ${isExiting ? 'ao-v1-row--exiting' : ''}`}
              >
                <div className="ao-v1-row-left">
                  <span className="ao-v1-row-id">#{shortId}</span>
                  <span className="ao-v1-row-preview">{preview}</span>
                </div>
                <div className="ao-v1-row-right">
                  <span className={`ao-v1-pill ${isDelivered ? 'ao-v1-pill--green' : 'ao-v1-pill--orange'}`}>
                    {!isDelivered && <span className="ao-v1-blink"/>}
                    {getStepLabel(stepKey)}
                  </span>
                  <span className="ao-v1-row-total">{orderTotal} {currency}</span>
                </div>
              </div>
            );
          })}
          <div className="ao-v1-footer">
            <span className="ao-v1-footer-lbl">{lbl("orderTotal", "Total comenzi")}</span>
            <span className="ao-v1-footer-val">{total.toFixed(2)} {currency}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const ActiveOrder = () => {
  const { url, token, setNotification, restaurantData } = useContext(StoreContext);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const currency = restaurantData?.currency || "RON";

  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [exitingIds, setExitingIds] = useState(new Set());
  const [removedIds, setRemovedIds] = useState(new Set());

  // toast "placed" — rămâne pill-ul jos
  const [placedToasts, setPlacedToasts] = useState([]);

  // modal "delivered" — cu confetti
  const { add: addDeliveredModal, renderToasts: renderDeliveredModals } = useOrderToast();

  const [translatedLabels, setTranslatedLabels] = useState({});
  const [translatedItems,  setTranslatedItems]  = useState({});

  const prevStatusRef = useRef({});
  const pollRef       = useRef(null);

  const translateLabels = useCallback(async (lang) => {
    if (lang === "ro") { setTranslatedLabels({}); return; }
    try {
      const ro = [
        "Primit", "În preparare", "Livrat", "Total comenzi",
        "Comandă activă", "Comenzi active", "Se finalizează...",
        "Comandă plasată! 🎉", "Urmărești live statusul din aplicație",
        "Comandă livrată!", "a ajuns la masă 🍽️",
      ];
      const resp = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ro&tl=${lang}&dt=t&q=${encodeURIComponent(ro.join(" ||| "))}`
      );
      if (!resp.ok) return;
      const data  = await resp.json();
      const parts = (data[0]?.map(x => x[0]).join("") || "").split(" ||| ");
      setTranslatedLabels({
        received:            parts[0],
        preparing:           parts[1],
        delivered:           parts[2],
        orderTotal:          parts[3],
        activeOne:           parts[4],
        activeMany:          parts[5],
        finalizing:          parts[6],
        toastPlacedTitle:    parts[7],
        toastPlacedSub:      parts[8],
        toastDeliveredTitle: parts[9],
        toastDeliveredSub:   parts[10],
      });
    } catch (e) { console.error(e); }
  }, []);

  const translateItemNames = useCallback(async (lang, orderList) => {
    if (lang === "ro" || !orderList.length) { setTranslatedItems({}); return; }
    const allNames = [...new Set(
      orderList.flatMap(o => (o.items || []).map(it => it.name).filter(Boolean))
    )];
    if (!allNames.length) return;
    try {
      const resp = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ro&tl=${lang}&dt=t&q=${encodeURIComponent(allNames.join(" ||| "))}`
      );
      if (!resp.ok) return;
      const data  = await resp.json();
      const parts = (data[0]?.map(x => x[0]).join("") || "").split(" ||| ");
      const map   = {};
      allNames.forEach((name, i) => { if (parts[i]) map[name] = parts[i]; });
      setTranslatedItems(map);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { translateLabels(currentLanguage); }, [currentLanguage, translateLabels]);
  useEffect(() => {
    if (orders.length > 0) translateItemNames(currentLanguage, orders);
  }, [currentLanguage, orders, translateItemNames]);

  const lbl = (key, fallback) =>
    currentLanguage !== "ro" && translatedLabels[key] ? translatedLabels[key] : fallback;

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.post(`${url}/api/order/userOrders`, {}, { headers: { token } });
      const all = (res.data?.data || []).filter(
        o => o.payment === false || o.payment === null || o.payment === undefined
      );
      const sorted = all.sort((a, b) => new Date(b.date) - new Date(a.date));

      const newlyDelivered = [];
      sorted.forEach(o => {
        const prev    = prevStatusRef.current[o._id];
        const current = STATUS_MAP[o.status] || "received";
        if (prev && prev !== "delivered" && current === "delivered") {
          newlyDelivered.push(o);
        }
        prevStatusRef.current[o._id] = current;
      });

      if (newlyDelivered.length > 0) {
        setExitingIds(prev => {
          const next = new Set(prev);
          newlyDelivered.forEach(o => next.add(o._id));
          return next;
        });

        newlyDelivered.forEach(o => {
          const shortId = String(o.orderNumber || o._id).slice(-6).toUpperCase();

          // ── modal verde cu confetti ──
          addDeliveredModal("delivered", shortId);

          if (setNotification) {
            setNotification(
              lbl("toastDeliveredTitle", "Comandă livrată!") +
              ` #${shortId} ` +
              lbl("toastDeliveredSub", "a ajuns la masă 🍽️")
            );
          }

          setTimeout(() => {
            setRemovedIds(prev => { const n = new Set(prev); n.add(o._id); return n; });
            setExitingIds(prev => { const n = new Set(prev); n.delete(o._id); return n; });
          }, 5000);
        });
      }

      setOrders(sorted);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token, url, setNotification, addDeliveredModal]);

  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchOrders]);

  // toast "placed" — pill jos (DeliveryToast rămâne pentru placed + added)
  useEffect(() => {
    const handler = e => {
      const shortId = e.detail?.shortId || "------";
      setPlacedToasts(prev => [...prev, { id: "placed-" + Date.now(), shortId, type: "placed" }]);
    };
    window.addEventListener("order:placed", handler);
    return () => window.removeEventListener("order:placed", handler);
  }, []);

  const removePlacedToast = useCallback(id => {
    setPlacedToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (loading || orders.length === 0) return null;

  const visibleOrders = orders.filter(o => {
    if (removedIds.has(o._id)) return false;
    if (STATUS_MAP[o.status] === "delivered" && !exitingIds.has(o._id)) return false;
    return true;
  });

  if (visibleOrders.length === 0) return null;

  return (
    <>
      <div className="ao-wrapper">
        <V1
          orders={visibleOrders}
          currency={currency}
          exitingIds={exitingIds}
          translatedLabels={translatedLabels}
          translatedItems={translatedItems}
        />
      </div>

      {/* Modal cu confetti pentru comenzi livrate */}
      {renderDeliveredModals()}

      {/* Pill jos pentru comenzi plasate (DeliveryToast existent) */}
      {placedToasts.map(t => (
        <DeliveryToast
          key={t.id}
          shortId={t.shortId}
          type="placed"
          translatedLabels={translatedLabels}
          onDone={() => removePlacedToast(t.id)}
        />
      ))}
    </>
  );
};

export default ActiveOrder;