import { motion } from "framer-motion";
import { Edit, Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const ProductsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({
        name: "",
        category: "",
        price: "",
        image: null,
    });
    const productsPerPage = 10; // Numărul de produse pe pagină
    const {url} = useUrl();

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
            } else {
                console.error("Response structure is not as expected:", response.data);
                setFilteredProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const removeFood = async (foodId) => {
        const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
        await fetchProducts();

        if (response.data.success) {
            toast.success(response.data.message);
        } else {
            toast.error(response.data.message);
        }
    };

    const editProduct = (product) => {
        setCurrentProduct(product);
        setUpdatedProduct({
            name: product.name,
            category: product.category,
            price: product.price.toFixed(2),
            image: null
        });
        setIsEditing(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData(); // Crează un obiect FormData
        formData.append("id", currentProduct._id);
        formData.append("name", updatedProduct.name);
        formData.append("category", updatedProduct.category);
        formData.append("price", updatedProduct.price);
        if (updatedProduct.image) {
            formData.append("image", updatedProduct.image); // Adaugă imaginea la formData
        }
        try {
            const response = await axios.post(`${url}/api/food/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Setează headerul corect pentru fișiere
                },
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchProducts(); // Reîncarcă produsele după actualizare
                setIsEditing(false); // Închide formularul de editare
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Error updating product.");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = products.filter(
            (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
        );
        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset page la 1 la fiecare căutare
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
                <h2 className='text-xl font-semibold text-gray-100'>Product List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search products...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            {isEditing && (
                <div className="mb-4 p-4 border border-gray-600 rounded">
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">Edit Product</h3>
                    <form onSubmit={handleUpdateProduct}>
                        <div className="mb-4">
                            <label className="block text-gray-400">Current Image</label>
                            {/* Afișează imaginea curentă dacă există */}
                            {currentProduct.image && (
                                <img
                                    src={`${url}/images/` + currentProduct.image}
                                    alt="Current category"
                                    className="mb-2 w-32 h-32 object-cover rounded" // Poți ajusta dimensiunile după preferințe
                                />
                            )}
                            <label className="block text-gray-400">New Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="mt-1 p-2 bg-gray-700 text-white rounded"
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.files[0] })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400">Name</label>
                            <input
                                type="text"
                                className="mt-1 p-2 bg-gray-700 text-white rounded"
                                value={updatedProduct.name}
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400">Category</label>
                            <input
                                type="text"
                                className="mt-1 p-2 bg-gray-700 text-white rounded"
                                value={updatedProduct.category}
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400">Price</label>
                            <input
                                type="number"
                                className="mt-1 p-2 bg-gray-700 text-white rounded"
                                value={updatedProduct.price}
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-red-600 text-white px-4 py-2 rounded ml-2">Cancel</button>
                    </form>
                </div>
            )}

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Category</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Price</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {currentProducts.map((product) => (
                            <motion.tr
                                key={product._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                    <img
                                        src={`${url}/images/` + product.image}
                                        alt='Product img'
                                        className='size-10 rounded-full object-cover'
                                    />
                                    {product.name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.category}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.price.toFixed(2)} €</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button onClick={() => editProduct(product)} className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => removeFood(product._id)} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className='flex justify-center mt-4'>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default ProductsTable;
