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
import { LanguageProvider } from "./context/LanguageContext";
import axios from "axios";
import "./i18n";
import CategoryPage from "./components/FoodDisplay/CategoryPage";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import GlobalNotification from "./components/GlobalNotifications/GlobalNotifications";
import NotFound from "./components/NotFound/NotFound";
import SessionExpiredModal from "./components/SessionExpiredModal/SessionExpiredModal";
import OrderCompleted from "./pages/OrderCompleted/OrderCompleted";

const App = () => {
  const {
    url,
    startStatusPolling,
    stopStatusPolling,
    userBlocked,
    setUserBlocked,
    isUserAuthenticated,
    checkUserStatus,
    forceStatusCheck,
    restaurantData // 👈 AICI AVEM ACCES LA DEFAULT LANGUAGE
  } = useContext(StoreContext);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const tableNumber = localStorage.getItem("tableNumber");

  // 🔥 FUNCȚIE PENTRU A OBȚINE CODUL LIMBII
  const getLanguageCode = (languageName) => {
    const languageMap = {
      'English': 'en',
      'Français': 'fr', 
      'Español': 'es',
      'Italiano': 'it',
      'Română': 'ro',
      'en': 'en',
      'fr': 'fr',
      'es': 'es',
      'it': 'it',
      'ro': 'ro'
    };
    
    return languageMap[languageName] || 'en';
  };

  // 🔥 VERIFICĂ ȘI SETEAZĂ LIMBA DIN RESTAURANT DATA
  useEffect(() => {
    if (restaurantData?.defaultLanguage) {
      const defaultLangCode = getLanguageCode(restaurantData.defaultLanguage);
      const savedLanguage = sessionStorage.getItem("language");
      
      console.log("🌍 App.js - Restaurant language:", {
        defaultLanguage: restaurantData.defaultLanguage,
        defaultLangCode,
        savedLanguage,
        shouldChange: !savedLanguage
      });
      
      // Dacă nu există limbă salvată, setează limba default
      if (!savedLanguage) {
        sessionStorage.setItem("language", defaultLangCode);
        console.log("🌍 App.js - Set default language to:", defaultLangCode);
      }
    }
  }, [restaurantData]);

  const checkIfShouldRedirectToOrderCompleted = async () => {
    if (!userId || !token) return false;

    try {
      const response = await axios.get(
        `${url}/api/user/check-inactive-orders`,
        {
          headers: { token },
          params: { userId },
        }
      );

      console.log("🔍 Redirect check response:", response.data);
      
      // ✅ LOGICA REVISATĂ: Verifică toate scenariile
      if (response.data.success) {
        // 1. Dacă userul este DEJA INACTIV - REDIRECT (e deja pe order-completed)
        if (response.data.isActive === false && response.data.reason === 'user_inactive') {
          console.log(`✅ User is already inactive - redirecting to order-completed`);
          return true;
        }
        
        // 2. Dacă backend-ul spune să redirecționezi ȘI userul a plătit personal pentru toate
        if (response.data.shouldRedirectToOrderCompleted === true) {
          // Verifică dacă e split bill cu alții
          if (response.data.paymentType === 'split_bill_with_others' || 
              response.data.userPaidForEverything === false) {
            console.log(`⚠️ Split bill with others - NO redirect`);
            return false;
          }
          
          // Dacă ajunge aici, înseamnă că e plată completă personală
          console.log(`✅ Full personal payment - redirecting to order-completed`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking inactive orders:", error);
      return false;
    }
  };

  useEffect(() => {
    const allowedRoutes = [
      "/welcome",
      "/login",
      "/register",
      "/validate",
      "/verify",
      "/thank-you",
      "/order-completed"
    ];
    
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const tableNumber = localStorage.getItem("tableNumber");
    const currentPath = location.pathname;
    
    if (allowedRoutes.includes(currentPath)) {
      return;
    }
    
    if (!userId || !token || !tableNumber) {
      navigate("/welcome", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === "/order-completed") {
      return;
    }

    const checkAndRedirect = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      const excludedRoutes = ["/order-completed", "/welcome", "/validate", "/login", "/register", "/verify", "/thank-you"];
      
      if (userId && token && !excludedRoutes.includes(location.pathname)) {
        try {
          const shouldRedirect = await checkIfShouldRedirectToOrderCompleted();
          
          if (shouldRedirect) {
            if (intervalId) {
              clearInterval(intervalId);
            }
            
            navigate("/order-completed", { 
              state: { 
                autoRedirected: true,
                reason: "all_orders_paid",
                timestamp: Date.now(),
                fromRoute: location.pathname
              },
              replace: true
            });
            
            stopStatusPolling();
          }
        } catch (error) {
          // Silently handle error
        }
      }
    };

    checkAndRedirect();
    const intervalId = setInterval(checkAndRedirect, 10000);
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [location.pathname, navigate, stopStatusPolling]);

  const extendTime = async (minutes) => {
    if (!userId) {
      return false;
    }

    try {
      const response = await axios.post(
        `${url}/api/user/extend-time`,
        {
          userId: userId,
          minutes: minutes,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        forceStatusCheck();
        return true;
      } else {
        return false;
      }
    } catch (error) {
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

      stopStatusPolling();
      setUserBlocked(false);
      setShowSessionExpiredModal(false);

      return () => clearTimeout(timer);
    } else {
      setLoading(false);

      if (isUserAuthenticated()) {
        startStatusPolling();
      } else {
        setUserBlocked(false);
        setShowSessionExpiredModal(false);
        stopStatusPolling();
      }
    }
  }, [
    token,
    userId,
    tableNumber,
    location.pathname,
    location.search,
    navigate,
  ]);

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

  useEffect(() => {
    if (userBlocked && isHomePage) {
      setShowSessionExpiredModal(true);
    } else {
      setShowSessionExpiredModal(false);
    }
  }, [userBlocked, isHomePage]);

  const handleCloseSessionModal = () => {
    setShowSessionExpiredModal(false);
  };

  const handleExtendTime = async (minutes) => {
    if (!userId) {
      return false;
    }

    try {
      const response = await axios.post(
        `${url}/api/user/extend-session-expired`,
        {
          userId: userId,
          minutes: minutes,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        forceStatusCheck();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  return (
    <LanguageProvider>
      {loading ? <Loading /> : null}
      {!loading && (
        <>
          {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}

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
            <Navbar setShowLogin={setShowLogin} />
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
                <Route path="/order-completed" element={<OrderCompleted />} />
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
    </LanguageProvider>
  );
};

export default App;