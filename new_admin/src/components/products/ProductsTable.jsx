import { motion } from "framer-motion";
import { Search, Trash2, Plus, Upload, Filter, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import ProductModal from "./ProductModal";
import EditProductModal from "./EditProductModal";
import ImportProductsModal from "./ImportProductsModal";
import ProductFilters from "./ProductFilters";
import ProductTableRow from "./ProductTableRow";

const ProductsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({
        name: "", category: "", price: "", discount: "", ingredients: "", extras: ""
    });
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { url } = useUrl();
    const productsPerPage = 10;

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
                setSelectedProducts([]);
                setSelectAll(false);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const removeFood = async (foodId) => {
        try {
            const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
            if (response.data.success) {
                toast.success(response.data.message, { theme: "dark" });
                fetchProducts();
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("Error removing product:", error);
            toast.error("Error removing product", { theme: "dark" });
        }
    };

    const removeMultipleFoods = async () => {
        if (selectedProducts.length === 0) {
            toast.warning("Please select at least one product to delete", { theme: "dark" });
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await axios.post(`${url}/api/food/remove-multiple`, {
                ids: selectedProducts
            });
            
            if (response.data.success) {
                toast.success(`Successfully deleted ${selectedProducts.length} product(s)`, { theme: "dark" });
                fetchProducts();
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("Error removing multiple products:", error);
            toast.error("Error deleting products", { theme: "dark" });
        }
    };

    const editProduct = (product) => {
        setCurrentProduct(product);
        setIsEditing(true);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Calculează produsele curente pentru paginare
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Handler pentru checkbox individual
    const handleProductSelect = (productId, isSelected) => {
        if (isSelected) {
            setSelectedProducts(prev => [...prev, productId]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
    };

    // Handler pentru Select All
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([]);
        } else {
            const allIdsOnPage = currentProducts.map(product => product._id);
            setSelectedProducts(allIdsOnPage);
        }
        setSelectAll(!selectAll);
    };

    // Actualizează selectAll când se schimbă selectedProducts
    useEffect(() => {
        if (currentProducts.length > 0) {
            const allSelected = currentProducts.every(product => 
                selectedProducts.includes(product._id)
            );
            setSelectAll(allSelected);
        } else {
            setSelectAll(false);
        }
    }, [selectedProducts, currentProducts]);

    // Funcția de aplicare a filtrelor
    const applyFilters = (globalSearch, columnFilters) => {
        let filtered = products;

        if (globalSearch) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(globalSearch) ||
                product.category.toLowerCase().includes(globalSearch) ||
                product.price.toString().includes(globalSearch) ||
                product.discountPercentage.toString().includes(globalSearch) ||
                (product.ingredients && product.ingredients.toLowerCase().includes(globalSearch)) ||
                (product.extras && product.extras.some(extra => 
                    extra.name.toLowerCase().includes(globalSearch)
                ))
            );
        }

        Object.keys(columnFilters).forEach(key => {
            if (columnFilters[key]) {
                filtered = filtered.filter(product => {
                    if (key === 'extras') {
                        return product.extras && product.extras.some(extra =>
                            extra.name.toLowerCase().includes(columnFilters[key])
                        );
                    }
                    const value = product[key]?.toString().toLowerCase() || '';
                    return value.includes(columnFilters[key]);
                });
            }
        });

        setFilteredProducts(filtered);
        setCurrentPage(1);
        setSelectedProducts([]);
        setSelectAll(false);
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, columnFilters);
    };

    const handleColumnFilter = (column, value) => {
        const newFilters = { ...columnFilters, [column]: value.toLowerCase() };
        setColumnFilters(newFilters);
        applyFilters(searchTerm, newFilters);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setColumnFilters({
            name: "", category: "", price: "", discount: "", ingredients: "", extras: ""
        });
        setFilteredProducts(products);
        setCurrentPage(1);
        setSelectedProducts([]);
        setSelectAll(false);
        setShowFilters(false);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setSelectedProducts([]);
        setSelectAll(false);
    };

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
                    <h2 className="text-xl font-bold text-white md:hidden">Products</h2>
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
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
                            Add Product
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 w-full bg-green-700 text-white font-semibold rounded-md px-4 py-3 border-2 border-green-600 hover:bg-green-600 transition-all duration-200"
                            onClick={() => {
                                setIsImportModalOpen(true);
                                setShowMobileMenu(false);
                            }}
                        >
                            <Upload size={18} />
                            Import
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
                        <span className="hidden md:inline">Add a new product</span>
                        <span className="md:hidden">Add</span>
                    </button>
                    <button
                        className="bg-green-700 text-white font-semibold rounded-md px-4 md:px-6 py-3 border-2 border-green-600 hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <Upload size={18} />
                        <span className="hidden md:inline">Import Products</span>
                        <span className="md:hidden">Import</span>
                    </button>
                    
                    {selectedProducts.length > 0 && (
                        <button
                            className="bg-red-700 text-white font-semibold rounded-md px-4 md:px-6 py-3 border-2 border-red-600 hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
                            onClick={removeMultipleFoods}
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="hidden md:inline">Delete ({selectedProducts.length})</span>
                            <span className="md:hidden">Del ({selectedProducts.length})</span>
                        </button>
                    )}
                </div>

                {/* Search Bar - Full width on mobile */}
                <div className='relative w-full md:w-auto'>
                    <input
                        type='text'
                        placeholder='Search products...'
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

            {/* Selected Products Banner */}
            {selectedProducts.length > 0 && (
                <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-blue-300 font-medium">
                                {selectedProducts.length} product(s) selected
                            </span>
                            <button
                                onClick={() => {
                                    setSelectedProducts([]);
                                    setSelectAll(false);
                                }}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                Clear selection
                            </button>
                        </div>
                        <button
                            onClick={removeMultipleFoods}
                            className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 self-start sm:self-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete all selected
                        </button>
                    </div>
                </div>
            )}

            {/* Filters - Collapsible on mobile */}
            <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-4`}>
                <ProductFilters 
                    columnFilters={columnFilters}
                    onColumnFilter={handleColumnFilter}
                    onResetFilters={resetFilters}
                    isMobile={!showFilters && window.innerWidth < 768}
                />
            </div>

            {/* Table - Responsive container */}
            <div className='overflow-x-auto -mx-4 md:mx-0'>
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border border-gray-700 rounded-lg">
                        <table className='min-w-full divide-y divide-gray-700'>
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12'>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectAll && currentProducts.length > 0}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-600 bg-gray-700"
                                            />
                                        </div>
                                    </th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell'>Category</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Price</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell'>Discount</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell'>Ingredients</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell'>Extras</th>
                                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-700 bg-gray-800 bg-opacity-50'>
                                {currentProducts.map((product) => (
                                    <ProductTableRow
                                        key={product._id}
                                        product={product}
                                        onEdit={editProduct}
                                        onRemove={removeFood}
                                        url={url}
                                        isSelected={selectedProducts.includes(product._id)}
                                        onSelect={handleProductSelect}
                                        isMobile={window.innerWidth < 768}
                                    />
                                ))}
                            </tbody>
                        </table>

                        {currentProducts.length === 0 && (
                            <div className="text-center py-8 text-gray-400 bg-gray-800 bg-opacity-30">
                                No products found matching your filters.
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
                    
                    {/* Show limited pages on mobile */}
                    {(() => {
                        const pages = [];
                        const maxVisible = window.innerWidth < 768 ? 3 : 5;
                        
                        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        let end = Math.min(totalPages, start + maxVisible - 1);
                        
                        if (end - start + 1 < maxVisible) {
                            start = Math.max(1, end - maxVisible + 1);
                        }
                        
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
                        
                        return pages.map((page, index) => (
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
                        ));
                    })()}
                    
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
                    Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={resetFilters}
                        className="text-gray-400 hover:text-white"
                    >
                        Reset all filters
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <span>Products per page:</span>
                        <span className="font-medium">{productsPerPage}</span>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProductAdded={fetchProducts}
            />

            <EditProductModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                product={currentProduct}
                onProductUpdated={fetchProducts}
            />

            <ImportProductsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onProductsImported={fetchProducts}
            />
        </motion.div>
    );
};

export default ProductsTable;