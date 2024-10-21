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
    const [showNotification, setShowNotification] = useState(false); // State pentru notificare

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

    // Get CSS class for status
    const getStatusClass = (isActive) => {
        if (isActive === true) {
            return "bg-green-500"; // Verde pentru utilizatorii activi
        } else if (isActive === false) {
            return "bg-red-500"; // Roșu pentru utilizatorii inactivi
        } else {
            return "bg-gray-500"; // Gri pentru statusuri necunoscute
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

    // Handle updating payment status
    const handlePaymentStatusChange = async (orderId, paymentStatus) => {
        try {
            const response = await axios.post(`${url}/api/order/payment-status`, {
                orderId: orderId,   // ID-ul comenzii
                payment: paymentStatus // Noua stare a plății
            });

            if (response.data.success) {
                toast.success("Payment status updated successfully.");
                fetchData(); // Refresh data after update
            } else {
                toast.error("Failed to update payment status.");
            }
        } catch (error) {
            toast.error("Error updating payment status.");
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

            <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 bg-white shadow-xl rounded-lg text-gray-900">
            <div className="rounded-t-lg h-32 overflow-hidden">
                <img
                    className="object-cover object-top w-full"
                    src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
                    alt="Mountain"
                />
            </div>
            {/* <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                <img
                    className="object-cover object-center h-32"
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
                    alt="Woman looking front"
                />
            </div> */}
            <div className="text-center mt-2">
                <h2 className="font-semibold"></h2>
                <p className="text-gray-500">Freelance Web Designer</p>
            </div>
            <ul className="py-4 mt-2 text-gray-700 flex items-center justify-around">
                <li className="flex flex-col items-center justify-around">
                    <svg className="w-4 fill-current text-blue-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <div>2k</div>
                </li>
                <li className="flex flex-col items-center justify-between">
                    <svg className="w-4 fill-current text-blue-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M7 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1c2.15 0 4.2.4 6.1 1.09L12 16h-1.25L10 20H4l-.75-4H2L.9 10.09A17.93 17.93 0 0 1 7 9zm8.31.17c1.32.18 2.59.48 3.8.92L18 16h-1.25L16 20h-3.96l.37-2h1.25l1.65-8.83zM13 0a4 4 0 1 1-1.33 7.76 5.96 5.96 0 0 0 0-7.52C12.1.1 12.53 0 13 0z" />
                    </svg>
                    <div>10k</div>
                </li>
                <li className="flex flex-col items-center justify-around">
                    <svg className="w-4 fill-current text-blue-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9 12H1v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-8v2H9v-2zm0-1H0V5c0-1.1.9-2 2-2h4V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v6h-9V9H9v2zm3-8V2H8v1h4z" />
                    </svg>
                    <div>15</div>
                </li>
            </ul>
            <div className="p-4 border-t mx-8 mt-2 flex mx-5">
                <button className="w-1/2 block mx-auto rounded-full bg-gray-900 hover:shadow-lg font-semibold text-white px-6 py-2">
                    Check orders
                </button>
                <button className="w-1/2 block mx-auto rounded-full bg-gray-900 hover:shadow-lg font-semibold text-white px-6 py-2">
                    Close table
                </button>
            </div>
            
        </div>
    
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
                                Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Items
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Table status
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


                                    <select
                                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value === "true")} // Trimite orderId și noul status de plată
                                        value={order.payment ? "true" : "false"} // Valoarea actuală a statusului plății
                                        className={`text-white rounded-lg p-2 ${getStatusClass(order.payment)}`} // Stilizare în funcție de status
                                    >
                                        <option value="true">Successfull</option>
                                        <option value="false">Not paid</option>
                                    </select>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.status}
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
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                    <select
                                        onChange={(e) => {
                                            // Check if the order is paid
                                            if (!order.payment) {
                                                // Show a notification that the order is not paid
                                                toast.error("Order is not paid yet. Please complete the payment before changing the status.");
                                                return; // Prevent changing the status
                                            }
                                            // If paid, proceed to change the status
                                            handleIsActiveChange(order.user?._id, e.target.value === "true"); // Send true/false based on selection
                                        }}
                                        value={order.user?.isActive === true ? "true" : "false"} // If isActive is true, select "Active"
                                        className={`text-white rounded-lg p-2 ${getStatusClass(order.user?.isActive)}`} // Style based on isActive
                                        disabled={!order.payment} // Disable if payment is false
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                    {!order.payment && <p className="text-red-500 text-sm mt-1">Order is not paid yet.</p>} {/* Show message if unpaid */}
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
