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
                                name="deleteHours"
                                onChange={onChangeHandler}
                                value={data.deleteHours}
                                id="deleteHours"
                                min="1"
                                max="24"
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-700 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="deleteHours" className="peer-focus:font-medium absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                Old accounts deleted hours
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

                    </div>

                    <div className='flex justify-between items-center mb-6 mt-6'>
                        <h2 className='text-xl font-semibold text-gray-100'>Opening hours</h2>
                    </div>
                    <div className="grid md:grid-cols-2 md:gap-6" hidden>
                        <>
                            {/* drawer init and show */}
                            <div className="text-center">
                                <button
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    type="button"
                                    data-drawer-target="drawer-timepicker"
                                    data-drawer-show="drawer-timepicker"
                                    aria-controls="drawer-timepicker"
                                >
                                    Set time schedule
                                </button>
                            </div>
                            {/* drawer component */}
                            <div
                                id="drawer-timepicker"
                                className="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-96 dark:bg-gray-800"
                                tabIndex={-1}
                                aria-labelledby="drawer-timepicker-label"
                            >
                                <h5
                                    id="drawer-label"
                                    className="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
                                >
                                    Time schedule
                                </h5>
                                <button
                                    type="button"
                                    data-drawer-hide="drawer-timepicker"
                                    aria-controls="drawer-timepicker"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close menu</span>
                                </button>
                            
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700 mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-900 dark:text-white text-base font-medium">
                                                Business hours
                                            </span>
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultValue=""
                                                    name="business-hours"
                                                    className="sr-only peer"
                                                />
                                                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                                <span className="sr-only">Business hours</span>
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                            Enable or disable business working hours for all weekly working days
                                        </p>
                                    </div>
                                    <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
                                        <label
                                            htmlFor="timezones"
                                            className="flex items-center mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            <span className="me-1">Select a timezone</span>
                                            <button type="button" data-tooltip-target="tooltip-timezone">
                                                <svg
                                                    aria-hidden="true"
                                                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white dark:text-gray-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="sr-only">Details</span>
                                            </button>
                                            <div
                                                id="tooltip-timezone"
                                                role="tooltip"
                                                className="inline-block absolute invisible z-10 py-2 px-3 max-w-sm text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                                            >
                                                Select a timezone that fits your location to accurately display
                                                time-related information.
                                                <div className="tooltip-arrow" data-popper-arrow="" />
                                            </div>
                                        </label>
                                        <select
                                            id="timezones"
                                            name="timezone"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            defaultValue=""
                                            required=""
                                        >
                                            <option  value="">
                                                Choose a timezone
                                            </option>
                                            <option value="America/New_York">
                                                EST (Eastern Standard Time) - GMT-5 (New York)
                                            </option>
                                            <option value="America/Los_Angeles">
                                                PST (Pacific Standard Time) - GMT-8 (Los Angeles)
                                            </option>
                                            <option value="Europe/London">
                                                GMT (Greenwich Mean Time) - GMT+0 (London)
                                            </option>
                                            <option value="Europe/Paris">
                                                CET (Central European Time) - GMT+1 (Paris)
                                            </option>
                                            <option value="Asia/Tokyo">
                                                JST (Japan Standard Time) - GMT+9 (Tokyo)
                                            </option>
                                            <option value="Australia/Sydney">
                                                AEDT (Australian Eastern Daylight Time) - GMT+11 (Sydney)
                                            </option>
                                            <option value="Canada/Mountain">
                                                MST (Mountain Standard Time) - GMT-7 (Canada)
                                            </option>
                                            <option value="Canada/Central">
                                                CST (Central Standard Time) - GMT-6 (Canada)
                                            </option>
                                            <option value="Canada/Eastern">
                                                EST (Eastern Standard Time) - GMT-5 (Canada)
                                            </option>
                                            <option value="Europe/Berlin">
                                                CET (Central European Time) - GMT+1 (Berlin)
                                            </option>
                                            <option value="Asia/Dubai">
                                                GST (Gulf Standard Time) - GMT+4 (Dubai)
                                            </option>
                                            <option value="Asia/Singapore">
                                                SGT (Singapore Standard Time) - GMT+8 (Singapore)
                                            </option>
                                        </select>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center min-w-[4rem]">
                                                <input
                                                    defaultChecked=""
                                                    id="monday"
                                                    name="days"
                                                    type="checkbox"
                                                    defaultValue="monday"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label
                                                    htmlFor="monday"
                                                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Mon
                                                </label>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="start-time-monday" className="sr-only">
                                                    Start time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="start-time-monday"
                                                        name="start-time-monday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="end-time-monday" className="sr-only">
                                                    End time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="end-time-monday"
                                                        name="end-time-monday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={24}
                                                        height={24}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center min-w-[4rem]">
                                                <input
                                                    id="tuesday"
                                                    name="days"
                                                    type="checkbox"
                                                    defaultValue="tuesday"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label
                                                    htmlFor="tuesday"
                                                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Tue
                                                </label>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="start-time-tuesday" className="sr-only">
                                                    Start time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="start-time-tuesday"
                                                        name="start-time-tuesday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="end-time-tuesday" className="sr-only">
                                                    End time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="end-time-tuesday"
                                                        name="end-time-tuesday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={24}
                                                        height={24}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center min-w-[4rem]">
                                                <input
                                                    defaultChecked=""
                                                    id="wednesday"
                                                    name="days"
                                                    type="checkbox"
                                                    defaultValue="wednesday"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label
                                                    htmlFor="wednesday"
                                                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Wed
                                                </label>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="start-time-wednesday" className="sr-only">
                                                    Start time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="start-time-wednesday"
                                                        name="start-time-wednesday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="end-time-wednesday" className="sr-only">
                                                    End time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="end-time-wednesday"
                                                        name="end-time-wednesday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={24}
                                                        height={24}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center min-w-[4rem]">
                                                <input
                                                    id="thursday"
                                                    name="days"
                                                    type="checkbox"
                                                    defaultValue="thursday"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label
                                                    htmlFor="thursday"
                                                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Thu
                                                </label>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="start-time-thursday" className="sr-only">
                                                    Start time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="start-time-thursday"
                                                        name="start-time-thursday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="end-time-thursday" className="sr-only">
                                                    End time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="end-time-thursday"
                                                        name="end-time-thursday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={24}
                                                        height={24}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center min-w-[4rem]">
                                                <input
                                                    id="friday"
                                                    name="days"
                                                    type="checkbox"
                                                    defaultValue="friday"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label
                                                    htmlFor="friday"
                                                    className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                    Fri
                                                </label>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="start-time-friday" className="sr-only">
                                                    Start time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="start-time-friday"
                                                        name="start-time-friday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full max-w-[7rem]">
                                                <label htmlFor="end-time-friday" className="sr-only">
                                                    End time:
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        id="end-time-friday"
                                                        name="end-time-friday"
                                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        min="09:00"
                                                        max="18:00"
                                                        defaultValue="00:00"
                                                        required=""
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width={24}
                                                        height={24}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center w-full py-2.5 mb-4 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                    >
                                        <svg
                                            className="w-4 h-4 me-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 12h14m-7 7V5"
                                            />
                                        </svg>
                                        Add interval
                                    </button>
                                    <div className="grid grid-cols-2 gap-4 bottom-4 left-0 w-full md:px-4 md:absolute">
                                        <button
                                            type="button"
                                            data-drawer-hide="drawer-timepicker"
                                            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            className="text-white w-full inline-flex items-center justify-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                        >
                                            Save all
                                        </button>
                                    </div>
                             
                            </div>
                        </>

                    </div>
                    <div className='flex justify-between items-center mb-6 mt-6'>
                        <h2 className='text-xl font-semibold text-gray-100'>Opening hours</h2>
                    </div>
                    <div className="grid md:grid-cols-2 md:gap-6">

                        {/* Start and End Time */}
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label htmlFor="startTime" className="block text-sm text-gray-600 dark:text-gray-200">
                                    Start Time (24h format)
                                </label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={schedule.startTime}
                                    onChange={handleTimeChange}
                                    className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    min="09:00"
                                    max="18:00"


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
                                    name="endTime"
                                    value={schedule.endTime}
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
