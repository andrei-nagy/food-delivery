import React, { useState, useEffect } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';

const AddProductsPage = () => {
    const url = "http://localhost:4000";
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

    return (
        <div className='container mx-auto p-6'>
            <h2 className='text-3xl font-bold text-gray-800 mb-8 text-center'>Add New Product</h2>
            <form className='bg-white rounded-lg shadow-lg p-8 flex flex-col space-y-6' onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col items-center mb-4">
                    <p className='text-gray-600 mb-2'>Upload Image</p>
                    <label htmlFor="image" className='cursor-pointer'>
                        <div className='w-40 h-40 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center transition hover:border-blue-500'>
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="Product preview" className='object-cover w-full h-full rounded-lg' />
                            ) : (
                                <span className='text-gray-500'>No image selected</span>
                            )}
                        </div>
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
                </div>

                <div className="add-product-name flex-col">
                    <label className="block mb-1 text-gray-700 font-semibold">Product Name</label>
                    <input
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        name="name"
                        placeholder='Enter product name'
                        className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                        required
                    />
                </div>

                <div className="add-product-description flex-col">
                    <label className="block mb-1 text-gray-700 font-semibold">Product Description</label>
                    <textarea
                        onChange={onChangeHandler}
                        value={data.description}
                        name="description"
                        rows="4"
                        placeholder='Write product description here'
                        className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                        required
                    ></textarea>
                </div>

                <div className="add-category-price flex space-x-4">
                    <div className="add-category flex-col w-1/2">
                        <label className="block mb-1 text-gray-700 font-semibold">Product Category</label>
                        <select
                            onChange={onChangeHandler}
                            value={data.category}
                            name="category"
                            className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
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
                        <label className="block mb-1 text-gray-700 font-semibold">Product Price</label>
                        <input
                            onChange={onChangeHandler}
                            onBlur={onPriceBlur}
                            value={data.price}
                            type="number"
                            name="price"
                            placeholder='$20.00'
                            className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200'
                            required
                        />
                    </div>
                </div>
                <button type='submit' className='add-btn bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition duration-300 font-semibold'>Add Product</button>
            </form>
        </div>
    );
}

export default AddProductsPage;
