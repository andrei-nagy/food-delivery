import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // Ensure you have react-toastify installed

const OrdersToCloseTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [combinedOrders, setCombinedOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrderItems, setSelectedOrderItems] = useState(null); // Stare pentru a ține minte articolele comenzii selectate
    const [isModalOpen, setIsModalOpen] = useState(false); // Stare pentru a deschide/inchide modalul

    const url = "http://localhost:4000"; // API URL
    const ordersPerPage = 10; // Number of orders per page

    // Fetch orders and users from the API
    const fetchData = async () => {
        try {
            const [ordersResponse, usersResponse] = await Promise.all([
                axios.get(`${url}/api/order/list`),
                axios.get(`${url}/api/user/list`)
            ]);

            if (ordersResponse.data.success && usersResponse.data.success) {
                let orders = ordersResponse.data.data;
                const users = usersResponse.data.users;

                // Filtrare pentru a exclude comenzile fără orderNumber sau tableNo
                const filteredOrders = orders.filter(order => order.orderNumber && order.tableNo);

                // Combine orders with corresponding users
                const combined = filteredOrders.map(order => {
                    const user = users.find(u => u._id === order.userId);
                    return {
                        ...order,
                        user
                    };
                });

                // Sort orders by orderNumber in descending order
                const sortedCombined = combined.sort((a, b) => b.orderNumber - a.orderNumber);

                setCombinedOrders(sortedCombined);
                setFilteredOrders(sortedCombined);
            } else {
                console.error("Failed to fetch data.");
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Handle Search
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1);

        const filtered = combinedOrders.filter((order) => {
            const orderNumber = order.orderNumber ? String(order.orderNumber) : '';
            const tableNo = order.tableNo ? String(order.tableNo) : '';
            const status = order.status ? String(order.status) : '';
            const date = order.date ? new Date(order.date).toLocaleDateString('ro-RO') : '';
            const userName = order.user?.name?.toLowerCase() || '';

            return (
                orderNumber.toLowerCase().includes(term) ||
                tableNo.toLowerCase().includes(term) ||
                status.toLowerCase().includes(term) ||
                date.includes(term) ||
                userName.includes(term)
            );
        });

        setFilteredOrders(filtered);
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Function to handle opening the modal and setting the selected order items
    const handleCheckOrderClick = (items) => {
        setSelectedOrderItems(items);
        setIsModalOpen(true);
    };

    // Function to close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderItems(null);
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
                                Table No.
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment Method
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>

                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Items
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
                                    {order.user ? order.tableNo : "Unknown"} {/* Display tableNo */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.paymentMethod || "Unknown"} {/* Display paymentMethod */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {/* Display payment status */}
                                    {order.payment ? "Paid" : "Not paid"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.status}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(order.date).toLocaleDateString('ro-RO')} {/* Display date in format day/month/year */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                    <button
                                        className='bg-blue-500 text-white rounded-lg px-4 py-2'
                                        onClick={() => handleCheckOrderClick(order.items)} // Pass order items to the function
                                    >
                                        Check order
                                    </button>
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

            {/* Modal */}
            {isModalOpen && (
                <motion.div
                    className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
                        <h2 className='text-xl text-white mb-4'>Order Items</h2>
                        <table className='min-w-full divide-y divide-gray-700'>
                            <thead>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Item Name
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Quantity
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-700'>
                                {selectedOrderItems && selectedOrderItems.length > 0 ? (
                                    selectedOrderItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {item.name}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {item.quantity}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className='px-6 py-4 text-gray-100' colSpan={2}>
                                            No items found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <button
                            className='mt-4 bg-red-500 text-white rounded-lg px-4 py-2'
                            onClick={handleCloseModal}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default OrdersToCloseTable;
