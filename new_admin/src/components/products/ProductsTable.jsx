import { motion } from "framer-motion";
import { Search } from "lucide-react";
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
    const { url } = useUrl();
    const productsPerPage = 10;

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
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

    const editProduct = (product) => {
        setCurrentProduct(product);
        setIsEditing(true);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
    };

    const resetFilters = () => {
        setSearchTerm("");
        setColumnFilters({
            name: "", category: "", price: "", discount: "", ingredients: "", extras: ""
        });
        setFilteredProducts(products);
        setCurrentPage(1);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <div className="flex gap-3">
                    <button
                        className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 transition-all duration-200"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add a new product
                    </button>
                    <button
                        className="bg-green-700 text-white font-semibold rounded-md px-6 py-3 border-2 border-green-600 hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Import Products
                    </button>
                </div>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search all products...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <ProductFilters 
                columnFilters={columnFilters}
                onColumnFilter={handleColumnFilter}
                onResetFilters={resetFilters}
            />

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Category</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Price</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Discount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Ingredients</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Extras</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {currentProducts.map((product) => (
                            <ProductTableRow
                                key={product._id}
                                product={product}
                                onEdit={editProduct}
                                onRemove={removeFood}
                                url={url}
                            />
                        ))}
                    </tbody>
                </table>

                {currentProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No products found matching your filters.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className='flex justify-center mt-4'>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`mx-1 px-3 py-1 rounded ${
                                currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}

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