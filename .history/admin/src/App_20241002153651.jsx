import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add/Add'
import { List } from './pages/List/List'
import Orders from './pages/Orders/Orders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCategory from './pages/AddCategory/AddCategory'
import ListCategory from './pages/ListCategories/ListCategory'


const App = () => {
    const url = "http://localhost:4000";

  return (
    <div>
      <ToastContainer></ToastContainer>
        <Navbar></Navbar>
        <hr></hr>
        <div className="app-content">
            <Sidebar/>
            <Routes>
              <Route path="/add" element={<Add url={url}></Add>}/>
              <Route path="/list" element={<List url={url}></List>}/>
              <Route path="/orders" element={<Orders url={url}></Orders>}/>
              <Route path="/addcategory" element={<AddCategory url={url}></AddCategory>}/>
              <Route path="/listcategory" element={<ListCategory url={url}></ListCategory>}/>
            </Routes>
        </div>
    </div>
  )
}

export default App