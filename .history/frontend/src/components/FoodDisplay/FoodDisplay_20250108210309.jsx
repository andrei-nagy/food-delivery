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

  

    return (
        <div className='food-display' id='food-display'>
            <h2>{t('top_dishes')}</h2>
            <div className="food-display-list">
                {food_list.map((item, index) => {
                    if (category === "All" || category === item.category) {
                        return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} isBestSeller={item.isBestSeller} isNewAdded={item.isNewAdded} isVegan={item.isVegan} category={item.category}></FoodItem>
                    }
                })}
            </div>
        </div>
    )
}

export default FoodDisplay