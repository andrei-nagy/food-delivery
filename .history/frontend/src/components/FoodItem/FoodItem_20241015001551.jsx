import React, { useContext } from 'react'
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';


const FoodItem = ({ id, name, price, description, image }) => {


    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");


    const openModal = () => {
        setSelectedFood({ id, name, price, description, image });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };

    const handleSaveInstructions = async () => {
        // Aici poți adăuga logica pentru a salva instrucțiunile în baza de date
        console.log("Saving instructions:", specialInstructions);
        // Implementare logică de salvare a instrucțiunilor
    };
    


    return (
        <>
            <div className='food-item' onClick={openModal}>
                <div className="food-item-img-container">
                    <img className='food-item-img' src={url + "/images/" + image} alt={name} />

                    {cartItems && cartItems[id] !== undefined
                        ? (
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{selectedFood.name}</h2>
                        <img src={url + "/images/" + selectedFood.image} alt={selectedFood.name} />
                        <p>{selectedFood.description}</p>

                        <div className="modal-actions">
                            <button onClick={() => addToCart(selectedFood.id)}>Add to Cart</button>
                            <button onClick={() => removeFromCart(selectedFood.id)}>Remove from Cart</button>
                        </div>

                        <textarea
                            placeholder="Special Instructions"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                        <button onClick={handleSaveInstructions}>Save Instructions</button>

                        <button className="close" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FoodItem;