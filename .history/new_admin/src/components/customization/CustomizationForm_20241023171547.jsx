import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { assets } from '../../../../frontend/src/assets/assets';
import { useUrl } from '../context/UrlContext';

const CustomizationPage = () => {
    const {url} = useUrl();
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
    
    const onImageChangeHandler = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setImage(selectedFile); // Set the image file to state
        } else {
            toast.error('Please select a valid image file');
            setImage(null); // Reset image if not valid
        }
    };
    const onSubmitHandler = async (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append("id", data._id); // Assuming you need to send an ID
        formData.append('restaurantName', data.restaurantName);
    
        // Check if a new image is being uploaded
        if (image && typeof image !== 'string') { // New image uploaded
            formData.append('image', image);
        } else if (isExistingCustomization && data.image) {
            // If there's existing customization and no new image uploaded, do not append the image
            // Optionally, you could send a signal here if you need to indicate no change to the image
            // e.g., formData.append('image', data.image); // Not required in this case
        }
    
        // Append other fields
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
                <h2 className='text-xl font-semibold text-gray-100'>Customization page</h2>
            </div>
            <div className='overflow-x-auto'>
                

<form class="max-w-md mx-auto">
 
  <div class="relative z-0 w-full mb-5 group">
      <input type="password" name="repeat_password" id="floating_repeat_password" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
      <label for="floating_repeat_password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm password</label>
  </div>
  <div class="grid md:grid-cols-2 md:gap-6">
    <div class="relative z-0 w-full mb-5 group">
        <input type="text" name="floating_first_name" id="floating_first_name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label for="floating_first_name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">First name</label>
    </div>
    <div class="relative z-0 w-full mb-5 group">
        <input type="text" name="floating_last_name" id="floating_last_name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label for="floating_last_name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Last name</label>
    </div>
  </div>
  <div class="grid md:grid-cols-2 md:gap-6">
    <div class="relative z-0 w-full mb-5 group">
        <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" name="floating_phone" id="floating_phone" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label for="floating_phone" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Phone number (123-456-7890)</label>
    </div>
    <div class="relative z-0 w-full mb-5 group">
        <input type="text" name="floating_company" id="floating_company" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
        <label for="floating_company" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Company (Ex. Google)</label>
    </div>
  </div>
  <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
</form>



                <form className='bg-gray-50 rounded-lg shadow-md p-6 flex flex-col space-y-4' onSubmit={onSubmitHandler}>
                    <div className="add-img-upload flex-col items-center mb-4">
                        <p className='text-gray-600'>Upload your logo</p>
                        <label htmlFor="image" className='cursor-pointer'>
                            <div className='w-full max-w-xs h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center'>
                                {/* {image ? (
                                    <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="Category preview" className='object-cover w-full h-full rounded' />
                                ) : (
                                    <img src={assets.upload_area} alt="Upload area" className='object-cover w-full h-full rounded'/>
                                )} */}
                                {image ? (
                                    <img src={typeof image === 'string' ? `${url}/images/` + image : URL.createObjectURL(image)} alt="Category preview" className='object-contain w-full h-full rounded' />

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