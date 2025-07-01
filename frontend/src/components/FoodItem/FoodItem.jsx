import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan, openModal }) => {
    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

    const handleClick = () => {
        openModal({ id, name, price, description, image });
    };

    return (
        <div className='food-item' onClick={handleClick} style={{ cursor: 'pointer' }}>
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
                    <img className='add' onClick={e => { e.stopPropagation(); addToCart(id, 1); }} src={assets.add_icon_white} alt="Add" />
                )}
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <p className="food-item-price">{price} €</p>
                </div>
                <p className="food-item-desc">{description.length > 70 ? description.slice(0, 70) + "..." : description}</p>
            </div>
        </div>
    );
};

export default FoodItem;
