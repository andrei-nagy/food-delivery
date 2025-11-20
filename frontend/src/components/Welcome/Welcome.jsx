import React from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Welcome = () => {
    const { t } = useTranslation();
    
    useEffect(() => {
        // Ascunde navbar-ul
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.display = 'none';
        }
        
        // Adaugă clasa specială la componentDidMount
        document.querySelector('.app').classList.add('welcome-page-active');
        
        // Șterge clasa la componentWillUnmount
        return () => {
            if (navbar) {
                navbar.style.display = 'flex';
            }
            document.querySelector('.app').classList.remove('welcome-page-active');
        };
    }, []);

    const navigate = useNavigate();
    const { url } = useContext(StoreContext);
    const [data, setData] = useState({
        image: '',
        restaurantName: t('welcome.our_restaurant'),
        primaryColor: '#2c3e50',
        secondaryColor: '#e74c3c',
        slogan: t('welcome.exquisite_dining'),
        contactEmail: '',
        contactPhone: '',
        securityToken: '',
        openingHours: ''
    });

    const handleExploreClick = () => {
        navigate('/home');
    };

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            } else {
                toast.error('Customization data is unavailable.');
            }
        } catch (error) {
            toast.error('Error fetching customization data: ' + error.message);
        }
    };

    useEffect(() => {
        fetchCustomization();
    }, [url]);

    // Variante de animație
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="welcome-page">
            <div className="welcome-background">
                <div className="background-overlay"></div>
            </div>
            
            <motion.div 
                className="welcome-container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div className="welcome-card" variants={itemVariants}>
                    {/* Logo-ul deasupra textului */}
                    <motion.div 
                        className="logo-container"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <img 
                            src={data.image ? `${url}/images/${data.image}` : assets.original_logo} 
                            alt="Restaurant Logo" 
                            className="welcome-logo" 
                        />
                    </motion.div>

                    <motion.h1 variants={itemVariants}>
                        {t('welcome.welcome_to')} <span className="restaurant-name">{data.restaurantName}</span>
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="slogan">
                        {data.slogan}
                    </motion.p>
                    
                    <motion.p variants={itemVariants} className="welcome-description">
                        {t('welcome.welcome_description')}
                    </motion.p>

                    <motion.div variants={itemVariants} className="schedule-container">
                        <h3>{t('welcome.business_hours')}</h3>
                        <div className="schedule-grid">
                            <div className="schedule-item">
                                <span className="day">{t('welcome.monday_friday')}</span>
                                <span className="hours">
                                    {data.openingHours?.weekdays?.open
                                        ? `${data.openingHours.weekdays.open} AM - ${data.openingHours.weekdays.close} PM`
                                        : t('welcome.closed')}
                                </span>
                            </div>
                            <div className="schedule-item">
                                <span className="day">{t('welcome.saturday')}</span>
                                <span className="hours">
                                    {data.openingHours?.saturday?.open
                                        ? `${data.openingHours.saturday.open} AM - ${data.openingHours.saturday.close} PM`
                                        : t('welcome.closed')}
                                </span>
                            </div>
                            <div className="schedule-item">
                                <span className="day">{t('welcome.sunday')}</span>
                                <span className="hours">
                                    {data.openingHours?.sunday?.open && data.openingHours?.sunday?.close
                                        ? `${data.openingHours.sunday.open} AM - ${data.openingHours.sunday.close} PM`
                                        : t('welcome.closed')}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="button-container"
                        variants={itemVariants}
                    >
                        <motion.button
                            className="explore-button"
                            onClick={handleExploreClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('welcome.explore_menu')}
                        </motion.button>
                        
                        <motion.button
                            className="contact-button"
                            onClick={() => window.location.href = `tel:${data.contactPhone}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('welcome.contact_us')}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Welcome;