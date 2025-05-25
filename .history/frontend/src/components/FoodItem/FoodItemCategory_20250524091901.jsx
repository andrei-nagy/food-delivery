import React, { useContext, useState, useRef } from 'react';
import './FoodItemCategory.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItemCategory = ({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan, category }) => {
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const initialQuantityRef = useRef(0);

    const openFoodModal = () => {
        setSelectedFood({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan });

        const currentQuantity = cartItems && cartItems[id] ? cartItems[id] : 0;
        initialQuantityRef.current = currentQuantity;
        setSelectedQuantity(currentQuantity > 0 ? currentQuantity : 1);

        setSpecialInstructions("");
        setIsModalOpen(true);
    };

    const closeFoodModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };

    const handleIncreaseQuantityModal = () => {
        setSelectedQuantity(prev => prev + 1);
    };

    const handleDecreaseQuantityModal = () => {
        setSelectedQuantity(prev => Math.max(prev - 1, 1));
    };

    const handleAddToOrder = () => {
        const diff = selectedQuantity - initialQuantityRef.current;

        if (diff > 0) {
            addToCart(selectedFood.id, diff, specialInstructions);
        } else if (diff < 0) {
            removeFromCart(selectedFood.id, -diff);
        }
        closeFoodModal();
    };

    return (
        <>
            <div className='food-item-category' onClick={openFoodModal} style={{ cursor: 'pointer' }}>
                <div className="food-item-img-container">
                    {isNewAdded && <img className='new-badge' src={assets.new_icon} alt="New" />}
                    {isVegan && <img className='vegan-badge' src={assets.vegan_icon} alt="Vegan" />}
                    {isBestSeller && <img className='best-seller-badge' src={assets.bestseller_icon} alt="Best Seller" />}
                    <img className='food-item-img' src={url + "/images/" + image} alt={name} />

                    {cartItems && cartItems[id] !== undefined ? (
                        <div className='food-item-counter' onClick={e => e.stopPropagation()}>
                            <img onClick={() => removeFromCart(id, 1)} src={assets.remove_icon_red} alt="Remove" />
                            <p>{cartItems[id]}</p>
                            <img onClick={() => addToCart(id, 1)} src={assets.add_icon_green} alt="Add" />
                        </div>
                    ) : (
                        <img
                            className='add'
                            onClick={e => { e.stopPropagation(); addToCart(id, 1); }}
                            src={assets.add_icon_white}
                            alt="Add"
                        />
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

            {isModalOpen && selectedFood && (
                <div className="modal-overlay quick-food-modal">
                    <div className="modal-content">
                        <button className="modal-close-button" onClick={closeFoodModal}>X</button>
                        <h2>{selectedFood.name}</h2>
                        <img src={url + "/images/" + selectedFood.image} alt={selectedFood.name} />
                        <p>{selectedFood.description}</p>

                        <div className="modal-actions">
                            {/* Folosim exact structura butoanelor din lista */}
                            <div className='food-item-counter'>
                                <img onClick={handleDecreaseQuantityModal} src={assets.remove_icon_red} alt="Remove" />
                                <p>{selectedQuantity}</p>
                                <img onClick={handleIncreaseQuantityModal} src={assets.add_icon_green} alt="Add" />
                            </div>
                        </div>

                        <textarea
                            placeholder="Special Instructions"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                        <button className="close" onClick={handleAddToOrder}>Add to Order</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FoodItemCategory;
