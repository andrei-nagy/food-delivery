import { motion } from "framer-motion";
import { Edit, Search, Trash2, Plus, Calendar, Tag, Percent, Euro, Infinity } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const PromoCodeTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({
        code: "",
        description: "",
        discountType: "",
        status: ""
    });
    const [promoCodes, setPromoCodes] = useState([]);
    const [filteredPromoCodes, setFilteredPromoCodes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPromoCode, setCurrentPromoCode] = useState(null);
    const [updatedPromoCode, setUpdatedPromoCode] = useState({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        noExpiration: false,
        usageLimit: "",
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const promoCodesPerPage = 10;
    const { url } = useUrl();
    const token = localStorage.getItem("authToken");

    const fetchPromoCodes = async () => {
        try {
            const response = await axios.get(`${url}/admin/promo-codes`);
            
            if (response.data.success && Array.isArray(response.data.data)) {
                setPromoCodes(response.data.data);
                setFilteredPromoCodes(response.data.data);
            } else {
                setFilteredPromoCodes([]);
                toast.error(response.data.message || "Failed to load promo codes");
            }
        } catch (error) {
            if (error.response) {
                toast.error(`Server error: ${error.response.status}`);
            } else if (error.request) {
                toast.error("No response from server");
            } else {
                toast.error("Error: " + error.message);
            }
        }
    };

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const handleAddPromoCode = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...updatedPromoCode,
                discountValue: updatedPromoCode.discountValue === "" ? 0 : parseFloat(updatedPromoCode.discountValue),
                minOrderAmount: updatedPromoCode.minOrderAmount === "" ? 0 : parseFloat(updatedPromoCode.minOrderAmount),
                maxDiscountAmount: updatedPromoCode.maxDiscountAmount === "" ? null : parseFloat(updatedPromoCode.maxDiscountAmount),
                usageLimit: updatedPromoCode.usageLimit === "" ? null : parseInt(updatedPromoCode.usageLimit),
                endDate: updatedPromoCode.noExpiration 
                    ? new Date(new Date().getFullYear() + 100, 11, 31).toISOString()
                    : new Date(updatedPromoCode.endDate).toISOString()
            };

            const response = await axios.post(`${url}/admin/promo-codes`, payload, {
                headers: { 
                    token: token 
                }
            });
            
            if (response.data.success) {
                toast.success("Promo code created successfully");
                fetchPromoCodes();
                setIsModalOpen(false);
                setUpdatedPromoCode({
                    code: "",
                    description: "",
                    discountType: "percentage",
                    discountValue: "",
                    minOrderAmount: "",
                    maxDiscountAmount: "",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: "",
                    noExpiration: false,
                    usageLimit: "",
                    isActive: true
                });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating promo code");
        } finally {
            setLoading(false);
        }
    };

    const removePromoCode = async (promoCodeId) => {
        if (!window.confirm("Are you sure you want to delete this promo code?")) {
            return;
        }

        try {
            const response = await axios.delete(`${url}/admin/promo-codes/${promoCodeId}`, {
                headers: { 
                    token: token 
                }
            });
            if (response.data.success) {
                toast.success("Promo code deleted successfully");
                fetchPromoCodes();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error deleting promo code");
        }
    };

    const editPromoCode = (promoCode) => {
        setCurrentPromoCode(promoCode);
        
        const isNoExpiration = promoCode.endDate && new Date(promoCode.endDate).getFullYear() > new Date().getFullYear() + 50;
        
        setUpdatedPromoCode({
            code: promoCode.code,
            description: promoCode.description,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue.toString(),
            minOrderAmount: promoCode.minOrderAmount?.toString() || "",
            maxDiscountAmount: promoCode.maxDiscountAmount?.toString() || "",
            startDate: new Date(promoCode.startDate).toISOString().split('T')[0],
            endDate: isNoExpiration ? "" : new Date(promoCode.endDate).toISOString().split('T')[0],
            noExpiration: isNoExpiration,
            usageLimit: promoCode.usageLimit?.toString() || "",
            isActive: promoCode.isActive
        });
        setIsEditing(true);
    };

    const handleUpdatePromoCode = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...updatedPromoCode,
                discountValue: updatedPromoCode.discountValue === "" ? 0 : parseFloat(updatedPromoCode.discountValue),
                minOrderAmount: updatedPromoCode.minOrderAmount === "" ? 0 : parseFloat(updatedPromoCode.minOrderAmount),
                maxDiscountAmount: updatedPromoCode.maxDiscountAmount === "" ? null : parseFloat(updatedPromoCode.maxDiscountAmount),
                usageLimit: updatedPromoCode.usageLimit === "" ? null : parseInt(updatedPromoCode.usageLimit),
                endDate: updatedPromoCode.noExpiration 
                    ? new Date(new Date().getFullYear() + 100, 11, 31).toISOString()
                    : new Date(updatedPromoCode.endDate).toISOString()
            };

            const response = await axios.put(`${url}/admin/promo-codes/${currentPromoCode._id}`, payload, {
                headers: { 
                    token: token 
                }
            });
            
            if (response.data.success) {
                toast.success("Promo code updated successfully");
                fetchPromoCodes();
                setIsEditing(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating promo code");
        } finally {
            setLoading(false);
        }
    };

    const togglePromoCode = async (promoCodeId, currentStatus) => {
        try {
            const response = await axios.patch(`${url}/admin/promo-codes/${promoCodeId}/toggle`, {}, {
                headers: { 
                    token: token 
                }
            });
            if (response.data.success) {
                toast.success(`Promo code ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                fetchPromoCodes();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error toggling promo code");
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, columnFilters);
    };

    const handleColumnFilter = (column, value) => {
        const newFilters = {
            ...columnFilters,
            [column]: value.toLowerCase()
        };
        setColumnFilters(newFilters);
        applyFilters(searchTerm, newFilters);
    };

    const applyFilters = (globalSearch, columnFilters) => {
        let filtered = promoCodes;

        if (globalSearch) {
            filtered = filtered.filter(promoCode =>
                promoCode.code.toLowerCase().includes(globalSearch) ||
                promoCode.description.toLowerCase().includes(globalSearch) ||
                promoCode.discountType.toLowerCase().includes(globalSearch) ||
                (promoCode.isActive ? "active" : "inactive").includes(globalSearch)
            );
        }

        if (columnFilters.code) {
            filtered = filtered.filter(promoCode =>
                promoCode.code.toLowerCase().includes(columnFilters.code)
            );
        }

        if (columnFilters.description) {
            filtered = filtered.filter(promoCode =>
                promoCode.description.toLowerCase().includes(columnFilters.description)
            );
        }

        if (columnFilters.discountType) {
            filtered = filtered.filter(promoCode =>
                promoCode.discountType.toLowerCase().includes(columnFilters.discountType)
            );
        }

        if (columnFilters.status) {
            filtered = filtered.filter(promoCode => {
                const statusText = promoCode.isActive ? "active" : "inactive";
                return statusText.includes(columnFilters.status);
            });
        }

        setFilteredPromoCodes(filtered);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setColumnFilters({
            code: "",
            description: "",
            discountType: "",
            status: ""
        });
        setFilteredPromoCodes(promoCodes);
        setCurrentPage(1);
    };

    const isExpired = (endDate) => {
        if (!endDate) return false;
        if (new Date(endDate).getFullYear() > new Date().getFullYear() + 50) {
            return false;
        }
        return new Date(endDate) < new Date();
    };

    const isUpcoming = (startDate) => {
        return new Date(startDate) > new Date();
    };

    const getStatusBadge = (promoCode) => {
        if (!promoCode.isActive) {
            return <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">Inactive</span>;
        }
        if (promoCode.endDate && isExpired(promoCode.endDate)) {
            return <span className="px-2 py-1 text-xs bg-gray-500 text-white rounded-full">Expired</span>;
        }
        if (isUpcoming(promoCode.startDate)) {
            return <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">Upcoming</span>;
        }
        return <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">Active</span>;
    };

    const getValidityDisplay = (promoCode) => {
        const isNoExpiration = promoCode.endDate && new Date(promoCode.endDate).getFullYear() > new Date().getFullYear() + 50;
        
        if (isNoExpiration) {
            return (
                <div className="flex items-center gap-1 text-green-400">
                    <Infinity size={14} />
                    <span>No expiration</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                {new Date(promoCode.startDate).toLocaleDateString()} - {new Date(promoCode.endDate).toLocaleDateString()}
            </div>
        );
    };

    const indexOfLastPromoCode = currentPage * promoCodesPerPage;
    const indexOfFirstPromoCode = indexOfLastPromoCode - promoCodesPerPage;
    const currentPromoCodes = filteredPromoCodes.slice(indexOfFirstPromoCode, indexOfLastPromoCode);
    const totalPages = Math.ceil(filteredPromoCodes.length / promoCodesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} />
                    Add New Promo Code
                </button>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search all promo codes...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Tag size={14} />
                                        Code
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Filter code..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.code}
                                        onChange={(e) => handleColumnFilter('code', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Description</div>
                                    <input
                                        type="text"
                                        placeholder="Filter description..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.description}
                                        onChange={(e) => handleColumnFilter('description', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Discount</div>
                                    <input
                                        type="text"
                                        placeholder="Filter type..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.discountType}
                                        onChange={(e) => handleColumnFilter('discountType', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Validity</div>
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Usage</div>
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Status</div>
                                    <input
                                        type="text"
                                        placeholder="Filter status..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.status}
                                        onChange={(e) => handleColumnFilter('status', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {currentPromoCodes.map((promoCode) => (
                            <motion.tr
                                key={promoCode._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-blue-400" />
                                        <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                                            {promoCode.code}
                                        </span>
                                    </div>
                                </td>
                                <td className='px-6 py-4 text-sm text-gray-300 max-w-xs'>
                                    <div className="truncate" title={promoCode.description}>
                                        {promoCode.description}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className="flex items-center gap-1">
                                        {promoCode.discountType === 'percentage' ? (
                                            <Percent size={14} className="text-green-400" />
                                        ) : (
                                            <Euro size={14} className="text-green-400" />
                                        )}
                                        {promoCode.discountValue}
                                        {promoCode.discountType === 'percentage' ? '%' : '€'}
                                        {promoCode.minOrderAmount > 0 && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                (min {promoCode.minOrderAmount}€)
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {getValidityDisplay(promoCode)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {promoCode.usageLimit ? (
                                        <span>
                                            {promoCode.usedCount}/{promoCode.usageLimit}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">No limit</span>
                                    )}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    {getStatusBadge(promoCode)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => togglePromoCode(promoCode._id, promoCode.isActive)}
                                            className={`p-1 rounded ${
                                                promoCode.isActive 
                                                    ? 'text-green-400 hover:text-green-300 hover:bg-green-900/30' 
                                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                            }`}
                                            title={promoCode.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {promoCode.isActive ? '✓' : '✗'}
                                        </button>
                                        <button 
                                            onClick={() => editPromoCode(promoCode)} 
                                            className='text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-900/30'
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => removePromoCode(promoCode._id)} 
                                            className='text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/30'
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {currentPromoCodes.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No promo codes found matching your filters.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className='flex justify-center mt-4'>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`mx-1 px-3 py-1 rounded ${
                                currentPage === index + 1 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}

            {isEditing && (
                <motion.div
                    className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className='bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <h2 className='text-xl font-semibold text-gray-100 mb-4'>Edit Promo Code</h2>

                        <form onSubmit={handleUpdatePromoCode} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Promo Code</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.code}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, code: e.target.value })}
                                        required
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Description</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.description}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Discount Type</label>
                                    <select
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.discountType}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, discountType: e.target.value })}
                                        required
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">
                                        {updatedPromoCode.discountType === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                                    </label>
                                    <input
                                        type="number"
                                        step={updatedPromoCode.discountType === 'percentage' ? 1 : 0.01}
                                        min="0"
                                        max={updatedPromoCode.discountType === 'percentage' ? 100 : undefined}
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.discountValue}
                                        onChange={(e) => setUpdatedPromoCode({ 
                                            ...updatedPromoCode, 
                                            discountValue: e.target.value 
                                        })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Minimum Order Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.minOrderAmount}
                                        onChange={(e) => setUpdatedPromoCode({ 
                                            ...updatedPromoCode, 
                                            minOrderAmount: e.target.value 
                                        })}
                                    />
                                </div>
                                {updatedPromoCode.discountType === 'percentage' && (
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-1">Maximum Discount Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                            value={updatedPromoCode.maxDiscountAmount}
                                            onChange={(e) => setUpdatedPromoCode({ 
                                                ...updatedPromoCode, 
                                                maxDiscountAmount: e.target.value 
                                            })}
                                            placeholder="No limit"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.startDate}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="noExpiration"
                                            checked={updatedPromoCode.noExpiration}
                                            onChange={(e) => setUpdatedPromoCode({ 
                                                ...updatedPromoCode, 
                                                noExpiration: e.target.checked,
                                                endDate: e.target.checked ? "" : updatedPromoCode.endDate
                                            })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="noExpiration" className="text-gray-400 text-sm">
                                            No expiration date
                                        </label>
                                    </div>
                                    {!updatedPromoCode.noExpiration && (
                                        <>
                                            <label className="block text-gray-400 text-sm mb-1">End Date</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                                value={updatedPromoCode.endDate}
                                                onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, endDate: e.target.value })}
                                                required={!updatedPromoCode.noExpiration}
                                                min={updatedPromoCode.startDate}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.usageLimit}
                                        onChange={(e) => setUpdatedPromoCode({ 
                                            ...updatedPromoCode, 
                                            usageLimit: e.target.value 
                                        })}
                                        placeholder="No limit"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Status</label>
                                    <select
                                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                                        value={updatedPromoCode.isActive}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, isActive: e.target.value === "true" })}
                                        required
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)} 
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h3 className="text-2xl font-bold text-white">
                                Create New Promo Code
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form className="p-6 space-y-6" onSubmit={handleAddPromoCode}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Promo Code *</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., SUMMER20"
                                        value={updatedPromoCode.code}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, code: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Discount Type *</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={updatedPromoCode.discountType}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, discountType: e.target.value })}
                                        required
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">
                                        {updatedPromoCode.discountType === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                                    </label>
                                    <input
                                        type="number"
                                        step={updatedPromoCode.discountType === 'percentage' ? 1 : 0.01}
                                        min="0"
                                        max={updatedPromoCode.discountType === 'percentage' ? 100 : undefined}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder={updatedPromoCode.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 5.00'}
                                        value={updatedPromoCode.discountValue}
                                        onChange={(e) => setUpdatedPromoCode({ 
                                            ...updatedPromoCode, 
                                            discountValue: e.target.value 
                                        })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Minimum Order Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., 50.00"
                                        value={updatedPromoCode.minOrderAmount}
                                        onChange={(e) => setUpdatedPromoCode({ 
                                            ...updatedPromoCode, 
                                            minOrderAmount: e.target.value 
                                        })}
                                    />
                                </div>
                            </div>

                            {updatedPromoCode.discountType === 'percentage' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white">Maximum Discount Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="No limit"
                                            value={updatedPromoCode.maxDiscountAmount}
                                            onChange={(e) => setUpdatedPromoCode({ 
                                                ...updatedPromoCode, 
                                                maxDiscountAmount: e.target.value 
                                            })}
                                        />
                                    </div>
                                    <div></div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Start Date *</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={updatedPromoCode.startDate}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, startDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            id="noExpirationModal"
                                            checked={updatedPromoCode.noExpiration}
                                            onChange={(e) => setUpdatedPromoCode({ 
                                                ...updatedPromoCode, 
                                                noExpiration: e.target.checked,
                                                endDate: e.target.checked ? "" : updatedPromoCode.endDate
                                            })}
                                            className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor="noExpirationModal" className="text-sm font-medium text-white flex items-center gap-1">
                                            <Infinity size={14} />
                                            No expiration date
                                        </label>
                                    </div>
                                    {!updatedPromoCode.noExpiration && (
                                        <>
                                            <label className="block text-sm font-medium text-white">End Date *</label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                value={updatedPromoCode.endDate}
                                                onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, endDate: e.target.value })}
                                                required={!updatedPromoCode.noExpiration}
                                                min={updatedPromoCode.startDate}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Usage Limit</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="No limit"
                                        value={updatedPromoCode.usageLimit}
                                        onChange={(e) => setUpdatedPromoCode({ 
                                            ...updatedPromoCode, 
                                            usageLimit: e.target.value 
                                        })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Status</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={updatedPromoCode.isActive}
                                        onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, isActive: e.target.value === "true" })}
                                        required
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Description *</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Describe your promo code..."
                                    value={updatedPromoCode.description}
                                    onChange={(e) => setUpdatedPromoCode({ ...updatedPromoCode, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    <Plus size={18} />
                                    <span>{loading ? 'Creating...' : 'Create Promo Code'}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default PromoCodeTable;