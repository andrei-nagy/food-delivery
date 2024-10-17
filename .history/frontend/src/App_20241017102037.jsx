import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import ThankYou from './pages/ThankYou/ThankYou';
import Loading from './components/Loading/Loading'; // Importăm componenta Loading
import CheckUser from './components/CheckUser/CheckUser';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false); // State pentru ecranul de încărcare
  const location = useLocation(); // Pentru a detecta ruta curentă

  // Efect pentru a afișa loading screen pe rutele care necesită timp de încărcare
  useEffect(() => {
    if (location.pathname === '/register') {
      setLoading(true); // Setează loading la true când ajunge pe /register
      setTimeout(() => {
        setLoading(false); // Dezactivează loading după 2 secunde sau când datele sunt gata
      }, 40000); // Poți ajusta acest timp
    } else {
      setLoading(false); // Dezactivează loading pe alte rute
    }
  }, [location.pathname]);

  return (
    <>
      {loading && <Loading />} {/* Afișează ecranul de încărcare dacă loading este true */}
      {!loading && (
        <>
          {showLogin ? <LoginPopup setShowLogin={setShowLogin}></LoginPopup> : null}
          <div className="app">
            <ToastContainer></ToastContainer>
            <Navbar setShowLogin={setShowLogin}></Navbar>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order" element={<PlaceOrder />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/login" element={<LoginPopup />} />
              <Route path="/register" element={<LoginPopup />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/validate" element={<CheckUser />} />
            </Routes>
          </div>
          <Footer></Footer>
        </>
      )}
    </>
  );
};

export default App;
