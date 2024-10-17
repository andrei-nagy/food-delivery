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
import Loading from './components/Loading/Loading'; // Importăm componenta Loading
import CheckUser from './components/CheckUser/CheckUser';
import Welcome from './components/Welcome/Welcome';
import { StoreContext } from './context/StoreContext';
import axios
  from 'axios';
const App = () => {
  const { url } = useContext(StoreContext);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false); // State pentru ecranul de încărcare
  const location = useLocation(); // Pentru a detecta ruta curentă
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // Funcție pentru logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tableNumber");
    localStorage.removeItem("userId");
    setUserId("");
    setToken("");
    navigate("/"); // Redirecționează utilizatorul către pagina principală
    window.location.reload();
  };

  // Funcție pentru a verifica dacă utilizatorul este activ sau dacă token-ul a expirat
  const checkUserStatus = async () => {
    try {

      // Verificăm doar dacă userId și token există înainte să facem request
      if (!userId || !token) {
        console.log('Nu există token sau userId');
        return;
      }


      const response = await axios.post(`${url}/api/user/check-status`, {}, {
        headers: {
          userId: userId
        }
      });
      const { isActive, tokenExpiry } = response.data;
console.log('respomse ' + response.data)
      const now = new Date();
      // Verificăm dacă isActive și tokenExpiry sunt corecte înainte de logout
      if (isActive === false || !tokenExpiry || new Date(tokenExpiry) < now) {
        console.log('INTRAM AICI 1 - Utilizator inactiv sau token expirat');
        logout();
      }
    } catch (error) {
      console.log('INTRAM AICI 2')
      console.error("Error checking user status:", error);
      // logout(); // În caz de eroare, facem logout
    }
  };


  // Efect pentru a afișa loading screen pe rutele care necesită timp de încărcare
  useEffect(() => {
    if (location.pathname === '/register') {
      setLoading(true); // Setează loading la true când ajunge pe /register
      setTimeout(() => {
        setLoading(false); // Dezactivează loading după 40 de secunde
      }, 60000);
    } else {
      setLoading(false); // Dezactivează loading pe alte rute
    }

    if (token) {
      // Setăm un interval pentru a verifica la fiecare 10 minute dacă utilizatorul este activ
      // const interval = setInterval(() => {
      checkUserStatus(); // Verifică statusul utilizatorului
      // }, 10 * 60 * 1000); // 10 minute

      // Curățăm intervalul la unmount pentru a preveni scurgeri de memorie
      // return () => clearInterval(interval);
    }
  }, [location.pathname, token]);

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
              <Route path="/welcome" element={<Welcome />} />
            </Routes>
          </div>
          <Footer></Footer>
        </>
      )}
    </>
  );
};

export default App;
