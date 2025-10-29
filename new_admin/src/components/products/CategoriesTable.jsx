import { motion } from "framer-motion";
import { Edit, Search, Trash2, Filter } from "lucide-react";
import { useState, useEffect } from "react";
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
    const categoriesPerPage = 10;
    const { url } = useUrl();

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
            console.error("Error fetching products:", error);
        }
    };

    const handleAddCategory = async (event) => {
        event.preventDefault();

        console.log("🌟 handleAddCategory called");
        console.log("Current updatedCategory:", updatedCategory);
        console.log("Selected image:", image);

        const formData = new FormData();
        formData.append("menu_name", updatedCategory.menu_name);
        formData.append("description", updatedCategory.description);
        formData.append("isActive", updatedCategory.isActive);
        if (image) {
            formData.append("image", image);
        }

        // Log FormData keys and values for debugging
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        try {
            const response = await axios.post(`${url}/api/categories/addcategory`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("Response from addcategory:", response.data);

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
            console.error("Error adding product:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            }
            toast.error("Error adding product", { theme: "dark" });
        }
    };

    const removeFoodCategory = async (categoryId) => {
        const response = await axios.post(`${url}/api/categories/removecategory`, { id: categoryId })
        await fetchCategories();

        if (response.data.success) {
            toast.success(response.data.message, { theme: "dark" })
        } else {
            toast.error(response.data.message, { theme: "dark" })
        }
    }

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
    }, [])

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
    };

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

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
                    Add a new category
                </button>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search all categories...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        Name
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Filter name..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.name}
                                        onChange={(e) => handleColumnFilter('name', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Description</div>
                                    <input
                                        type="text"
                                        placeholder="Filter description..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.description}
                                        onChange={(e) => handleColumnFilter('description', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Status</div>
                                    <input
                                        type="text"
                                        placeholder="Filter status..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.status}
                                        onChange={(e) => handleColumnFilter('status', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {currentCategories.map((category) => (
                            <motion.tr
                                key={category._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                    <img
                                        src={`${url}/images/` + category.image}
                                        alt='Category img'
                                        className='size-10 rounded-full object-cover'
                                    />
                                    {category.menu_name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{category.description}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {category.isActive ? (
                                        <span className="text-green-500">Active</span>
                                    ) : (
                                        <span className="text-red-500">Inactive</span>
                                    )}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <button onClick={() => editCategory(category)} className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => removeFoodCategory(category._id)} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {/* Mesaj pentru niciun rezultat */}
                {currentCategories.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No categories found matching your filters.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='flex justify-center mt-4'>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}

            {isEditing && (
                <motion.div
                    className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className='bg-gray-800 rounded-lg p-6 w-96'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <h2 className='text-xl font-semibold text-gray-100 mb-4'>Edit Category</h2>

                        <form onSubmit={handleUpdateCategory}>
                            <div className="mb-4">
                                <label className="block text-gray-400">Current Image</label>
                                {currentCategory.image && (
                                    <img
                                        src={`${url}/images/` + currentCategory.image}
                                        alt="Current category"
                                        className="mb-2 w-32 h-32 object-cover rounded"
                                    />
                                )}
                                <label className="block text-gray-400">New Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 p-2 bg-gray-700 text-white rounded"
                                    onChange={(e) => setUpdatedCategory({ ...updatedCategory, image: e.target.files[0] })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Name</label>
                                <input
                                    type="text"
                                    className="mt-1 p-2 bg-gray-700 text-white rounded"
                                    value={updatedCategory.menu_name}
                                    onChange={(e) => setUpdatedCategory({ ...updatedCategory, menu_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Description</label>
                                <input
                                    type="text"
                                    className="mt-1 p-2 bg-gray-700 text-white rounded"
                                    value={updatedCategory.description}
                                    onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400">Category Status</label>
                                <select
                                    className="mt-1 p-2 bg-gray-700 text-white rounded"
                                    value={updatedCategory.isActive}
                                    onChange={(e) => setUpdatedCategory({ ...updatedCategory, isActive: e.target.value === "true" })}
                                    required
                                >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                            </div>

                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-red-600 text-white px-4 py-2 rounded ml-2">Cancel</button>
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
                        className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h3 className="text-2xl font-bold text-white">
                                Create New Category
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form className="p-6 space-y-6" onSubmit={handleAddCategory}>
                            {/* Image Upload */}
                            <div className="space-y-3">
                                <label className="block text-lg font-semibold text-white">Category Image</label>
                                <label htmlFor="image" className="cursor-pointer group">
                                    <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                        {image ? (
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src={URL.createObjectURL(image)} 
                                                    alt="Category preview" 
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

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Describe your category..."
                                    value={updatedCategory.description}
                                    onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
                                />
                            </div>

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