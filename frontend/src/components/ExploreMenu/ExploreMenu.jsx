import React, { useContext, useRef, useEffect, useState } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);
    const { t, i18n } = useTranslation();
    const { currentLanguage } = useLanguage();
    const menuListRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [translatedCategories, setTranslatedCategories] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const activeCategories = foodCategory_list.filter(item => item.isActive);

    // === FUNCȚII PENTRU TRADUCERE ===
    const translateText = async (text, targetLang) => {
        if (!text?.trim() || !targetLang || targetLang === 'ro') {
            return text;
        }
        
        if (text.length < 2 || /^[\d\s\W]+$/.test(text)) {
            return text;
        }
        
        try {
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const translatedText = data[0]?.[0]?.[0] || text;
            
            return translatedText;
        } catch (error) {
            return text;
        }
    };

    // Funcție pentru traducerea numelor categoriilor
    const translateCategoryNames = async () => {
        if (currentLanguage === 'ro' || !activeCategories.length) {
            setTranslatedCategories({});
            setIsTranslating(false);
            return;
        }

        setIsTranslating(true);

        try {
            const categoryNamesToTranslate = [];
            const categoryIdMap = {};

            // Colectează toate numele categoriilor care trebuie traduse
            activeCategories.forEach((category, index) => {
                if (category.menu_name && category.menu_name.trim()) {
                    categoryNamesToTranslate.push(category.menu_name);
                    categoryIdMap[index] = category._id || category.menu_name;
                }
            });

            if (categoryNamesToTranslate.length > 0) {
                const combinedText = categoryNamesToTranslate.join(' ||| ');

                const response = await fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
                    const translatedNames = translatedCombinedText.split(' ||| ');

                    // Creează obiectul cu traducerile
                    const newTranslatedCategories = {};
                    Object.keys(categoryIdMap).forEach((index) => {
                        const categoryId = categoryIdMap[index];
                        const translatedName = translatedNames[index] || categoryNamesToTranslate[index];
                        if (translatedName && categoryId) {
                            newTranslatedCategories[categoryId] = translatedName;
                        }
                    });

                    setTranslatedCategories(newTranslatedCategories);
                }
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsTranslating(false);
        }
    };

    // Efect pentru traducerea categoriilor când se schimbă limba sau categoriile
    useEffect(() => {
        if (activeCategories.length > 0) {
            translateCategoryNames();
        }
    }, [currentLanguage, activeCategories.length]);

    // Funcție pentru a obține numele tradus al categoriei
    const getTranslatedCategoryName = (categoryItem) => {
        const categoryId = categoryItem._id || categoryItem.menu_name;
        const translatedName = translatedCategories[categoryId];
        
        return currentLanguage !== 'ro' && translatedName 
            ? translatedName 
            : categoryItem.menu_name;
    };

    const scrollMenu = (direction) => {
        const scrollAmount = 200;
        if (direction === 'left') {
            menuListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            menuListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            <div className='explore-menu' id='explore-menu'>
                <h2>{t('explore_menu')}</h2>
                <p className='explore-menu-text'>
                    {t('explore_menu_description')}
                </p>
                <div className="explore-menu-container">
                    <button className="navigation-arrow left" onClick={() => scrollMenu('left')}>{'<'}</button>
                    <div className="explore-menu-list" ref={menuListRef}>
                        {activeCategories.map((item, index) => (
                            <Link
                                to={`/category/${encodeURIComponent(item.menu_name)}`}
                                key={index}
                                className='explore-menu-list-item'
                                onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)}
                            >
                                <img
                                    className={category === item.menu_name ? "active" : ""}
                                    src={`${url}/images/${item.image}`}
                                    alt={getTranslatedCategoryName(item)}
                                />
                                <p className={category === item.menu_name ? "active" : ""}>
                                    {getTranslatedCategoryName(item)}
                                    {isTranslating && (
                                        <span className="translating-indicator"></span>
                                    )}
                                </p>
                            </Link>
                        ))}
                    </div>
                    <button className="navigation-arrow right" onClick={() => scrollMenu('right')}>{'>'}</button>
                </div>
            </div>
        </motion.div>
    );
}

export default ExploreMenu;