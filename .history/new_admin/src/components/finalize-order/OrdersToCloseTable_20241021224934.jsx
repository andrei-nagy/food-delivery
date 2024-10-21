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
    const [isModalOpen, setIsModalOpen] = useState(false); // Stare pentru a deschide/inchide modalul
    const [selectedOrderItems, setSelectedOrderItems] = useState([]); // Stare pentru a stoca produsele selectate
    const [selectedOrder, setSelectedOrder] = useState(null); // Adaugă această linie
    const [relatedOrders, setRelatedOrders] = useState([]); // Stare pentru comenzile legate de tableNo
    const [selectedUserId, setSelectedUserId] = useState(null);


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
        const uniqueUsers = getUniqueUsers(combinedOrders);
        setFilteredOrders(uniqueUsers);
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000);
        return () => clearInterval(intervalId);
    }, [combinedOrders]);

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


     // Function to get unique users based on orders
     const getUniqueUsers = (orders) => {
        const userMap = new Map();

        orders.forEach(order => {
            if (order.userId && !userMap.has(order.userId)) {
                userMap.set(order.userId, {
                    ...order,
                    orderCount: 1, // Track number of orders per user if needed
                });
            } else if (userMap.has(order.userId)) {
                // If user already exists, just increment count or do any other logic
                userMap.get(order.userId).orderCount++;
            }
        });

        return Array.from(userMap.values());
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
                orderId: orderId,
                payment: paymentStatus
            });
    
            if (response.data.success) {
                // Update the related orders in local state
                setRelatedOrders((prevOrders) => 
                    prevOrders.map((order) => 
                        order._id === orderId ? { ...order, payment: paymentStatus } : order
                    )
                );
                toast.success("Payment status updated successfully.");
                fetchData(); // Refresh data after update, if necessary
            } else {
                toast.error("Failed to update payment status.");
            }
        } catch (error) {
            toast.error("Error updating payment status.");
        }
    };

    // Function to handle opening the modal and setting the selected order items

    const handleCheckOrderClick = (userOrder) => {
        setSelectedUserId(userOrder.userId); // Set selected user ID
        // Fetch or filter the orders for this user
        const ordersForUser = combinedOrders.filter(order => order.userId === userOrder.userId);
        setRelatedOrders(ordersForUser); // Set related orders
        setIsModalOpen(true); // Open the modal
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
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Order Number
                            </th> */}
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Table No.
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment Method
                            </th>
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment
                            </th> */}
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

                    {currentUsers.map((userOrder) => (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.orderNumber || "Unknown"}
                                </td> */}
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {userOrder.tableNo} {/* Display tableNo */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {userOrder.paymentMethod || "Unknown"} {/* Display paymentMethod */}
                                </td>
                                {/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>


                                    <select
                                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value === "true")} // Trimite orderId și noul status de plată
                                        value={order.payment ? "true" : "false"} // Valoarea actuală a statusului plății
                                        className={`text-white rounded-lg p-2 ${getStatusClass(order.payment)}`} // Stilizare în funcție de status
                                    >
                                        <option value="true">Successfull</option>
                                        <option value="false">Not paid</option>
                                    </select>
                                </td> */}
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {userOrder.status}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(userOrder.date).toLocaleDateString('ro-RO')} {/* Display date in format day/month/year */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button
                                        className='bg-blue-500 text-white rounded-lg px-4 py-2'
                                        onClick={() => handleCheckOrderClick(userOrder)} // Pass order items to the function
                                    >
                                        Check order
                                    </button>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                    <select
                                        onChange={(e) => {
                                            // Check if the order is paid
                                            if (!userOrder.payment) {
                                                // Show a notification that the order is not paid
                                                toast.error("Order is not paid yet. Please complete the payment before changing the status.");
                                                return; // Prevent changing the status
                                            }
                                            // If paid, proceed to change the status
                                            handleIsActiveChange(userOrder.user?._id, e.target.value === "true"); // Send true/false based on selection
                                        }}
                                        value={userOrder.user?.isActive === true ? "true" : "false"} // If isActive is true, select "Active"
                                        className={`text-white rounded-lg p-2 ${getStatusClass(userOrder.user?.isActive)}`} // Style based on isActive
                                        disabled={!userOrder.payment} // Disable if payment is false
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                    {!userOrder.payment && <p className="text-red-500 text-sm mt-1">Order is not paid yet.</p>} {/* Show message if unpaid */}
                                </td>

                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modal */}
            {/* Modal for related orders */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-gray-800 rounded-lg p-6 '>
                        <h2 className='text-lg font-semibold text-gray-100 mb-4'>Related Orders for Table {selectedUserId}</h2>
                        <table className='min-w-full divide-y divide-gray-700'>
                            <thead>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Order Number
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Items
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Payment Method
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Is paid?
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Status
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide divide-gray-700'>
                                {relatedOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                            {order.orderNumber || "Unknown"}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                            {/* Afișăm articolele din comandă */}
                                            {order.items.length > 0 ? (
                                                order.items.map((item, index) => (
                                                    <div key={index}>
                                                        {item.name} x {item.quantity} {/* Afișează numele și cantitatea fiecărui articol */}
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No items</p> // Mesaj în cazul în care nu sunt articole
                                            )}
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
                                            {order.status || "Unknown"}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                            {new Date(order.date).toLocaleDateString('ro-RO') || "Unknown"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className='mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700' onClick={handleCloseModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}

        </motion.div>
    );
};
export default OrdersToCloseTable;
