import React, { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { useReveal } from "../UseReveal/UseReveal";
import "./ContactForm.css";

// ── Data ──────────────────────────────────────────────────────────────────────

const INFO = [
  { icon: "📧", label: "Email",         value: "contact@orderly.ro" },
  { icon: "📞", label: "Phone",         value: "0750 275 575"        },
  { icon: "📍", label: "Location",      value: "Bucharest, Romania"  },
  { icon: "⏱️", label: "Response time", value: "< 24 hours"          },
];

const STATS = [
  { n: "500+", l: "Restaurants", color: "#00B37E" },
  { n: "4.9",  l: "Rating",      color: "#F97316" },
  { n: "98%",  l: "Satisfaction",color: "#8B5CF6" },
];

const CHIPS = ["No commitment", "Customized demo", "24h response"];

// ── Motion variants ───────────────────────────────────────────────────────────

// Secțiunea: fade simplu + y — fără clipPath care poate bloca interacțiunea
const sectionVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Header: litere care cad din sus (rotație 3D pe X)
const headerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};

const headerLineVariants = {
  hidden:  { opacity: 0, rotateX: -90, y: -20 },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Panoul stâng: slide din stânga cu blur
const leftPanelVariants = {
  hidden:  { opacity: 0, x: -60, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
  },
};

// Info items: stagger fade din stânga
const infoListVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
};

const infoItemVariants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Stats: pop-in cu spring
const statsContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.7 } },
};

const statPopVariants = {
  hidden:  { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 18 },
  },
};

// Testimonial: fade + slight rotate
const testimonialVariants = {
  hidden:  { opacity: 0, rotate: -1, y: 16 },
  visible: {
    opacity: 1,
    rotate: 0,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.9 },
  },
};

// Panoul drept (form): slide din dreapta cu blur
const rightPanelVariants = {
  hidden:  { opacity: 0, x: 60, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 },
  },
};

// Câmpuri form: stagger fade-up
const formFieldsVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.65 } },
};

const fieldVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Chips: pop-in cu spring staggerat
const chipsContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.85 } },
};

