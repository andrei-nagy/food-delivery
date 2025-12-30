import { useState, useEffect, useMemo, useRef } from "react";
import { Menu, X, Bell, Search, Settings, LogOut, User, Home, Package, ShoppingCart, BarChart, HelpCircle, PenBox, Users as UsersIcon, UserPlus, FileText, ChevronRight, Filter } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ title, onSearch, showNotifications = true }) => {
    const name = localStorage.getItem("userName") || "User";
    const role = localStorage.getItem("userRole") || "User";
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMobileSearch, setShowMobileSearch] = useState(false); // Nou: control pentru search pe mobil
    const searchInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // TOATE secțiunile din sidebar cu mai multe detalii pentru search
    const getAllMenuItems = () => {
        const allItems = [
            { 
                name: "Overview", 
                path: "/", 
                icon: <Home size={20} />, 
                color: "#6366f1",
                keywords: ["dashboard", "home", "main", "overview", "principal"]
            },
            { 
                name: "Products", 
                path: "/products", 
                icon: <Package size={20} />, 
                color: "#8B5CF6",
                keywords: ["products", "items", "menu", "produse", "articole"]
            },
            { 
                name: "Categories", 
                path: "/categories", 
                icon: <Package size={20} />, 
                color: "#6EE7B7",
                keywords: ["categories", "categories", "sections", "categorii", "section"]
            },
            { 
                name: "Orders", 
                path: "/orders", 
                icon: <ShoppingCart size={20} />, 
                color: "#F59E0B",
                keywords: ["orders", "comenzi", "orders", "purchases", "command"]
            },
            { 
                name: "Waiter Requests", 
                path: "/waiter", 
                icon: <UsersIcon size={20} />, 
                color: "#EC4899",
                keywords: ["waiter", "requests", "chelner", "cereri", "assistance", "ajutor"]
            },
            { 
                name: "Analytics & Sales", 
                path: "/analytics", 
                icon: <BarChart size={20} />, 
                color: "#3B82F6",
                keywords: ["analytics", "sales", "statistics", "reports", "analize", "vanzari"]
            },
            { 
                name: "Customization", 
                path: "/customization", 
                icon: <PenBox size={20} />, 
                color: "#3B82F6",
                keywords: ["customization", "personalizare", "settings", "config", "setup"]
            },
            { 
                name: "Accounts", 
                path: "/accounts", 
                icon: <User size={20} />, 
                color: "#3B82F6",
                keywords: ["accounts", "users", "conturi", "utilizatori", "profile"]
            },
            { 
                name: "Settings", 
                path: "/settings", 
                icon: <Settings size={20} />, 
                color: "#6EE7B7",
                keywords: ["settings", "setari", "configuration", "preferences", "optiuni"]
            },
            { 
                name: "Create an account", 
                path: "/create-account", 
                icon: <UserPlus size={20} />, 
                color: "#EC4899",
                keywords: ["create account", "new user", "register", "inregistrare", "nou cont"]
            },
            { 
                name: "Submit a ticket", 
                path: "/support", 
                icon: <HelpCircle size={20} />, 
                color: "#6EE7B7",
                keywords: ["submit ticket", "support", "help", "ajutor", "asistenta", "ticket"]
            },
            { 
                name: "Release notes", 
                path: "/release-notes", 
                icon: <FileText size={20} />, 
                color: "#3B82F6",
                keywords: ["release notes", "updates", "versiuni", "actualizari", "changelog"]
            },
        ];

        // Filtrare bazată pe rol (ca în sidebar)
        if (role === "Waiter") {
            return allItems.filter(item => 
                ["Orders", "Categories", "Submit a ticket", "Waiter Requests"].includes(item.name)
            );
        }
        
        return allItems;
    };

    // Submeniuri (ca în sidebar)
    const getSubmenuItems = (mainItem) => {
        switch(mainItem.name) {
            case "Orders":
                return [
                    { 
                        name: "New orders", 
                        path: "/orders", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["new orders", "orders", "comenzi noi", "noi"]
                    },
                    { 
                        name: "Orders History", 
                        path: "/orders/history", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["orders history", "history", "istoric", "vechi", "anterioare"]
                    },
                    { 
                        name: "Active orders", 
                        path: "/close-order", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["active orders", "active", "activi", "curent", "in progress"]
                    },
                ];
            case "Analytics & Sales":
                return [
                    { 
                        name: "Analytics", 
                        path: "/analytics", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["analytics", "statistics", "analize", "date"]
                    },
                    { 
                        name: "Sales", 
                        path: "/sales", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["sales", "vanzari", "income", "venituri"]
                    },
                ];
            case "Customization":
                return [
                    { 
                        name: "Customization", 
                        path: "/customization", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["customization", "personalizare", "main"]
                    },
                    { 
                        name: "QR Codes", 
                        path: "/qrcodes", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["qr codes", "qr", "codes", "coduri", "scan"]
                    },
                    { 
                        name: "Create QR Code", 
                        path: "/create-qrcode", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["create qr code", "create", "generare", "new qr"]
                    },
                    { 
                        name: "Promo Codes", 
                        path: "/promo-codes", 
                        icon: <ChevronRight size={16} />,
                        keywords: ["promo codes", "promo", "discount", "reduceri", "voucher"]
                    },
                ];
            default:
                return [];
        }
    };

    const [openSubmenus, setOpenSubmenus] = useState({});

    const toggleSubmenu = (itemName) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    // Mock notifications
    useEffect(() => {
        setNotifications([
            { id: 1, text: "New order received", time: "5 min ago", read: false },
            { id: 2, text: "Table 4 needs assistance", time: "15 min ago", read: true },
        ]);
    }, []);

    const getInitials = (fullName) => {
        if (!fullName) return "U";
        return fullName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleMenuSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        // Dacă search query-ul nu este gol, deschide toate submeniurile pentru a vedea rezultatele
        if (query.trim()) {
            const menuItems = getAllMenuItems();
            menuItems.forEach(item => {
                const subItems = getSubmenuItems(item);
                if (subItems.length > 0) {
                    setOpenSubmenus(prev => ({ ...prev, [item.name]: true }));
                }
            });
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const filteredItems = filterMenuItems;
            if (filteredItems.length === 1) {
                navigate(filteredItems[0].path);
                setSearchQuery("");
                setIsMobileMenuOpen(false);
                setShowMobileSearch(false);
            }
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        if (showMobileSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    // Funcție pentru a filtra meniul bazat pe search
    const filterMenuItems = useMemo(() => {
        const allItems = getAllMenuItems();
        
        if (!searchQuery.trim()) {
            return allItems;
        }

        const query = searchQuery.toLowerCase().trim();
        
        return allItems.filter(item => {
            // Verifică dacă item-ul principal se potrivește
            const matchesMainItem = 
                item.name.toLowerCase().includes(query) ||
                (item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(query)));
            
            // Verifică dacă vreun subitem se potrivește
            const subItems = getSubmenuItems(item);
            const matchesSubItems = subItems.some(subItem => 
                subItem.name.toLowerCase().includes(query) ||
                (subItem.keywords && subItem.keywords.some(keyword => keyword.toLowerCase().includes(query)))
            );
            
            return matchesMainItem || matchesSubItems;
        });
    }, [searchQuery, role]);

    // Verifică dacă un item sau subitem este activ pentru highlighting
    const isItemActive = (item, subItems = []) => {
        return location.pathname === item.path || 
            subItems.some(sub => location.pathname === sub.path);
    };

    // Verifică dacă un subitem se potrivește cu search query-ul
    const isSubItemMatchingSearch = (subItem) => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase().trim();
        return (
            subItem.name.toLowerCase().includes(query) ||
            (subItem.keywords && subItem.keywords.some(keyword => keyword.toLowerCase().includes(query)))
        );
    };

    // Funcție pentru a naviga direct la un item căutat
    const navigateToSearchResult = (item, isSubItem = false, subItemPath = null) => {
        if (isSubItem && subItemPath) {
            navigate(subItemPath);
        } else {
            navigate(item.path);
        }
        setSearchQuery("");
        setIsMobileMenuOpen(false);
        setShowMobileSearch(false);
    };

    // Search suggestions pentru rezultate rapide
    const searchSuggestions = useMemo(() => {
        if (!searchQuery.trim() || filterMenuItems.length === 0) return [];
        
        const suggestions = [];
        const query = searchQuery.toLowerCase().trim();
        
        filterMenuItems.forEach(item => {
            // Adaugă item-ul principal dacă se potrivește
            if (item.name.toLowerCase().includes(query) || 
                (item.keywords && item.keywords.some(k => k.toLowerCase().includes(query)))) {
                suggestions.push({
                    type: 'main',
                    name: item.name,
                    path: item.path,
                    icon: item.icon,
                    color: item.color
                });
            }
            
            // Adaugă subitemele care se potrivesc
            const subItems = getSubmenuItems(item);
            subItems.forEach(subItem => {
                if (subItem.name.toLowerCase().includes(query) || 
                    (subItem.keywords && subItem.keywords.some(k => k.toLowerCase().includes(query)))) {
                    suggestions.push({
                        type: 'sub',
                        name: subItem.name,
                        path: subItem.path,
                        parent: item.name,
                        icon: <ChevronRight size={14} />
                    });
                }
            });
        });
        
        return suggestions.slice(0, 5); // Limităm la 5 sugestii
    }, [searchQuery, filterMenuItems]);

    // Funcție pentru activarea search-ului pe mobil
    const activateMobileSearch = () => {
        setShowMobileSearch(true);
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 100); // Mic delay pentru a se asigura că input-ul este renderizat
    };

    // Închide search-ul pe mobil când închizi meniul
    useEffect(() => {
        if (!isMobileMenuOpen) {
            setShowMobileSearch(false);
        }
    }, [isMobileMenuOpen]);

    return (
        <>
            {/* Main Header - COMPACT cu mai puțin padding */}
            <header className="bg-gray-900 bg-opacity-95 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
                <div className="px-3 sm:px-4 py-2">
                    <div className="flex items-center justify-between h-12">
                        {/* Left: Burger + Title */}
                        <div className="flex items-center flex-1 min-w-0">
                            {/* Burger Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-1.5 mr-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                                aria-label="Menu"
                            >
                                <div className="relative w-5 h-5">
                                    <motion.span
                                        className="absolute top-0 left-0 w-full h-0.5 bg-gray-300 group-hover:bg-white transition-colors rounded-full"
                                        animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <motion.span
                                        className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 group-hover:bg-white transition-colors rounded-full"
                                        animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <motion.span
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 group-hover:bg-white transition-colors rounded-full"
                                        animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                            </button>

                            {/* Title */}
                            <div className="flex items-center min-w-0">
                                <h1 className="text-base md:text-lg font-bold text-white truncate max-w-[160px] md:max-w-md">
                                    {title || "Dashboard"}
                                </h1>
                                <span className="hidden md:inline ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-900 bg-opacity-40 text-blue-300 rounded-full border border-blue-700">
                                    {role}
                                </span>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-1.5 md:space-x-3">
                            {/* Search Bar pentru Meniu (desktop) */}
                            <div className="relative hidden md:block">
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search menu items..."
                                        value={searchQuery}
                                        onChange={handleMenuSearch}
                                        className="w-56 pl-8 pr-8 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </form>
                                
                                {/* Search Suggestions Dropdown */}
                                {searchQuery && searchSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                                        <div className="p-1.5">
                                            <p className="text-xs text-gray-500 px-2 py-1">Quick navigation:</p>
                                            {searchSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={`${suggestion.type}-${suggestion.path}-${index}`}
                                                    onClick={() => navigateToSearchResult(
                                                        suggestion, 
                                                        suggestion.type === 'sub', 
                                                        suggestion.path
                                                    )}
                                                    className="flex items-center w-full px-2.5 py-1.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        {suggestion.type === 'main' ? (
                                                            <div 
                                                                className="p-1 rounded mr-1.5"
                                                                style={{ backgroundColor: `${suggestion.color}20` }}
                                                            >
                                                                {suggestion.icon}
                                                            </div>
                                                        ) : (
                                                            <div className="p-1 rounded mr-1.5 opacity-60">
                                                                {suggestion.icon}
                                                            </div>
                                                        )}
                                                        <div className="text-left">
                                                            <span className="text-xs">{suggestion.name}</span>
                                                            {suggestion.type === 'sub' && (
                                                                <p className="text-xs text-gray-500">in {suggestion.parent}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={12} className="ml-auto opacity-50" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Search Button pentru Mobile - deschide search in sidebar */}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(true);
                                    setTimeout(() => {
                                        activateMobileSearch();
                                    }, 300); // Delay pentru animația sidebar-ului
                                }}
                                className="md:hidden p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                aria-label="Search menu"
                            >
                                <Search size={18} />
                            </button>

                            {/* Notifications */}
                            {showNotifications && (
                                <button
                                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors relative"
                                    aria-label="Notifications"
                                >
                                    <Bell size={18} />
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                            {unreadNotificationsCount}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center p-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                                    aria-label="Profile"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                                        <span className="text-white font-bold text-xs">
                                            {getInitials(name)}
                                        </span>
                                    </div>
                                    <span className="hidden md:inline ml-1.5 text-xs font-medium text-gray-300">
                                        {name.split(' ')[0]}
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-1.5 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-3 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800">
                                                <p className="text-xs font-semibold text-white truncate">{name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                                            </div>
                                            
                                            <div className="py-1">
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <Settings size={16} className="mr-2" />
                                                    Settings
                                                </Link>
                                                
                                                <div className="border-t border-gray-800 my-1"></div>
                                                
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-3 py-2 text-xs text-red-400 hover:bg-red-900 hover:bg-opacity-20 hover:text-red-300 transition-colors"
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu cu Search pentru meniu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop cu blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 z-50 overflow-y-auto shadow-2xl"
                        >
                            <div className="h-full flex flex-col">
                                {/* Header cu buton de închidere */}
                                <div className="p-4 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-gray-800 relative">
                                    {/* Buton de închidere (X) în colțul dreapta sus */}
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="absolute right-3 top-3 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X size={20} />
                                    </button>
                                    
                                    <div className="flex items-center space-x-3 pr-8">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-blue-500 ring-opacity-50">
                                                <span className="text-white font-bold text-base">
                                                    {getInitials(name)}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-base font-bold text-white truncate">{name}</h2>
                                            <p className="text-xs text-gray-400">{role}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Welcome back! 👋</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Bar pentru Meniu (în meniul mobile) - doar dacă showMobileSearch este true */}
                                {showMobileSearch ? (
                                    <div className="p-3 border-b border-gray-800 bg-gray-800">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Search menu items..."
                                                value={searchQuery}
                                                onChange={handleMenuSearch}
                                                className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                // REMOVED autoFocus from here
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={clearSearch}
                                                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {searchQuery && (
                                            <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                                                <Filter size={10} className="mr-1" />
                                                Showing {filterMenuItems.length} results
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    // Buton pentru activarea search-ului pe mobil
                                    <div className="p-3 border-b border-gray-800">
                                        <button
                                            onClick={activateMobileSearch}
                                            className="flex items-center justify-center w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                                        >
                                            <Search size={16} className="mr-2" />
                                            <span className="text-sm">Search menu</span>
                                        </button>
                                    </div>
                                )}

                                {/* Menu Items */}
                                <nav className="flex-1 p-3 overflow-y-auto">
                                    {filterMenuItems.length === 0 && searchQuery ? (
                                        <div className="text-center py-6">
                                            <Search size={28} className="text-gray-600 mx-auto mb-2" />
                                            <p className="text-gray-400 text-sm">No menu items found</p>
                                            <p className="text-gray-600 text-xs mt-0.5">Try a different search term</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5">
                                            {filterMenuItems.map((item) => {
                                                const submenuItems = getSubmenuItems(item);
                                                const hasSubmenu = submenuItems.length > 0;
                                                const isSubmenuOpen = openSubmenus[item.name] || searchQuery;
                                                const isActive = isItemActive(item, submenuItems);
                                                const filteredSubItems = submenuItems.filter(isSubItemMatchingSearch);

                                                return (
                                                    <div key={item.path} className="relative">
                                                        {hasSubmenu ? (
                                                            <>
                                                                <button
                                                                    onClick={() => toggleSubmenu(item.name)}
                                                                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                                                        isActive 
                                                                            ? 'bg-blue-900 bg-opacity-30 text-blue-300' 
                                                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div 
                                                                            className="p-1.5 rounded-lg mr-2.5"
                                                                            style={{ backgroundColor: `${item.color}20` }}
                                                                        >
                                                                            {item.icon}
                                                                        </div>
                                                                        <div className="text-left">
                                                                            <span className="font-medium block text-sm">{item.name}</span>
                                                                            {searchQuery && (
                                                                                <span className="text-xs text-gray-500">
                                                                                    {filteredSubItems.length} sub-items
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <motion.div
                                                                        animate={{ rotate: isSubmenuOpen ? 90 : 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <ChevronRight size={16} />
                                                                    </motion.div>
                                                                </button>
                                                                
                                                                {/* Submeniu */}
                                                                <AnimatePresence>
                                                                    {(isSubmenuOpen && filteredSubItems.length > 0) && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.2 }}
                                                                            className="ml-9 mt-0.5 space-y-0.5 overflow-hidden"
                                                                        >
                                                                            {filteredSubItems.map((subItem) => {
                                                                                const isSubActive = location.pathname === subItem.path;
                                                                                const isMatchingSearch = isSubItemMatchingSearch(subItem);
                                                                                
                                                                                return (
                                                                                    <Link
                                                                                        key={subItem.path}
                                                                                        to={subItem.path}
                                                                                        onClick={() => {
                                                                                            setIsMobileMenuOpen(false);
                                                                                            setSearchQuery("");
                                                                                            setShowMobileSearch(false);
                                                                                        }}
                                                                                        className={`flex items-center px-2.5 py-2 rounded-lg transition-colors relative ${
                                                                                            isSubActive
                                                                                                ? 'text-blue-300 bg-blue-900 bg-opacity-20'
                                                                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                                                        } ${isMatchingSearch && searchQuery ? 'border-l-2 border-blue-500' : ''}`}
                                                                                    >
                                                                                        <div className={`mr-2 ${isMatchingSearch && searchQuery ? 'opacity-100' : 'opacity-60'}`}>
                                                                                            {subItem.icon}
                                                                                        </div>
                                                                                        <span className="text-xs">{subItem.name}</span>
                                                                                        {isMatchingSearch && searchQuery && (
                                                                                            <span className="absolute right-1.5 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                                                                                                Match
                                                                                            </span>
                                                                                        )}
                                                                                    </Link>
                                                                                );
                                                                            })}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </>
                                                        ) : (
                                                            <Link
                                                                to={item.path}
                                                                onClick={() => {
                                                                    setIsMobileMenuOpen(false);
                                                                    setSearchQuery("");
                                                                    setShowMobileSearch(false);
                                                                }}
                                                                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                                                                    isActive 
                                                                        ? 'bg-blue-900 bg-opacity-30 text-blue-300' 
                                                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                                }`}
                                                            >
                                                                <div 
                                                                    className="p-1.5 rounded-lg mr-2.5"
                                                                    style={{ backgroundColor: `${item.color}20` }}
                                                                >
                                                                    {item.icon}
                                                                </div>
                                                                <span className="font-medium text-sm">{item.name}</span>
                                                                {searchQuery && (
                                                                    <span className="absolute right-3 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                                                                        Match
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </nav>

                                {/* Footer */}
                                <div className="p-3 border-t border-gray-800 bg-gray-900">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center w-full px-3 py-2 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-red-900/30"
                                    >
                                        <LogOut size={16} className="mr-1.5" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Close dropdowns */}
            {isProfileMenuOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Header;