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

                // Combine orders with corresponding users
                const combined = orders.map(order => {
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
                console.log(combinedOrders)
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

    // Get CSS class for status
    const getStatusClass = (status) => {
        switch (status) {
            case "Active":
                return "bg-green-500";
            case "Inactive":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    // Get CSS class for isActive
    const getIsActiveClass = (isActive) => {
        return isActive ? "text-green-500" : "text-red-500";
    };

    // Handle updating isActive status
    const handleIsActiveChange = async (userId, newStatus) => {
        try {
            const response = await axios.put(`${url}/api/user/update-status/${userId}`, {
                isActive: newStatus
            });

            if (response.data.success) {
                toast.success("User status updated successfully.");
                fetchData(); // Refresh data after update
            } else {
                toast.error("Failed to update user status.");
            }
        } catch (error) {
            toast.error("Error updating user status.");
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
                                Payment Method
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Is Active
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
                                    {order.orderNumber || "Unknown"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.user ? order.tableNo : "Unknown"} {/* Display tableNo */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.paymentMethod || "Unknown"} {/* Display paymentMethod */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.payment ? (
                                        <span className="text-green-500">Successful</span> // If payment is true, show green text
                                    ) : (
                                        <span className="text-red-500">Not paid</span> // If payment is false, show red text
                                    )} {/* Display payment */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.status}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                    <select
                                         onChange={(e) =>
                                            handleIsActiveChange(order.user?._id, e.target.value === "Active")
                                        }
                                        value={order.isActive ? order.isActive : "Unknown"}
                                        className={`text-white rounded-lg p-2 ${getStatusClass(order.isActive)}`} // Set color based on status
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>


                                    </select>


                                    <select
                                        value={order.user?.isActive ? "Active" : "Inactive"}
                                        onChange={(e) =>
                                            handleIsActiveChange(order.user?._id, e.target.value === "Active")
                                        }
                                        className={`text-white rounded-lg p-2 ${getIsActiveClass(order.user?.isActive)}`}
                                    >
                                        <option value="Active" className="text-green-500">Active</option>
                                        <option value="Inactive" className="text-red-500">Inactive</option>
                                    </select>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(order.date).toLocaleDateString('ro-RO')} {/* Display date in format day/month/year */}
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
