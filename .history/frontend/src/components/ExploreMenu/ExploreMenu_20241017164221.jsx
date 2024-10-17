import React, { useContext } from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            <p className='explore-menu-text'>Discover a world of flavors, crafted with care and passion. Our chefs select only the finest ingredients to bring you a delightful culinary experience. Whether you're craving something savory or sweet, our menu has something to satisfy every appetite. Ready to indulge in something extraordinary? Explore our diverse dishes now!</p>
            <div className="explore-menu-list">
                {foodCategory_list.map((item, index) => {
                    return (
                        <div onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} key={index} className='explore-menu-list-item'>
                            <img className={category === item.menu_name ? "active" : ""} src={`${url}/images/` + item.image} alt="" />
                            <p>{item.menu_name}</p>
                        </div>
                    )
                })}
            </div>
            <hr />
        </div>
    )
   
}

export default ExploreMenu