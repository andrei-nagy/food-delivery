import { motion } from "framer-motion";
import { Edit, Search, Trash2, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import "react-toastify/dist/ReactToastify.css";

// Componenta ExtraOptionsSection mutată în afara componentei principale
const ExtraOptionsSection = ({ 
  extraName, 
  setExtraName, 
  extraPrice, 
  setExtraPrice, 
  addExtra, 
  updatedProduct, 
  removeExtra 
}) => (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-white">Extra Options</label>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2">
        <input
          type="text"
          value={extraName}
          onChange={(e) => setExtraName(e.target.value)}
          placeholder="Extra name (e.g., Extra Cheese)"
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={extraPrice}
          onChange={(e) => setExtraPrice(e.target.value)}
          placeholder="Price"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addExtra}
          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-500 transition duration-200"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>

    {updatedProduct.extras.length > 0 && (
      <div className="bg-gray-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Added Extras:</h4>
        <div className="space-y-2">
          {updatedProduct.extras.map((extra, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-600/50 rounded px-3 py-2">
              <div>
                <span className="text-white text-sm">{extra.name}</span>
                <span className="text-green-400 text-sm ml-2">+${extra.price}</span>
              </div>
              <button
                type="button"
                onClick={() => removeExtra(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

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
        price: "",
        description: "",
        isBestSeller: false,
        isNewAdded: false,
        isVegan: false,
        extras: []
    });
    const [extraName, setExtraName] = useState("");
    const [extraPrice, setExtraPrice] = useState("");
    const productsPerPage = 10;
    const { url } = useUrl();
    const [list, setList] = useState([]);
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

    const getCategoryList = async () => {
        try {
            const response = await axios.get(`${url}/api/categories/listcategory`);
            if (response.data.success) {
                setList(response.data.data);
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("Error fetching categories", error);
            toast.error("Error fetching categories", { theme: "dark" });
        }
    };

    const handlePriceBlur = (e) => {
        let priceValue = parseFloat(e.target.value);
        if (isNaN(priceValue) || priceValue < 0) {
            priceValue = 0;
        }
        setUpdatedProduct({ ...updatedProduct, price: priceValue.toFixed(2) });
    };

    const addExtra = () => {
        if (!extraName.trim() || !extraPrice) {
            toast.error("Please fill both extra name and price", { theme: "dark" });
            return;
        }

        const numericPrice = parseFloat(extraPrice);
        if (isNaN(numericPrice)) {
            toast.error("Please enter a valid price", { theme: "dark" });
            return;
        }

        const newExtra = {
            name: extraName.trim(),
            price: numericPrice.toFixed(2)
        };

        setUpdatedProduct(prev => ({
            ...prev,
            extras: [...prev.extras, newExtra]
        }));

        setExtraName("");
        setExtraPrice("");
        toast.success("Extra option added successfully!", { theme: "dark" });
    };

    const removeExtra = (index) => {
        setUpdatedProduct(prev => ({
            ...prev,
            extras: prev.extras.filter((_, i) => i !== index)
        }));
        toast.info("Extra option removed", { theme: "dark" });
    };

 const handleAddProduct = async (event) => {
  event.preventDefault();

  const productPrice = parseFloat(updatedProduct.price);
  if (isNaN(productPrice) || productPrice <= 0) {
    toast.error("Please enter a valid product price", { theme: "dark" });
    return;
  }

  if (!image) {
    toast.error("Please upload a product image", { theme: "dark" });
    return;
  }

  const formData = new FormData();
  formData.append("name", updatedProduct.name);
  formData.append("description", updatedProduct.description);
  formData.append("price", productPrice);
  formData.append("category", updatedProduct.category);
  formData.append("image", image);
  formData.append("isBestSeller", updatedProduct.isBestSeller);
  formData.append("isNewAdded", updatedProduct.isNewAdded);
  formData.append("isVegan", updatedProduct.isVegan);
  
  // SCHIMBARE: Trimite extrasele ca JSON string
  formData.append("extras", JSON.stringify(updatedProduct.extras));

  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await axios.post(`${url}/api/food/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      // Reset form
      setImage(null);
      setUpdatedProduct({
        name: "",
        category: "",
        price: "",
        description: "",
        isBestSeller: false,
        isNewAdded: false,
        isVegan: false,
        extras: []
      });
      setExtraName("");
      setExtraPrice("");
      toast.success(response.data.message, { theme: "dark" });
      fetchProducts();
      setIsModalOpen(false);
    } else {
      toast.error(response.data.message, { theme: "dark" });
    }
  } catch (error) {
    console.error("❌ Error adding product:", error);
    toast.error("Error adding product", { theme: "dark" });
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
        setUpdatedProduct({
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price.toFixed(2),
            image: null,
            isBestSeller: product.isBestSeller,
            isNewAdded: product.isNewAdded,
            isVegan: product.isVegan,
            extras: product.extras || []
        });
        setIsEditing(true);
    };

const handleUpdateProduct = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("id", currentProduct._id);
  formData.append("name", updatedProduct.name);
  formData.append("category", updatedProduct.category);
  formData.append("price", updatedProduct.price);
  formData.append("description", updatedProduct.description);
  formData.append("isBestSeller", updatedProduct.isBestSeller);
  formData.append("isNewAdded", updatedProduct.isNewAdded);
  formData.append("isVegan", updatedProduct.isVegan);
  
  // SCHIMBARE: Trimite extrasele ca JSON string
  formData.append("extras", JSON.stringify(updatedProduct.extras));
  
  if (updatedProduct.image instanceof File) {
    formData.append("image", updatedProduct.image);
  }

  console.log("Update FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await axios.post(`${url}/api/food/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.data.success) {
      toast.success(response.data.message, { theme: "dark" });
      fetchProducts();
      setIsEditing(false);
    } else {
      toast.error(response.data.message, { theme: "dark" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Error updating product", { theme: "dark" });
  }
};

    useEffect(() => {
        fetchProducts();
        getCategoryList();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = products.filter(
            (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
        );
        setFilteredProducts(filtered);
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
                <button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    onClick={() => setIsModalOpen(true)}
                >
                    Add a new product
                </button>
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

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Category</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Price</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Extras</th>
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
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{product.category}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{product.price.toFixed(2)} €</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {product.extras?.length > 0 ? (
                                        <div className="text-xs text-gray-300">
                                            {product.extras.length} extra(s)
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500">No extras</span>
                                    )}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
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

            <div className='flex justify-center mt-4'>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {isEditing && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h3 className="text-2xl font-bold text-white">
                                Edit Product
                            </h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form className="p-6 space-y-6" onSubmit={handleUpdateProduct}>
                            {/* Image Upload */}
                            <div className="space-y-3">
                                <label className="block text-lg font-semibold text-white">Product Image</label>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Current Image */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-400">Current Image</label>
                                        <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
                                            <img
                                                src={`${url}/images/` + currentProduct.image}
                                                alt="Current product"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* New Image */}
                                    <div className="space-y-2 flex-1">
                                        <label className="block text-sm font-medium text-gray-400">New Image (optional)</label>
                                        <label htmlFor="edit-image" className="cursor-pointer group">
                                            <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                                {updatedProduct.image instanceof File ? (
                                                    <div className="relative w-full h-full">
                                                        <img 
                                                            src={URL.createObjectURL(updatedProduct.image)} 
                                                            alt="New product preview" 
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="text-white text-center">
                                                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <p className="text-sm">Change Image</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-6">
                                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2  002 2z" />
                                                        </svg>
                                                        <p className="text-gray-400 text-sm">Click to upload new image</p>
                                                        <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG up to 10MB</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input 
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.files[0] })} 
                                                type="file" 
                                                id="edit-image" 
                                                hidden 
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Product Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter product name"
                                        value={updatedProduct.name}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Price (€)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 no-arrows"
                                        placeholder="0.00"
                                        value={updatedProduct.price}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
                                        onBlur={handlePriceBlur}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={updatedProduct.category}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select category</option>
                                        {list.map((category) => (
                                            <option key={category._id} value={category.menu_name}>
                                                {category.menu_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Product Tags</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={updatedProduct.isBestSeller}
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, isBestSeller: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-white">Best Seller</span>
                                        </label>

                                        <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={updatedProduct.isNewAdded}
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, isNewAdded: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-white">New Arrival</span>
                                        </label>

                                        <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={updatedProduct.isVegan}
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, isVegan: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-white">Vegan</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Description</label>
                                <textarea
                                    rows="4"
                                    maxLength="500"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Describe your product..."
                                    value={updatedProduct.description}
                                    onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
                                />
                            </div>

                            {/* Extra Options Section */}
                            <ExtraOptionsSection 
                                extraName={extraName}
                                setExtraName={setExtraName}
                                extraPrice={extraPrice}
                                setExtraPrice={setExtraPrice}
                                addExtra={addExtra}
                                updatedProduct={updatedProduct}
                                removeExtra={removeExtra}
                            />

                            {/* Actions */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200 font-medium flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Update Product</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h3 className="text-2xl font-bold text-white">Create New Product</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form className="p-6 space-y-6" onSubmit={handleAddProduct}>
                            {/* Image Upload */}
                            <div className="space-y-3">
                                <label className="block text-lg font-semibold text-white">Product Image</label>
                                <label htmlFor="image" className="cursor-pointer group">
                                    <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                        {image ? (
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src={URL.createObjectURL(image)} 
                                                    alt="Product preview" 
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-white text-center">
                                                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-sm">Change Image</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6">
                                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-gray-400 text-sm">Click to upload product image</p>
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

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        maxLength="100"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter product name"
                                        value={updatedProduct.name}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Price (€)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        maxLength="6"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 no-arrows"
                                        placeholder="0.00"
                                        value={updatedProduct.price}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
                                        onBlur={handlePriceBlur}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={updatedProduct.category}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select category</option>
                                        {list.map((category) => (
                                            <option key={category._id} value={category.menu_name}>
                                                {category.menu_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Product Tags</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isBestSeller"
                                                checked={updatedProduct.isBestSeller}
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, isBestSeller: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-white">Best Seller</span>
                                        </label>

                                        <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isNewAdded"
                                                checked={updatedProduct.isNewAdded}
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, isNewAdded: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-white">New Arrival</span>
                                        </label>

                                        <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isVegan"
                                                checked={updatedProduct.isVegan}
                                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, isVegan: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-white">Vegan</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Description</label>
                                <textarea
                                    rows="4"
                                    maxLength="500"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Describe your product..."
                                    value={updatedProduct.description}
                                    onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
                                />
                            </div>

                            {/* Extra Options Section */}
                            <ExtraOptionsSection 
                                extraName={extraName}
                                setExtraName={setExtraName}
                                extraPrice={extraPrice}
                                setExtraPrice={setExtraPrice}
                                addExtra={addExtra}
                                updatedProduct={updatedProduct}
                                removeExtra={removeExtra}
                            />

                            {/* Actions */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200 font-medium flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Add Product</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ProductsTable;