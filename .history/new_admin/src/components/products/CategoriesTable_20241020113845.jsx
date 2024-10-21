import { motion } from "framer-motion";
import { Edit, Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CategoriesTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [updatedCategory, setUpdatedCategory] = useState({
        menu_name: "",
        description: "",
        image: null,
    });
    const categoriesPerPage = 10; // Numărul de produse pe pagină
    const url = "http://localhost:4000";

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

    const removeFoodCategory = async (categoryId) => {
        const response = await axios.post(`${url}/api/categories/removecategory`, { id: categoryId })
        await fetchCategories();
    
        if (response.data.success) {
          toast.success(response.data.message)
        } else {
          toast.error(response.data.message)
        }
      }

    const editCategory = (category) => {
        setCurrentCategory(category);
        setUpdatedCategory({
            menu_name: category.menu_name,
            description: category.description,
            image: category.image
        });
        setIsEditing(true);
    };

    const handleUpdateCategory= async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/categories/update`, {
                id: currentCategory._id,
                ...updatedCategory,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchCategories(); // Reîncarcă produsele după actualizare
                setIsEditing(false); // Închide formularul de editare
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Error updating category.");
        }
    };

    useEffect(() => {
        fetchCategories();
      }, [])
    

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = categories.filter(
            (category) => category.menu_name.toLowerCase().includes(term) || category.description.toLowerCase().includes(term)
        );
        setFilteredCategories(filtered);
        setCurrentPage(1); // Reset page la 1 la fiecare căutare
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
                <h2 className='text-xl font-semibold text-gray-100'>Categories List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search category...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            {isEditing && (
                <div className="mb-4 p-4 border border-gray-600 rounded">
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">Edit Category</h3>
                    <form onSubmit={handleUpdateCategory}>
                    <div className="mb-4">
                            <label className="block text-gray-400">Image</label>
                            <input
                                type="file"
                                className="mt-1 p-2 bg-gray-700 text-white rounded"
                                value={updatedCategory.image}
                                onChange={(e) => setUpdatedCategory({ ...updatedCategory, image: e.target.value[0] })}
                                required
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
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-red-600 text-white px-4 py-2 rounded ml-2">Cancel</button>
                    </form>
                </div>
            )}

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Image</th>
                        
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Description</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
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
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{category.description}</td>
                              
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
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

export default CategoriesTable;
