import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // Make sure you have react-toastify installed

const OrdersTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orders, setOrders] = useState([]); // Stocăm comenzile aduse din API
	const [currentPage, setCurrentPage] = useState(1);
    const url = "http://localhost:4000"; // URL-ul API-ului
    const ordersPerPage = 10; // Numărul de produse pe pagină

    // Funcția pentru a prelua comenzile din API
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`);
            console.log(response.data); // Verifică structura răspunsului
            if (response.data.success && Array.isArray(response.data.data)) {
                // Sortează comenzile în ordine descrescătoare după dată
                const sortedOrders = response.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders); // Setăm și lista filtrată cu aceleași date sortate
            } else {
                console.error("Response structure is not as expected:", response.data);
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Funcția de căutare a comenzilor
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = orders.filter((order) => {
            // Asigură-te că orderNumber, tableNo, status și date sunt definite și sunt string-uri
            const orderNumber = order.orderNumber ? String(order.orderNumber) : '';
            const tableNo = order.tableNo ? String(order.tableNo) : '';
            const status = order.status ? String(order.status) : '';
            const date = order.date ? new Date(order.date).toLocaleDateString('ro-RO') : ''; // Formatează data în format zi/lună/an

            // Căutare după orderNumber, tableNo, status și date
            return (
                orderNumber.toLowerCase().includes(term) ||
                tableNo.toLowerCase().includes(term) ||
                status.toLowerCase().includes(term) ||
                date.includes(term) // Căutare după data formatată
            );
			setCurrentPage(1); 
        });

        setFilteredOrders(filtered);
    };

    // Funcția pentru schimbarea statusului comenzii
    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value;
        try {
            const response = await axios.post(`${url}/api/order/status`, {
                orderId,
                status: newStatus
            });

            if (response.data.success) {
                toast.success("Status updated successfully.");
                await fetchOrders(); // Reîncarcă comenzile după actualizare
            } else {
                toast.error("Failed to update status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating status.");
        }
    };

    // Funcția pentru a obține clasa pentru status
    const getStatusClass = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-500"; // Verde pentru livrat
            case "Food Processing":
                return "bg-red-500"; // Roșu pentru în preparare
            case "Out for delivery":
                return "bg-yellow-500"; // Galben pentru în livrare
            default:
                return "bg-red-500"; // Culoare implicită
        }
    };
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Order List</h2>
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
                                Total
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide divide-gray-700'>
                        {filteredOrders.map((order) => (
                            <motion.tr
                                key={order._id} // Folosește _id ca și key
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.orderNumber || "Unknown"} {/* Afișează orderNumber */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.tableNo || "Unknown"} {/* Afișează table number */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.amount.toFixed(2)}€{/* Afișează totalul */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <select 
                                        onChange={(event) => statusHandler(event, order._id)} 
                                        value={order.status} 
                                        className={`text-white rounded-lg p-2 ${getStatusClass(order.status)}`} // Setează culoarea în funcție de status
                                    >
                                        <option value="Food Processing">Food Processing</option>
                                        <option value="Out for delivery">Out for delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(order.date).toLocaleDateString('ro-RO')} {/* Afișează data în format zi/lună/an */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default OrdersTable;
