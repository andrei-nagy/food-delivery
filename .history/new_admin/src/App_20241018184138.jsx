import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";

import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AddProductsPage from "./pages/AddProductsPage";
import Login from "./components/login/adminLogin";

function App() {
	const location = useLocation(); // Obține locația curentă
	const url = "http://localhost:4000";

	// Verifică dacă utilizatorul este pe pagina de login
	const isLoginPage = location.pathname === '/login';

	return (
		<div className={isLoginPage ? 'h-screen bg-gray-900 text-gray-100' : 'flex h-screen bg-gray-900 text-gray-100 overflow-hidden'}>
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
				<Route path='/users' element={<UsersPage />} />
				<Route path='/sales' element={<SalesPage />} />
				<Route path='/orders' element={<OrdersPage />} />
				<Route path='/analytics' element={<AnalyticsPage />} />
				<Route path='/settings' element={<SettingsPage />} />
				<Route path='/products/add' element={<AddProductsPage />} />
				<Route path='/login' element={<Login />} />
			</Routes>
		</div>
	);
}

export default App;