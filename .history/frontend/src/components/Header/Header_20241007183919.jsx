import React from 'react'
import './Header.css'
 

const Header = () => {

  const tableNumber = localStorage.getItem("tableNumber");

  return (
    <div className='header'>
        <div className="header-contents">
            <h2>Order you favourite food at {tableNumber ? ' table no. ' + tableNumber : ' your table'}</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatem nobis deleniti obcaecati unde autem facilis mollitia quaerat, rem repudiandae sed repellat eius in molestiae harum, cupiditate quos explicabo natus.</p>
        <button>View Menu</button>
        </div>
    </div>
  )
}

export default Header