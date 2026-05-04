import React, { useRef, useState } from "react";
import emailjs from 'emailjs-com';
import { setAppVersion } from "../context/AppVersionContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── EmailJS config ─────────────────────────────────────────────
// Asigură-te că în template-ul EmailJS (template_vdxgeu8):
//   - "To Email" este setat la: contact@orderly.ro
//   - Câmpurile template au: {{name}}, {{restaurant_name}}, {{email}},
//     {{severity}}, {{message}}, {{app_version}}
const EMAILJS_SERVICE_ID  = 'service_d722x3s';
const EMAILJS_TEMPLATE_ID = 'template_vdxgeu8';
const EMAILJS_PUBLIC_KEY  = 'Rw7daoMmQiW-EUsnH';

const SEVERITY_COLORS = {
    low:    { bg: 'rgba(16,185,129,0.1)',  border: '#10b981', text: '#6ee7b7' },
    medium: { bg: 'rgba(245,158,11,0.1)',  border: '#f59e0b', text: '#fcd34d' },
    high:   { bg: 'rgba(239,68,68,0.1)',   border: '#ef4444', text: '#fca5a5' },
};

export function SubmitTicketPage() {
    const form    = useRef();
    const appVersion = setAppVersion();

    const [severity,    setSeverity]    = useState('low');
    const [submitting,  setSubmitting]  = useState(false);
    const [submitted,   setSubmitted]   = useState(false);

    const sendEmail = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData(form.current);
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_email:       'contact@orderly.ro',
                    from_name:      formData.get('from_name'),
                    restaurantName: formData.get('restaurantName'),
                    contactPhone:   formData.get('contactPhone'),
                    contactEmail:   formData.get('contactEmail'),
                    severity:       severity,
                    message:        formData.get('message'),
                    app_version:    String(appVersion),
                },
                EMAILJS_PUBLIC_KEY
            );
            form.current.reset();
            setSeverity('low');
            setSubmitted(true);
            toast.success('Ticket submitted successfully! We\'ll be in touch shortly.', { theme: 'dark' });
            setTimeout(() => setSubmitted(false), 6000);
        } catch (error) {
            console.error('EmailJS error:', error);
            toast.error('Failed to send. Please try again or email us directly at contact@orderly.ro', { theme: 'dark' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="flex-1 overflow-auto relative z-10">
            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-10">
                    <span style={{
                        display: 'inline-block',
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.12em', color: '#60a5fa',
                        background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                        padding: '3px 10px', borderRadius: 999, marginBottom: 12,
                    }}>
                        Support
                    </span>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f3f4f6', margin: '0 0 8px' }}>
                        Submit a Support Ticket
                    </h1>
                    <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, maxWidth: 520 }}>
                        Having trouble with Orderly? Describe the issue and we'll get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 2fr' }}>

                    {/* ── Contact Info ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Email card */}
                        <div style={{
                            padding: '20px', borderRadius: 14,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: 'rgba(96,165,250,0.1)',
                                border: '1px solid rgba(96,165,250,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 12,
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    strokeWidth="1.5" stroke="#60a5fa" style={{ width: 18, height: 18 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', margin: '0 0 4px' }}>Email</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
                                Our team is ready to help with any questions.
                            </p>
                            <a href="mailto:contact@orderly.ro"
                                style={{ fontSize: 13, color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
                                contact@orderly.ro
                            </a>
                        </div>

                        {/* Phone card */}
                        <div style={{
                            padding: '20px', borderRadius: 14,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 12,
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    strokeWidth="1.5" stroke="#10b981" style={{ width: 18, height: 18 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', margin: '0 0 4px' }}>Phone</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
                                Monday – Friday, 8:00 AM – 5:00 PM
                            </p>
                            <a href="tel:+40750275575"
                                style={{ fontSize: 13, color: '#10b981', textDecoration: 'none', fontWeight: 500 }}>
                                0750 275 575
                            </a>
                        </div>

                        {/* Response time */}
                        <div style={{
                            padding: '16px 20px', borderRadius: 14,
                            background: 'rgba(235,104,22,0.06)',
                            border: '1px solid rgba(235,104,22,0.2)',
                        }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#fb923c', margin: '0 0 4px' }}>
                                ⚡ Response Time
                            </p>
                            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                                We typically respond within <strong style={{ color: '#e5e7eb' }}>2–4 hours</strong> on business days.
                            </p>
                        </div>
                    </div>

                    {/* ── Form ── */}
                    <div style={{
                        padding: '28px', borderRadius: 16,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {submitted ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', height: '100%', minHeight: 320, textAlign: 'center', gap: 16,
                            }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%',
                                    background: 'rgba(16,185,129,0.1)', border: '2px solid #10b981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                                }}>
                                    ✓
                                </div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f3f4f6', margin: 0 }}>Ticket Submitted!</h2>
                                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, maxWidth: 300 }}>
                                    We've received your request and will get back to you at your email address shortly.
                                </p>
                            </div>
                        ) : (
                            <form ref={form} onSubmit={sendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                                {/* Name + Restaurant row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>Your Name</label>
                                        <input
                                            name="from_name" type="text" placeholder="John Doe" required
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#60a5fa'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Restaurant Name</label>
                                        <input
                                            name="restaurantName" type="text" placeholder="Restaurant Exemplu" required
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#60a5fa'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                </div>

                                {/* Contact Email + Phone row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>Contact Email</label>
                                        <input
                                            name="contactEmail" type="email" required
                                            placeholder="you@example.com"
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#60a5fa'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Contact Phone</label>
                                        <input
                                            name="contactPhone" type="tel" required
                                            placeholder="0700 000 000"
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#60a5fa'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                </div>

                                {/* Severity */}
                                <div>
                                    <label style={labelStyle}>Severity</label>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                        {['low', 'medium', 'high'].map(level => {
                                            const c = SEVERITY_COLORS[level];
                                            const active = severity === level;
                                            return (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setSeverity(level)}
                                                    style={{
                                                        flex: 1, padding: '8px 0', borderRadius: 8,
                                                        fontSize: 12, fontWeight: 600,
                                                        textTransform: 'capitalize', cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        background: active ? c.bg : 'rgba(255,255,255,0.03)',
                                                        border: `1.5px solid ${active ? c.border : 'rgba(255,255,255,0.08)'}`,
                                                        color: active ? c.text : '#6b7280',
                                                    }}
                                                >
                                                    {level === 'low' && '🟢 '}
                                                    {level === 'medium' && '🟡 '}
                                                    {level === 'high' && '🔴 '}
                                                    {level}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label style={labelStyle}>Message</label>
                                    <textarea
                                        name="message" required
                                        placeholder="Describe the issue in as much detail as possible so we can assist you effectively..."
                                        style={{ ...inputStyle, height: 140, resize: 'vertical', paddingTop: 12 }}
                                        onFocus={e => e.target.style.borderColor = '#60a5fa'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>

                                {/* Hidden app version */}
                                <input type="hidden" name="app_version" value={appVersion} />

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        padding: '11px 24px', borderRadius: 10, border: 'none',
                                        background: submitting ? 'rgba(235,104,22,0.5)' : '#eb6816',
                                        color: '#fff', fontSize: 13, fontWeight: 600,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    }}
                                    onMouseEnter={e => { if (!submitting) e.target.style.background = '#d45e0f'; }}
                                    onMouseLeave={e => { if (!submitting) e.target.style.background = '#eb6816'; }}
                                >
                                    {submitting ? (
                                        <>
                                            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Ticket →'
                                    )}
                                </button>

                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .support-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}

// ── Shared input styles ───────────────────────────────────────
const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#9ca3af',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e5e7eb',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

export default SubmitTicketPage;