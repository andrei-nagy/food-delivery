import React, { useContext } from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext';

const ExploreMenu = ({ category, setCategory }) => {
    const { foodCategory_list, url } = useContext(StoreContext);

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore our menu</h1>
            {/* <p className='explore-menu-text'>Lorem ipsum dolor sit amet consectetur adipisicing elit. In, laborum ad deleniti minima impedit repellat delectus a enim illum inventore! Eum dignissimos facere nihil neque rem id deleniti aliquam necessitatibus?</p> */}
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