import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Zap, Star, Crown,
    ShoppingCart, QrCode, LayoutGrid, BarChart2,
    Tag, ThumbsUp, Banknote,
    Truck, Package, Bell, Printer, Globe, MessageCircle,
    ChevronDown, Save, RefreshCw,
    CheckCircle2, XCircle,
} from "lucide-react";
import { useUrl } from "../context/UrlContext";

// ── Doar 3 planuri ────────────────────────────────────────────
const PLANS = [
    { id: 1, label: "Light",    color: "#10b981", icon: Zap,   desc: "Basic menu, QR codes, and orders." },
    { id: 2, label: "Standard", color: "#6366f1", icon: Star,  desc: "Adds analytics, promo codes, ratings & sales." },
    { id: 3, label: "Premium",  color: "#f59e0b", icon: Crown, desc: "Adds delivery, reservations, waiter app, Diana AI & more." },
];

// ── Feature groups — fără Enterprise ─────────────────────────
const FEATURE_GROUPS = [
    {
        group: "Core (Light +)",
        minPlan: 1,
        color: "#10b981",
        features: [
            { key: "menuEnabled",       label: "Menu",       icon: LayoutGrid,   desc: "Display the restaurant menu to customers." },
            { key: "qrCodeEnabled",     label: "QR Codes",   icon: QrCode,       desc: "Generate and manage table QR codes." },
            { key: "ordersEnabled",     label: "Orders",     icon: ShoppingCart, desc: "Accept and manage incoming orders." },
            { key: "categoriesEnabled", label: "Categories", icon: LayoutGrid,   desc: "Organize products into categories." },
        ],
    },
    {
        group: "Standard +",
        minPlan: 2,
        color: "#6366f1",
        features: [
            { key: "analyticsEnabled",     label: "Analytics",      icon: BarChart2,  desc: "View traffic and usage analytics." },
            { key: "salesReportEnabled",   label: "Sales Reports",  icon: BarChart2,  desc: "Revenue and sales breakdown reports." },
            { key: "promoCodesEnabled",    label: "Promo Codes",    icon: Tag,        desc: "Create discount and promotion codes." },
            { key: "ratingEnabled",        label: "Ratings",        icon: ThumbsUp,   desc: "Let customers rate orders and dishes." },
            { key: "tipsEnabled",          label: "Tips",           icon: Banknote,   desc: "Allow customers to add tips at checkout." },
            { key: "ordersHistoryEnabled", label: "Orders History", icon: ShoppingCart, desc: "Access full historical order logs." },
        ],
    },
    {
        group: "Premium +",
        minPlan: 3,
        color: "#f59e0b",
        features: [
            { key: "reservationEnabled",    label: "Reservations",    icon: Bell,          desc: "Table reservation system." },
            { key: "takeawayEnabled",       label: "Takeaway",        icon: Package,       desc: "Enable takeaway ordering." },
            { key: "deliveryEnabled",       label: "Delivery",        icon: Truck,         desc: "Enable delivery ordering & tracking." },
            { key: "waiterRequestsEnabled", label: "Waiter Requests", icon: Bell,          desc: "Customers can call waiter from table." },
            { key: "autoPrintEnabled",      label: "Auto Print",      icon: Printer,       desc: "Automatically print orders on receipt." },
            { key: "multiLanguageEnabled",  label: "Multi-Language",  icon: Globe,         desc: "Menu available in multiple languages." },
            { key: "dianaAiEnabled",        label: "Diana AI",        icon: MessageCircle, desc: "AI assistant chatbot visible to customers." },
        ],
    },
];

// ── Toggle ────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        className={`toggle-btn ${checked ? "on" : "off"} ${disabled ? "locked" : ""}`}
        title={disabled ? "Upgrade plan to unlock" : checked ? "Enabled" : "Disabled"}
    >
        <span className="toggle-thumb" />
    </button>
);

