import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { assets } from '../../assets/assets';
import './Welcome.css';

const Welcome = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    
    const [restaurantData, setRestaurantData] = useState({
        image: '',
        restaurantName: t('welcome.our_restaurant'),
        slogan: t('welcome.exquisite_dining'),
        openingHours: {},
        contactEmail: '',
        contactPhone: '',
        facebook: '',
        instagram: ''
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [isHoursOpen, setIsHoursOpen] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const navbar = document.querySelector('.navbar');
        const app = document.querySelector('.app');
        
        if (navbar) navbar.style.display = 'none';
        if (app) app.classList.add('welcome-clean-active');
        
        setTimeout(() => setIsLoaded(true), 400);
        
        return () => {
            if (navbar) navbar.style.display = 'flex';
            if (app) app.classList.remove('welcome-clean-active');
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${url}/admin/personalization/get`);
                if (response.data.success && response.data.data) {
                    setRestaurantData(response.data.data);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        fetchData();
    }, [url]);

    // Subtle floating particles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 80;
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.alpha = Math.random() * 0.1 + 0.05;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }
        
        animate();
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleExplore = () => {
        navigate('/home');
    };

    const toggleHours = () => {
        setIsHoursOpen(!isHoursOpen);
    };

    const handleContactClick = () => {
        // Verificăm dacă avem ambele metode de contact disponibile
        const hasEmail = restaurantData.contactEmail && restaurantData.contactEmail.trim() !== '';
        const hasPhone = restaurantData.contactPhone && restaurantData.contactPhone.trim() !== '';
        
        // Dacă avem doar unul, folosim direct acel contact method
        if (hasEmail && !hasPhone) {
            window.location.href = `mailto:${restaurantData.contactEmail}`;
            return;
        }
        
        if (!hasEmail && hasPhone) {
            window.location.href = `tel:${restaurantData.contactPhone}`;
            return;
        }
        
        // Dacă avem ambele, afișăm modalul
        if (hasEmail && hasPhone) {
            setShowContactModal(true);
        }
    };

    const handleEmailClick = () => {
        if (restaurantData.contactEmail) {
            window.location.href = `mailto:${restaurantData.contactEmail}`;
            setShowContactModal(false);
        }
    };

    const handlePhoneClick = () => {
        if (restaurantData.contactPhone) {
            window.location.href = `tel:${restaurantData.contactPhone}`;
            setShowContactModal(false);
        }
    };

    const closeModal = (e) => {
        if (e.target.classList.contains('contact-modal-overlay')) {
            setShowContactModal(false);
        }
    };

    // Funcții pentru deschiderea linkurilor sociale
    const handleFacebookClick = () => {
        if (restaurantData.facebook) {
            // Asigură-te că linkul începe cu https://
            let facebookUrl = restaurantData.facebook;
            if (!facebookUrl.startsWith('http://') && !facebookUrl.startsWith('https://')) {
                facebookUrl = `https://${facebookUrl}`;
            }
            window.open(facebookUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleInstagramClick = () => {
        if (restaurantData.instagram) {
            // Asigură-te că linkul începe cu https://
            let instagramUrl = restaurantData.instagram;
            if (!instagramUrl.startsWith('http://') && !instagramUrl.startsWith('https://')) {
                instagramUrl = `https://${instagramUrl}`;
            }
            window.open(instagramUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const hasSocialLinks = () => {
        return (restaurantData.facebook && restaurantData.facebook.trim() !== '') || 
               (restaurantData.instagram && restaurantData.instagram.trim() !== '');
    };

    const containerAnimation = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemAnimation = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const accordionAnimation = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.4,
                ease: "easeInOut"
            }
        }
    };

    const modalAnimation = {
        hidden: { 
            opacity: 0,
            scale: 0.9,
            y: -20
        },
        visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        },
        exit: { 
            opacity: 0,
            scale: 0.9,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    const iconAnimation = {
        closed: { rotate: 0 },
        open: { rotate: 180 }
    };

    const openingHours = restaurantData.openingHours || {};

    return (
        <motion.div 
            className="welcome-minimal"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={containerAnimation}
        >
            {/* Subtle particles canvas */}
            <canvas 
                ref={canvasRef} 
                className="welcome-minimal-canvas"
            />
            
            {/* Minimal background gradient */}
            <div className="welcome-minimal-bg">
                <div className="welcome-bg-gradient" />
                <div className="welcome-bg-light" />
            </div>
            
            {/* Floating subtle shapes */}
            <div className="welcome-floating-shapes">
                <motion.div 
                    className="welcome-shape welcome-shape-circle"
                    animate={{
                        y: [0, -30, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div 
                    className="welcome-shape welcome-shape-square"
                    animate={{
                        x: [0, 20, 0],
                        rotate: [0, 90, 180]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div 
                    className="welcome-shape welcome-shape-triangle"
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, 120, 240]
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>
            
            {/* Main content */}
            <div className="welcome-minimal-content">
                <motion.div 
                    className="welcome-minimal-card"
                    variants={itemAnimation}
                    whileHover={{ 
                        scale: 1.01,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.05)"
                    }}
                >
                    {/* Logo with subtle animation */}
                    <motion.div 
                        className="welcome-logo-minimal"
                        variants={itemAnimation}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="welcome-logo-frame-minimal">
                            <motion.img 
                                src={restaurantData.image ? `${url}/images/${restaurantData.image}` : assets.original_logo}
                                alt="Restaurant Logo"
                                className="welcome-logo-img-minimal"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            />
                        </div>
                    </motion.div>
                    
                    {/* Title section */}
                    <motion.div 
                        className="welcome-title-minimal"
                        variants={itemAnimation}
                    >
                        <motion.h2 
                            className="welcome-subtitle-minimal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {t('welcome.welcome_to')}
                        </motion.h2>
                        
                        <motion.h1 
                            className="welcome-main-title"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            {restaurantData.restaurantName}
                        </motion.h1>
                        
                        <motion.div 
                            className="welcome-title-line"
                            initial={{ width: 0 }}
                            animate={{ width: '100px' }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        />
                    </motion.div>
                    
                    {/* Slogan */}
                    <motion.p 
                        className="welcome-slogan-minimal"
                        variants={itemAnimation}
                    >
                        {restaurantData.slogan}
                    </motion.p>
                    
                    {/* Description */}
                    <motion.p 
                        className="welcome-desc-minimal"
                        variants={itemAnimation}
                    >
                        {t('welcome.welcome_description')}
                    </motion.p>
                    
                    {/* Opening hours accordion */}
                    <motion.div 
                        className="welcome-hours-accordion"
                        variants={itemAnimation}
                    >
                        <motion.button
                            className="welcome-accordion-header"
                            onClick={toggleHours}
                            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="accordion-header-content">
                                <span className="accordion-title">{t('welcome.business_hours')}</span>
                                <span className="accordion-hint">
                                    {isHoursOpen ? t('welcome.click_to_hide') : t('welcome.click_to_view')}
                                </span>
                            </div>
                            
                            <motion.div 
                                className="accordion-icon"
                                variants={iconAnimation}
                                animate={isHoursOpen ? "open" : "closed"}
                                transition={{ duration: 0.3 }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path 
                                        d="M6 9L12 15L18 9" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </motion.div>
                        </motion.button>
                        
                        <AnimatePresence>
                            {isHoursOpen && (
                                <motion.div 
                                    className="accordion-content-welcome"
                                    variants={accordionAnimation}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <div className="welcome-hours-grid">
                                        {[
                                            { day: t('welcome.monday_friday'), key: 'weekdays' },
                                            { day: t('welcome.saturday'), key: 'saturday' },
                                            { day: t('welcome.sunday'), key: 'sunday' }
                                        ].map((item, index) => (
                                            <motion.div
                                                key={item.key}
                                                className="welcome-hour-item-minimal"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ 
                                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                                    transform: 'translateY(-2px)'
                                                }}
                                            >
                                                <span className="welcome-hour-day-minimal">{item.day}</span>
                                                <span className="welcome-hour-time-minimal">
                                                    {openingHours[item.key]?.open && openingHours[item.key]?.close
                                                        ? `${openingHours[item.key].open} - ${openingHours[item.key].close}`
                                                        : t('welcome.closed')}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    
                                    <div className="accordion-footer">
                                        <p className="footer-note">
                                            {t('welcome.hours_note')}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    
       {/* Social Media Links (doar dacă există) */}
{hasSocialLinks() && (
    <motion.div 
        className="welcome-social-links-minimal"
        variants={itemAnimation}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
    >
        <div className="social-icons-minimal-container">
            {restaurantData.facebook && restaurantData.facebook.trim() !== '' && (
                <motion.button
                    className="social-icon-minimal facebook-icon-minimal"
                    onClick={handleFacebookClick}
                    whileHover={{ 
                        scale: 1.15,
                        backgroundColor: 'rgba(24, 119, 242, 0.08)'
                    }}
                    whileTap={{ scale: 0.9 }}
                    title={t('welcome.visit_facebook') || 'Visit our Facebook page'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </motion.button>
            )}
            
            {restaurantData.instagram && restaurantData.instagram.trim() !== '' && (
                <motion.button
                    className="social-icon-minimal instagram-icon-minimal"
                    onClick={handleInstagramClick}
                    whileHover={{ 
                        scale: 1.15,
                        backgroundColor: 'rgba(228, 64, 95, 0.08)'
                    }}
                    whileTap={{ scale: 0.9 }}
                    title={t('welcome.visit_instagram') || 'Visit our Instagram page'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                </motion.button>
            )}
        </div>
        
        {/* <motion.p 
            className="social-links-hint-minimal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.0 }}
        >
            {t('welcome.follow_us') || 'Follow us'}
        </motion.p> */}
    </motion.div>
)}
                    
                    {/* Buttons */}
                    <motion.div 
                        className="welcome-buttons-minimal"
                        variants={itemAnimation}
                    >
                        {/* <motion.button
                            className="welcome-btn-primary"
                            onClick={handleExplore}
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: 'rgba(0, 0, 0, 0.9)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            animate={{
                                boxShadow: [
                                    "0 4px 20px rgba(0, 0, 0, 0.1)",
                                    "0 6px 25px rgba(0, 0, 0, 0.15)",
                                    "0 4px 20px rgba(0, 0, 0, 0.1)"
                                ]
                            }}
                            transition={{
                                boxShadow: {
                                    duration: 2,
                                    repeat: Infinity
                                }
                            }}
                        >
                            <span>{t('welcome.explore_menu')}</span>
                            <motion.svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24"
                                initial={{ x: 0 }}
                                whileHover={{ x: 5 }}
                            >
                                <path 
                                    fill="currentColor" 
                                    d="M9 6l6 6-6 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </motion.svg>
                        </motion.button> */}
                        
                        {(restaurantData.contactPhone || restaurantData.contactEmail) && (
                            <motion.button
                                className="welcome-btn-secondary"
                                onClick={handleContactClick}
                                whileHover={{ 
                                    scale: 1.05,
                                    borderColor: 'rgba(0, 0, 0, 0.3)'
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {t('welcome.contact_us')}
                            </motion.button>
                        )}
                    </motion.div>

                </motion.div>
            </div>
            
            {/* Contact Modal */}
            <AnimatePresence>
                {showContactModal && (
                    <motion.div 
                        className="contact-modal-overlay"
                        onClick={closeModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="contact-modal"
                            variants={modalAnimation}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="contact-modal-header">
                                <h3>{t('welcome.choose_contact_method')}</h3>
                                <button 
                                    className="contact-modal-close"
                                    onClick={() => setShowContactModal(false)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path 
                                            d="M18 6L6 18M6 6l12 12" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="contact-modal-content">
                                <p className="contact-modal-description">
                                    {t('welcome.select_preferred_contact')}
                                </p>
                                
                                <div className="contact-options">
                                    {restaurantData.contactEmail && (
                                        <motion.button
                                            className="contact-option"
                                            onClick={handleEmailClick}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="contact-option-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path 
                                                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    />
                                                    <polyline 
                                                        points="22,6 12,13 2,6" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="contact-option-info">
                                                <span className="contact-option-title">
                                                    {t('welcome.send_email')}
                                                </span>
                                                <span className="contact-option-value">
                                                    {restaurantData.contactEmail}
                                                </span>
                                            </div>
                                            <div className="contact-option-arrow">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path 
                                                        d="M9 18l6-6-6-6" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                        </motion.button>
                                    )}
                                    
                                    {restaurantData.contactPhone && (
                                        <motion.button
                                            className="contact-option"
                                            onClick={handlePhoneClick}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="contact-option-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path 
                                                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="contact-option-info">
                                                <span className="contact-option-title">
                                                    {t('welcome.call_us')}
                                                </span>
                                                <span className="contact-option-value">
                                                    {restaurantData.contactPhone}
                                                </span>
                                            </div>
                                            <div className="contact-option-arrow">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path 
                                                        d="M9 18l6-6-6-6" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="contact-modal-footer">
                                <button 
                                    className="contact-modal-cancel"
                                    onClick={() => setShowContactModal(false)}
                                >
                                    {t('welcome.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </motion.div>
    );
};

export default Welcome;