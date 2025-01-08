import React, { useContext, useRef } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);
    const { t, i18n } = useTranslation();
    const menuListRef = useRef(null);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // Filtrăm categoriile pentru a păstra doar cele active
    const activeCategories = foodCategory_list.filter(item => item.isActive);

    const scrollMenu = (direction) => {
        const scrollAmount = 200; // cantitatea de derulare
        if (direction === 'left') {
            menuListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            menuListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>{t('explore_menu')}</h1>
            <p className='explore-menu-text'>
                {t('explore_menu_description')}
            </p>
            <div className="explore-menu-container">
                <button className="navigation-arrow left" onClick={() => scrollMenu('left')}>{'<'}</button>
                <div className="explore-menu-list" ref={menuListRef}>
                    {activeCategories.map((item, index) => (
                        <div 
                            onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
                            key={index} 
                            className='explore-menu-list-item'
                        >
                            <img 
                                className={category === item.menu_name ? "active" : ""} 
                                src={`${url}/images/` + item.image} 
                                alt={item.menu_name} 
                            />
                            <p>{item.menu_name}</p>
                        </div>
                    ))}
                </div>
                <button className="navigation-arrow right" onClick={() => scrollMenu('right')}>{'>'}</button>
            </div>
            <div className="progress-bar"></div>
            <hr />
        </div>
    );
}

export default ExploreMenu;
