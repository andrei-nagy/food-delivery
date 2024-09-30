import React from 'react'
import './Navbar.css'
import Sidebar from '../Sidebar/Sidebar'
const Navbar = () => {
  return (
    <div>
        <Navbar></Navbar>
        <hr></hr>
        <div className="app-content">
            <Sidebar/>
        </div>
    </div>
  )
}

export default Navbar