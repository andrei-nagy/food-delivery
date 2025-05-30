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
  } from "lucide-react";
  import { useState } from "react";
  import { AnimatePresence, motion } from "framer-motion";
  import { Link } from "react-router-dom";
  import { assets } from "../../../../frontend/src/assets/assets";


  const SIDEBAR_ITEMS = [
	{
	  name: "Overview",
	  icon: BarChart2,
	  color: "#6366f1",
	  href: "/",
	},
	{ name: "Products", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
	{ name: "Users", icon: Users, color: "#EC4899", href: "/users" },
	{ name: "Sales", icon: DollarSign, color: "#10B981", href: "/sales" },
	{ name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
	{ name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
	{ name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
  ];
  
  const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isProductsOpen, setIsProductsOpen] = useState(false); // Stare pentru submeniul Products
  
	const handleProductsClick = () => {
	  setIsProductsOpen((prev) => !prev); // Toggle submeniu
	};
  
	return (
	  <motion.div
		className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
		  isSidebarOpen ? "w-64" : "w-20"
		}`}
		animate={{ width: isSidebarOpen ? 256 : 80 }}
	  >
		<div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
			 {/* Adaugă logo aici */}
			 <div className="flex items-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-full" // Ajustează dimensiunea după preferințe
          />
          {isSidebarOpen && (
            <span className="ml-2 text-white text-lg font-bold">Orderly</span>
          )}
        </div>
		  <motion.button
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			onClick={() => setIsSidebarOpen(!isSidebarOpen)}
			className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
		  >
			<Menu size={24} />
		  </motion.button>
  
		  <nav className="mt-8 flex-grow">
			{SIDEBAR_ITEMS.map((item) => (
			  <div key={item.href}>
				{item.name === "Products" ? (
				  <>
					<motion.div
					  className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 cursor-pointer"
					  onClick={handleProductsClick}
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
							  animate={{ rotate: isProductsOpen ? 180 : 0 }}
							  className="ml-auto"
							>
							  <ChevronDown size={16} />
							</motion.div>
						  </>
						)}
					  </AnimatePresence>
					</motion.div>
  
					<AnimatePresence>
					  {isProductsOpen && (
						<motion.div
						  className="ml-6"
						  initial={{ height: 0, opacity: 0 }}
						  animate={{ height: "auto", opacity: 1 }}
						  exit={{ height: 0, opacity: 0 }}
						  transition={{ duration: 0.3 }}
						>
						  <Link to="/products/add">
							<motion.div className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
							  Add Items
							</motion.div>
						  </Link>
						  <Link to="/products">
							<motion.div className="p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
							  Products
							</motion.div>
						  </Link>
						</motion.div>
					  )}
					</AnimatePresence>
				  </>
				) : (
				  <Link to={item.href}>
					<motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
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
			))}
		  </nav>
		</div>
	  </motion.div>
	);
  };
  export default Sidebar;
  