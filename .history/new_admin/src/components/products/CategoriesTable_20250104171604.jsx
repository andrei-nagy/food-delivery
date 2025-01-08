import { motion } from "framer-motion";
import { Edit, Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const CategoriesTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
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
    // const onChangeHandler = (event) => {
    //     const name = event.target.name;
    //     const value = event.target.value;
    //     setData(data => ({ ...data, [name]: value }));
    // };

    const handleAddProduct = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("menu_name", updatedCategory.menu_name);
        formData.append("description", updatedCategory.description);
        formData.append("image", image);
        formData.append("isActive", updatedCategory.isActive); 

        try {
            const response = await axios.post(`${url}/api/categories/addcategory`, formData);
            if (response.data.success) {

                setImage(null);
                toast.success(response.data.message, {theme: "dark"});
                fetchCategories(); // Reîncarcă produsele după adăugare
                setIsModalOpen(false); // Închide modalul
                setUpdatedCategory({ name: "", description: "", price: "", category: "" }); // Resetează formularul
            } else {
              
                toast.error(response.data.message, {theme: "dark"});
            }
        } catch (error) {
            console.error("Error adding product", error);
            toast.error("Error adding product", {theme: "dark"});
        }
    }

    const removeFoodCategory = async (categoryId) => {
        const response = await axios.post(`${url}/api/categories/removecategory`, { id: categoryId })
        await fetchCategories();

        if (response.data.success) {
            toast.success(response.data.message, {theme: "dark"})
        } else {
            toast.error(response.data.message, {theme: "dark"})
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
        const formData = new FormData(); // Crează un obiect FormData
        formData.append("id", currentCategory._id);
        formData.append("menu_name", updatedCategory.menu_name);
        formData.append("description", updatedCategory.description);
        formData.append("isActive", updatedCategory.isActive);
        if (updatedCategory.image) {
            formData.append("image", updatedCategory.image); // Adaugă imaginea la formData
        }

        try {
            const response = await axios.post(`${url}/api/categories/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Setează headerul corect pentru fișiere
                },
            });
            if (response.data.success) {
                toast.success(response.data.message, {theme: "dark"});
                fetchCategories(); // Reîncarcă produsele după actualizare
                setIsEditing(false); // Închide formularul de editare
            } else {
                toast.error(response.data.message, {theme: "dark"});
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Error updating category.", {theme: "dark"});
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
                {/* <h2 className='text-xl font-semibold text-gray-100'>Categories List</h2> */}
                <button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    onClick={() => setIsModalOpen(true)}
                >
                    Add a new category
                </button>
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

          
            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Image</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Description</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
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
                            {/* Afișează imaginea curentă dacă există */}
                            {currentCategory.image && (
                                <img
                                    src={`${url}/images/` + currentCategory.image}
                                    alt="Current category"
                                    className="mb-2 w-32 h-32 object-cover rounded" // Poți ajusta dimensiunile după preferințe
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
                                onChange={(e) => setUpdatedCategory({ ...updatedCategory, isActive: e.target.value === "true" })} // Transformăm valoarea selectată în boolean
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
                <div id="crud-modal" className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
                    <div className="relative p-4 w-full max-w-md max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create a new category
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <form className="p-4 md:p-5" onSubmit={handleAddProduct}>
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                    <div className="col-span-2">
                                        <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Upload image
                                            <div className='w-40 h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer'>
                                                {image ? (
                                                    <img src={URL.createObjectURL(image)} alt="Product preview" className='object-cover w-full h-full rounded' />
                                                ) : (
                                                    <span className='text-gray-400'>No image selected</span>
                                                )}
                                            </div>
                                        </label>
                                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />

                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category name</label>
                                        <input
                                            type="text"
                                            name="menu_name"
                                            id="name"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="Type category name"
                                            value={updatedCategory.menu_name}
                                            onChange={(e) => setUpdatedCategory({ ...updatedCategory, menu_name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category description</label>
                                        <textarea
                                            id="description"
                                            rows="4"
                                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Write category description here"
                                            value={updatedCategory.description}
                                            onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category status</label>
                                        <select
                                            name="isActive"
                                            value={updatedCategory.isActive}
                                            onChange={(e) => setUpdatedCategory({ ...updatedCategory, isActive: e.target.value })}
                                            className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                                            required
                                        >
                                            <option value="select">-- Select Status --</option>
                                            <option value={true}>Active</option>
                                            <option value={false}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='flex justify-center mt-4'>
                                <button type="submit" className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                    Add new category
                                </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CategoriesTable;
