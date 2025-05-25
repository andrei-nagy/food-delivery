import React, { useContext, useState, useEffect } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { useTranslation } from 'react-i18next';

const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);
    const { t, i18n } = useTranslation();

    const [groupedFood, setGroupedFood] = useState({});

    useEffect(() => {
        const groupByCategory = () => {
            const groups = food_list.reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push(item);
                return acc;
            }, {});
            setGroupedFood(groups);
        };

        groupByCategory();
    }, [food_list]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng); // Schimbă limba
    };

    return (
        <div className='food-display' id='food-display'>
            {/* <h2>{t('top_dishes')}</h2> */}

            {Object.keys(groupedFood).length > 0 ? (
                Object.keys(groupedFood).map((cat) => {
                    // Dacă categoria curentă este "All" sau corespunde cu categoria filtrată, afișăm produsele
                    if (category === "All" || category === cat) {
                        return (
                            <div key={cat}>
                                <div className="category-header">
                                    <span className="category-title">{cat}</span>
                                    <a href={`/random-page`} className="view-more">View more</a>
                                </div>
                                <div className="food-display-list">
                                    {groupedFood[cat].map((item, index) => (
                                        <FoodItem
                                            key={index}
                                            id={item._id}
                                            name={item.name}
                                            description={item.description.length > 50 ? item.description.slice(0, 70) + '...' : item.description}
                                            price={item.price}
                                            image={item.image}
                                            isBestSeller={item.isBestSeller}
                                            isNewAdded={item.isNewAdded}
                                            isVegan={item.isVegan}
                                            category={item.category}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })
            ) : (
                <p>{t('no_food_found')}</p>
            )}
        </div>
    );
};

export default FoodDisplay;
