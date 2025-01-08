import React, { useContext } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng); // Schimbă limba
    };
  
    // Filtrăm categoriile pentru a păstra doar cele active
    const activeCategories = foodCategory_list.filter(item => item.isActive);

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>{t('explore_menu')}</h1>
            <p className='explore-menu-text'>
            {t('explore_menu_description')}
            </p>
            <div className="explore-menu-list">
                {activeCategories.map((item, index) => {
                    return (
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
                    );
                })}
            </div>
            <hr />
        </div>
    );
}

export default ExploreMenu;
