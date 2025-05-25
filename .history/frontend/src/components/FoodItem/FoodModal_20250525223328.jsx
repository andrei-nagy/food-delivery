import React, { useContext, useEffect, useState } from 'react';
import './FoodModal.css';
import { StoreContext } from '../../context/StoreContext';

const FoodModal = ({ food, closeModal }) => {
    const { addToCart, url } = useContext(StoreContext);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const increase = () => setSelectedQuantity(q => q + 1);
    const decrease = () => setSelectedQuantity(q => Math.max(1, q - 1));
    const add = () => {
        addToCart(food.id, selectedQuantity, specialInstructions);
        closeModal();
    };

    return (
        <div className="modal-overlay quick-food-modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={closeModal}>✕</button>
                <h2>{food.name}</h2>
                <img src={url + "/images/" + food.image} alt={food.name} className="modal-food-image" />
                <p className="modal-description">{food.description}</p>
                <div className="modal-controls">
                    <div className="quantity-control">
                        <button className="quantity-btn" onClick={decrease}>-</button>
                        <span className="quantity">{selectedQuantity}</span>
                        <button className="quantity-btn" onClick={increase}>+</button>
                    </div>
                    <button className="add-to-cart-btn" onClick={add}>
                        Add {(food.price * selectedQuantity).toFixed(2)} €
                    </button>
                </div>
                <textarea
                    className="special-instructions-modal"
                    placeholder="Special instructions (optional)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                />
            </div>
        </div>
    );
};

export default FoodModal;
