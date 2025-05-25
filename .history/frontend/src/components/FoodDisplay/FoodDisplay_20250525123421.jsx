import React, { useContext, useState, useEffect } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { useTranslation } from 'react-i18next';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Slider from "react-slick";

const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);
    const { t, i18n } = useTranslation();

    const [groupedFood, setGroupedFood] = useState({});
    const [bestSellers, setBestSellers] = useState([]);

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

        const extractBestSellers = () => {
            const best = food_list.filter(item => item.isBestSeller);
            setBestSellers(best);
        };

        if (food_list.length > 0) {
            groupByCategory();
            extractBestSellers();
        }
    }, [food_list]);

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false
    };

    return (
        <div className='food-display' id='food-display'>

            {/* Best Sellers Section */}
            {bestSellers.length > 0 && (
                <div>
                    <div className="category-header">
                        <span className="category-title">Best Sellers</span>
                        <Link to={`/category/Best Sellers`} className="view-more">
                            View more <FaArrowRight className="arrow-icon auto-bounce" />
                        </Link>
                    </div>
                    <Slider {...sliderSettings}>
                        {bestSellers.map((item, index) => (
                            <div key={index}>
                                <FoodItem
                                    id={item._id}
                                    name={item.name}
                                    description={item.description}
                                    price={item.price}
                                    image={item.image}
                                    isBestSeller={item.isBestSeller}
                                    isNewAdded={item.isNewAdded}
                                    isVegan={item.isVegan}
                                    category={item.category}
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* All other categories */}
            {Object.keys(groupedFood).length > 0 ? (
                Object.keys(groupedFood).map((cat) => {
                    if ((category === "All" || category === cat) && cat !== "Best Sellers") {
                        return (
                            <div key={cat}>
                                <div className="category-header">
                                    <span className="category-title">{cat}</span>
                                    <Link to={`/category/${encodeURIComponent(cat)}`} className="view-more">
                                        View more <FaArrowRight className="arrow-icon auto-bounce" />
                                    </Link>
                                </div>
                                <div className="food-display-list">
                                    {groupedFood[cat].map((item, index) => (
                                        <FoodItem
                                            key={index}
                                            id={item._id}
                                            name={item.name}
                                            description={item.description}
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
                <p>No food found.</p>
            )}
        </div>
    );
};

export default FoodDisplay;
