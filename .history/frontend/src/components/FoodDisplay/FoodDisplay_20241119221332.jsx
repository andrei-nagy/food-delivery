import React, { useContext } from 'react'
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { useTranslation } from 'react-i18next';


const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng); // Schimbă limba
    };
    console.log('Current language:', i18n.language);
    console.log('Food item name:', item.name[i18n.language]);
    return (
        <div className='food-display' id='food-display'>
            <h2>{t('top_dishes')}</h2>
            <div className="food-display-list">
                {food_list.map((item, index) => {
                    if (category === "All" || category === item.category) {
                        // Preluare traduceri pe baza limbii curente
                        const translatedName = item.name[i18n.language] || item.name['en']; // Fallback la engleză
                        const translatedDescription = item.description[i18n.language] || item.description['en']; // Fallback la engleză
                        
                        return (
                            <FoodItem
                                key={index}
                                id={item._id}
                                name={translatedName}
                                description={translatedDescription}
                                price={item.price}
                                image={item.image}
                                isBestSeller={item.isBestSeller}
                                isNewAdded={item.isNewAdded}
                                isVegan={item.isVegan}
                            />
                        );
                    }
                    return null; // Asigurare că doar produsele filtrate sunt afișate
                })}
            </div>
        </div>
    );
}

export default FoodDisplay;
