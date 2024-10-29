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
        securityToken: '',
        openingHours: '',
        deleteAccountHours: ''
    });

    const [schedule, setSchedule] = useState({
        weekdays: { open: "", close: "" },
        saturday: { open: "", close: "" },
        sunday: { open: "", close: "" }
    });



    const handleTimeChange = (event, type) => {
        const { name, value } = event.target;

        setSchedule((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [name]: value
            }
        }));
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
    const handleClearTime = (dayType, field) => {
        setSchedule((prevSchedule) => ({
            ...prevSchedule,
            [dayType]: {
                ...prevSchedule[dayType],
                [field]: ""
            }
        }));
    };
    const onImageChangeHandler = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setImage(selectedFile); // Set the image file to state
        } else {
            toast.error('Please select a valid image file', { theme: "dark" });
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
        formData.append('openingHours', JSON.stringify(schedule));

        formData.append('deleteAccountHours', data.deleteAccountHours)
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
                    openingHours: ''
                });
                setImage(null); // Reset image on successful submission
                if (isExistingCustomization) {
                    toast.success('Customization updated successfully!', { theme: "dark" });
                } else {
                    toast.success('Customization added successfully!', { theme: "dark" });
                }

                toast.success(response.data.message, { theme: "dark" });
                fetchCustomization(); // Refresh data
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error('Error adding/updating customization:', error);
            toast.error('Failed to add/update customization.', { theme: "dark" });
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
                    <div className='flex justify-between items-center mb-6 mt-6'>
                        <h2 className='text-xl font-semibold text-gray-100'>Opening hours</h2>
                    </div>
                    <div className="grid md:grid-cols-2 md:gap-6">

                        <div className="space-y-6">
                            {/* Luni - Vineri */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <label htmlFor="openHourWeekdays" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        Monday - Friday: Start Time (24h format)
                                    </label>
                                    <input
                                        type="time"
                                        name="open"
                                        value={data.openingHours.weekdays.open}
                                        onChange={(e) => handleTimeChange(e, "weekdays")}
                                        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-12 shadow-md transition duration-200 ease-in-out"
                                        required
                                        step="600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClearTime("weekdays", "open")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition duration-200 ease-in-out"
                                    >
                                        &#x2715;
                                    </button>
                                </div>

                                <div className="flex-1 relative">
                                    <label htmlFor="closeHourWeekdays" className="block text-sm text-gray-600 dark:text-gray-200">
                                        Monday - Friday: End Time (24h format)
                                    </label>
                                    <input
                                        type="time"
                                        name="close"
                                        value={schedule.weekdays.close}
                                        onChange={(e) => handleTimeChange(e, "weekdays")}
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                        step="600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClearTime("weekdays", "close")}
                                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                            </div>

                            {/* Sâmbătă */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <label htmlFor="openHourSaturday" className="block text-sm text-gray-600 dark:text-gray-200">
                                        Saturday: Start Time (24h format)
                                    </label>
                                    <input
                                        type="time"
                                        name="open"
                                        value={schedule.saturday.open}
                                        onChange={(e) => handleTimeChange(e, "saturday")}
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        step="600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClearTime("saturday", "open")}
                                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <label htmlFor="closeHourSaturday" className="block text-sm text-gray-600 dark:text-gray-200">
                                        Saturday: End Time (24h format)
                                    </label>
                                    <input
                                        type="time"
                                        name="close"
                                        value={schedule.saturday.close}
                                        onChange={(e) => handleTimeChange(e, "saturday")}
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        step="600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClearTime("saturday", "close")}
                                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                            </div>

                            {/* Duminică */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <label htmlFor="openHourSunday" className="block text-sm text-gray-600 dark:text-gray-200">
                                        Sunday: Start Time (24h format)
                                    </label>
                                    <input
                                        type="time"
                                        name="open"
                                        value={schedule.sunday.open}
                                        onChange={(e) => handleTimeChange(e, "sunday")}
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        step="600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClearTime("sunday", "open")}
                                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <label htmlFor="closeHourSunday" className="block text-sm text-gray-600 dark:text-gray-200">
                                        Sunday: End Time (24h format)
                                    </label>
                                    <input
                                        type="time"
                                        name="close"
                                        value={schedule.sunday.close}
                                        onChange={(e) => handleTimeChange(e, "sunday")}
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        step="600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClearTime("sunday", "close")}
                                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    >
                                        &#x2715;
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <button type="submit" className="mt-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        {isExistingCustomization ? 'Update Customization' : 'Add Customization'}
                    </button>
                </form>




            </div>
        </motion.div>
    );
};

export default CustomizationPage;
