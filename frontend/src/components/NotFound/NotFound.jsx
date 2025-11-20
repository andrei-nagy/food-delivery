import React from 'react';
import './NotFound.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useEffect } from 'react';
import { assets } from '../../assets/assets';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const NotFound = () => {
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

    const handleGoHome = () => {
        navigate('/');
    };

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            } else {
                console.log('Customization data is unavailable.');
            }
        } catch (error) {
            console.log('Error fetching customization data: ' + error.message);
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
        <div className="welcome-page not-found-page">
            <div className="welcome-background not-found-background">
                <div className="background-overlay"></div>
            </div>
            
            <div className="error-code">404</div>
            
            <motion.div 
                className="welcome-container not-found-container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div className="welcome-card not-found-card" variants={itemVariants}>
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
                        {t('not_found.page_not_found')}
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="slogan">
                        {t('not_found.error_message')}
                    </motion.p>

                    <motion.div 
                        className="button-container"
                        variants={itemVariants}
                    >
                        <motion.button
                            className="explore-button back-button"
                            onClick={() => navigate(-1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('not_found.back')}
                        </motion.button>
                        
                        <motion.button
                            className="contact-button home-button"
                            onClick={handleGoHome}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('not_found.home_page')}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;