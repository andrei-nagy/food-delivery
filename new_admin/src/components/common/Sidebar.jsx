import {
	BarChart2,
	Menu,
	Settings,
	ShoppingBag,
	ShoppingCart,
	TrendingUp,
	Users,
	ChevronDown,
	HelpCircle,
	PenBox,
	User2Icon,
	BookUser,
	ToggleLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../../../../frontend/src/assets/assets";
import { BiCollection } from "react-icons/bi";
import { setAppVersion } from "../context/AppVersionContext";

const SIDEBAR_ITEMS = [
	{ name: "Overview",          icon: BarChart2,   color: "#6366f1", href: "/" },
	{ name: "Products",          icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
	{ name: "Categories",        icon: BiCollection,color: "#6EE7B7", href: "/categories" },
	{ name: "Orders",            icon: ShoppingCart,color: "#F59E0B", href: "/orders" },
	{ name: "Waiter Requests",   icon: Users,       color: "#EC4899", href: "/waiter" },
	{ name: "Analytics & Sales", icon: TrendingUp,  color: "#3B82F6", href: "/analytics" },
	{ name: "Customization",     icon: PenBox,      color: "#3B82F6", href: "/customization" },
	{ name: "Accounts",          icon: BookUser,    color: "#3B82F6", href: "/accounts" },
	{ name: "Settings",          icon: Settings,    color: "#6EE7B7", href: "/settings" },
	{ name: "Feature Flags",     icon: ToggleLeft,  color: "#a855f7", href: "/feature-flags" },
	{ name: "Create an account", icon: User2Icon,   color: "#EC4899", href: "/create-account" },
	{ name: "Submit a ticket",   icon: HelpCircle,  color: "#6EE7B7", href: "/support" },
	{ name: "Release notes",     icon: HelpCircle,  color: "#3B82F6", href: "/release-notes" },
];

const Sidebar = () => {
	const [isSidebarOpen,       setIsSidebarOpen]       = useState(true);
	const [isAnalyticsOpen,     setIsAnalyticsOpen]     = useState(false);
	const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
	const [isOrdersOpen,        setIsOrdersOpen]        = useState(false);
	const appVersion = setAppVersion();

	const location = useLocation();
	const navigate = useNavigate();

	const role     = localStorage.getItem("userRole") ?? "";
	const userName = localStorage.getItem("userName") ?? "";

	// Feature Flags vizibil DOAR pentru rolul "Orderly" (contul Orderly Team)
	const isOrderlyTeam = role === "Orderly";

	useEffect(() => {
		if (!isSidebarOpen) {
			setIsAnalyticsOpen(false);
			setIsCustomizationOpen(false);
			setIsOrdersOpen(false);
		}
	}, [isSidebarOpen]);

	const toggleSidebar          = () => setIsSidebarOpen(p => !p);
	const handleAnalyticsClick   = () => setIsAnalyticsOpen(p => !p);
	const handleOrdersClick      = () => setIsOrdersOpen(p => !p);
	const handleCustomizationClick = () => setIsCustomizationOpen(p => !p);

	const handleLogout = () => {
		localStorage.removeItem('authToken');
		localStorage.removeItem('userRole');
		localStorage.removeItem('userName');
		navigate('/login');
	};

	return (
		<motion.div
			className={`hidden md:block relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? "w-64" : "w-20"}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700 overflow-hidden">
				{/* Logo */}
				<div className="flex items-center mb-6">
					<img src={assets.original_logo} alt="Logo" className="w-20 h-50 rounded-full" />
				</div>

				<motion.button
					whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
					onClick={toggleSidebar}
					className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
				>
					<Menu size={24} />
				</motion.button>

				{/* ── Nav ── */}
				<nav className="mt-2 flex-grow overflow-y-auto overflow-x-hidden min-h-0">
					{SIDEBAR_ITEMS.map((item) => {
						// Reguli de vizibilitate per rol
						const canRenderItem =
							role === 'Admin' ||
							(role === 'Waiter' && ['Orders', 'Categories', 'Submit a ticket', 'Waiter Requests'].includes(item.name)) ||
							role !== 'Waiter';

						// Feature Flags — exclusiv pentru rolul Orderly
						if (item.name === "Feature Flags" && !isOrderlyTeam) return null;
						if (!canRenderItem) return null;

						// ── Orders dropdown ──
						if (item.name === "Orders") return (
							<div key={item.href}>
								<motion.div
									className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
									onClick={handleOrdersClick}
									style={{ backgroundColor: location.pathname === item.href || location.pathname === '/orders/history' ? "rgba(255,255,255,0.1)" : "transparent" }}
								>
									<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
									<AnimatePresence>
										{isSidebarOpen && (
											<>
												<motion.span className="ml-4 whitespace-nowrap"
													initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
													exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, delay: 0.3 }}>
													{item.name}
												</motion.span>
												<motion.div initial={{ rotate: 0 }} animate={{ rotate: isOrdersOpen ? 180 : 0 }} className="ml-auto">
													<ChevronDown size={16} />
												</motion.div>
											</>
										)}
									</AnimatePresence>
								</motion.div>
								{isSidebarOpen && (
									<AnimatePresence>
										{isOrdersOpen && (
											<motion.div className="ml-6"
												initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
												{[
													{ to: "/orders",         label: "New orders" },
													{ to: "/orders/history", label: "Orders History" },
													{ to: "/close-order",    label: "Active orders" },
												].map(({ to, label }) => (
													<Link key={to} to={to}>
														<motion.div className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{ backgroundColor: location.pathname === to ? "rgba(255,255,255,0.1)" : "transparent" }}>
															{label}
														</motion.div>
													</Link>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								)}
							</div>
						);

						// ── Analytics dropdown ──
						if (item.name === "Analytics & Sales") return (
							<div key={item.href}>
								<motion.div
									className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
									onClick={handleAnalyticsClick}
									style={{ backgroundColor: [item.href, '/analytics', '/sales'].includes(location.pathname) ? "rgba(255,255,255,0.1)" : "transparent" }}
								>
									<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
									<AnimatePresence>
										{isSidebarOpen && (
											<>
												<motion.span className="ml-4 whitespace-nowrap"
													initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
													exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, delay: 0.3 }}>
													{item.name}
												</motion.span>
												<motion.div initial={{ rotate: 0 }} animate={{ rotate: isAnalyticsOpen ? 180 : 0 }} className="ml-auto">
													<ChevronDown size={16} />
												</motion.div>
											</>
										)}
									</AnimatePresence>
								</motion.div>
								{isSidebarOpen && (
									<AnimatePresence>
										{isAnalyticsOpen && (
											<motion.div className="ml-6"
												initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
												{[
													{ to: "/analytics", label: "Analytics" },
													{ to: "/sales",     label: "Sales" },
												].map(({ to, label }) => (
													<Link key={to} to={to}>
														<motion.div className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{ backgroundColor: location.pathname === to ? "rgba(255,255,255,0.1)" : "transparent" }}>
															{label}
														</motion.div>
													</Link>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								)}
							</div>
						);

						// ── Customization dropdown ──
						if (item.name === "Customization") return (
							<div key={item.href}>
								<motion.div
									className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
									onClick={handleCustomizationClick}
									style={{ backgroundColor: ['/customization','/create-qrcodes','/qrcodes','/promo-codes'].includes(location.pathname) ? "rgba(255,255,255,0.1)" : "transparent" }}
								>
									<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
									<AnimatePresence>
										{isSidebarOpen && (
											<>
												<motion.span className="ml-4 whitespace-nowrap"
													initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
													exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, delay: 0.3 }}>
													{item.name}
												</motion.span>
												<motion.div initial={{ rotate: 0 }} animate={{ rotate: isCustomizationOpen ? 180 : 0 }} className="ml-auto">
													<ChevronDown size={16} />
												</motion.div>
											</>
										)}
									</AnimatePresence>
								</motion.div>
								{isSidebarOpen && (
									<AnimatePresence>
										{isCustomizationOpen && (
											<motion.div className="ml-6"
												initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
												{[
													{ to: "/customization",  label: "Customization" },
													{ to: "/qrcodes",        label: "QR Codes" },
													{ to: "/create-qrcode",  label: "Create QR Code" },
													{ to: "/promo-codes",    label: "Promo Codes" },
												].map(({ to, label }) => (
													<Link key={to} to={to}>
														<motion.div className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
															style={{ backgroundColor: location.pathname === to ? "rgba(255,255,255,0.1)" : "transparent" }}>
															{label}
														</motion.div>
													</Link>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								)}
							</div>
						);

						// ── Feature Flags (corectat cu Link în loc de onClick) ──
						if (item.name === "Feature Flags") return (
							<Link key={item.href} to={item.href}>
								<motion.div
									className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 relative"
									style={{
										backgroundColor: location.pathname === item.href ? "rgba(168,85,247,0.15)" : "transparent",
										border: location.pathname === item.href ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
									}}
								>
									<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
									<AnimatePresence>
										{isSidebarOpen && (
											<motion.span className="ml-4 whitespace-nowrap"
												initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
												exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, delay: 0.3 }}>
												{item.name}
											</motion.span>
										)}
									</AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											initial={{ opacity: 0 }} animate={{ opacity: 1 }}
											transition={{ duration: 0.2, delay: 0.4 }}
											style={{
												marginLeft: "auto", fontSize: "9px", fontWeight: 700,
												textTransform: "uppercase", letterSpacing: "0.05em",
												padding: "2px 6px", borderRadius: "999px",
												background: "rgba(168,85,247,0.2)", color: "#c084fc",
												border: "1px solid rgba(168,85,247,0.3)", whiteSpace: "nowrap",
											}}>
											Admin
										</motion.span>
									)}
								</motion.div>
							</Link>
						);

						// ── Default link ──
						return (
							<Link key={item.href} to={item.href}>
								<motion.div
									className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2"
									style={{ backgroundColor: location.pathname === item.href ? "rgba(255,255,255,0.1)" : "transparent" }}
								>
									<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
									<AnimatePresence>
										{isSidebarOpen && (
											<motion.span className="ml-4 whitespace-nowrap"
												initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
												exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, delay: 0.3 }}>
												{item.name}
											</motion.span>
										)}
									</AnimatePresence>
								</motion.div>
							</Link>
						);
					})}
				</nav>

				{/* Logout */}
				{localStorage.getItem("authToken") && (
					<motion.button
						className="hover:bg-red-700 text-white font-semibold rounded-md px-6 py-2 border-2 border-red-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none mt-2"
						onClick={handleLogout}
					>
						<span className="block sm:hidden">X</span>
						<span className="hidden sm:block">{!isSidebarOpen ? "X" : "Logout"}</span>
					</motion.button>
				)}

				<motion.div className="text-gray-500 text-xs mt-4 text-center"
					initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
					App v.{appVersion}
				</motion.div>
			</div>
		</motion.div>
	);
};

export default Sidebar;