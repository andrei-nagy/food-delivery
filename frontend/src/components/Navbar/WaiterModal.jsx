import React, { useContext, useState, useEffect } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  FaComments, FaMoneyBillWave, FaCreditCard, FaMoneyBill,
  FaUtensils, FaQuestion, FaWater, FaWineGlass,
  FaReceipt, FaClock, FaConciergeBell, FaTimes,
} from 'react-icons/fa';
import ChatBot from '../ChatBot/ChatBot';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { assets } from '../../assets/assets';

/* ─── Mesaje confirm ─── */
const ACTION_CONFIRM = {
  'Call waiter - Need to order':         { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să vină imediat la masa ta pentru a prelua comanda.' },
  'Call waiter - Need menu explanation': { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să vină imediat să te ajute cu meniul.' },
  'Call waiter - Need water':            { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să aducă apă la masa ta în cel mai scurt timp.' },
  'Call waiter - Need drinks':           { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să vină imediat să preia comanda de băuturi.' },
  'Call waiter - Need bill':             { icon: 'bell', title: 'Nota vine imediat!',           sub: 'Un ospătar o să aducă nota la masa ta în câteva momente.' },
  'Call waiter - Need cutlery':          { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să aducă tacâmuri la masa ta imediat.' },
  'Call waiter - Need assistance':       { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să vină imediat să te ajute.' },
  'Call waiter - Other reason':          { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să vină imediat la masa ta.' },
  'Call waiter - POS payment':           { icon: 'card', title: 'Un ospătar vine cu POS-ul!',  sub: 'Cererea de plată prin card a fost înregistrată. Ospătarul tău ajunge imediat.' },
  'Call waiter - Cash payment':          { icon: 'cash', title: 'Un ospătar vine cu nota!',    sub: 'Cererea de plată cash a fost înregistrată. Ospătarul tău ajunge imediat.' },
  'Call waiter - Cash or POS payment':   { icon: 'cash', title: 'Un ospătar vine cu nota!',    sub: 'Cererea de plată a fost înregistrată. Ospătarul tău ajunge imediat.' },
  default:                               { icon: 'bell', title: 'Am înregistrat cererea ta!',  sub: 'Un ospătar o să vină imediat la masa ta.' },
};
const getConfirm = (action) => ACTION_CONFIRM[action] ?? ACTION_CONFIRM['default'];

const WaiterModalCart = ({ show, onClose, customAction, paymentDetails }) => {
  const { url } = useContext(StoreContext);
  const [view,             setView]             = useState("main");
  const [showDianaAI,      setShowDianaAI]      = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [confirmData,      setConfirmData]      = useState(null);
  const [showConfirm,      setShowConfirm]      = useState(false);

  // ── Feature flag: Diana AI ──
  const [dianaAiEnabled, setDianaAiEnabled] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber");
  const { t }       = useTranslation();

  // ── Fetch feature flags o singură dată la mount ──
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const { data } = await axios.get(`${url}/admin/personalization/get`);
        if (data.success && data.data?.features) {
          setDianaAiEnabled(Boolean(data.data.features.dianaAiEnabled));
        }
      } catch (e) {
        // Dacă nu se poate fetch, Diana AI rămâne ascunsă (safe default)
        console.warn('Could not fetch feature flags:', e.message);
      }
    };
    fetchFeatures();
  }, [url]);

  useEffect(() => { if (show) setView("main"); }, [show]);

  useEffect(() => {
    if (show && paymentDetails?.paymentMethod === 'Cash/POS' && !hasAutoSubmitted) {
      setHasAutoSubmitted(true);
      submitAction('Call waiter - Cash or POS payment');
    }
  }, [show, paymentDetails, hasAutoSubmitted]);

  useEffect(() => { if (!show) setHasAutoSubmitted(false); }, [show]);

  const submitAction = async (action) => {
    try {
      const requestData = { action, tableNo: tableNumber };
      if (paymentDetails) requestData.paymentDetails = paymentDetails;
      const response = await axios.post(`${url}/api/waiterorders/add`, requestData);
      if (response.data.success) {
        if (action === 'Ask Diana AI') {
          setShowDianaAI(true);
        } else {
          onClose();
          const cfg = getConfirm(action);
          setConfirmData(cfg);
          setShowConfirm(true);
          if (customAction) customAction();
        }
      }
    } catch (err) {
      console.error('Waiter action error:', err);
    }
  };

  const handleWaiterReason = (reason) => {
    const map = {
      order: 'Call waiter - Need to order', menu: 'Call waiter - Need menu explanation',
      water: 'Call waiter - Need water',    drinks: 'Call waiter - Need drinks',
      bill:  'Call waiter - Need bill',     cutlery: 'Call waiter - Need cutlery',
      assistance: 'Call waiter - Need assistance', other: 'Call waiter - Other reason',
    };
    submitAction(map[reason] ?? 'Call a waiter');
  };

  const handlePaymentMethod = (method) => {
    submitAction(method === 'card' ? 'Call waiter - POS payment' : 'Call waiter - Cash payment');
  };

  const waiterReasons = [
    { id: 'order',      Icon: FaUtensils,      label: t('waiter_modal.want_to_order'),      desc: t('waiter_modal.place_new_order'),          color: '#FF6B6B' },
    { id: 'menu',       Icon: FaQuestion,      label: t('waiter_modal.menu_explanation'),   desc: t('waiter_modal.need_help_with_menu'),      color: '#4ECDC4' },
    { id: 'water',      Icon: FaWater,         label: t('waiter_modal.need_water'),         desc: t('waiter_modal.request_water_service'),    color: '#45B7D1' },
    { id: 'drinks',     Icon: FaWineGlass,     label: t('waiter_modal.need_drinks'),        desc: t('waiter_modal.order_beverages'),          color: '#A855F7' },
    { id: 'bill',       Icon: FaReceipt,       label: t('waiter_modal.ask_for_bill'),       desc: t('waiter_modal.request_the_check'),        color: '#3A7D50' },
    { id: 'cutlery',    Icon: FaConciergeBell, label: t('waiter_modal.need_cutlery'),       desc: t('waiter_modal.request_utensils'),         color: '#F97316' },
    { id: 'assistance', Icon: FaQuestion,      label: t('waiter_modal.general_assistance'), desc: t('waiter_modal.need_help_with_something'), color: '#6366F1' },
    { id: 'other',      Icon: FaClock,         label: t('waiter_modal.other_reason'),       desc: t('waiter_modal.something_else'),           color: '#9CA3AF' },
  ];

  return (
    <>
      {show && (
        <div className="wm-overlay" onClick={onClose}>
          <div className="wm-sheet" onClick={(e) => e.stopPropagation()}>

            <div className="wm-handle" />

            <div className="wm-topbar">
              {view !== "main" ? (
                <button className="wm-back-link" onClick={() => setView("main")}>
                  ← {t('back') || 'Înapoi'}
                </button>
              ) : (
                <div className="wm-topbar-spacer" />
              )}

              <span className="wm-topbar-title">
                {view === "main"           && t('waiter_modal.need_help')}
                {view === "waiterReasons"  && t('waiter_modal.call_waiter_title')}
                {view === "paymentOptions" && t('waiter_modal.payment_method')}
              </span>

              <button className="wm-x-btn" onClick={onClose} aria-label="Închide">
                <FaTimes size={13} />
              </button>
            </div>

            <p className="wm-subtitle">
              {view === "main"           && t('waiter_modal.how_can_we_assist')}
              {view === "waiterReasons"  && t('waiter_modal.why_need_waiter')}
              {view === "paymentOptions" && t('waiter_modal.how_would_you_like_to_pay')}
            </p>

            {/* ── MAIN ── */}
            {view === "main" && (
              <div className="wm-actions">
                <button className="wm-action-card" onClick={() => setView("waiterReasons")}>
                  <div className="wm-action-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <img src={assets.waiter_icon} alt="" className="wm-waiter-img" />
                  </div>
                  <div className="wm-action-info">
                    <span className="wm-action-label">{t('waiter_modal.call_waiter')}</span>
                    <span className="wm-action-hint">Un ospătar vine la masa ta</span>
                  </div>
                  <span className="wm-action-chev">›</span>
                </button>

                <button className="wm-action-card" onClick={() => setView("paymentOptions")}>
                  <div className="wm-action-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <FaMoneyBillWave size={22} color="#10B981" />
                  </div>
                  <div className="wm-action-info">
                    <span className="wm-action-label">{t('waiter_modal.to_pay')}</span>
                    <span className="wm-action-hint">Card sau cash</span>
                  </div>
                  <span className="wm-action-chev">›</span>
                </button>

                {/* ── Diana AI — afișat DOAR dacă dianaAiEnabled === true ── */}
                {dianaAiEnabled && (
                  <button className="wm-action-card" onClick={() => submitAction('Ask Diana AI')}>
                    <div className="wm-action-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
                      <FaComments size={22} color="#8B5CF6" />
                    </div>
                    <div className="wm-action-info">
                      <span className="wm-action-label">{t('waiter_modal.ask_diana_ai')}</span>
                      <span className="wm-action-hint">Chat cu asistentul virtual</span>
                    </div>
                    <span className="wm-action-chev">›</span>
                  </button>
                )}
              </div>
            )}

            {/* ── WAITER REASONS ── */}
            {view === "waiterReasons" && (
              <div className="wm-reasons">
                {waiterReasons.map(({ id, Icon, label, desc, color }) => (
                  <button key={id} className="wm-reason-row" onClick={() => handleWaiterReason(id)}>
                    <div className="wm-reason-icon" style={{ background: `${color}20` }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div className="wm-reason-text">
                      <span className="wm-reason-label">{label}</span>
                      <span className="wm-reason-desc">{desc}</span>
                    </div>
                    <span className="wm-reason-chev">›</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── PAYMENT ── */}
            {view === "paymentOptions" && (
              <div className="wm-payments">
                <button className="wm-pay-card" onClick={() => handlePaymentMethod('card')}>
                  <div className="wm-pay-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <FaCreditCard size={22} color="#6366F1" />
                  </div>
                  <div className="wm-pay-text">
                    <span className="wm-pay-label">{t('waiter_modal.pay_by_card')}</span>
                    <span className="wm-pay-desc">{t('waiter_modal.pos_terminal')}</span>
                  </div>
                  <span className="wm-reason-chev">›</span>
                </button>

                <button className="wm-pay-card" onClick={() => handlePaymentMethod('cash')}>
                  <div className="wm-pay-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                    <FaMoneyBill size={22} color="#10B981" />
                  </div>
                  <div className="wm-pay-text">
                    <span className="wm-pay-label">{t('waiter_modal.pay_by_cash')}</span>
                    <span className="wm-pay-desc">{t('waiter_modal.cash_payment')}</span>
                  </div>
                  <span className="wm-reason-chev">›</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <ChatBot show={showDianaAI} onClose={() => setShowDianaAI(false)} />

      {confirmData && (
        <ConfirmModal
          show={showConfirm}
          icon={confirmData.icon}
          title={confirmData.title}
          subtitle={confirmData.sub}
          duration={4500}
          onClose={() => { setShowConfirm(false); setConfirmData(null); }}
        />
      )}
    </>
  );
};

export default WaiterModalCart;