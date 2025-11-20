import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useState, useEffect, useContext } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/VerifyPayment/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import ThankYou from "./pages/ThankYou/ThankYou";
import Loading from "./components/Loading/Loading";
import CheckUser from "./components/CheckUser/CheckUser";
import Welcome from "./components/Welcome/Welcome";
import { StoreContext } from "./context/StoreContext";
import axios from "axios";
import "./i18n";
import CategoryPage from "./components/FoodDisplay/CategoryPage";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import GlobalNotification from "./components/GlobalNotifications/GlobalNotifications";
import NotFound from "./components/NotFound/NotFound";
import SessionExpiredModal from "./components/SessionExpiredModal/SessionExpiredModal";

const App = () => {
  const { 
    url, 
    startStatusPolling, 
    stopStatusPolling, 
    userBlocked, 
    setUserBlocked,
    isUserAuthenticated,
    checkUserStatus,
    forceStatusCheck
  } = useContext(StoreContext);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isWelcomePage = location.pathname === "/welcome";
  const isHomePage = location.pathname === "/"; // ✅ Adaugă această verificare

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const tableNumber = localStorage.getItem("tableNumber");

  // Funcție pentru a extinde timpul session-ului
  const extendTime = async (minutes) => {
    if (!userId) {
      console.error("User ID not found");
      return false;
    }

    try {
      const response = await axios.post(`${url}/api/user/extend-time`, {
        userId: userId,
        minutes: minutes
      }, {
        headers: { token }
      });

      if (response.data.success) {
        console.log(`Time extended by ${minutes} minutes`);
        // Forțează o verificare imediată a statusului
        forceStatusCheck();
        return true;
      } else {
        console.error("Failed to extend time:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error extending time:", error);
      return false;
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const table = searchParams.get("table");
    
    if (location.pathname === "/register" && table) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 60000);
      
      if (!tableNumber) {
        localStorage.setItem("tableNumber", table);
      }
      
      // Oprește polling-ul pe pagina de register
      stopStatusPolling();
      setUserBlocked(false);
      setShowSessionExpiredModal(false);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
      
      // Dacă utilizatorul este autentificat, start polling
      if (isUserAuthenticated()) {
        startStatusPolling();
      } else {
        // Dacă nu este autentificat, asigură-te că userBlocked este false
        setUserBlocked(false);
        setShowSessionExpiredModal(false);
        stopStatusPolling();
      }
    }
  }, [token, userId, tableNumber, location.pathname, location.search, navigate]);

  // Efect pentru a gestiona polling-ul când utilizatorul se autentifică/deconectează
  useEffect(() => {
    if (isUserAuthenticated()) {
      startStatusPolling();
    } else {
      stopStatusPolling();
      setUserBlocked(false);
      setShowSessionExpiredModal(false);
    }

    return () => {
      stopStatusPolling();
    };
  }, [token, userId, tableNumber]);

  // ✅ MODIFICAT: Efect pentru a afișa modal-ul doar pe homepage când session-ul expiră
  useEffect(() => {
    if (userBlocked && isHomePage) {
      setShowSessionExpiredModal(true);
    } else {
      setShowSessionExpiredModal(false);
    }
  }, [userBlocked, isHomePage]); // ✅ Schimbat din location.pathname în isHomePage

  // Funcție pentru a închide modal-ul
  const handleCloseSessionModal = () => {
    setShowSessionExpiredModal(false);
  };

  // În App.js, modificați funcția handleExtendTime:
  const handleExtendTime = async (minutes) => {
    if (!userId) {
      console.error("User ID not found");
      return false;
    }

    try {
      // Folosește noua rută pentru session expired
      const response = await axios.post(`${url}/api/user/extend-session-expired`, {
        userId: userId,
        minutes: minutes
      }, {
        headers: { token }
      });

      if (response.data.success) {
        console.log(`Session reactivated and extended by ${minutes} minutes`);
        // Forțează o verificare imediată a statusului
        forceStatusCheck();
        return true;
      } else {
        console.error("Failed to extend session:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error extending session:", error);
      return false;
    }
  };

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <>
          {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
          
          {/* ✅ MODIFICAT: Modal pentru Session Expired - doar pe homepage */}
          {isHomePage && (
            <SessionExpiredModal 
              isOpen={showSessionExpiredModal}
              onClose={handleCloseSessionModal}
              onExtendTime={handleExtendTime}
            />
          )}

          <div className="app">
            <ToastContainer />
            <ScrollToTop />
            <GlobalNotification />
            <Navbar setShowLogin={setShowLogin} isWelcomePage={isWelcomePage} />
            <AnimatePresence mode="wait">
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
                <Route
                  path="/category/:categoryName"
                  element={<CategoryPage />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </div>
        </>
      )}
    </>
  );
};

export default App;