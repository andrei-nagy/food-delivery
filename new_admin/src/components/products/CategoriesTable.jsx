import { motion } from "framer-motion";
import { Edit, Search, Trash2, Filter, Plus, X, Menu, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const CategoriesTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({
        name: "",
        description: "",
        status: ""
    });
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [updatedCategory, setUpdatedCategory] = useState({
        menu_name: "",
        description: "",
        isActive: "",
        image: null,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const categoriesPerPage = 10;
    const { url } = useUrl();
    const actionsMenuRef = useRef(null);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${url}/api/categories/listcategory`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setCategories(response.data.data);
                setFilteredCategories(response.data.data);
            } else {
                console.error("Response structure is not as expected:", response.data);
                setFilteredCategories([]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("menu_name", updatedCategory.menu_name);
        formData.append("description", updatedCategory.description);
        formData.append("isActive", updatedCategory.isActive);
        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await axios.post(`${url}/api/categories/addcategory`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setImage(null);
                toast.success(response.data.message, { theme: "dark" });
                fetchCategories();
                setIsModalOpen(false);
                setUpdatedCategory({ menu_name: "", description: "", isActive: "", image: null });
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Error adding category", { theme: "dark" });
        }
    };

    const removeFoodCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        try {
            const response = await axios.post(`${url}/api/categories/removecategory`, { id: categoryId });
            await fetchCategories();

            if (response.data.success) {
                toast.success(response.data.message, { theme: "dark" })
            } else {
                toast.error(response.data.message, { theme: "dark" })
            }
        } catch (error) {
            console.error("Error removing category:", error);
            toast.error("Error removing category", { theme: "dark" });
        }
    };

    const editCategory = (category) => {
        setCurrentCategory(category);
        setUpdatedCategory({
            menu_name: category.menu_name,
            description: category.description,
            isActive: category.isActive,
            image: null
        });
        setIsEditing(true);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("id", currentCategory._id);
        formData.append("menu_name", updatedCategory.menu_name);
        formData.append("description", updatedCategory.description);
        formData.append("isActive", updatedCategory.isActive);
        if (updatedCategory.image) {
            formData.append("image", updatedCategory.image);
        }

        try {
            const response = await axios.post(`${url}/api/categories/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data.success) {
                toast.success(response.data.message, { theme: "dark" });
                fetchCategories();
                setIsEditing(false);
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Error updating category.", { theme: "dark" });
        }
    };

    useEffect(() => {
        fetchCategories();
        // Close actions menu when clicking outside
        const handleClickOutside = (event) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
                setShowActionsMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Funcția de filtrare globală
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, columnFilters);
    };

    // Funcția pentru filtrarea pe coloane
    const handleColumnFilter = (column, value) => {
        const newFilters = {
            ...columnFilters,
            [column]: value.toLowerCase()
        };
        setColumnFilters(newFilters);
        applyFilters(searchTerm, newFilters);
    };

    // Funcția care aplică toate filtrele
    const applyFilters = (globalSearch, columnFilters) => {
        let filtered = categories;

        // Filtrare globală
        if (globalSearch) {
            filtered = filtered.filter(category =>
                category.menu_name.toLowerCase().includes(globalSearch) ||
                category.description.toLowerCase().includes(globalSearch) ||
                (category.isActive ? "active" : "inactive").includes(globalSearch)
            );
        }

        // Filtrare pe coloane
        if (columnFilters.name) {
            filtered = filtered.filter(category =>
                category.menu_name.toLowerCase().includes(columnFilters.name)
            );
        }

        if (columnFilters.description) {
            filtered = filtered.filter(category =>
                category.description.toLowerCase().includes(columnFilters.description)
            );
        }

        if (columnFilters.status) {
            filtered = filtered.filter(category => {
                const statusText = category.isActive ? "active" : "inactive";
                return statusText.includes(columnFilters.status);
            });
        }

        setFilteredCategories(filtered);
        setCurrentPage(1);
    };

    // Resetează toate filtrele
    const resetFilters = () => {
        setSearchTerm("");
        setColumnFilters({
            name: "",
            description: "",
            status: ""
        });
        setFilteredCategories(categories);
        setCurrentPage(1);
        setShowFilters(false);
    };

    // Toggle row details on mobile
    const toggleRowDetails = (categoryId) => {
        setExpandedRows(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Toggle actions menu
    const toggleActionsMenu = (categoryId, e) => {
        e.stopPropagation();
        setShowActionsMenu(showActionsMenu === categoryId ? null : categoryId);
    };

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Responsive pagination
    const getVisiblePages = () => {
        const maxVisible = window.innerWidth < 768 ? 3 : 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        const pages = [];
        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        
        return pages;
    };

    // Check if mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-4 md:p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Header Section - Responsive */}
            <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
                {/* Left: Title and Mobile Menu */}
                <div className="flex items-center justify-between md:justify-start">
                    <h2 className="text-xl font-bold text-white md:hidden">Categories</h2>
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && (
                    <div className="md:hidden bg-gray-900 rounded-lg p-4 space-y-2 border border-gray-700">
                        <button
                            className="flex items-center justify-center gap-2 w-full bg-gray-800 text-white font-semibold rounded-md px-4 py-3 border-2 border-gray-700 hover:bg-gray-700 transition-all duration-200"
                            onClick={() => {
                                setIsModalOpen(true);
                                setShowMobileMenu(false);
                            }}
                        >
                            <Plus size={18} />
                            Add Category
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white font-semibold rounded-md px-4 py-3 border-2 border-blue-600 hover:bg-blue-600 transition-all duration-200"
                        >
                            <Filter size={18} />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                )}

                {/* Desktop Buttons */}
                <div className="hidden md:flex gap-3">
                    <button
                        className="bg-gray-800 text-white font-semibold rounded-md px-4 md:px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Add a new category</span>
                        <span className="md:hidden">Add</span>
                    </button>
                </div>

                {/* Search Bar - Full width on mobile */}
                <div className='relative w-full md:w-auto'>
                    <input
                        type='text'
                        placeholder='Search categories...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>

                {/* Filter Toggle Button for Mobile */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden flex items-center justify-center gap-2 w-full md:w-auto bg-blue-700 text-white font-semibold rounded-md px-4 py-3 border-2 border-blue-600 hover:bg-blue-600 transition-all duration-200"
                >
                    <Filter size={18} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Filters - Collapsible on mobile */}
            <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-4`}>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">Filter by Name</label>
                            <input
                                type="text"
                                placeholder="Filter name..."
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={columnFilters.name}
                                onChange={(e) => handleColumnFilter('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">Filter by Description</label>
                            <input
                                type="text"
                                placeholder="Filter description..."
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={columnFilters.description}
                                onChange={(e) => handleColumnFilter('description', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">Filter by Status</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={columnFilters.status}
                                onChange={(e) => handleColumnFilter('status', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table - Responsive container */}
            <div className='overflow-x-auto -mx-4 md:mx-0'>
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border border-gray-700 rounded-lg">
                        {isMobile ? (
                            // Mobile View - Card Layout
                            <div className="divide-y divide-gray-700">
                                {currentCategories.map((category) => (
                                    <div 
                                        key={category._id} 
                                        className="p-4 hover:bg-gray-700 hover:bg-opacity-30 cursor-pointer"
                                        onClick={() => toggleRowDetails(category._id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`${url}/images/` + category.image}
                                                    alt='Category img'
                                                    className='size-12 rounded-full object-cover'
                                                />
                                                <div>
                                                    <div className="font-medium text-white">{category.menu_name}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {category.isActive ? (
                                                            <span className="text-green-500">● Active</span>
                                                        ) : (
                                                            <span className="text-red-500">● Inactive</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => toggleActionsMenu(category._id, e)}
                                                    className="p-1.5 rounded bg-gray-800 hover:bg-gray-700"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {expandedRows[category._id] ? (
                                                    <ChevronUp size={16} className="text-gray-400" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Menu */}
                                        {showActionsMenu === category._id && (
                                            <div 
                                                ref={actionsMenuRef}
                                                className="absolute right-4 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[120px]"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        editCategory(category);
                                                        setShowActionsMenu(null);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-gray-800 text-blue-300"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFoodCategory(category._id);
                                                        setShowActionsMenu(null);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}

                                        {/* Expanded Details */}
                                        {expandedRows[category._id] && (
                                            <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Description</div>
                                                    <div className="text-sm text-gray-300">{category.description}</div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            editCategory(category);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-900 bg-opacity-30 hover:bg-opacity-40 text-blue-300 rounded text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFoodCategory(category._id);
                                                        }}
                                                        className="px-3 py-1.5 bg-red-900 bg-opacity-30 hover:bg-opacity-40 text-red-300 rounded text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Desktop View - Table Layout
                            <table className='min-w-full divide-y divide-gray-700'>
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className='px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1">
                                                    Name
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Filter name..."
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={columnFilters.name}
                                                    onChange={(e) => handleColumnFilter('name', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className='px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                            <div className="space-y-2">
                                                <div>Description</div>
                                                <input
                                                    type="text"
                                                    placeholder="Filter description..."
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={columnFilters.description}
                                                    onChange={(e) => handleColumnFilter('description', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className='px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                            <div className="space-y-2">
                                                <div>Status</div>
                                                <select
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={columnFilters.status}
                                                    onChange={(e) => handleColumnFilter('status', e.target.value)}
                                                >
                                                    <option value="">All Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </th>
                                        <th className='px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-700 bg-gray-800 bg-opacity-50'>
                                    {currentCategories.map((category) => (
                                        <motion.tr
                                            key={category._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="hover:bg-gray-700 hover:bg-opacity-30"
                                        >
                                            <td className='px-4 md:px-6 py-4 whitespace-nowrap'>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`${url}/images/` + category.image}
                                                        alt='Category img'
                                                        className='size-10 rounded-full object-cover'
                                                    />
                                                    <div className="font-medium text-white">{category.menu_name}</div>
                                                </div>
                                            </td>
                                            <td className='px-4 md:px-6 py-4'>
                                                <div className="text-sm text-gray-300 max-w-xs truncate" title={category.description}>
                                                    {category.description || <span className="text-gray-500">No description</span>}
                                                </div>
                                            </td>
                                            <td className='px-4 md:px-6 py-4 whitespace-nowrap'>
                                                {category.isActive ? (
                                                    <span className="px-2 py-1 bg-green-900 bg-opacity-30 rounded text-green-300 text-sm">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-900 bg-opacity-30 rounded text-red-300 text-sm">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className='px-4 md:px-6 py-4 whitespace-nowrap'>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => editCategory(category)} 
                                                        className='p-2 rounded bg-gray-700 hover:bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors'
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => removeFoodCategory(category._id)} 
                                                        className='p-2 rounded bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-300 transition-colors'
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* No results message */}
                        {currentCategories.length === 0 && (
                            <div className="text-center py-8 text-gray-400 bg-gray-800 bg-opacity-30">
                                No categories found matching your filters.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination - Responsive */}
            {totalPages > 1 && (
                <div className='flex flex-wrap justify-center mt-4 gap-1'>
                    <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        &lt;
                    </button>
                    
                    {getVisiblePages().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                    
                    <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        &gt;
                    </button>
                </div>
            )}

            {/* Stats Footer */}
            <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                    Showing {indexOfFirstCategory + 1} to {Math.min(indexOfLastCategory, filteredCategories.length)} of {filteredCategories.length} categories
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={resetFilters}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        Reset all filters
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        <span>Categories per page:</span>
                        <span className="font-medium">{categoriesPerPage}</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <motion.div
                    className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className='bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className='text-xl font-semibold text-white'>Edit Category</h2>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">Current Image</label>
                                    {currentCategory.image && (
                                        <img
                                            src={`${url}/images/` + currentCategory.image}
                                            alt="Current category"
                                            className="mb-2 w-32 h-32 object-cover rounded-lg"
                                        />
                                    )}
                                    <label className="block text-gray-400 mb-2">New Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full p-2 bg-gray-700 text-white rounded-lg"
                                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, image: e.target.files[0] })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-gray-700 text-white rounded-lg"
                                        value={updatedCategory.menu_name}
                                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, menu_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Description</label>
                                    <textarea
                                        className="w-full p-2 bg-gray-700 text-white rounded-lg"
                                        value={updatedCategory.description}
                                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Category Status</label>
                                    <select
                                        className="w-full p-2 bg-gray-700 text-white rounded-lg"
                                        value={updatedCategory.isActive}
                                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, isActive: e.target.value === "true" })}
                                        required
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(false)} 
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                                    >
                                        Update Category
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* Add Category Modal */}
            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                            <h3 className="text-xl md:text-2xl font-bold text-white">
                                Create New Category
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form className="p-4 md:p-6 space-y-6" onSubmit={handleAddCategory}>
                            {/* Image Upload - Responsive */}
                            <div className="space-y-3">
                                <label className="block text-lg font-semibold text-white">Category Image</label>
                                <label htmlFor="image" className="cursor-pointer group">
                                    <div className="w-full h-40 md:h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                        {image ? (
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src={URL.createObjectURL(image)} 
                                                    alt="Category preview" 
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-white text-center">
                                                        <svg className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-xs md:text-sm">Change Image</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 md:p-6">
                                                <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-gray-400 text-sm">Click to upload category image</p>
                                                <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        onChange={(e) => setImage(e.target.files[0])} 
                                        type="file" 
                                        id="image" 
                                        hidden 
                                        required 
                                        accept="image/*"
                                    />
                                </label>
                            </div>

                            {/* Grid Layout - Responsive */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Category Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Category Name</label>
                                    <input
                                        type="text"
                                        name="menu_name"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter category name"
                                        value={updatedCategory.menu_name}
                                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, menu_name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Status</label>
                                    <select
                                        name="isActive"
                                        value={updatedCategory.isActive}
                                        onChange={(e) => setUpdatedCategory({ ...updatedCategory, isActive: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="" disabled>Select status</option>
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Description</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Describe your category..."
                                    value={updatedCategory.description}
                                    onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
                                />
                            </div>

                            {/* Actions - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    <span>Add Category</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default CategoriesTable;