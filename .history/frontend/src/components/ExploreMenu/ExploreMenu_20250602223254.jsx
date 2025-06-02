import React, { useContext, useRef, useEffect, useState } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);
    const { t, i18n } = useTranslation();
    const menuListRef = useRef(null);
    const [progress, setProgress] = useState(0);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const activeCategories = foodCategory_list.filter(item => item.isActive);

    const scrollMenu = (direction) => {
        const scrollAmount = 200;
        if (direction === 'left') {
            menuListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            menuListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const updateProgressBar = () => {
            const { scrollLeft, scrollWidth, clientWidth } = menuListRef.current;
            const scrollableWidth = scrollWidth - clientWidth;
            const progressPercentage = (scrollLeft / scrollableWidth) * 100;
            setProgress(progressPercentage);
        };

        const menuList = menuListRef.current;
        menuList.addEventListener('scroll', updateProgressBar);

        return () => menuList.removeEventListener('scroll', updateProgressBar);
    }, []);

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
                                alt={item.menu_name}
                            />
                            <p className={category === item.menu_name ? "active" : ""}>{item.menu_name}</p>
                         
                        </Link>
                    ))}
                </div>
                <button className="navigation-arrow right" onClick={() => scrollMenu('right')}>{'>'}</button>
            </div>
            {/* <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div> */}
           
        </div>
        </motion.div>
    );
}

export default ExploreMenu;
