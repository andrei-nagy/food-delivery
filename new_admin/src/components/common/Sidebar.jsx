import {
	BarChart2,
	DollarSign,
	Menu,
	Settings,
	ShoppingBag,
	ShoppingCart,
	TrendingUp,
	Users,
	ChevronDown,
	TreePine,
	UtensilsCrossedIcon,
	UtensilsCrossed,
	HelpCircle,
	PenBox,
	PercentCircle,
	User2Icon,
	BookUser,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Importă useLocation și useNavigate
import { assets } from "../../../../frontend/src/assets/assets";
import ThemeToggleButton from "../themeToggle/ThemeToggleSystem";
import { BiCollection } from "react-icons/bi";
import { setAppVersion } from "../context/AppVersionContext";

const SIDEBAR_ITEMS = [
	{
		name: "Overview",
		icon: BarChart2,
		color: "#6366f1",
		href: "/",
	},
	{ name: "Products", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
	{ name: "Categories", icon: BiCollection, color: "#6EE7B7", href: "/categories" },
	{ name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
	{ name: "Waiter Requests", icon: Users, color: "#EC4899", href: "/waiter" },
	// { name: "Sales", icon: DollarSign, color: "#10B981", href: "/sales" },
	{ name: "Analytics & Sales", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
	{ name: "Customization", icon: PenBox, color: "#3B82F6", href: "/customization" },
	{ name: "Accounts", icon: BookUser, color: "#3B82F6", href: "/accounts" },
	// { name: "Close order", icon: UtensilsCrossed, color: "red", href: "/close-order" },
	// { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
	{ name: "Create an account", icon: User2Icon, color: "#EC4899", href: "/create-account" },
	{ name: "Submit a ticket", icon: HelpCircle, color: "#6EE7B7", href: "/support" },
	{ name: "Release notes", icon: HelpCircle, color: "#3B82F6", href: "/release-notes" },
	// { name: "QR Codes", icon: HelpCircle, color: "#3B82F6", href: "/qrcodes" },


];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

	const [isOrdersOpen, setIsOrdersOpen] = useState(false); // Am corectat setIsOrdersOpen
	const appVersion = setAppVersion();

	const location = useLocation(); // Obține locația curentă
	const navigate = useNavigate(); // Hook pentru navigare
	const role = localStorage.getItem("userRole"); // Obține rolul utilizatorului



	const handleAnalyticsClick = () => {
		setIsAnalyticsOpen((prev) => !prev);
	};
	const handleOrdersClick = () => {
		setIsOrdersOpen((prev) => !prev); // Am corectat numele funcției
	};
	const handleCustomizationClick = () => {
		setIsCustomizationOpen((prev) => !prev); // Am corectat numele funcției
	};
	const handleLogout = () => {
		localStorage.removeItem('authToken'); // Șterge token-ul din localStorage
		localStorage.removeItem('userRole'); // Șterge token-ul din localStorage
		localStorage.removeItem('userName'); // Șterge token-ul din localStorage
		navigate('/login');  // Redirecționează la login
	};

	const [dark, setDark] = useState(false);

	const darkModeHandler = () => {
		setDark(!dark);
		document.body.classList.toggle("dark");
	}
	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
				{/* Adaugă logo aici */}
				<div className="flex items-center mb-6">
					<img
						src={assets.original_logo}
						alt="Logo"
						className="w-20 h-50 rounded-full" // Ajustează dimensiunea după preferințe
					/>
				</div>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
				>
					<Menu size={24} />
				</motion.button>

				<nav className="mt-2 flex-grow">
					{SIDEBAR_ITEMS.map((item) => {
						// Verifică dacă rolul este Admin
						const canRenderItem = role === 'Admin' ||
							(role === 'Waiter' && ['Orders', 'Categories', 'Submit a ticket', 'Waiter Requests'].includes(item.name)) ||
							role !== 'Waiter';

						if (!canRenderItem) return null;

						return (
							<div key={item.href}>
								{item.name === "Orders" ? (
									<>
										<motion.div
											className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
											onClick={handleOrdersClick}
											style={{
												backgroundColor:
													location.pathname === item.href || location.pathname === '/orders/history'
														? "rgba(255, 255, 255, 0.1)"
														: "transparent",
											}}
										>
											<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
											<AnimatePresence>
												{isSidebarOpen && (
													<>
														<motion.span
															className="ml-4 whitespace-nowrap"
															initial={{ opacity: 0, width: 0 }}
															animate={{ opacity: 1, width: "auto" }}
															exit={{ opacity: 0, width: 0 }}
															transition={{ duration: 0.2, delay: 0.3 }}
														>
															{item.name}
														</motion.span>
														<motion.div
															initial={{ rotate: 0 }}
															animate={{ rotate: isOrdersOpen ? 180 : 0 }}
															className="ml-auto"
														>
															<ChevronDown size={16} />
														</motion.div>
													</>
												)}
											</AnimatePresence>
										</motion.div>
										<AnimatePresence>
											{isOrdersOpen && (
												<motion.div
													className="ml-6"
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.3 }}
												>
													<Link to="/orders">
														<motion.div
															className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{
																backgroundColor:
																	location.pathname === "/orders" ? "rgba(255, 255, 255, 0.1)" : "transparent",
															}}
														>
															New orders
														</motion.div>
													</Link>
													<Link to="/orders/history">
														<motion.div
															className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{
																backgroundColor:
																	location.pathname === "/orders/history" ? "rgba(255, 255, 255, 0.1)" : "transparent",
															}}
														>
															Orders History
														</motion.div>
													</Link>
													<Link to="/close-order">
														<motion.div
															className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{
																backgroundColor:
																	location.pathname === "/close-order" ? "rgba(255, 255, 255, 0.1)" : "transparent",
															}}
														>
															Active orders
														</motion.div>
													</Link>
												</motion.div>
											)}
										</AnimatePresence>
									</>
								) : item.name === "Analytics & Sales" ? (
									<>
										<motion.div
											className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
											onClick={handleAnalyticsClick}
											style={{
												backgroundColor:
													location.pathname === item.href || location.pathname === '/analytics' || location.pathname === '/sales'
														? "rgba(255, 255, 255, 0.1)"
														: "transparent",
											}}
										>
											<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
											<AnimatePresence>
												{isSidebarOpen && (
													<>
														<motion.span
															className="ml-4 whitespace-nowrap"
															initial={{ opacity: 0, width: 0 }}
															animate={{ opacity: 1, width: "auto" }}
															exit={{ opacity: 0, width: 0 }}
															transition={{ duration: 0.2, delay: 0.3 }}
														>
															{item.name}
														</motion.span>
														<motion.div
															initial={{ rotate: 0 }}
															animate={{ rotate: isAnalyticsOpen ? 180 : 0 }}
															className="ml-auto"
														>
															<ChevronDown size={16} />
														</motion.div>
													</>
												)}
											</AnimatePresence>
										</motion.div>
										<AnimatePresence>
											{isAnalyticsOpen && (
												<motion.div
													className="ml-6"
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.3 }}
												>
													<Link to="/analytics">
														<motion.div
															className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{
																backgroundColor:
																	location.pathname === "/analytics" ? "rgba(255, 255, 255, 0.1)" : "transparent",
															}}
														>
															Analytics
														</motion.div>
													</Link>
													<Link to="/sales">
														<motion.div
															className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{
																backgroundColor:
																	location.pathname === "/sales" ? "rgba(255, 255, 255, 0.1)" : "transparent",
															}}
														>
															Sales
														</motion.div>
													</Link>
												</motion.div>
											)}
										</AnimatePresence>
									</>
								) : item.name === "Customization" ? (
									<>
        <motion.div
            className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
            onClick={handleCustomizationClick}
            style={{
                backgroundColor:
                    location.pathname === item.href || 
                    location.pathname === '/customization' || 
                    location.pathname === '/create-qrcodes' || 
                    location.pathname === '/qrcodes' ||
                    location.pathname === '/promo-codes'
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
            }}
        >
            <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.span
                            className="ml-4 whitespace-nowrap"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, delay: 0.3 }}
                        >
                            {item.name}
                        </motion.span>
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isCustomizationOpen ? 180 : 0 }}
                            className="ml-auto"
                        >
                            <ChevronDown size={16} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
        <AnimatePresence>
            {isCustomizationOpen && (
                <motion.div
                    className="ml-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Link to="/customization">
                        <motion.div
                            className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
                            style={{
                                backgroundColor:
                                    location.pathname === "/customization" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            }}
                        >
                            Customization
                        </motion.div>
                    </Link>
                    <Link to="/qrcodes">
                        <motion.div
                            className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
                            style={{
                                backgroundColor:
                                    location.pathname === "/qrcodes" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            }}
                        >
                            QR Codes
                        </motion.div>
                    </Link>
                    <Link to="/create-qrcode">
                        <motion.div
                            className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
                            style={{
                                backgroundColor:
                                    location.pathname === "/create-qrcode" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            }}
                        >
                            Create QR Code
                        </motion.div>
                    </Link>
                    {/* Adaugă link-ul pentru Promo Codes */}
                    <Link to="/promo-codes">
                        <motion.div
                            className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
                            style={{
                                backgroundColor:
                                    location.pathname === "/promo-codes" ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            }}
                        >
                            Promo Codes
                        </motion.div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    </>
								) : (
									<Link to={item.href}>
										<motion.div
											className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
											style={{
												backgroundColor: location.pathname === item.href ? "rgba(255, 255, 255, 0.1)" : "transparent",
											}}
										>
											<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
											<AnimatePresence>
												{isSidebarOpen && (
													<motion.span
														className="ml-4 whitespace-nowrap"
														initial={{ opacity: 0, width: 0 }}
														animate={{ opacity: 1, width: "auto" }}
														exit={{ opacity: 0, width: 0 }}
														transition={{ duration: 0.2, delay: 0.3 }}
													>
														{item.name}
													</motion.span>
												)}
											</AnimatePresence>
										</motion.div>
									</Link>
								)}
							</div>
						);
					})}
					
				</nav>


				{/* <ThemeToggleButton /> */}

				{localStorage.getItem("authToken") && ( // Verifică dacă authToken există
					<motion.button
						className="hover:bg-red-700 text-white font-semibold rounded-md px-6 py-2 border-2 border-red-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
						onClick={handleLogout}
					>
						<span className="block sm:hidden">X</span>
						<span className="hidden sm:block">{!isSidebarOpen ? "X" : "Logout"}</span>
					</motion.button>
				)}
				<motion.div
					className="text-gray-500 text-xs mt-4 text-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					App v.{appVersion}
				</motion.div>
			</div>
		</motion.div>
	);
};

export default Sidebar;
