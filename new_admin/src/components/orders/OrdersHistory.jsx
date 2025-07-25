import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // Make sure you have react-toastify installed
import { useUrl } from "../context/UrlContext";
// import { useTheme } from "../themeToggle/ThemeContext";

const OrdersHistoryTable = () => {
    // const { isDarkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orders, setOrders] = useState([]); // Store orders fetched from API
    const [currentPage, setCurrentPage] = useState(1);
    const {url} = useUrl();
    const ordersPerPage = 10; // Number of orders per page

   // Function to fetch orders from the API
const fetchOrders = async () => {
    try {
        const response = await axios.get(`${url}/api/order/list`);
        if (response.data.success && Array.isArray(response.data.data)) {
            // Filtrează comenzile doar cu statusul "delivered"
            const deliveredOrders = response.data.data.filter(order => order.status === 'Delivered');

            // Sortează comenzile în funcție de orderNumber în ordine descrescătoare
            const sortedOrders = deliveredOrders.sort((a, b) => {
                const orderNumberA = a.orderNumber ? Number(a.orderNumber) : 0; // Asigură-te că orderNumber este un număr
                const orderNumberB = b.orderNumber ? Number(b.orderNumber) : 0; // Asigură-te că orderNumber este un număr

                return orderNumberB - orderNumberA; // Sortează orderNumber în ordine descrescătoare
            });

            setOrders(sortedOrders); // Setează comenzile sortate
            setFilteredOrders(sortedOrders); // Setează comenzi filtrate cu aceleași date sortate
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
        // const intervalId = setInterval(() => {
        //     fetchOrders();
        // }, 5000);
    }, []);

    // Function for searching orders
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1); // Reset to the first page on search

        const filtered = orders.filter((order) => {
            const orderNumber = order.orderNumber ? String(order.orderNumber) : '';
            const tableNo = order.tableNo ? String(order.tableNo) : '';
            const status = order.status ? String(order.status) : '';
            const date = order.date ? new Date(order.date).toLocaleDateString('ro-RO') : ''; // Format date
            const paymentMethod = order.paymentMethod ? String(order.paymentMethod) : '';
            // Search by orderNumber, tableNo, status, and date
            return (
                orderNumber.toLowerCase().includes(term) ||
                tableNo.toLowerCase().includes(term) ||
                status.toLowerCase().includes(term) ||
                paymentMethod.toLowerCase().includes(term) ||
                date.includes(term) // Search by formatted date
            );
        });

        setFilteredOrders(filtered);
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    // Function to change order status
    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value;
        try {
            const response = await axios.post(`${url}/api/order/status`, {
                orderId,
                status: newStatus
            });

            if (response.data.success) {
                toast.success("Status updated successfully.");
                await fetchOrders(); // Reload orders after update
            } else {
                toast.error("Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating status.");
        }
    };

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

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Slice filteredOrders based on currentPage and ordersPerPage
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder); // Get orders for the current page

    return (
        <motion.div
        className={`bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8`} // Adaugă clasa doar când isDarkMode este true
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        // style={{
        //     backgroundColor: isDarkMode ? 'transparent' : '#ffffff',
        //     ...(isDarkMode ? {} : { color: 'black', borderColor: '#D1D5DB' }), // Aplică stilurile doar în modul normal
        // }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Order History List</h2>
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
                                Items
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Instructions
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Total
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment Method
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Paid?
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
                        {currentOrders.map((order) => ( // Use currentOrders instead of filteredOrders
                            <motion.tr
                                key={order._id} // Use _id as key
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="border-b border-gray-700" // Adaugă un border între rânduri
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                <div className='h-10 w-10 rounded-lg border-2 border-gray-700  flex items-center justify-center text-white font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>

                                    {order.orderNumber || "Unknown"} {/* Display orderNumber */}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.tableNo || "Unknown"} {/* Display table number */}
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
                                    {order.specialInstructions}{/* Display total */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.amount.toFixed(2)}€{/* Display total */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.paymentMethod}{/* Display total */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.payment ? (
                                        <span className="text-green-500">Successful</span> // If payment is true, show green text
                                    ) : (
                                        <span className="text-red-500">Not paid</span> // If payment is false, show red text
                                    )}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {new Date(order.date).toLocaleDateString('ro-RO')} {/* Display date in format day/month/year */}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                {order.status == 'Delivered' ? (
                                        <span className="text-green-500">Delivered</span> // If payment is true, show green text
                                    ) : (
                                        <span className="text-red-500">Not paid</span> // If payment is false, show red text
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
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default OrdersHistoryTable;
