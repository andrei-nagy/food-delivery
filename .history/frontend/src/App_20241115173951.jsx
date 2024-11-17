import React, { useState, useEffect, useContext } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import Loading from './components/Loading/Loading'; 
import CheckUser from './components/CheckUser/CheckUser';
import Welcome from './components/Welcome/Welcome';
import { StoreContext } from './context/StoreContext';
import axios from 'axios';

const App = () => {
  const { url } = useContext(StoreContext);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isWelcomePage = location.pathname === '/welcome';

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const tableNumber = localStorage.getItem("tableNumber");

  // Funcție pentru logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tableNumber");
    localStorage.removeItem("userId");
    navigate("/welcome"); 
    window.location.reload();
  };

  // Funcție pentru a verifica dacă utilizatorul este activ
  const checkUserStatus = async () => {
    try {
      if (!userId || !token) {
        return;
      }
      const response = await axios.post(`${url}/api/user/check-status`, {}, {
        headers: { userId }
      });

      const { isActive, tokenExpiry } = response.data;
      const now = new Date();
      if (isActive === false || new Date(tokenExpiry) < now) {
        logout();
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const table = searchParams.get('table');

    if (!token || !userId || !tableNumber) {
        if (location.pathname === '/register' && table) {
            // Stochează tableNumber în localStorage pentru utilizare ulterioară
            if (!tableNumber) {
                localStorage.setItem('tableNumber', table);
            }
            return; // Oprește execuția pentru a evita redirecționarea
        }

        navigate('/welcome'); // Redirecționează doar dacă niciuna dintre condițiile de mai sus nu este îndeplinită
    } else {
        // Verifică statusul utilizatorului dacă tokenul există
        checkUserStatus();
    }

    if (location.pathname === '/register') {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 60000); // 60 de secunde

        // Curățăm timer-ul la demontarea componentei
        return () => clearTimeout(timer);
    } else {
        setLoading(false);
    }
}, [token, userId, tableNumber, location.pathname, location.search, navigate]);



  return (
    <>
      {loading && <Loading />} 
      {!loading && (
        <>
          {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
          <div className="app">
            <ToastContainer />
            <Navbar setShowLogin={setShowLogin} />
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
              <Route path="/welcome" element={<Welcome />} />
            </Routes>
          </div>
          {!isWelcomePage && <Footer />}
        </>
      )}
    </>
  );
};

export default App;
