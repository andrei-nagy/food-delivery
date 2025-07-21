import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItemCategory from '../FoodItem/FoodItemCategory';
import { FaArrowLeft } from 'react-icons/fa';
import './CategoryPage.css';
import SearchBar from '../SearchBar/SearchBar';
import { motion } from 'framer-motion';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { food_list, addToCart,getTotalCartAmount,cartItems } = useContext(StoreContext);
    const navigate = useNavigate();
    const activeCategoryRef = useRef(null);
    const menuContainerRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [shouldRender, setShouldRender] = useState(false);
const [isVisible, setIsVisible] = useState(false);
const [lastScrollY, setLastScrollY] = useState(window.scrollY);
const [lastCartChange, setLastCartChange] = useState(Date.now());

  const cartItemCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

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
  if (cartItemCount > 0) {
    setShouldRender(true);
    setIsVisible(true);
    setLastCartChange(Date.now());

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // dispare după 4 secunde

    return () => clearTimeout(timer);
  } else {
    setShouldRender(false);
  }
}, [cartItemCount]);
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY) {
      // Scroll UP → arată butonul
      if (cartItemCount > 0) {
        setIsVisible(true);
      }
    } else if (currentScrollY > lastScrollY) {
      // Scroll DOWN → ascunde butonul
      setIsVisible(false);
    }

    setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY, cartItemCount]);

useEffect(() => {
  if (cartItemCount > 0 && !isModalOpen) {
    setShouldRender(true);
    setTimeout(() => setIsVisible(true), 10); 
  } else {
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 200); 
  }
}, [cartItemCount, isModalOpen]);
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

    const filteredByCategory = categoryName === 'All'
        ? food_list
        : food_list.filter(item => item.category === categoryName);

    const filteredFood = filteredByCategory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
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
                <SearchBar
                    food_list={food_list || []}
                    onItemClick={openModal}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
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
            {shouldRender && (
  <div
    className={`floating-checkout-home ${isVisible ? "visible" : ""}`}
    onClick={() => {
      navigate("/cart");
      window.scrollTo(0, 0);
    }}
  >
    <div className="floating-checkout-left column">
      <span className="floating-checkout-count">{cartItemCount}</span>
      <span className="floating-checkout-cta">View Order</span>
      <span className="floating-checkout-total">
        {getTotalCartAmount().toFixed(2)} €
      </span>
    </div>
  </div>
)}

        </motion.div>
    );
};

export default CategoryPage;
