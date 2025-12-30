import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useUrl } from "../context/UrlContext";

const OrdersHistoryTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({
        orderNumber: "",
        tableNo: "",
        items: "",
        total: "",
        paymentMethod: "",
        payment: "",
        date: "",
        status: ""
    });
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const { url } = useUrl();
    const ordersPerPage = 10;
    const isMobile = window.innerWidth < 768;

    // Function to fetch orders from the API
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`);
            if (response.data.success && Array.isArray(response.data.data)) {
                const deliveredOrders = response.data.data.filter(order => order.status === 'Delivered');
                const sortedOrders = deliveredOrders.sort((a, b) => {
                    const orderNumberA = a.orderNumber ? Number(a.orderNumber) : 0;
                    const orderNumberB = b.orderNumber ? Number(b.orderNumber) : 0;
                    return orderNumberB - orderNumberA;
                });
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
            } else {
                console.error("Structura răspunsului nu este așa cum era de așteptat:", response.data);
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error("Eroare la preluarea comenzilor:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Function for global search
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, columnFilters);
    };

    // Function for column filtering
    const handleColumnFilter = (column, value) => {
        const newFilters = {
            ...columnFilters,
            [column]: value.toLowerCase()
        };
        setColumnFilters(newFilters);
        applyFilters(searchTerm, newFilters);
    };

    // Function to apply all filters
    const applyFilters = (globalSearch, columnFilters) => {
        let filtered = orders;

        if (globalSearch) {
            filtered = filtered.filter((order) => {
                const orderNumber = order.orderNumber ? String(order.orderNumber) : '';
                const tableNo = order.tableNo ? String(order.tableNo) : '';
                const status = order.status ? String(order.status) : '';
                const date = order.date ? new Date(order.date).toLocaleDateString('ro-RO') : '';
                const paymentMethod = order.paymentMethod ? String(order.paymentMethod) : '';
                const paymentStatus = order.payment ? "paid" : "unpaid";
                const itemsText = order.items.map(item => item.name).join(' ').toLowerCase();

                return (
                    orderNumber.toLowerCase().includes(globalSearch) ||
                    tableNo.toLowerCase().includes(globalSearch) ||
                    status.toLowerCase().includes(globalSearch) ||
                    paymentMethod.toLowerCase().includes(globalSearch) ||
                    paymentStatus.includes(globalSearch) ||
                    itemsText.includes(globalSearch) ||
                    date.includes(globalSearch)
                );
            });
        }

        // Column filters
        Object.keys(columnFilters).forEach(key => {
            if (columnFilters[key]) {
                filtered = applyColumnFilter(filtered, key, columnFilters[key]);
            }
        });

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const applyColumnFilter = (filteredArray, column, value) => {
        switch (column) {
            case 'orderNumber':
                return filteredArray.filter(order => 
                    order.orderNumber?.toString().toLowerCase().includes(value)
                );
            case 'tableNo':
                return filteredArray.filter(order => 
                    order.tableNo?.toString().toLowerCase().includes(value)
                );
            case 'items':
                return filteredArray.filter(order =>
                    order.items.some(item => 
                        item.name.toLowerCase().includes(value)
                    )
                );
            case 'total':
                return filteredArray.filter(order => 
                    order.amount?.toString().includes(value)
                );
            case 'paymentMethod':
                return filteredArray.filter(order => 
                    order.paymentMethod?.toLowerCase().includes(value)
                );
            case 'payment':
                return filteredArray.filter(order => {
                    const paymentStatus = order.payment ? "paid" : "unpaid";
                    return paymentStatus.includes(value);
                });
            case 'date':
                return filteredArray.filter(order => 
                    new Date(order.date).toLocaleDateString('ro-RO').includes(value)
                );
            case 'status':
                return filteredArray.filter(order => 
                    order.status?.toLowerCase().includes(value)
                );
            default:
                return filteredArray;
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("");
        setColumnFilters({
            orderNumber: "",
            tableNo: "",
            items: "",
            total: "",
            paymentMethod: "",
            payment: "",
            date: "",
            status: ""
        });
        setFilteredOrders(orders);
        setCurrentPage(1);
        setShowMobileFilters(false);
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Slice filteredOrders based on currentPage and ordersPerPage
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // Mobile Filter Component
    const MobileFilters = () => (
        <motion.div
            className="md:hidden bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
                    <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-1 rounded-lg hover:bg-gray-700"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                
                {Object.entries(columnFilters).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input
                            type="text"
                            placeholder={`Filter ${key}...`}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={value}
                            onChange={(e) => handleColumnFilter(key, e.target.value)}
                        />
                    </div>
                ))}
                
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={resetFilters}
                        className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Reset Filters
                    </button>
                    <button
                        onClick={() => setShowMobileFilters(false)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // Mobile Order Card
    const MobileOrderCard = ({ order }) => (
        <motion.div
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderExpansion(order._id)}
            >
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg border-2 border-gray-700 flex items-center justify-center text-white font-semibold">
                        {order.orderNumber || "N/A"}
                    </div>
                    <div>
                        <p className="text-white font-medium">Table {order.tableNo || "N/A"}</p>
                        <p className="text-gray-400 text-sm">
                            {order.date ? new Date(order.date).toLocaleDateString('ro-RO') : "Unknown"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-white font-bold">{order.amount?.toFixed(2)}€</p>
                    <p className={`text-sm ${order.payment ? 'text-green-500' : 'text-red-500'}`}>
                        {order.payment ? "Paid" : "Unpaid"}
                    </p>
                    {expandedOrderId === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {expandedOrderId === order._id && (
                <motion.div
                    className="mt-4 pt-4 border-t border-gray-700 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-gray-400 text-sm">Payment Method</p>
                            <p className="text-white">{order.paymentMethod || "Unknown"}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <p className={`${order.status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}>
                                {order.status || "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-gray-400 text-sm mb-1">Items</p>
                        <div className="space-y-1">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className="text-gray-400">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.specialInstructions && (
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Instructions</p>
                            <p className="text-gray-300 text-sm">{order.specialInstructions}</p>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            {/* Header */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
                <h2 className='text-xl font-semibold text-gray-100'>Order History List</h2>
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className='relative flex-1 md:flex-none'>
                        <input
                            type='text'
                            placeholder='Search all orders...'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="md:hidden px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <Filter size={16} />
                            Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && <MobileFilters />}

            {/* Mobile View */}
            <div className="md:hidden">
                {currentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No orders found matching your filters.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentOrders.map((order) => (
                            <MobileOrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className='hidden md:block overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            {['Order Number', 'Table No.', 'Items', 'Instructions', 'Total', 'Payment Method', 'Paid?', 'Date', 'Status'].map((header) => (
                                <th key={header} className='px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            {header === 'Order Number' && <Filter size={14} />}
                                            {header}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={`Filter ${header.toLowerCase()}...`}
                                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                            value={columnFilters[header.replace(/[\s?]/g, '').toLowerCase().replace('no.', 'no').replace('paid?', 'payment')]}
                                            onChange={(e) => handleColumnFilter(
                                                header.replace(/[\s?]/g, '').toLowerCase()
                                                    .replace('no.', 'no')
                                                    .replace('paid?', 'payment'), 
                                                e.target.value
                                            )}
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentOrders.map((order) => (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className='h-8 w-8 rounded border border-gray-700 flex items-center justify-center text-white font-semibold'>
                                        {order.orderNumber || "N/A"}
                                    </div>
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.tableNo || "N/A"}
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-300 max-w-xs truncate'>
                                    {order.items.length > 0 ? (
                                        order.items.slice(0, 2).map((item, index) => (
                                            <div key={index} className="truncate">
                                                {item.name} x {item.quantity}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No items</p>
                                    )}
                                    {order.items.length > 2 && (
                                        <span className="text-gray-500 text-xs">+{order.items.length - 2} more</span>
                                    )}
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate'>
                                    {order.specialInstructions || "No instructions"}
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.amount?.toFixed(2)}€
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.paymentMethod || "Unknown"}
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.payment ? (
                                        <span className="text-green-500">✓</span>
                                    ) : (
                                        <span className="text-red-500">✗</span>
                                    )}
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.date ? new Date(order.date).toLocaleDateString('ro-RO') : "Unknown"}
                                </td>
                                <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.status === 'Delivered' ? (
                                        <span className="text-green-500">✓</span>
                                    ) : (
                                        <span className="text-red-500">✗</span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {/* No results message */}
                {currentOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No orders found matching your filters.
                    </div>
                )}
            </div>

            {/* Pagination - Responsive */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-1 md:space-x-2">
                    <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-2 md:px-3 py-1 md:py-2 rounded-lg text-sm ${
                            currentPage === 1
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        ←
                    </button>

                    {/* First page */}
                    {currentPage > 3 && (
                        <>
                            <button
                                onClick={() => paginate(1)}
                                className="px-2 md:px-3 py-1 md:py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm"
                            >
                                1
                            </button>
                            {currentPage > 4 && <span className="px-1 md:px-2 text-gray-400">...</span>}
                        </>
                    )}

                    {/* Middle pages */}
                    {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (currentPage <= 2) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - (isMobile ? 2 : 4) + i;
                        } else {
                            pageNum = currentPage - (isMobile ? 1 : 2) + i;
                        }

                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => paginate(pageNum)}
                                className={`px-2 md:px-3 py-1 md:py-2 rounded-lg text-sm ${
                                    currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {/* Last page */}
                    {currentPage < totalPages - (isMobile ? 1 : 2) && (
                        <>
                            {currentPage < totalPages - (isMobile ? 2 : 3) && <span className="px-1 md:px-2 text-gray-400">...</span>}
                            <button
                                onClick={() => paginate(totalPages)}
                                className="px-2 md:px-3 py-1 md:py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* Next button */}
                    <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-2 md:px-3 py-1 md:py-2 rounded-lg text-sm ${
                            currentPage === totalPages
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        →
                    </button>
                </div>
            )}

            {/* Results count */}
            <div className="mt-4 text-center text-gray-400 text-sm">
                Showing {currentOrders.length} of {filteredOrders.length} orders
            </div>
        </motion.div>
    );
};

export default OrdersHistoryTable;