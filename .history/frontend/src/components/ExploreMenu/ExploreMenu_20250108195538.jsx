import React, { useContext, useRef, useState, useEffect } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);
    const { t, i18n } = useTranslation();
    const listRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const activeCategories = foodCategory_list.filter(item => item.isActive);

    const handleScroll = (direction) => {
        const scrollAmount = 150;
        if (listRef.current) {
            if (direction === 'left') {
                listRef.current.scrollLeft -= scrollAmount;
            } else {
                listRef.current.scrollLeft += scrollAmount;
            }
        }
    };

    useEffect(() => {
        const handleScrollPosition = () => {
            const maxScrollLeft = listRef.current.scrollWidth - listRef.current.clientWidth;
            const scrollRatio = listRef.current.scrollLeft / maxScrollLeft;
            setScrollPosition(scrollRatio * 100);
        };

        listRef.current.addEventListener('scroll', handleScrollPosition);

        return () => {
            listRef.current.removeEventListener('scroll', handleScrollPosition);
        };
    }, []);

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>{t('explore_menu')}</h1>
            <p className='explore-menu-text'>
                {t('explore_menu_description')}
            </p>
            <div className="explore-menu-list" ref={listRef}>
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
            <button className="navigation-arrow left" onClick={() => handleScroll('left')}>‹</button>
            <button className="navigation-arrow right" onClick={() => handleScroll('right')}>›</button>
            <div className="progress-bar">
                <div style={{ width: `${scrollPosition}%` }} className="progress-bar-fill"></div>
            </div>
            <hr />
        </div>
    );
}

export default ExploreMenu;
