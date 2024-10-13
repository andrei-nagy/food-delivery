import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import ThankYou from './pages/ThankYou/ThankYou'

const App = () => {

  const [showLogin, setShowLogin] = useState(false);

  return (

    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin}></LoginPopup> : <></>}
      <div className='app'>
        <ToastContainer></ToastContainer>
        <Navbar setShowLogin={setShowLogin}></Navbar>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/login' element={<LoginPopup />} />
          <Route path='/register' element={<LoginPopup />} />
          <Route path='/thank-yoy' element={<ThankYou /> }/>
        </Routes>
      </div>
      <Footer></Footer>
    </>

  )
}

export default App