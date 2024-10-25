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
	// { name: "Close order", icon: UtensilsCrossed, color: "red", href: "/close-order" },
	// { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
	{ name: "Submit a ticket", icon: HelpCircle, color: "#6EE7B7", href: "/support" },
];

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);
    const appVersion = setAppVersion();

    const location = useLocation();
    const navigate = useNavigate();

    const role = localStorage.getItem("userRole"); // Obține rolul utilizatorului

    const handleProductsClick = () => setIsProductsOpen((prev) => !prev);
    const handleAnalyticsClick = () => setIsAnalyticsOpen((prev) => !prev);
    const handleOrdersClick = () => setIsOrdersOpen((prev) => !prev);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole"); // Șterge și rolul la logout
        navigate("/login");
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
                <div className="flex items-center mb-6">
                    <img
                        src={assets.original_logo}
                        alt="Logo"
                        className="w-20 h-50 rounded-full"
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
                    {SIDEBAR_ITEMS.map((item) => (
                        <div key={item.href}>
                            {/* Condiționează afisarea bazată pe rolul Waiter */}
                            {(role == 'Waiter' && ['Orders', 'Categories', 'Submit a ticket'].includes(item.name)) || role != 'Waiter' ? (
                                <>
                                    {/* Specific pentru Orders */}
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
                                </>
                            ) : null}
                        </div>
                    ))}
                </nav>

                {localStorage.getItem("authToken") && (
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
