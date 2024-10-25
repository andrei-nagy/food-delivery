import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { assets } from '../../../../frontend/src/assets/assets';
import { useUrl } from '../context/UrlContext';

const CustomizationPage = () => {
    const { url } = useUrl();
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        image: '',
        restaurantName: '',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        slogan: '',
        contactEmail: '',
        contactPhone: '',
        securityToken: ''
    });

    const [schedule, setSchedule] = useState({
        startTime: "",
        endTime: "",
        days: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        }
    });
    const handleTimeChange = (e) => {
        const { name, value } = e.target;
        setSchedule({
            ...schedule,
            [name]: value
        });
    };
    const handleDayChange = (e) => {
        const { name, checked } = e.target;
        setSchedule({
            ...schedule,
            days: {
                ...schedule.days,
                [name]: checked
            }
        });
    };
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
            toast.error('Error fetching customization data:', error);
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
            toast.error('Please select a valid image file', {theme: "dark"});
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
        formData.append('securityToken', data.securityToken)

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
                    toast.success('Customization updated successfully!', {theme: "dark"});
                } else {
                    toast.success('Customization added successfully!', {theme: "dark"});
                }

                toast.success(response.data.message, {theme: "dark"});
                fetchCustomization(); // Refresh data
            } else {
                toast.error(response.data.message, {theme: "dark"});
            }
        } catch (error) {
            console.error('Error adding/updating customization:', error);
            toast.error('Failed to add/update customization.', {theme: "dark"});
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


                <form className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col space-y-4'" onSubmit={onSubmitHandler}>

                    <div className="relative z-0 w-full mb-5 group">
                        {/* <input type="text" name="image" id="image" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent  appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required /> */}
                        <label htmlFor="image" className='cursor-pointer flex items-center justify-center'>
                            <div className='w-full max-w-xs h-40 border-2 border-none rounded flex items-center justify-center'>
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
                    <div className="relative z-0 w-full mb-5 group">
                        <input type="text"
                            onChange={onChangeHandler}
                            value={data.restaurantName}
                            name="restaurantName"
                            id="restaurantName"
                            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="restaurantName" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Restaurant name</label>
                    </div>
                    <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="text"
                                name="contactEmail"
                                onChange={onChangeHandler}
                                value={data.contactEmail}
                                id="contactEmail" className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="contactEmail" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contact email</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="text"
                                name="contactPhone"
                                onChange={onChangeHandler}
                                value={data.contactPhone}
                                id="contactPhone"
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="contactPhone" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Contact phone</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="number"
                                name="deleteAccountHours"
                                onChange={onChangeHandler}
                                value={data.deleteAccountHours}
                                id="deleteAccountHours"
                                min="1"
                                max="24"
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="deleteAccountHours" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Hours for deleting accounts after someone scans the QR code.
                            </label>

                            {/* Tooltip */}
                            <div className="absolute top-0 right-0 mt-2 mr-2">
                                <div className="relative group">
                                    <svg className="w-5 h-5 text-gray-400 cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M12 12h.01M12 16v.01" />
                                    </svg>
                                    <div className="absolute hidden group-hover:block bg-gray-600 text-white text-xs rounded-lg p-2 mt-2 shadow-lg">
                                        Hours for deleting accounts after someone scans the QR code.
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="text"
                                name="securityToken"
                                onChange={onChangeHandler}
                                value={data.securityToken}
                                id="securityToken"
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                            <label htmlFor="securityToken" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Security Token</label>
                        </div>
                    </div>

                  
                    <div className='flex justify-between items-center mb-6 mt-6'>
                        <h2 className='text-xl font-semibold text-gray-100'>Opening hours</h2>
                    </div>
                    <div className="grid md:grid-cols-2 md:gap-6">

                        {/* Start and End Time */}
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label htmlFor="openHour" className="block text-sm text-gray-600 dark:text-gray-200">
                                    Start Time (24h format)
                                </label>
                                <input
                                    type="time"
                                    name="openHour"
                                    value={schedule.openHour}
                                    onChange={handleTimeChange}
                                    className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                   


                                    required
                                    step="600" // Step is 10 minutes
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="endTime" className="block text-sm text-gray-600 dark:text-gray-200">
                                    End Time (24h format)
                                </label>
                                <input
                                    type="time"
                                    name="closeHour"
                                    value={schedule.closeHour}
                                    onChange={handleTimeChange}
                                    className="block w-full px-4 py-2 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:outline-none focus:ring"
                                    required
                                    step="600" // Step is 10 minutes
                                />
                            </div>
                        </div>

                        {/* Days of the Week */}
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-200 mb-2">Select Active Days</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.keys(schedule.days).map((day) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name={day}
                                            checked={schedule.days[day]}
                                            onChange={handleDayChange}
                                            id={day}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                                        />
                                        <label htmlFor={day} className="capitalize text-sm text-gray-600 dark:text-gray-200">
                                            {day}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-0 w-full mb-5 group">
                        <input
                            type="text"
                            name="slogan"
                            id="slogan"
                            onChange={onChangeHandler}
                            value={data.slogan}
                            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label htmlFor="slogan" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Slogan</label>
                    </div>
                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        {isExistingCustomization ? 'Update Customization' : 'Add Customization'}
                    </button>
                </form>




            </div>
        </motion.div>
    );
};

export default CustomizationPage;
