import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import FoodModal from '../FoodModal/FoodModal'; // Importă componenta FoodModal

const FoodItem = ({ id, name, price, description, image }) => {
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null); // Adaugă starea pentru alimentul selectat

    const openFoodModal = () => {
        setSelectedFood({ id, name, price, description, image });
        setIsModalOpen(true);
    };

    const closeFoodModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className='food-item' onClick={openFoodModal}>
                <div className="food-item-img-container">
                    <img className='food-item-img' src={url + "/images/" + image} alt={name} />
                    {cartItems && cartItems[id] !== undefined ? (
                        <div className='food-item-counter'>
                            <img onClick={(e) => { e.stopPropagation(); removeFromCart(id); }} src={assets.remove_icon_red} alt="Remove" />
                            <p>{cartItems[id]}</p>
                            <img onClick={(e) => { e.stopPropagation(); addToCart(id); }} src={assets.add_icon_green} alt="Add" />
                        </div>
                    ) : (
                        <img className='add' onClick={(e) => { e.stopPropagation(); addToCart(id); }} src={assets.add_icon_white} alt="Add" />
                    )}
                </div>
                <div className="food-item-info">
                    <div className="food-item-name-rating">
                        <p>{name}</p>
                        <img src={assets.rating_starts} alt="Rating" />
                    </div>
                    <p className="food-item-desc">{description}</p>
                    <p className="food-item-price">${price}</p>
                </div>
            </div>

            {/* Utilizează componenta FoodModal */}
            {isModalOpen && selectedFood && ( // Verifică dacă modalul trebuie să fie deschis
                <FoodModal
                    foodItem={selectedFood} // Transmite alimentul selectat
                    isOpen={isModalOpen}
                    onClose={closeFoodModal}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                />
            )}
        </>
    );
};

export default FoodItem;
