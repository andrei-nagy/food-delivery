import React from 'react';
import { assets } from '../../assets/assets';

const QuantityCounter = ({ quantity, onIncrease, onDecrease }) => {
    return (
        <div className='food-item-counter'>
            <img onClick={onDecrease} src={assets.remove_icon_red} alt="Remove" />
            <p>{quantity}</p>
            <img onClick={onIncrease} src={assets.add_icon_green} alt="Add" />
        </div>
    );
};

export default QuantityCounter;
