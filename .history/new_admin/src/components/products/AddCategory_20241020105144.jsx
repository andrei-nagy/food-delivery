import React, { useState, useEffect } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';
import { motion } from "framer-motion";

const AddCategory = () => {
    const url = "http://localhost:4000"
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad"
    });

    const [list, setList] = useState([]);

    const getCategoryList = async () => {
        try {
            const response = await axios.get(`${url}/api/categories/listcategory`);
            console.log(response.data);
            if (response.data.success) {
                setList(response.data.data);  // Setăm lista de categorii
            } else {
                toast.error("Error fetching categories");
            }
        } catch (error) {
            console.error("Error fetching categories", error);
            toast.error("Error fetching categories");
        }
    };

    useEffect(() => {
        getCategoryList();
    }, [])

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(prevData => ({ ...prevData, [name]: value }));
    }

    // New onBlur handler for price
    const onPriceBlur = () => {
        const numericValue = parseFloat(data.price);
        if (!isNaN(numericValue)) {
            const roundedValue = numericValue.toFixed(2);
            setData(prevData => ({ ...prevData, price: roundedValue }));
        }
    };

    const onSubmitHandler = async (event) => {
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
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding product", error);
            toast.error("Error adding product");
        }
    }

    return (<motion.div
        className='max-w-7xl mt-10 mx-auto py-6 px-4 lg:px-8 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
    >
        <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold text-gray-100'>Add a product</h2>
         
                {/* <input
                    type='text'
                    placeholder='Search products...'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    onChange={handleSearch}
                    value={searchTerm}
                /> */}
                {/* <Search className='absolute left-3 top-2.5 text-gray-400' size={18} /> */}
       
        </div>
       
        <div className='overflow-x-auto'>
            <form className='bg-gray-50 rounded-lg shadow-md p-6 flex flex-col space-y-4' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col items-center mb-4">
                    <p className='text-gray-600'>Upload Image</p>
                    <label htmlFor="image" className='cursor-pointer'>
                        <div className='w-40 h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center'>
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="Product preview" className='object-cover w-full h-full rounded' />
                            ) : (
                                <span className='text-gray-400'>No image selected</span>
                            )}
                        </div>
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                </div>

                <div className="add-product-name flex-col">
                    <label className="block mb-1 text-gray-700">Product Name</label>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        placeholder='Product name'
                        className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'  // Adăugat text-black
                        required
                    />
                </div>

                <div className="add-product-description flex-col">
                    <label className="block mb-1 text-gray-700">Product Description</label>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.description}
                        name="description"
                        rows="4"
                        placeholder='Write your description'
                        className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                        required
                    ></textarea>
                </div>

                <div className="add-category-price flex space-x-4">
                    <div className="add-category flex-col w-1/2">
                        <label className="block mb-1 text-gray-700">Product Category</label>
                        <select
                            onChange={onChangeHandler}
                            value={data.category}
                            name="category"
                            className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                        >
                            <option value="" disabled>Select a category</option>
                            {list.map((category) => (
                                <option key={category._id} value={category.menu_name}>
                                    {category.menu_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="add-price flex-col w-1/2">
                        <label className="block mb-1 text-gray-700">Product Price</label>
                        <input
                            onChange={onChangeHandler}
                            onBlur={onPriceBlur}
                            value={data.price}
                            type="number"
                            name="price"
                            placeholder='$20.00'
                            className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        />
                    </div>
                </div>
                <button type='submit' className='add-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-300'>Add Product</button>
            </form>
        </div>
        </motion.div>
        
    );
}

export default AddCategory;
