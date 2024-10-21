import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // Make sure you have react-toastify installed

const OrdersToCloseTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [combinedOrders, setCombinedOrders] = useState([]); // Store combined orders and user data
    const [currentPage, setCurrentPage] = useState(1);
    const url = "http://localhost:4000"; // API URL
    const ordersPerPage = 10; // Number of orders per page

    // Function to fetch orders and users from the API
    const fetchData = async () => {
        try {
            const [ordersResponse, usersResponse] = await Promise.all([
                axios.get(`${url}/api/order/list`),
                axios.get(`${url}/api/user/list`)
            ]);

            if (ordersResponse.data.success && usersResponse.data.success) {
                const orders = ordersResponse.data.data;
                const users = usersResponse.data.users;

                // Combine orders with corresponding users
                const combined = orders.map(order => {
                    const user = users.find(u => u._id === order.userId); // Match order's userId with user's _id
                    return {
                        ...order,
                        user // Add user information to the order object
                    };
                });

                const sortedOrders = combined.sort((a, b) => {
                    const orderNumberA = a.orderNumber ? Number(a.orderNumber) : 0;
                    const orderNumberB = b.orderNumber ? Number(b.orderNumber) : 0;

                    return orderNumberB - orderNumberA;
                });

                setCombinedOrders(sortedOrders);
                setFilteredOrders(sortedOrders); // Initially set the filtered orders to the full list
            } else {
                console.error("Failed to fetch data from APIs.");
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders and users:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000);
        return () => clearInterval(intervalId); // Clear interval when component unmounts
    }, []);

    // Function for searching orders
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1); // Reset to the first page on search

        const filtered = combinedOrders.filter((order) => {
            const orderNumber = order.orderNumber ? String(order.orderNumber) : '';
            const tableNo = order.tableNo ? String(order.tableNo) : '';
            const status = order.status ? String(order.status) : '';
            const date = order.date ? new Date(order.date).toLocaleDateString('ro-RO') : '';
            const userName = order.user?.name?.toLowerCase() || ''; // Search by user's name

            return (
                orderNumber.toLowerCase().includes(term) ||
                tableNo.toLowerCase().includes(term) ||
                status.toLowerCase().includes(term) ||
                date.includes(term) ||
                userName.includes(term) // Include user's name in search
            );
        });

        setFilteredOrders(filtered);
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Function to get class for status
    const getStatusClass = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-500"; // Green for delivered
            case "Food Processing":
                return "bg-red-500"; // Red for food processing
            case "Out for delivery":
                return "bg-yellow-500"; // Yellow for out for delivery
            default:
                return "bg-red-500"; // Default color
        }
    };


    // Pagination logic
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Active Orders</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search orders...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Order Number
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Table No.
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                User Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Items
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Total
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide divide-gray-700'>
                        {currentOrders.map((order) => (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.orderNumber || "Unknown"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.tableNo || "Unknown"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.user?.name || "Unknown"} {/* Display user name */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <div key={index}>
                                                {item.name} x {item.quantity}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No items</p>
                                    )}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.amount.toFixed(2)}€
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(order.date).toLocaleDateString('ro-RO')}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <select
                                        onChange={(event) => statusHandler(event, order._id)}
                                        value={order.status}
                                        className={`text-white rounded-lg p-2 ${getStatusClass(order.status)}`}
                                    >
                                        <option value="Food Processing">Food Processing</option>
                                        <option value="Out for delivery">Out for delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className='flex justify-center mt-4'>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default OrdersToCloseTable;
