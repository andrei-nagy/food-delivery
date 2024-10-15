// FoodModal.jsx
import React, { useContext, useState } from 'react';
import './FoodModal.css'; // Asigură-te că ai un fișier CSS pentru stiluri

const FoodModal = ({ foodItem, isOpen, onClose, removeFromCart }) => {
    const [specialInstructions, setSpecialInstructions] = useState("");
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const handleSaveInstructions = () => {
        // Aici poți adăuga logica pentru a salva instrucțiunile în baza de date
        console.log("Saving instructions:", specialInstructions);
    };

    if (!isOpen) return null;

    return (
        <div className="food-modal-overlay">
            <div className="food-modal-content">
                <h2>{foodItem.name}</h2>
                <img src={foodItem.image} alt={foodItem.name} />
                <p>{foodItem.description}</p>
                
                <div className="food-modal-actions">
                    <button onClick={() => addToCart(foodItem)}>Add to Cart</button>
                    <button onClick={() => removeFromCart(foodItem)}>Remove from Cart</button>
                </div>
                
                <textarea
                    className="food-modal-textarea"
                    placeholder="Special Instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                />
                <button onClick={handleSaveInstructions}>Save Instructions</button>

                <button className="food-modal-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default FoodModal;
