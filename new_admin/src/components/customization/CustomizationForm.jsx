import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { assets } from '../../../../frontend/src/assets/assets';
import { useUrl } from '../context/UrlContext';
import { X, Upload, Clock, Mail, Phone, Shield, Trash2 } from "lucide-react";

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

    const [isExistingCustomization, setIsExistingCustomization] = useState(false);

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

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                const customizationData = response.data.data;
                setData(customizationData);
                setIsExistingCustomization(true);

                if (customizationData.image) {
                    setImage(customizationData.image);
                }

                if (customizationData.openingHours) {
                    setSchedule((prevSchedule) => ({
                        ...prevSchedule,
                        weekdays: {
                            open: customizationData.openingHours.weekdays?.open || "",
                            close: customizationData.openingHours.weekdays?.close || "",
                        },
                        saturday: {
                            open: customizationData.openingHours.saturday?.open || "",
                            close: customizationData.openingHours.saturday?.close || "",
                        },
                        sunday: {
                            open: customizationData.openingHours.sunday?.open || "",
                            close: customizationData.openingHours.sunday?.close || "",
                        }
                    }));
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
            setImage(selectedFile);
        } else {
            toast.error('Please select a valid image file', { theme: "dark" });
            setImage(null);
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("id", data._id);
        formData.append('restaurantName', data.restaurantName);

        if (image && typeof image !== 'string') {
            formData.append('image', image);
        }

        formData.append('primaryColor', data.primaryColor);
        formData.append('secondaryColor', data.secondaryColor);
        formData.append('slogan', data.slogan);
        formData.append('contactEmail', data.contactEmail);
        formData.append('contactPhone', data.contactPhone);
        formData.append('securityToken', data.securityToken);
        formData.append('openingHours', JSON.stringify(schedule));
        formData.append('openHour', 'null');
        formData.append('closeHour', 'null');
        formData.append('deleteAccountHours', data.deleteAccountHours);

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
                setImage(null);
                
                if (isExistingCustomization) {
                    toast.success('Customization updated successfully!', { theme: "dark" });
                } else {
                    toast.success('Customization added successfully!', { theme: "dark" });
                }

                fetchCustomization();
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error('Error adding/updating customization:', error);
            toast.error('Failed to add/update customization.', { theme: "dark" });
        }
    };

    const clearImage = () => {
        setImage(null);
        setData(prev => ({ ...prev, image: '' }));
    };

    return (
        <motion.div
            className="max-w-6xl mx-auto py-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Restaurant Customization</h1>
                    <p className="text-gray-400 mt-2">Manage your restaurant's branding and settings</p>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Form Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">
                        {isExistingCustomization ? 'Update Restaurant Settings' : 'Setup Restaurant'}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isExistingCustomization 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {isExistingCustomization ? 'Configured' : 'Setup Required'}
                        </div>
                    </div>
                </div>

                <form className="p-6 space-y-8" onSubmit={onSubmitHandler}>
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Restaurant Logo</label>
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Current Logo */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-400">Current Logo</label>
                                <div className="w-48 h-48 border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-700/30">
                                    {data.image ? (
                                        <div className="relative w-full h-full group">
                                            <img
                                                src={`${url}/images/` + data.image}
                                                alt="Current logo"
                                                className="w-full h-full object-contain p-4"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="text-white text-center">
                                                    <p className="text-sm">Current Logo</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-400 text-sm">No logo set</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* New Logo Upload */}
                            <div className="space-y-3 flex-1">
                                <label className="block text-sm font-medium text-gray-400">Upload New Logo</label>
                                <label htmlFor="logo-upload" className="cursor-pointer group">
                                    <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                        {image instanceof File ? (
                                            <div className="relative w-full h-full">
                                                <img 
                                                    src={URL.createObjectURL(image)} 
                                                    alt="New logo preview" 
                                                    className="w-full h-full object-contain p-4"
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <button
                                                        type="button"
                                                        onClick={clearImage}
                                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-white text-center">
                                                        <Upload className="w-8 h-8 mx-auto mb-2" />
                                                        <p className="text-sm">Change Logo</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-400 text-sm">Click to upload logo</p>
                                                <p className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        onChange={onImageChangeHandler} 
                                        type="file" 
                                        id="logo-upload" 
                                        hidden 
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Restaurant Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white flex items-center gap-2">
                                Restaurant Name
                            </label>
                            <input
                                type="text"
                                name="restaurantName"
                                value={data.restaurantName}
                                onChange={onChangeHandler}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter restaurant name"
                                required
                            />
                        </div>

                        {/* Slogan */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">Slogan</label>
                            <input
                                type="text"
                                name="slogan"
                                value={data.slogan}
                                onChange={onChangeHandler}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Your restaurant slogan"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white flex items-center gap-2">
                                <Mail size={16} />
                                Contact Email
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={data.contactEmail}
                                onChange={onChangeHandler}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="contact@restaurant.com"
                                required
                            />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white flex items-center gap-2">
                                <Phone size={16} />
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                name="contactPhone"
                                value={data.contactPhone}
                                onChange={onChangeHandler}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="+1 (555) 123-4567"
                                required
                            />
                        </div>
                    </div>

                    {/* Security & Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Security Token */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white flex items-center gap-2">
                                <Shield size={16} />
                                Security Token
                            </label>
                            <input
                                type="text"
                                name="securityToken"
                                value={data.securityToken}
                                onChange={onChangeHandler}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter security token"
                                required
                            />
                        </div>

                        {/* Delete Account Hours */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white flex items-center gap-2">
                                <Clock size={16} />
                                Auto-delete Accounts (hours)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="deleteAccountHours"
                                    value={data.deleteAccountHours}
                                    onChange={onChangeHandler}
                                    min="1"
                                    max="24"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="24"
                                    required
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="relative group">
                                        <div className="text-gray-400 hover:text-gray-300 cursor-help">
                                            ℹ️
                                        </div>
                                        <div className="absolute hidden group-hover:block right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 z-10">
                                            Accounts will be automatically deleted after this many hours when users scan QR codes
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Opening Hours Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Clock className="text-blue-400" size={24} />
                            <h3 className="text-xl font-semibold text-white">Opening Hours</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Weekdays */}
                            <div className="space-y-3 bg-gray-700/30 rounded-xl p-4">
                                <label className="block text-sm font-medium text-white">Monday - Friday</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Opening Time</label>
                                        <input
                                            type="time"
                                            name="open"
                                            value={schedule.weekdays.open}
                                            onChange={(e) => handleTimeChange(e, "weekdays")}
                                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Closing Time</label>
                                        <input
                                            type="time"
                                            name="close"
                                            value={schedule.weekdays.close}
                                            onChange={(e) => handleTimeChange(e, "weekdays")}
                                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Saturday */}
                            <div className="space-y-3 bg-gray-700/30 rounded-xl p-4">
                                <label className="block text-sm font-medium text-white">Saturday</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Opening Time</label>
                                        <input
                                            type="time"
                                            name="open"
                                            value={schedule.saturday.open}
                                            onChange={(e) => handleTimeChange(e, "saturday")}
                                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Closing Time</label>
                                        <input
                                            type="time"
                                            name="close"
                                            value={schedule.saturday.close}
                                            onChange={(e) => handleTimeChange(e, "saturday")}
                                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sunday */}
                            <div className="space-y-3 bg-gray-700/30 rounded-xl p-4">
                                <label className="block text-sm font-medium text-white">Sunday</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Opening Time</label>
                                        <input
                                            type="time"
                                            name="open"
                                            value={schedule.sunday.open}
                                            onChange={(e) => handleTimeChange(e, "sunday")}
                                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Closing Time</label>
                                        <input
                                            type="time"
                                            name="close"
                                            value={schedule.sunday.close}
                                            onChange={(e) => handleTimeChange(e, "sunday")}
                                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-700">
                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 font-medium flex items-center space-x-2 hover:scale-105 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{isExistingCustomization ? 'Update Settings' : 'Save Configuration'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default CustomizationPage;