import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan }) => {
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const openFoodModal = () => {
        setSelectedFood({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan });
        setSelectedQuantity(1); // Afișează cantitatea corectă în modal
        setIsModalOpen(true);
    };

    const closeFoodModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };

    const handleIncreaseQuantity = () => {
        setSelectedQuantity((prevQuantity) => prevQuantity + 1);
    };
    
    const handleDecreaseQuantity = () => {
        setSelectedQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
    };
    

    const handleAddToOrder = () => {
        addToCart(selectedFood.id, selectedQuantity, specialInstructions );
        closeFoodModal();
    };

    
    return (
        <>
            <div className='food-item' onClick={openFoodModal}>
                <div className="food-item-img-container">
                    <img className='food-item-img' src={url + "/images/" + image} alt={name} />

                    {cartItems && cartItems[id] !== undefined
                        ? (
                            <div className='food-item-counter'>
                                <img onClick={(e) => { e.stopPropagation(); removeFromCart(id); }} src={assets.remove_icon_red} alt="Remove" />
                                <p>{cartItems[id]}</p>
                                <img onClick={(e) => { e.stopPropagation(); addToCart(id, 1); }} src={assets.add_icon_green} alt="Add" />
                            </div>
                        ) : (
                            <img className='add' onClick={(e) => { e.stopPropagation(); addToCart(id, 1); }} src={assets.add_icon_white} alt="Add" />
                        )}
                </div>
                <div className="food-item-info">
                    <div className="food-item-name-rating">
                        <p>{name}</p>
                        <p className="food-item-price">{price} €</p>
                    </div>
                    <p className="food-item-desc">{description}</p>
                    
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay quick-food-modal">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFoodModal}>X</button>
                        <h2>{selectedFood.name}</h2>
                        <img src={url + "/images/" + selectedFood.image} alt={selectedFood.name} />
                        <p>{selectedFood.description}</p>

                        <div className="modal-actions">
                            <div className="quantity-selector">
                                <button onClick={handleDecreaseQuantity}>-</button>
                                <span>{selectedQuantity}</span>
                                <button onClick={handleIncreaseQuantity}>+</button>
                            </div>
                        </div>

                        <textarea
                            placeholder="Special Instructions"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                        <button className="close" onClick={() => {handleAddToOrder()}}>Add to Order</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FoodItem;