// ── Feature Row ───────────────────────────────────────────────
const FeatureRow = ({ feature, value, plan, minPlan, onChange }) => {
    const Icon = feature.icon;
    const locked = plan < minPlan;
    return (
        <motion.div
            className={`feature-row ${locked ? "locked" : ""}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="feature-left">
                <div className="feature-icon-wrap"><Icon size={15} /></div>
                <div>
                    <p className="feature-label">{feature.label}</p>
                    <p className="feature-desc">{feature.desc}</p>
                </div>
            </div>
            <div className="feature-right">
                {locked && <span className="lock-badge">Plan required</span>}
                <Toggle checked={value} onChange={(v) => onChange(feature.key, v)} disabled={locked} />
            </div>
        </motion.div>
    );
};

// ── Main Component ────────────────────────────────────────────
const FeatureFlags = () => {
    const { url } = useUrl();
    const BASE = `${url}/admin/personalization`;

    const [customization, setCustomization] = useState(null);
    const [plan, setPlan]         = useState(1);
    const [features, setFeatures] = useState({});
    const [saving, setSaving]     = useState(false);
    const [loading, setLoading]   = useState(true);
    const [toast, setToast]       = useState(null);
    const [openGroups, setOpenGroups] = useState({ 0: true, 1: true, 2: true });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE}/get`);
            if (data.success && data.data) {
                setCustomization(data.data);
                // Clamp plan to max 3 for this UI (no Enterprise exposed)
                setPlan(Math.min(data.data.partnerPlan ?? 1, 3));
                setFeatures(data.data.features ?? {});
            } else {
                showToast("No customization data found.", "error");
            }
        } catch (e) {
            console.error("fetchData error:", e);
            showToast("Failed to load data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePlanChange = (newPlan) => {
        setPlan(newPlan);
        const updated = { ...features };
        FEATURE_GROUPS.forEach(g => {
            g.features.forEach(f => {
                if (newPlan < g.minPlan) updated[f.key] = false;
                else if (updated[f.key] === false || updated[f.key] === undefined) updated[f.key] = true;
            });
        });
        // Diana AI: default ON for premium, OFF otherwise
        if (newPlan >= 3) updated.dianaAiEnabled = updated.dianaAiEnabled ?? true;
        else updated.dianaAiEnabled = false;
        setFeatures(updated);
    };

    const handleToggle = (key, value) => {
        setFeatures(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!customization?._id) {
            showToast("No customization document. Complete setup in Settings first.", "error");
            return;
        }
        setSaving(true);
        try {
            const planRes = await axios.post(`${BASE}/update-plan`, {
                id: customization._id,
                partnerPlan: plan,
            });
            if (!planRes.data.success) throw new Error(planRes.data.message);

            const featRes = await axios.post(`${BASE}/update-features`, {
                id: customization._id,
                features,
            });
            if (!featRes.data.success) throw new Error(featRes.data.message);

            showToast("Saved successfully!", "success");
            fetchData();
        } catch (e) {
            console.error("handleSave error:", e);
            showToast(e?.response?.data?.message || e.message || "Save failed.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 48, textAlign: "center", color: "#6b7280" }}>
                <RefreshCw size={24} style={{ animation: "spinAnim 1s linear infinite", marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Loading feature flags...</p>
            </div>
        );
    }

    return (
        <div className="ff-root">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`ff-toast ${toast.type}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {toast.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="ff-header">
                <div>
                    <h1 className="ff-title">Feature Flags</h1>
                    <p className="ff-subtitle">
                        Manage plan tier and feature toggles for this partner.
                        {customization && (
                            <span style={{ marginLeft: 8, color: "#4b5563" }}>
                                ID: <code style={{ fontSize: 11 }}>{customization._id}</code>
                            </span>
                        )}
                    </p>
                </div>
                <div className="ff-header-actions">
                    <button className="ff-btn-ghost" onClick={fetchData} disabled={loading}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                    <button className="ff-btn-primary" onClick={handleSave} disabled={saving || !customization}>
                        {saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* No data warning */}
            {!customization && (
                <div style={{
                    padding: "16px 20px", borderRadius: 10, marginBottom: 24,
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "#fca5a5", fontSize: 13,
                }}>
                    ⚠️ No customization document found. Please complete initial setup in <strong>Settings → Customization</strong> first.
                </div>
            )}

            {/* Plan selector — doar 3 planuri */}
            <div className="plan-section">
                <p className="section-label">Partner Plan</p>
                <div className="plan-grid">
                    {PLANS.map(p => {
                        const PlanIcon = p.icon;
                        const active = plan === p.id;
                        return (
                            <motion.button
                                key={p.id}
                                className={`plan-card ${active ? "active" : ""}`}
                                style={{ "--plan-color": p.color }}
                                onClick={() => handlePlanChange(p.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={!customization}
                            >
                                <PlanIcon size={20} style={{ color: p.color }} />
                                <span className="plan-name">{p.label}</span>
                                <span className="plan-desc">{p.desc}</span>
                                {active && <span className="plan-badge">Active</span>}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feature groups */}
            <div className="groups-section">
                <p className="section-label">Individual Feature Toggles</p>
                {FEATURE_GROUPS.map((group, gi) => {
                    const isOpen = openGroups[gi];
                    const locked = plan < group.minPlan;
                    return (
                        <div key={group.group} className={`feature-group ${locked ? "group-locked" : ""}`}>
                            <button
                                className="group-header"
                                onClick={() => setOpenGroups(prev => ({ ...prev, [gi]: !prev[gi] }))}
                            >
                                <span className="group-dot" style={{ background: group.color }} />
                                <span className="group-name">{group.group}</span>
                                {locked && <span className="group-lock-badge">🔒 Requires higher plan</span>}
                                <ChevronDown
                                    size={16}
                                    className="group-chevron"
                                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                                />
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="group-body"
                                    >
                                        {group.features.map(feat => (
                                            <FeatureRow
                                                key={feat.key}
                                                feature={feat}
                                                value={features[feat.key] ?? false}
                                                plan={plan}
                                                minPlan={group.minPlan}
                                                onChange={handleToggle}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .ff-root { padding: 28px 32px; max-width: 860px; margin: 0 auto; color: #e5e7eb; font-family: system-ui, sans-serif; }
                .ff-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
                .ff-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
                .ff-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
                .ff-header-actions { display: flex; gap: 10px; }
                .ff-btn-ghost { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: #d1d5db; font-size: 13px; cursor: pointer; transition: background 0.2s; }
                .ff-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.07); }
                .ff-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
                .ff-btn-primary { display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; border: none; background: #eb6816; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .ff-btn-primary:hover:not(:disabled) { background: #d45e0f; }
                .ff-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                .spin { animation: spinAnim 0.8s linear infinite; }
                @keyframes spinAnim { to { transform: rotate(360deg); } }
                .ff-toast { position: fixed; top: 20px; right: 24px; z-index: 9999; display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
                .ff-toast.success { background: #065f46; color: #6ee7b7; border: 1px solid #059669; }
                .ff-toast.error { background: #7f1d1d; color: #fca5a5; border: 1px solid #dc2626; }
                .section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin: 0 0 12px; }
                .plan-section { margin-bottom: 32px; }
                .plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
                .plan-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); cursor: pointer; text-align: left; transition: border-color 0.2s, background 0.2s; }
                .plan-card:hover:not(:disabled) { background: rgba(255,255,255,0.07); }
                .plan-card:disabled { opacity: 0.4; cursor: not-allowed; }
                .plan-card.active { border-color: var(--plan-color); background: color-mix(in srgb, var(--plan-color) 10%, transparent); }
                .plan-name { font-size: 14px; font-weight: 600; color: #f3f4f6; }
                .plan-desc { font-size: 11px; color: #9ca3af; line-height: 1.4; }
                .plan-badge { position: absolute; top: 10px; right: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; background: var(--plan-color); color: #fff; letter-spacing: 0.05em; }
                .groups-section { display: flex; flex-direction: column; gap: 12px; }
                .feature-group { border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; background: rgba(255,255,255,0.02); }
                .group-locked { opacity: 0.65; }
                .group-header { display: flex; align-items: center; gap: 10px; padding: 14px 18px; width: 100%; background: none; border: none; cursor: pointer; color: #e5e7eb; font-size: 14px; font-weight: 600; transition: background 0.2s; }
                .group-header:hover { background: rgba(255,255,255,0.04); }
                .group-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
                .group-name { flex: 1; text-align: left; }
                .group-lock-badge { font-size: 11px; color: #9ca3af; font-weight: 400; }
                .group-chevron { transition: transform 0.25s; color: #6b7280; }
                .group-body { padding: 0 8px 8px; }
                .feature-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; gap: 12px; transition: background 0.15s; }
                .feature-row:hover { background: rgba(255,255,255,0.04); }
                .feature-row.locked { opacity: 0.5; }
                .feature-left { display: flex; align-items: center; gap: 12px; }
                .feature-icon-wrap { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; color: #9ca3af; flex-shrink: 0; }
                .feature-label { font-size: 13px; font-weight: 500; color: #e5e7eb; margin: 0 0 2px; }
                .feature-desc { font-size: 11px; color: #6b7280; margin: 0; }
                .feature-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
                .lock-badge { font-size: 10px; color: #6b7280; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
                .toggle-btn { position: relative; width: 44px; height: 24px; border-radius: 999px; border: none; cursor: pointer; transition: background 0.25s; flex-shrink: 0; padding: 0; }
                .toggle-btn.on { background: #eb6816; }
                .toggle-btn.off { background: rgba(255,255,255,0.12); }
                .toggle-btn.locked { cursor: not-allowed; opacity: 0.5; }
                .toggle-thumb { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                .toggle-btn.on .toggle-thumb { left: calc(100% - 21px); }
                .toggle-btn.off .toggle-thumb { left: 3px; }
            `}</style>
        </div>
    );
};

export default FeatureFlags;