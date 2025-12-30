import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { useUrl } from '../context/UrlContext';
import { 
    X, Upload, Clock, Mail, Phone, Shield, Globe, CreditCard, 
    MapPin, Users, Percent, Star, Palette, Receipt, Languages, Calendar,
    Package, ShoppingCart, Info, AlertCircle, CircleDollarSign, Banknote,
    Coins, Landmark, Wallet, CreditCard as CardIcon
} from "lucide-react";

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
        deleteAccountHours: '24',
        currency: 'EUR',
        defaultLanguage: 'en',
        timezone: 'Europe/Bucharest',
        taxRate: '19',
        serviceCharge: '0',
        address: '',
        city: '',
        country: 'Romania',
        postalCode: '',
        website: '',
        facebook: '',
        instagram: '',
        reservationEnabled: true,
        takeawayEnabled: true,
        deliveryEnabled: false,
        minOrderAmount: '0',
        deliveryFee: '0',
        vatNumber: '',
        companyNumber: '',
        receiptFooter: 'Thank you for visiting us!',
        ratingEnabled: true,
        tipsEnabled: true,
        logoPosition: 'center',
        themeStyle: 'modern',
        menuLayout: 'grid',
        qrCodeEnabled: true,
        autoPrintEnabled: false
    });

    const [schedule, setSchedule] = useState({
        weekdays: { open: "", close: "" },
        saturday: { open: "", close: "" },
        sunday: { open: "", close: "" }
    });

    const [isExistingCustomization, setIsExistingCustomization] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const currencyOptions = [
        { value: 'EUR', label: 'Euro (€)', symbol: '€' },
        { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
        { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
        { value: 'RON', label: 'Romanian Leu (lei)', symbol: 'lei' },
        { value: 'MDL', label: 'Moldovan Leu', symbol: 'MDL' },
        { value: 'HUF', label: 'Hungarian Forint', symbol: 'Ft' },
        { value: 'PLN', label: 'Polish Zloty', symbol: 'zł' },
        { value: 'BGN', label: 'Bulgarian Lev', symbol: 'лв' },
        { value: 'TRY', label: 'Turkish Lira', symbol: '₺' },
        { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' }
    ];

    const languageOptions = [
        { value: 'en', label: 'English', flag: '🇬🇧' },
        { value: 'ro', label: 'Română', flag: '🇷🇴' },
        { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { value: 'it', label: 'Italiano', flag: '🇮🇹' },
        { value: 'es', label: 'Español', flag: '🇪🇸' },
        { value: 'fr', label: 'Français', flag: '🇫🇷' }
    ];

    const timezoneOptions = [
        { value: 'Europe/Bucharest', label: 'Bucharest (GMT+2)' },
        { value: 'Europe/London', label: 'London (GMT+1)' },
        { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
        { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
        { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
        { value: 'America/New_York', label: 'New York (GMT-5)' },
        { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' }
    ];

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
                
                // Set all data from backend
                setData(prev => ({
                    ...prev,
                    ...customizationData,
                    // Ensure booleans are properly set
                    reservationEnabled: customizationData.reservationEnabled !== undefined ? customizationData.reservationEnabled : true,
                    takeawayEnabled: customizationData.takeawayEnabled !== undefined ? customizationData.takeawayEnabled : true,
                    deliveryEnabled: customizationData.deliveryEnabled !== undefined ? customizationData.deliveryEnabled : false,
                    ratingEnabled: customizationData.ratingEnabled !== undefined ? customizationData.ratingEnabled : true,
                    tipsEnabled: customizationData.tipsEnabled !== undefined ? customizationData.tipsEnabled : true,
                    qrCodeEnabled: customizationData.qrCodeEnabled !== undefined ? customizationData.qrCodeEnabled : true,
                    autoPrintEnabled: customizationData.autoPrintEnabled !== undefined ? customizationData.autoPrintEnabled : false,
                }));
                
                setIsExistingCustomization(true);

                if (customizationData.image) {
                    setImage(customizationData.image);
                }

                if (customizationData.openingHours) {
                    setSchedule({
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
                    });
                }
            } else {
                setIsExistingCustomization(false);
            }
        } catch (error) {
            console.error('Error fetching customization:', error);
            toast.error('Error fetching customization data: ' + error.message, { theme: "dark" });
        } finally {
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchCustomization();
    }, [url]);

    const onChangeHandler = (event) => {
        const { name, value, type, checked } = event.target;
        setData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
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
        
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        // VALIDARE CÂMPURI OBLIGATORII
        const requiredFields = {
            restaurantName: data.restaurantName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            address: data.address,
            city: data.city,
            country: data.country,
            securityToken: data.securityToken,
            taxRate: data.taxRate,
            deleteAccountHours: data.deleteAccountHours
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || value.toString().trim() === '')
            .map(([key]) => key);

        if (missingFields.length > 0) {
            toast.error(`Please fill in required fields: ${missingFields.join(', ')}`, { theme: "dark" });
            setIsSubmitting(false);
            return;
        }

        // VALIDARE TIMPURI
        if (!schedule.weekdays.open || !schedule.weekdays.close) {
            toast.error('Please set weekday opening hours', { theme: "dark" });
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        
        // Add ID if it exists
        if (data._id) {
            formData.append("id", data._id);
        }
        
        formData.append('restaurantName', data.restaurantName || '');
        
        // Check if image is a File object
        if (image && image instanceof File) {
            formData.append('image', image);
        } else if (data.image && typeof data.image === 'string') {
            // If we have an existing image URL, send it as is
            formData.append('image', data.image);
        } else if (image && typeof image === 'string') {
            // If image is a string from backend
            formData.append('image', image);
        }

        // Add all other fields
        const fieldsToSend = {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            slogan: data.slogan || '',
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            securityToken: data.securityToken,
            deleteAccountHours: data.deleteAccountHours,
            currency: data.currency,
            defaultLanguage: data.defaultLanguage,
            timezone: data.timezone,
            taxRate: data.taxRate,
            serviceCharge: data.serviceCharge || '0',
            address: data.address,
            city: data.city,
            country: data.country,
            postalCode: data.postalCode || '',
            website: data.website || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            reservationEnabled: data.reservationEnabled,
            takeawayEnabled: data.takeawayEnabled,
            deliveryEnabled: data.deliveryEnabled,
            minOrderAmount: data.minOrderAmount || '0',
            deliveryFee: data.deliveryFee || '0',
            vatNumber: data.vatNumber || '',
            companyNumber: data.companyNumber || '',
            receiptFooter: data.receiptFooter || 'Thank you for visiting us!',
            ratingEnabled: data.ratingEnabled,
            tipsEnabled: data.tipsEnabled,
            logoPosition: data.logoPosition,
            themeStyle: data.themeStyle,
            menuLayout: data.menuLayout,
            qrCodeEnabled: data.qrCodeEnabled,
            autoPrintEnabled: data.autoPrintEnabled
        };

        Object.entries(fieldsToSend).forEach(([key, value]) => {
            const finalValue = typeof value === 'boolean' ? value.toString() : value || '';
            formData.append(key, finalValue);
        });

        // Add opening hours
        formData.append('openingHours', JSON.stringify(schedule));

        // Add empty values for backward compatibility
        formData.append('openHour', 'null');
        formData.append('closeHour', 'null');

        try {
            const endpoint = isExistingCustomization ? 'update' : 'add';
            const method = isExistingCustomization ? 'put' : 'post';
            
            const response = await axios({
                method: method,
                url: `${url}/admin/personalization/${endpoint}`,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                toast.success('Settings saved successfully!', { theme: "dark" });
                // Refresh data
                await fetchCustomization();
            } else {
                toast.error(response.data.message || 'Failed to save settings', { theme: "dark" });
            }
        } catch (error) {
            console.error('Error saving customization:', error);
            
            if (error.response) {
                toast.error(`Server error: ${error.response.data?.message || error.response.status}`, { theme: "dark" });
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.', { theme: "dark" });
            } else {
                toast.error('Error: ' + error.message, { theme: "dark" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        setData(prev => ({ ...prev, image: '' }));
    };

    // Tabs pentru organizare
    const [activeTab, setActiveTab] = useState('basic');

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Info },
        { id: 'contact', label: 'Contact', icon: MapPin },
        { id: 'hours', label: 'Hours', icon: Clock },
        { id: 'financial', label: 'Financial', icon: CreditCard },
        { id: 'features', label: 'Features', icon: Users },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'social', label: 'Social', icon: Globe }
    ];

    // Iconiță custom pentru currency
    const CurrencySymbol = ({ className = "" }) => {
        const currency = currencyOptions.find(c => c.value === data.currency);
        return (
            <span className={`${className} font-medium`}>
                {currency?.symbol || '€'}
            </span>
        );
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-4 lg:px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Restaurant Customization</h1>
                    <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Manage your restaurant's branding and settings</p>
                </div>
                <div className="flex items-center">
                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                        isExistingCustomization 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                        {isExistingCustomization ? 'Configured' : 'Setup Required'}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden">
                {/* Tabs Navigation - RESPONSIVE */}
                <div className="border-b border-gray-700">
                    <div className="flex overflow-x-auto scrollbar-hide px-1 sm:px-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                                    activeTab === tab.id
                                        ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-900/50'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                                }`}
                            >
                                <tab.icon size={16} className="mr-1.5 sm:mr-2" />
                                <span className="hidden xs:inline">{tab.label}</span>
                                <span className="xs:hidden text-xs">{tab.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <form className="p-4 sm:p-6" onSubmit={onSubmitHandler}>
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Basic Information</h3>
                            
                            {/* Logo Section - RESPONSIVE */}
                            <div className="space-y-4">
                                <label className="block text-base sm:text-lg font-semibold text-white">Restaurant Logo</label>
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                    <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
                                        <label className="block text-sm font-medium text-gray-400">Current Logo</label>
                                        <div className="w-full sm:w-40 md:w-48 h-40 sm:h-48 border-2 border-dashed border-gray-600 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden bg-gray-700/30">
                                            {data.image ? (
                                                <div className="relative w-full h-full group">
                                                    <img
                                                        src={`${url}/images/` + data.image}
                                                        alt="Current logo"
                                                        className="w-full h-full object-contain p-3 sm:p-4"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center p-4 sm:p-6">
                                                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                                    <p className="text-gray-400 text-xs sm:text-sm">No logo set</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 sm:space-y-3 flex-1">
                                        <label className="block text-sm font-medium text-gray-400">Upload New Logo</label>
                                        <label htmlFor="logo-upload" className="cursor-pointer group">
                                            <div className="w-full h-40 sm:h-48 border-2 border-dashed border-gray-600 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:bg-gray-700/50">
                                                {image instanceof File ? (
                                                    <div className="relative w-full h-full">
                                                        <img 
                                                            src={URL.createObjectURL(image)} 
                                                            alt="New logo preview" 
                                                            className="w-full h-full object-contain p-3 sm:p-4"
                                                        />
                                                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                                                            <button
                                                                type="button"
                                                                onClick={clearImage}
                                                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors"
                                                            >
                                                                <X size={14} className="sm:w-4 sm:h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-4 sm:p-6">
                                                        <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                                                        <p className="text-gray-400 text-xs sm:text-sm">Click to upload logo</p>
                                                        <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 10MB</p>
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

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Restaurant Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">
                                        Restaurant Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="restaurantName"
                                        value={data.restaurantName}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Your restaurant slogan"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Currency */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <CircleDollarSign size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Currency *</span>
                                    </label>
                                    <select
                                        name="currency"
                                        value={data.currency}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        {currencyOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Default Language */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Languages size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Default Language</span>
                                    </label>
                                    <select
                                        name="defaultLanguage"
                                        value={data.defaultLanguage}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        {languageOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.flag} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Timezone */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Globe size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Timezone</span>
                                    </label>
                                    <select
                                        name="timezone"
                                        value={data.timezone}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        {timezoneOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Information Tab */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Contact Information</h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Mail size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Contact Email *</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={data.contactEmail}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="contact@restaurant.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Phone size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Contact Phone *</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={data.contactPhone}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="+1 (555) 123-4567"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                    <MapPin size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-sm sm:text-base">Address *</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={data.address}
                                    onChange={onChangeHandler}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Street Address"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={data.city}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="City"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={data.country}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Country"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={data.postalCode}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="123456"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={data.website}
                                    onChange={onChangeHandler}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="https://restaurant.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Hours & Location Tab */}
                    {activeTab === 'hours' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Opening Hours</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Weekdays */}
                                <div className="space-y-3 bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <label className="block text-sm font-medium text-white">Monday - Friday *</label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Opening Time</label>
                                            <input
                                                type="time"
                                                name="open"
                                                value={schedule.weekdays.open}
                                                onChange={(e) => handleTimeChange(e, "weekdays")}
                                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Saturday */}
                                <div className="space-y-3 bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <label className="block text-sm font-medium text-white">Saturday</label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Opening Time</label>
                                            <input
                                                type="time"
                                                name="open"
                                                value={schedule.saturday.open}
                                                onChange={(e) => handleTimeChange(e, "saturday")}
                                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Closing Time</label>
                                            <input
                                                type="time"
                                                name="close"
                                                value={schedule.saturday.close}
                                                onChange={(e) => handleTimeChange(e, "saturday")}
                                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sunday */}
                                <div className="space-y-3 bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                    <label className="block text-sm font-medium text-white">Sunday</label>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Opening Time</label>
                                            <input
                                                type="time"
                                                name="open"
                                                value={schedule.sunday.open}
                                                onChange={(e) => handleTimeChange(e, "sunday")}
                                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Closing Time</label>
                                            <input
                                                type="time"
                                                name="close"
                                                value={schedule.sunday.close}
                                                onChange={(e) => handleTimeChange(e, "sunday")}
                                                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special Hours Note */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" />
                                    <div>
                                        <p className="text-blue-300 text-xs sm:text-sm">
                                            *Set blank times to mark as closed. Special holiday hours can be configured separately.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Financial Settings</h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Percent size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Tax Rate (%) *</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="taxRate"
                                            value={data.taxRate}
                                            onChange={onChangeHandler}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <CreditCard size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Service Charge (%)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="serviceCharge"
                                            value={data.serviceCharge}
                                            onChange={onChangeHandler}
                                            min="0"
                                            max="50"
                                            step="0.01"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <CircleDollarSign size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Minimum Order Amount</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="minOrderAmount"
                                            value={data.minOrderAmount}
                                            onChange={onChangeHandler}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <CurrencySymbol />
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Package size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Delivery Fee</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="deliveryFee"
                                            value={data.deliveryFee}
                                            onChange={onChangeHandler}
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <CurrencySymbol />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Landmark size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">VAT/Tax Number</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="vatNumber"
                                        value={data.vatNumber}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="RO12345678"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Banknote size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Company Registration Number</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyNumber"
                                        value={data.companyNumber}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="J40/1234/2021"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Features & Services</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <label className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                                    <input
                                        type="checkbox"
                                        name="reservationEnabled"
                                        checked={data.reservationEnabled}
                                        onChange={onChangeHandler}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rounded focus:ring-blue-600 focus:ring-offset-gray-900"
                                    />
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-white">Reservations</span>
                                        <p className="text-xs sm:text-sm text-gray-400">Allow table reservations</p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                                    <input
                                        type="checkbox"
                                        name="takeawayEnabled"
                                        checked={data.takeawayEnabled}
                                        onChange={onChangeHandler}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rounded focus:ring-blue-600 focus:ring-offset-gray-900"
                                    />
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-white">Takeaway</span>
                                        <p className="text-xs sm:text-sm text-gray-400">Allow takeaway orders</p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                                    <input
                                        type="checkbox"
                                        name="deliveryEnabled"
                                        checked={data.deliveryEnabled}
                                        onChange={onChangeHandler}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rounded focus:ring-blue-600 focus:ring-offset-gray-900"
                                    />
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-white">Delivery</span>
                                        <p className="text-xs sm:text-sm text-gray-400">Enable delivery service</p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                                    <input
                                        type="checkbox"
                                        name="ratingEnabled"
                                        checked={data.ratingEnabled}
                                        onChange={onChangeHandler}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rounded focus:ring-blue-600 focus:ring-offset-gray-900"
                                    />
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-white">Customer Ratings</span>
                                        <p className="text-xs sm:text-sm text-gray-400">Allow dish ratings</p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                                    <input
                                        type="checkbox"
                                        name="tipsEnabled"
                                        checked={data.tipsEnabled}
                                        onChange={onChangeHandler}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rounded focus:ring-blue-600 focus:ring-offset-gray-900"
                                    />
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-white">Tips</span>
                                        <p className="text-xs sm:text-sm text-gray-400">Enable tipping feature</p>
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                                    <input
                                        type="checkbox"
                                        name="qrCodeEnabled"
                                        checked={data.qrCodeEnabled}
                                        onChange={onChangeHandler}
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 rounded focus:ring-blue-600 focus:ring-offset-gray-900"
                                    />
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-white">QR Code Menu</span>
                                        <p className="text-xs sm:text-sm text-gray-400">Enable QR code scanning</p>
                                    </div>
                                </label>
                            </div>

                            {/* Security & Advanced Settings */}
                            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-gray-700">
                                <h4 className="text-base sm:text-lg font-semibold text-white">Security Settings</h4>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Shield size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Security Token *</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="securityToken"
                                        value={data.securityToken}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter security token"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <Clock size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Auto-delete Accounts (hours) *</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="deleteAccountHours"
                                            value={data.deleteAccountHours}
                                            onChange={onChangeHandler}
                                            min="1"
                                            max="24"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                                            placeholder="24"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Appearance & Design</h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="primaryColor"
                                            value={data.primaryColor}
                                            onChange={onChangeHandler}
                                            className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer rounded-lg border border-gray-600"
                                        />
                                        <input
                                            type="text"
                                            name="primaryColor"
                                            value={data.primaryColor}
                                            onChange={onChangeHandler}
                                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Secondary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="secondaryColor"
                                            value={data.secondaryColor}
                                            onChange={onChangeHandler}
                                            className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer rounded-lg border border-gray-600"
                                        />
                                        <input
                                            type="text"
                                            name="secondaryColor"
                                            value={data.secondaryColor}
                                            onChange={onChangeHandler}
                                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Theme Style</label>
                                    <select
                                        name="themeStyle"
                                        value={data.themeStyle}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="modern">Modern</option>
                                        <option value="classic">Classic</option>
                                        <option value="minimal">Minimal</option>
                                        <option value="elegant">Elegant</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Menu Layout</label>
                                    <select
                                        name="menuLayout"
                                        value={data.menuLayout}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="grid">Grid View</option>
                                        <option value="list">List View</option>
                                        <option value="cards">Cards View</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Receipt Footer Message</label>
                                <textarea
                                    name="receiptFooter"
                                    value={data.receiptFooter}
                                    onChange={onChangeHandler}
                                    rows="3"
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Thank you for visiting us!"
                                />
                            </div>
                        </div>
                    )}

                    {/* Social Media Tab */}
                    {activeTab === 'social' && (
                        <div className="space-y-6 sm:space-y-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Social Media & Links</h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="#1877F2" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <span className="text-sm sm:text-base">Facebook Page URL</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook"
                                        value={data.facebook}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="https://facebook.com/restaurant"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="#E4405F" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        <span className="text-sm sm:text-base">Instagram Profile</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={data.instagram}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="@restaurant"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button - RESPONSIVE */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-700 gap-4">
                        <div className="text-xs sm:text-sm text-gray-400 order-2 sm:order-1">
                            <span className="text-yellow-400">*</span> Required fields
                        </div>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4 order-1 sm:order-2">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || initialLoad}
                                className={`px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto ${
                                    isSubmitting || initialLoad
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : initialLoad ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{isExistingCustomization ? 'Update Settings' : 'Save Configuration'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default CustomizationPage;