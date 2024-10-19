import React, { useState, useEffect } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';

const AddProductsPage = () => {
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

    return (
        <div className='container mx-auto p-4'>
            <h2 className='text-2xl font-semibold text-gray-700 mb-6'>Add New Product</h2>
            <form className='bg-white rounded-lg shadow-md p-6 flex flex-col space-y-4' onSubmit={onSubmitHandler}>
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
                        placeholder='Type here'
                        className='border border-gray-300 rounded-lg p-2 w-full'
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
                        placeholder='Write content here'
                        className='border border-gray-300 rounded-lg p-2 w-full'
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
                            className='border border-gray-300 rounded-lg p-2 w-full'
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
                            className='border border-gray-300 rounded-lg p-2 w-full'
                            required
                        />
                    </div>
                </div>
                <button type='submit' className='add-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-300'>Add Product</button>
            </form>
        </div>
    );
}

export default AddProductsPage;
