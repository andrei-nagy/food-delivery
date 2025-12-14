import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { assets } from '../../../../frontend/src/assets/assets';
import { useUrl } from '../context/UrlContext';

const AddCategory = () => {
    const {url} = useUrl();
    const [image, setImage] = useState(null); 
    const [data, setData] = useState({
        menu_name: "",
        description: "",
        isActive: true, // Valoarea implicită pentru isActive
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("menu_name", data.menu_name);
        formData.append("description", data.description);
        formData.append("image", image);
        formData.append("isActive", data.isActive); // Adăugăm isActive la formData

        try {
            const response = await axios.post(`${url}/api/categories/addcategory`, formData);
            if (response.data.success) {
                setData({ menu_name: "", description: "", isActive: true }); // Resetăm formularul
                setImage(null); 
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding category", error);
            toast.error("Error adding category");
        }
    };

    return (
        <motion.div
            className='max-w-7xl mt-10 mx-auto py-6 px-4 lg:px-8 bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Add a Category</h2>
            </div>
            <div className='overflow-x-auto'>
                <form className='bg-gray-50 rounded-lg shadow-md p-6 flex flex-col space-y-4' onSubmit={onSubmitHandler}>
                    <div className="add-img-upload flex-col items-center mb-4">
                        <p className='text-gray-600'>Upload Image Category</p>
                        <label htmlFor="image" className='cursor-pointer'>
                            <div className='w-full max-w-xs h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center'>
                                {image ? (
                                    <img src={URL.createObjectURL(image)} alt="Category preview" className='object-cover w-full h-full rounded' />
                                ) : (
                                    <img src={assets.upload_area} alt="Upload area" className='object-cover w-full h-full rounded' />
                                )}
                            </div>
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                    </div>
                    <div className="add-product-name flex-col">
                        <label className="block mb-1 text-gray-700">Category Name</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.menu_name}
                            type="text"
                            name="menu_name"
                            placeholder='Type here'
                            className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        />
                    </div>
                    <div className="add-product-description flex-col">
                        <label className="block mb-1 text-gray-700">Category Description</label>
                        <textarea
                            onChange={onChangeHandler}
                            value={data.description}
                            name="description"
                            rows="4"
                            placeholder='Write content here'
                            className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        ></textarea>
                    </div>
                    {/* Câmp pentru statusul categoriei */}
                    <div className="add-product-status flex-col">
                        <label className="block mb-1 text-gray-700">Category Status</label>
                        <select
                            name="isActive"
                            value={data.isActive}
                            onChange={onChangeHandler}
                            className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        >
                            <option value={true}>Active</option>
                            <option value={false}>Inactive</option>
                        </select>
                    </div>
                    <button type='submit' className='add-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-300'>
                        Add Category
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default AddCategory;
