import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./SplitBillModal.css";

function useAnimatedNumber(target, decimals = 2) {
  const [val, setVal] = useState(target);
  const raf = useRef(null);
  const from = useRef(target);
  
  useEffect(() => {
    const start = from.current;
    const diff = target - start;
    if (Math.abs(diff) < 0.005) { 
      setVal(target); 
      return; 
    }
    
    let t0 = null;
    const tick = (now) => {
      if (!t0) t0 = now;
      const p = Math.min((now - t0) / 320, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(+(start + diff * e).toFixed(decimals));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = target;
    };
    
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, decimals]);
  
  return val;
}

export default function SplitBillModal({
  isOpen = false,
  onClose,
  orderItems = [],
  findFoodItem,
  getItemPriceWithDiscount,
  getTranslatedProductName,
  placeSplitBillOrder,
  isProcessing = false,
  paidItems = [],
  t = (_, fb) => fb,
  appliedPromoCode = null,
  isPromoApplied = false,
  discount = 0,
}) {
  const tableLabel = (() => {
    try { 
      const n = localStorage.getItem("tableNumber"); 
      return n ? `Table ${n}` : "Your Table"; 
    } catch { 
      return "Your Table"; 
    }
  })();

  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [tipPct, setTipPct] = useState(0);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [dragOff, setDragOff] = useState(0);
  const dragYRef = useRef(null);

  const baseGroups = useMemo(() => {
    const paidIds = new Set(paidItems.map((p) => p.uniqueId || p._id).filter(Boolean));
    const unpaid = orderItems.filter((item) => {
      const id = item.uniqueId || item._id;
      return !paidIds.has(id) && item.status !== "fully_paid";
    });
    
    const map = new Map();
    unpaid.forEach((item) => {
      const foodItem = findFoodItem?.(item.uniqueId) ?? null;
      const priceInfo = foodItem && getItemPriceWithDiscount
        ? getItemPriceWithDiscount(foodItem, item) : null;
      const name = (getTranslatedProductName ? getTranslatedProductName(foodItem) : null)
        || item.name || "";
      const unitPrice = priceInfo ? priceInfo.unitPrice : (item.price || 0);
      const qty = item.quantity || 1;
      const key = `${name}__${unitPrice}`;
      
      if (map.has(key)) {
        map.get(key).maxQty += qty;
        map.get(key)._raws.push({ ...item, _qty: qty });
      } else {
        map.set(key, { 
          key, 
          name, 
          unitPrice, 
          maxQty: qty, 
          _raws: [{ ...item, _qty: qty }] 
        });
      }
    });
    
    return Array.from(map.values());
  }, [orderItems, paidItems, findFoodItem, getItemPriceWithDiscount, getTranslatedProductName]);

  const groups = useMemo(() => {
    return baseGroups.map(group => ({
      ...group,
      payQty: selectedQuantities[group.key] || 0
    }));
  }, [baseGroups, selectedQuantities]);

  useEffect(() => {
    if (isOpen) {
      setSelectedQuantities({});
      setTipPct(0);
      setDragOff(0);
      setReady(false);
      requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(() => setReady(true), 80);
      });
    } else {
      setVisible(false);
      setReady(false);
    }
  }, [isOpen]);

  const setPayQty = useCallback((key, delta) => {
    if (typeof delta === 'number') {
      setSelectedQuantities(prev => {
        const currentQty = prev[key] || 0;
        const group = baseGroups.find(g => g.key === key);
        if (!group) return prev;
        const newQty = Math.min(group.maxQty, Math.max(0, currentQty + delta));
        return { ...prev, [key]: newQty };
      });
    } else {
      setSelectedQuantities(prev => {
        const currentQty = prev[key] || 0;
        const group = baseGroups.find(g => g.key === key);
        if (!group) return prev;
        const newQty = currentQty === 0 ? group.maxQty : 0;
        return { ...prev, [key]: newQty };
      });
    }
  }, [baseGroups]);

  const clearAll = useCallback(() => setSelectedQuantities({}), []);

  const selectAll = useCallback(() => {
    const allSelected = {};
    baseGroups.forEach(group => { allSelected[group.key] = group.maxQty; });
    setSelectedQuantities(allSelected);
  }, [baseGroups]);

  useEffect(() => {
    const btns = document.querySelector(".mfloating-buttons");
    if (isOpen) {
      btns?.classList.add("mfloating-buttons--hidden");
      document.body.style.overflow = "hidden";
    } else {
      btns?.classList.remove("mfloating-buttons--hidden");
      document.body.style.overflow = "";
    }
    return () => {
      btns?.classList.remove("mfloating-buttons--hidden");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => onClose?.(), 280);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, close]);

  const onPtrDown = (e) => { 
    dragYRef.current = e.clientY; 
    e.currentTarget.setPointerCapture(e.pointerId); 
  };
  const onPtrMove = (e) => { 
    if (dragYRef.current === null) return; 
    setDragOff(Math.max(0, e.clientY - dragYRef.current)); 
  };
  const onPtrUp = (e) => {
    if (dragYRef.current === null) return;
    const dy = e.clientY - dragYRef.current;
    dragYRef.current = null;
    if (dy > 80) close(); 
    else setDragOff(0);
  };

  const tableTotal = useMemo(() => 
    baseGroups.reduce((s, g) => s + g.unitPrice * g.maxQty, 0), [baseGroups]);
  const mySubtotal = useMemo(() => 
    groups.reduce((s, g) => s + g.unitPrice * g.payQty, 0), [groups]);
  const promoAmt = useMemo(() => 
    isPromoApplied && tableTotal > 0
      ? +(discount * (mySubtotal / tableTotal)).toFixed(2) : 0, 
    [isPromoApplied, tableTotal, mySubtotal, discount]);
  const myNet = useMemo(() => 
    +(mySubtotal - promoAmt).toFixed(2), [mySubtotal, promoAmt]);
  const myTip = useMemo(() => 
    +(myNet * tipPct / 100).toFixed(2), [myNet, tipPct]);
  const myTotal = useMemo(() => 
    +(myNet + myTip).toFixed(2), [myNet, myTip]);
  const myTotalAnim = useAnimatedNumber(myTotal);
  const selectedQty = useMemo(() => 
    groups.reduce((s, g) => s + g.payQty, 0), [groups]);
  const canPay = selectedQty > 0 && !isProcessing;
  const allSelected = groups.length > 0 && groups.every((g) => g.payQty === g.maxQty);

  const handlePay = useCallback(() => {
    if (!canPay) return;
    const itemsToSend = [];
    groups.forEach((g) => {
      if (g.payQty === 0) return;
      let rem = g.payQty;
      for (const raw of g._raws) {
        if (rem <= 0) break;
        const take = Math.min(raw._qty, rem);
        itemsToSend.push({ 
          ...raw, 
          quantity: take, 
          price: g.unitPrice, 
          totalPrice: g.unitPrice * take 
        });
        rem -= take;
      }
    });
    placeSplitBillOrder?.(itemsToSend, myTotal, promoAmt);
    if (!isProcessing) {
      setSelectedQuantities({});
      setTipPct(0);
    }
  }, [canPay, groups, myTotal, promoAmt, placeSplitBillOrder, isProcessing]);

  if (!isOpen && !visible) return null;

  /* Tip pills config */
  const TIP_OPTIONS = [
    { pct: 0,  label: "No tip" },
    { pct: 10, label: "10%" },
    { pct: 15, label: "15%" },
    { pct: 20, label: "20%" },
  ];

  return (
    <div
      className={`sbm-overlay${visible ? " sbm-overlay--in" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className={`sbm-sheet${visible ? " sbm-sheet--in" : ""}`}
        style={dragOff > 0 ? { transform: `translateY(${dragOff}px)`, transition: "none" } : undefined}
        role="dialog" 
        aria-modal="true"
      >
        {/* Drag handle */}
        <div 
          className="sbm-drag"
          onPointerDown={onPtrDown} 
          onPointerMove={onPtrMove} 
          onPointerUp={onPtrUp}
          onPointerCancel={() => { dragYRef.current = null; setDragOff(0); }}
        >
          <span className="sbm-drag__bar" />
        </div>

        {/* Header */}
        <div className="sbm-header">
          <div className="sbm-header__left">
            <span className="sbm-header__label">Split Bill</span>
            <h2 className="sbm-header__table">{tableLabel}</h2>
          </div>
          <div className="sbm-header__total">
            <div className="sbm-header__total-box">
              <span className="sbm-header__total-label">Total</span>
              <span className="sbm-header__total-value">€{tableTotal.toFixed(2)}</span>
            </div>
            <button className="sbm-close" onClick={close} aria-label="Close" type="button">
              <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="sbm-body">

          {/* Items section */}
          <div className="sbm-section">
            <div className="sbm-section__header">
              <span className="sbm-section__title">
                <span className="sbm-section__title-dot" />
                Your items
              </span>
              {groups.length > 0 && (
                <button 
                  type="button" 
                  className="sbm-section__action" 
                  onClick={allSelected ? clearAll : selectAll}
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              )}
            </div>

            {groups.length === 0 ? (
              <p className="sbm-empty">All items have been paid</p>
            ) : (
              <ul className={`sbm-list${ready ? " sbm-list--ready" : ""}`}>
                {groups.map((g, i) => {
                  const active = g.payQty > 0;
                  return (
                    <li
                      key={g.key}
                      className={`sbm-item${active ? " sbm-item--active" : ""}`}
                      style={{ "--i": i }}
                    >
                      <button
                        type="button"
                        className="sbm-item__checkbox"
                        onClick={() => setPayQty(g.key)}
                        aria-label={active ? "Deselect" : "Select"}
                      >
                        <span className={`sbm-checkbox${active ? " sbm-checkbox--on" : ""}`}>
                          {active && (
                            <svg viewBox="0 0 12 10" fill="none" width="12" height="10">
                              <path d="M1 5l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                      </button>

                      <div className="sbm-item__content">
                        <div className="sbm-item__info">
                          <span className="sbm-item__name">{g.name}</span>
                          {g.maxQty > 1 && (
                            <span className="sbm-item__badge">
                              {active ? `${g.payQty} of ${g.maxQty}` : `${g.maxQty} available`}
                            </span>
                          )}
                        </div>

                        <div className="sbm-item__price-section">
                          <span className="sbm-item__price">
                            €{(g.unitPrice * (active ? g.payQty : g.maxQty)).toFixed(2)}
                          </span>

                          {g.maxQty > 1 ? (
                            <div className={`sbm-stepper${active ? " sbm-stepper--active" : ""}`}>
                              <button
                                type="button"
                                className="sbm-stepper__btn"
                                onClick={(e) => { e.stopPropagation(); setPayQty(g.key, -1); }}
                                disabled={g.payQty === 0}
                              >−</button>
                              <span className="sbm-stepper__value">
                                {g.payQty}
                                <span className="sbm-stepper__max">/{g.maxQty}</span>
                              </span>
                              <button
                                type="button"
                                className="sbm-stepper__btn"
                                onClick={(e) => { e.stopPropagation(); setPayQty(g.key, 1); }}
                                disabled={g.payQty === g.maxQty}
                              >+</button>
                            </div>
                          ) : (
                            <span className="sbm-item__unit">€{g.unitPrice.toFixed(2)} each</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── TIP SECTION — redesign aliniat cu TipsSection ── */}
          {selectedQty > 0 && (
            <div className="sbm-section sbm-fadein">
              <div className="sbm-section__header">
                <span className="sbm-section__title">
                  <span className="sbm-section__title-dot" />
                  Add a tip
                </span>
                {myTip > 0 && (
                  <span className="sbm-section__aside">+€{myTip.toFixed(2)}</span>
                )}
              </div>

              {/* Card identic cu ts-card din TipsSection */}
              <div className="sbm-tip-card">
                <div className="sbm-tip-card__header">
                  <div className="sbm-tip-card__icon">🤝</div>
                  <div className="sbm-tip-card__text">
                    <span className="sbm-tip-card__title">Support the team</span>
                    <span className="sbm-tip-card__sub">100% goes to our staff</span>
                  </div>
                </div>

                <div className="sbm-tip-pills">
                  {TIP_OPTIONS.map(({ pct, label }) => {
                    const isActive = tipPct === pct;
                    const amt = pct === 0 ? null : (myNet * pct / 100).toFixed(2);
                    return (
                      <button
                        key={pct}
                        type="button"
                        className={`sbm-tip-pill${isActive ? " sbm-tip-pill--active" : ""}`}
                        onClick={() => setTipPct(pct)}
                      >
                        <span className="sbm-tip-pill__pct">
                          {pct === 0 ? "None" : `${pct}%`}
                        </span>
                        {amt && (
                          <span className="sbm-tip-pill__amt">€{amt}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedQty > 0 && (
            <div className="sbm-summary-card sbm-fadein">
              <div className="sbm-summary-row">
                <span>{selectedQty} item{selectedQty !== 1 ? "s" : ""}</span>
                <span>€{mySubtotal.toFixed(2)}</span>
              </div>
              {promoAmt > 0 && (
                <div className="sbm-summary-row sbm-summary-row--green">
                  <span>Promo {appliedPromoCode ? `(${appliedPromoCode})` : ""}</span>
                  <span>−€{promoAmt.toFixed(2)}</span>
                </div>
              )}
              {myTip > 0 && (
                <div className="sbm-summary-row">
                  <span>Tip ({tipPct}%)</span>
                  <span>+€{myTip.toFixed(2)}</span>
                </div>
              )}
              <div className="sbm-summary-divider" />
              <div className="sbm-summary-total">
                <span>Your total</span>
                <span className="sbm-summary-total__amount">€{myTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sbm-footer">
          <button
            type="button"
            className={`sbm-pay-button${canPay ? " sbm-pay-button--active" : ""}`}
            onClick={handlePay}
            disabled={!canPay}
          >
            {isProcessing ? (
              <span className="sbm-pay-button__spinner" />
            ) : !canPay ? (
              <span className="sbm-pay-button__idle">Select items to continue</span>
            ) : (
              <>
                <div className="sbm-pay-button__info">
                  <span className="sbm-pay-button__label">Pay my share</span>
                  <span className="sbm-pay-button__details">
                    {selectedQty} item{selectedQty !== 1 ? "s" : ""}
                    {tipPct > 0 && ` · ${tipPct}% tip`}
                  </span>
                </div>
                <span className="sbm-pay-button__amount">
                  €{(+myTotalAnim).toFixed(2)}
                </span>
              </>
            )}
          </button>
          <p className="sbm-footer-note">Secured payment · Others pay separately</p>
        </div>
      </div>
    </div>
  );
}