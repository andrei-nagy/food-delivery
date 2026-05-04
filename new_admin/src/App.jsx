import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Sidebar from "./components/common/Sidebar";

import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AddProductsPage from "./pages/AddProductsPage";
import Login from "./components/login/AdminLogin";
import WaiterPage from "./pages/WaiterPage";
import AddCategoriesPage from "./pages/AddCategoriesPage";
import CategoriesPage from "./pages/CategoriesPage";
import CustomizationPage from "./pages/CustomizationPage";
import CloseOrder from "./pages/CloseOrder";
import OrdersHistoryPage from "./pages/OrdersHistory";
import AddProductsInOrderPage from "./pages/AddProductsInOrder";
import { UrlProvider } from "./components/context/UrlContext";
import SupportPage from "./pages/SupportPage";
import { AppVersionProvider } from "./components/context/AppVersionContext";
import AccountsPage from "./pages/AccountsPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import { ToastContainer } from "react-toastify";
import CreateQrCodePage from "./pages/CreateQrCodePage";
import QrCodesPage from "./pages/QRCodesPage";
import PromoCodePage from "./pages/PromoCodePage";
import FeatureFlagsPage from "./pages/FeatureFlagsPage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/login";
  const isCreateAccountPage = location.pathname === "/create-account";

  useEffect(() => {
    if (!localStorage.getItem("authToken") && !isLoginPage) {
      navigate("/login");
    }
  }, [navigate, isLoginPage]);

  // Redirect unauthorized users away from /feature-flags
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const allowedRoles = ["Admin", "Orderly"]; // Permite Admin și Orderly
    if (location.pathname === "/feature-flags" && !allowedRoles.includes(role)) {
      navigate("/");
    }
  }, [location.pathname, navigate]);

  return (
    <UrlProvider>
      <AppVersionProvider>
        <div
          className={
            isLoginPage || isCreateAccountPage
              ? "h-screen bg-gray-900 text-gray-100"
              : "flex h-screen bg-gray-900 text-gray-100 overflow-hidden"
          }
        >
          {!isLoginPage && !isCreateAccountPage && (
            <div className="fixed inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
          )}

          <ToastContainer />

          {!isLoginPage && !isCreateAccountPage && <Sidebar />}

          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/waiter" element={<WaiterPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/products/add" element={<AddProductsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/category/add" element={<AddCategoriesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/customization" element={<CustomizationPage />} />
            <Route path="/close-order" element={<CloseOrder />} />
            <Route path="/orders/history" element={<OrdersHistoryPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/create-qrcode" element={<CreateQrCodePage />} />
            <Route path="/qrcodes" element={<QrCodesPage />} />
            <Route path="/add-products" element={<AddProductsInOrderPage />} />
            <Route path="/promo-codes" element={<PromoCodePage />} />
            <Route path="/feature-flags" element={<FeatureFlagsPage />} />
          </Routes>
        </div>
      </AppVersionProvider>
    </UrlProvider>
  );
}

export default App;