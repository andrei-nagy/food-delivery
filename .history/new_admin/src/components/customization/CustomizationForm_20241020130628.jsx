import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { assets } from '../../../../frontend/src/assets/assets';

const CustomizationPage = () => {
    const url = 'http://localhost:4000';
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        image: '',
        restaurantName: '',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        slogan: '',
        contactEmail: '',
        contactPhone: '',
    });
    const [isExistingCustomization, setIsExistingCustomization] = useState(false);

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                const customizationData = response.data.data;
                setData(customizationData);
                setIsExistingCustomization(true);

                // Set the image state if there's an existing image
                if (customizationData.image) {
                    setImage(customizationData.image);
                }
            } else {
                setIsExistingCustomization(false);
            }
        } catch (error) {
            console.error('Error fetching customization data:', error);
        }
    };

    useEffect(() => {
        fetchCustomization();
    }, [url]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('restaurantName', data.restaurantName);

        if (image && typeof image !== 'string') { // Ensure it's a new file
            formData.append('image', image);
        } else if (data.image) {
            formData.append('image', data.image); // Send existing image name
        }
        formData.append('primaryColor', data.primaryColor);
        formData.append('secondaryColor', data.secondaryColor);
        formData.append('slogan', data.slogan);
        formData.append('contactEmail', data.contactEmail);
        formData.append('contactPhone', data.contactPhone);

        try {
            const response = isExistingCustomization
                ? await axios.put(`${url}/admin/personalization/update`, formData)
                : await axios.post(`${url}/admin/personalization/add`, formData);

            if (response.data.success) {
                setData({
                    image: '',
                    restaurantName: '',
                    primaryColor: '#ffffff',
                    secondaryColor: '#000000',
                    slogan: '',
                    contactEmail: '',
                    contactPhone: '',
                });
                setImage(null); // Reset image on successful submission
                if (isExistingCustomization) {
                    toast.success('Customization updated successfully!');
                } else {
                    toast.success('Customization added successfully!');
                }

                toast.success(response.data.message);
                fetchCustomization(); // Refresh data
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error adding/updating customization:', error);
            toast.error('Failed to add/update customization.');
        }
    };

    return (
        <motion.div
            className='max-w-7xl mt-10 mx-auto py-6 px-4 lg:px-8 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
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
                                {/* {image ? (
                                    <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="Category preview" className='object-cover w-full h-full rounded' />
                                ) : (
                                    <img src={assets.upload_area} alt="Upload area" className='object-cover w-full h-full rounded'/>
                                )} */}
                                {image ? (
                                    <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="Category preview" className='object-contain w-full h-full rounded' />

                                ) : (
                                    <img
                                        src={`${url}/images/` + data.image}
                                        alt="Current category"
                                        className="mb-2 w-32 h-32 object-contain rounded" // Poți ajusta dimensiunile după preferințe
                                    />
                                )}
                            </div>
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' name="image" hidden />
                    </div>
                    <div className="add-product-name flex-col">
                        <label className="block mb-1 text-gray-700">Restaurant name</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.restaurantName}
                            type="text"
                            name="restaurantName"
                            placeholder='Type here'
                            className='border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        />
                    </div>
                    <div className="add-product-description flex-col">
                        <label className="block mb-1 text-gray-700">Restaurant slogan</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.slogan}
                            name="slogan"
                            rows="4"
                            placeholder='Write content here'
                            className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        ></input>
                    </div>
                    <div className="add-product-description flex-col">
                        <label className="block mb-1 text-gray-700">Contact email</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.contactEmail}
                            name="contactEmail"
                            rows="4"
                            placeholder='Write the contact email'
                            className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        ></input>
                    </div>
                    <div className="add-product-description flex-col">
                        <label className="block mb-1 text-gray-700">Contact phone</label>
                        <input
                            onChange={onChangeHandler}
                            value={data.contactPhone}
                            name="contactPhone"
                            rows="4"
                            placeholder='Write the contact phone'
                            className='border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-white'
                            required
                        ></input>
                    </div>
                    <button type='submit' className='add-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-300'>
                        {isExistingCustomization ? 'Update Customization' : 'Add Customization'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default CustomizationPage;
