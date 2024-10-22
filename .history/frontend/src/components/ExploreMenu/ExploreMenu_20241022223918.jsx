import React, { useContext } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);

    // Filtrăm categoriile pentru a păstra doar cele active
    const activeCategories = foodCategory_list.filter(item => item.isActive);

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            <p className='explore-menu-text'>
                Discover a world of flavors, crafted with care and passion. Our chefs select only the finest ingredients to bring you a delightful culinary experience. Whether you're craving something savory or sweet, our menu has something to satisfy every appetite.
            </p>
            <div className="explore-menu-list">
                {activeCategories.map((item, index) => {
                    return (
                        <div 
                            onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
                            key={index} 
                            className='explore-menu-list-item'
                        >
                            <img 
                                className={category === item.menu_name ? "active" : ""} 
                                src={`${url}/images/` + item.image} 
                                alt={item.menu_name} 
                            />
                            <p>{item.menu_name}</p>
                        </div>
                    );
                })}
            </div>
            <hr />
        </div>
    );
}

export default ExploreMenu;
