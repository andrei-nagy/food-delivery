import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItemCategory from '../FoodItem/FoodItemCategory';
import { FaArrowLeft } from 'react-icons/fa';
import './CategoryPage.css';
import SearchBar from '../SearchBar/SearchBar'; 

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { food_list, addToCart } = useContext(StoreContext);
    const navigate = useNavigate();
    const activeCategoryRef = useRef(null);
    const menuContainerRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const openModal = (food) => {
        setSelectedFood(food);
        setSelectedQuantity(1);
        setSpecialInstructions("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };


    useEffect(() => {
        const uniqueCategories = ['All', ...new Set(food_list.map(item => item.category))];
        setCategories(uniqueCategories);
    }, [food_list]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [categoryName]);

    useEffect(() => {
        if (!categories.length) return;

        const timeout = setTimeout(() => {
            if (activeCategoryRef.current && menuContainerRef.current) {
                const active = activeCategoryRef.current;
                const container = menuContainerRef.current;

                const offsetLeft = active.offsetLeft;
                const itemWidth = active.offsetWidth;
                const containerWidth = container.offsetWidth;

                container.scrollTo({
                    left: offsetLeft - containerWidth / 2 + itemWidth / 2,
                    behavior: 'smooth',
                });
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [categoryName, categories]);

    const filteredFood =
        categoryName === 'All'
            ? food_list
            : food_list.filter(item => item.category === categoryName);

    return (
        <div className="category-page">
            <button
                onClick={() => navigate('/')}
                aria-label="Go back"
                className="back-button"
            >
                <FaArrowLeft /> Back
            </button>


            <nav
                className="category-menu"
                ref={menuContainerRef}
            >
                {categories.map(cat => (
                    <Link
                        key={cat}
                        to={`/category/${encodeURIComponent(cat)}`}
                        className={categoryName === cat ? 'active' : ''}
                    >
                        <span
                            ref={categoryName === cat ? activeCategoryRef : null}
                            className="category-label"
                        >
                            {cat}
                        </span>
                    </Link>
                ))}
            </nav>

            {!searchQuery && filteredFood.length > 0 ? (
  <div className="food-list">
    {filteredFood.map(item => (
      <FoodItemCategory
        key={item._id}
        id={item._id}
        name={item.name}
        description={item.description} 
        price={item.price}
        image={item.image}
        isBestSeller={item.isBestSeller}
        isNewAdded={item.isNewAdded}
        isVegan={item.isVegan}
        category={item.category}
        onClick={() =>
          openModal({
            id: item._id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
          })
        }
      />
    ))}
  </div>
) : null}

        </div>
    );
};

export default CategoryPage;
