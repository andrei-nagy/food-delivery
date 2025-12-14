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
        openingHours: {}
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [isHoursOpen, setIsHoursOpen] = useState(false);
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
                    
                    {/* Buttons */}
                    <motion.div 
                        className="welcome-buttons-minimal"
                        variants={itemAnimation}
                    >
                        <motion.button
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
                        </motion.button>
                        
                        {restaurantData.contactPhone && (
                            <motion.button
                                className="welcome-btn-secondary"
                                onClick={() => window.location.href = `tel:${restaurantData.contactPhone}`}
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
            
        </motion.div>
    );
};

export default Welcome;