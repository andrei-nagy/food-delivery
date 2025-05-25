import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import './CategoryPage.css'; // dacă vrei stiluri separate

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { food_list } = useContext(StoreContext);

  // Filtrează mâncărurile după categoria din URL
  const filteredFood = food_list.filter(item => item.category === categoryName);

  return (
    <div className="category-page">
      <h2>{categoryName}</h2>

      {filteredFood.length > 0 ? (
        <div className="food-list">
          {filteredFood.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description.length > 50 ? item.description.slice(0, 70) + '...' : item.description}
              price={item.price}
              image={item.image}
              isBestSeller={item.isBestSeller}
              isNewAdded={item.isNewAdded}
              isVegan={item.isVegan}
              category={item.category}
            />
          ))}
        </div>
      ) : (
        <p>No items found for this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