const chipVariants = {
  hidden:  { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContactForm2() {
  const ref = useReveal();
  const [form, setForm] = useState({
    name: "", restaurantName: "", contactEmail: "", contactPhone: "", message: "",
  });
  const [sending, setSending] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    emailjs
      .send(
        "service_orderly.ro",
        "template_nue6nny",
        {
          name: form.name,
          restaurantName: form.restaurantName,
          message: form.message,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
        },
        "Rw7daoMmQiW-EUsnH"
      )
      .then(() => {
        toast.success("✓ Thank you! We'll contact you within 24 hours.", {
          position: "top-right",
          autoClose: 5000,
          style: { background: "#10B981", color: "white" },
        });
        setForm({ name: "", restaurantName: "", contactEmail: "", contactPhone: "", message: "" });
      })
      .catch(() =>
        toast.error("Please try again or contact us directly.", {
          position: "top-right",
          autoClose: 5000,
        })
      )
      .finally(() => setSending(false));
  };

  return (
    <motion.section
      className="cf2"
      id="requestDemo"
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <div className="cf2__wrap">

        {/* Header: litere cu rotație 3D pe X */}
        <motion.header
          className="cf2__header"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          style={{ perspective: 800 }}
        >
          <motion.div className="cf2__kicker" variants={headerLineVariants}>
            <span className="cf2__kicker-line" />
            Get started
            <span className="cf2__kicker-line" />
          </motion.div>
          <motion.h2 className="cf2__h" variants={headerLineVariants}>
            Transform your restaurant
            <br />
            <em>with Orderly.</em>
          </motion.h2>
          <motion.p className="cf2__sub" variants={headerLineVariants}>
            Schedule your personalized demo and discover the future of restaurant management.
          </motion.p>
        </motion.header>

        {/* Two-column card */}
        <div className="cf2__grid">

          {/* ── Left info panel: slide din stânga + blur ── */}
          <motion.div
            className="cf2__left"
            variants={leftPanelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <div>
              <div className="cf2__left-title">Let's talk about your restaurant</div>
              <div className="cf2__left-sub">
                Tell us about your vision — we'll create a solution that fits your unique needs.
              </div>
            </div>

            {/* Info items: stagger din stânga */}
            <motion.ul
              className="cf2__info-list"
              variants={infoListVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              {INFO.map((c) => (
                <motion.li
                  key={c.label}
                  className="cf2__info-item"
                  variants={infoItemVariants}
                >
                  <div className="cf2__info-icon">{c.icon}</div>
                  <div>
                    <div className="cf2__info-label">{c.label}</div>
                    <div className="cf2__info-val">{c.value}</div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* Stats: pop-in spring */}
            <motion.div
              className="cf2__stats"
              variants={statsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
            >
              {STATS.map((s) => (
                <motion.div
                  key={s.l}
                  className="cf2__stat"
                  variants={statPopVariants}
                >
                  <span className="cf2__stat-n" style={{ color: s.color }}>{s.n}</span>
                  <span className="cf2__stat-l">{s.l}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Testimonial: fade + rotate */}
            <motion.div
              className="cf2__testimonial"
              variants={testimonialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20px" }}
            >
              <div className="cf2__quote-mark">"</div>
              <p className="cf2__quote-text">
                Orderly transformed our operations. Table turnover is up 30% and our customers love
                the seamless experience.
              </p>
              <div className="cf2__quote-author">
                <span className="cf2__quote-name">Ana Popescu</span>
                <span className="cf2__quote-place">La Belle Table</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right form panel: slide din dreapta + blur ── */}
          <motion.div
            className="cf2__right"
            variants={rightPanelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="cf2__form-hdr-row">
              <div className="cf2__form-title">Request Your Demo</div>
              <div className="cf2__form-badge">
                <span className="cf2__form-badge-dot" />
                We reply in &lt;24h
              </div>
            </div>

            <form className="cf2__form" onSubmit={onSubmit}>
              {/* Câmpuri: stagger fade-up */}
              <motion.div
                variants={formFieldsVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20px" }}
              >
                <motion.div className="cf2__field" variants={fieldVariants}>
                  <label htmlFor="cf2-name" className="cf2__label">
                    Full Name <span>*</span>
                  </label>
                  <input
                    id="cf2-name" name="name" type="text"
                    className="cf2__input" placeholder="John Smith"
                    value={form.name} onChange={onChange}
                    required disabled={sending}
                  />
                </motion.div>

                <motion.div className="cf2__field" variants={fieldVariants}>
                  <label htmlFor="cf2-restaurant" className="cf2__label">
                    Restaurant Name <span>*</span>
                  </label>
                  <input
                    id="cf2-restaurant" name="restaurantName" type="text"
                    className="cf2__input" placeholder="Bistro Paris"
                    value={form.restaurantName} onChange={onChange}
                    required disabled={sending}
                  />
                </motion.div>

                <motion.div className="cf2__row2" variants={fieldVariants}>
                  <div className="cf2__field">
                    <label htmlFor="cf2-email" className="cf2__label">
                      Email <span>*</span>
                    </label>
                    <input
                      id="cf2-email" name="contactEmail" type="email"
                      className="cf2__input" placeholder="john@restaurant.com"
                      value={form.contactEmail} onChange={onChange}
                      required disabled={sending}
                    />
                  </div>
                  <div className="cf2__field">
                    <label htmlFor="cf2-phone" className="cf2__label">
                      Phone <span>*</span>
                    </label>
                    <input
                      id="cf2-phone" name="contactPhone" type="tel"
                      className="cf2__input" placeholder="+40 771 486 918"
                      value={form.contactPhone} onChange={onChange}
                      required disabled={sending}
                    />
                  </div>
                </motion.div>

                <motion.div className="cf2__field" variants={fieldVariants}>
                  <label htmlFor="cf2-msg" className="cf2__label">
                    Goals & Needs <span>*</span>
                  </label>
                  <textarea
                    id="cf2-msg" name="message"
                    className="cf2__textarea"
                    placeholder="Tell us about your restaurant, number of tables and what you hope to achieve with Orderly..."
                    value={form.message} onChange={onChange}
                    required disabled={sending} rows={4}
                  />
                </motion.div>
              </motion.div>

              {/* Chips: pop-in spring */}
              <motion.div
                className="cf2__chips"
                variants={chipsContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {CHIPS.map((c) => (
                  <motion.span key={c} className="cf2__chip" variants={chipVariants}>
                    <span className="cf2__chip-check">✓</span>
                    {c}
                  </motion.span>
                ))}
              </motion.div>

              {/* Buton submit: scale hover + tap */}
              <motion.button
                type="submit"
                className="cf2__submit"
                disabled={sending}
                whileHover={!sending ? { scale: 1.03 } : {}}
                whileTap={!sending ? { scale: 0.97 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {sending ? (
                  <><span className="cf2__spinner" />Sending...</>
                ) : (
                  <>Request Personalized Demo <span className="cf2__submit-arr">→</span></>
                )}
              </motion.button>

              <p className="cf2__note">2,000+ restaurants trust Orderly</p>
            </form>
          </motion.div>

        </div>
      </div>
    </motion.section>
  );
}