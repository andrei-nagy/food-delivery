import React, { useContext, useState, useRef, useEffect } from 'react';
import './FoodItemCategory.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItemCategory = ({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan, category }) => {
    const { cartItems, addToCart, removeFromCart, url, updateCartItemQuantity } = useContext(StoreContext);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const initialQuantityRef = useRef(0);
    useEffect(() => {
        console.log("FoodItemCategory - cartItems changed:", cartItems);
      }, [cartItems]);
 
const openFoodModal = () => {
    setSelectedFood({ id, name, price, description, image });
    const currentQuantity = cartItems[id] || 0;
    setSelectedQuantity(currentQuantity > 0 ? currentQuantity : 1);
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
    const handleAddToOrder = async () => {
        if (selectedFood) {
            await updateCartItemQuantity(selectedFood.id, selectedQuantity, specialInstructions);
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
            <button className="modal-close-button" onClick={closeFoodModal}>✕</button>
            <div className="modal-header">
                <h2>{selectedFood.name}</h2>
                <p className="modal-price">{(selectedFood.price * selectedQuantity).toFixed(2)} lei</p>
            </div>
            
            <img 
                src={url + "/images/" + selectedFood.image} 
                alt={selectedFood.name} 
                className="modal-food-image"
            />

            <p className="modal-description">{selectedFood.description}</p>

            <div className="modal-controls">
                <div className="quantity-control">
                    <button 
                        className="quantity-btn" 
                        onClick={handleDecreaseQuantityModal}
                    >
                        -
                    </button>
                    <span className="quantity">{selectedQuantity}</span>
                    <button 
                        className="quantity-btn" 
                        onClick={handleIncreaseQuantityModal}
                    >
                        +
                    </button>
                </div>
                
                <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToOrder}
                >
                    Adaugă {(selectedFood.price * selectedQuantity).toFixed(2)} lei
                </button>
            </div>

            <textarea
                className="special-instructions"
                placeholder="Instrucțiuni speciale (opțional)"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
            />
        </div>
    </div>
)}

        </>
    );
};

export default FoodItemCategory;
