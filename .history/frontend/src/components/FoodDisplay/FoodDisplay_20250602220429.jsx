import React, { useContext, useState, useEffect } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { useTranslation } from 'react-i18next';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import FoodModal from '../FoodItem/FoodModal'; // ✅ nou

const FoodDisplay = ({ category }) => {
    const { food_list } = useContext(StoreContext);
    const { t, i18n } = useTranslation();

    const [groupedFood, setGroupedFood] = useState({});
    const [bestSellers, setBestSellers] = useState([]);

    // ✅ pentru modal global
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        dots: true,
        infinite: true,
        speed: 1000,
        autoplay: false,
        autoplaySpeed: 3500,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } }
        ]
    };

    return (
        <div className='food-display' id='food-display'>
            {bestSellers.length > 0 && (
                <>
                    <div className="category-header">
                        <span className="category-title">Best Sellers</span>
                        <Link to={`/category/All`} className="view-more">
                            View more <FaArrowRight className="arrow-icon auto-bounce" />
                        </Link>
                    </div>
                    <Slider {...sliderSettings} className="best-sellers-slider">
                        {bestSellers.map((item, index) => (
                            <div key={index} className="best-seller-item">
                                <FoodItem
                                    key={item._id}
                                    id={item._id}
                                    {...item}
                                    openModal={(food) => {
                                        setSelectedFood(food);
                                        setIsModalOpen(true);
                                    }}
                                />
                            </div>
                        ))}
                    </Slider>
                </>
            )}

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
                                            key={item._id}
                                    id={item._id}
                                            {...item}
                                            openModal={(food) => {
                                                setSelectedFood(food);
                                                setIsModalOpen(true);
                                            }}
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

            {/* ✅ Modal Global */}
            {isModalOpen && selectedFood && (
                <FoodModal
                    food={selectedFood}
                    closeModal={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default FoodDisplay;
