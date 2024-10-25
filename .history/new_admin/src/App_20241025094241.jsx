import { Route, Routes, useLocation, useNavigate } from "react-router-dom"; // Importă Navigate
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
import { ThemeProvider } from "./components/themeToggle/ThemeContext"; // Importăm ThemeProvider
import { UrlProvider } from "./components/context/UrlContext";
import SupportPage from "./pages/SupportPage";
import { AppVersionProvider } from "./components/context/AppVersionContext";
import AccountsPage from "./pages/AccountsPage";
import CreateAccountPage from "./pages/RegisterPage";

function App() {
	const location = useLocation(); // Obține locația curentă
	const navigate = useNavigate(); // Hook pentru navigare

	// Verifică dacă utilizatorul este pe pagina de login
	const isLoginPage = location.pathname === '/login';
	const isCreateAccountPage = location.pathname === '/create-account';

	useEffect(() => {
		// Dacă nu există authToken și utilizatorul nu este pe pagina de login
		if (!localStorage.getItem("authToken") && !isLoginPage) {
			navigate("/login"); // Redirecționează utilizatorul la pagina de login
		}
	}, [navigate, isLoginPage]); // Asigură-te că include navigate și isLoginPage în dependențe

	return (
		// <ThemeProvider> {/* Mutăm ThemeProvider aici */}
		<UrlProvider>
			<AppVersionProvider>
			<div className={isLoginPage || isCreateAccountPage ? 'h-screen bg-gray-900 text-gray-100' : 'flex h-screen bg-gray-900 text-gray-100 overflow-hidden'}>
				{/* BG */}
				{/* Renderizează fundalul doar dacă nu e pe pagina de login */}
				{!isLoginPage && (
					<div className='fixed inset-0 z-0'>
						<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
						<div className='absolute inset-0 backdrop-blur-sm' />
					</div>
				)}

				{/* Renderizează Sidebar doar dacă nu e pe pagina de login */}
				{!isLoginPage && <Sidebar />}
				
				{/* Rutele aplicației */}
				<Routes>
					<Route path='/' element={<OverviewPage />} />
					<Route path='/products' element={<ProductsPage />} />
					<Route path='/waiter' element={<WaiterPage />} />
					<Route path='/sales' element={<SalesPage />} />
					<Route path='/orders' element={<OrdersPage />} />
					<Route path='/analytics' element={<AnalyticsPage />} />
					<Route path='/settings' element={<SettingsPage />} />
					<Route path='/products/add' element={<AddProductsPage />} />
					<Route path='/login' element={<Login />} />
					<Route path='/category/add' element={<AddCategoriesPage />} />
					<Route path='/categories' element={<CategoriesPage />} />
					<Route path='/customization' element={<CustomizationPage />} />
					<Route path='/close-order' element={<CloseOrder />} />
					<Route path='/orders/history' element={<OrdersHistoryPage />} />
					<Route path='/support' element={<SupportPage />} />
					<Route path='/accounts' element={<AccountsPage />} />
					<Route path='/create-account' element={<CreateAccountPage />} />
				</Routes>
			</div>
			</AppVersionProvider>
			</UrlProvider>
	);
}

export default App;
