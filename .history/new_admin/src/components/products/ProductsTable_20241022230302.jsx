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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [image, setImage] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({
        name: "",
        category: "",
        price: ""
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
    const handleAddProduct = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("image", image);

        try {
            const response = await axios.post(`${url}/api/food/add`, formData);

            if (response.data.success) {
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: "Salad"
                });
                setImage(null);
                toast.success(response.data.message);
                fetchProducts(); // Reîncarcă produsele după adăugare
                setIsModalOpen(false); // Închide modalul
                setUpdatedProduct({ name: "", description: "", price: "", category: "" }); // Resetează formularul
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding product", error);
            toast.error("Error adding product");
        }
    }

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
             <button 
                className="rounded-lg bg-red-800 text-white px-4 py-2 mb-4" 
                onClick={() => setIsModalOpen(true)}
            >
                Add a new product
            </button>
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
            {isModalOpen && (
                <div id="crud-modal" className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create New Product
                                </h3>
                                <button 
                                    type="button" 
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" 
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <form className="p-4 md:p-5" onSubmit={handleAddProduct}>
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                <div className="col-span-2">
                                        <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Upload image</label>
                                        <div className='w-40 h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center'>
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="Product preview" className='object-cover w-full h-full rounded' />
                            ) : (
                                <span className='text-gray-400'>No image selected</span>
                            )}
                        </div>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />

                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            id="name" 
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                            placeholder="Type product name" 
                                            value={updatedProduct.name}
                                            onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
                                        <input 
                                            type="number" 
                                            name="price" 
                                            id="price" 
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                            placeholder="$2999" 
                                            value={updatedProduct.price}
                                            onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                                        <select 
                                            id="category" 
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            value={updatedProduct.category}
                                            onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option value="TV">TV/Monitors</option>
                                            <option value="PC">PC</option>
                                            <option value="GA">Gaming/Console</option>
                                            <option value="PH">Phones</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Description</label>
                                        <textarea 
                                            id="description" 
                                            rows="4" 
                                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                            placeholder="Write product description here"
                                            value={updatedProduct.description}
                                            onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
                                        ></textarea>                    
                                    </div>
                                </div>
                                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                    Add new product
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ProductsTable;