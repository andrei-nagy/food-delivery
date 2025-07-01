import React, { useState } from 'react';
import FoodItemCategory from '../FoodItem/FoodItemCategory';
import './SearchBar.css';

const SearchBar = ({ food_list, onItemClick, searchQuery, setSearchQuery }) => {
    const filteredItems = food_list.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          aria-label="Search products"
        />
  
        {searchQuery && (
          <div className="search-results">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <FoodItemCategory
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  isBestSeller={item.isBestSeller}
                  isNewAdded={item.isNewAdded}
                  isVegan={item.isVegan}
                  category={item.category}
                  onClick={() => onItemClick(item)}
                />
              ))
            ) : (
              <p className="no-results">No products found.</p>
            )}
          </div>
        )}
      </div>
    );
  };

export default SearchBar;
