import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../FoodDisplay/CategoryPage.css';

const FoodModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="food-modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={e => e.stopPropagation()}>
        <button className="food-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <img src={item.image} alt={item.name} />
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <p><strong>Price:</strong> {item.price}€</p>
      </div>
    </div>
  );
};

export default FoodModal;
