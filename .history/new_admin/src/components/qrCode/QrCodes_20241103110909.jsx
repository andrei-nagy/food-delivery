import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // Make sure you have react-toastify installed
import { useUrl } from "../context/UrlContext";

const QrCodes = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orders, setOrders] = useState([]); // Store orders fetched from API
    const [currentPage, setCurrentPage] = useState(1);
    const {url} = useUrl();
    const ordersPerPage = 10; // Number of orders per page

  // Function to fetch orders from the API
const fetchQrCodes = async () => {
    try {
        const response = await axios.get(`${url}/admin/qrcodes`);
        if (response.data.success && Array.isArray(response.data.data)) {
            
            // Filtrare: Exclude comenzile cu statusul "Delivered"
            const filteredOrders = response.data.data;

            // Sortează comenzile rămase în funcție de orderNumber în ordine descrescătoare
            const sortedOrders = filteredOrders.sort((a, b) => {
                const tableNoA = a.tableNo ? Number(a.tableNo) : 0; // Asigură-te că tableNo este un număr
                const tableNoB = b.tableNo ? Number(b.tableNo) : 0; // Asigură-te că orderNumber este un număr

                return tableNoB - tableNoA; // Sortează orderNumber în ordine descrescătoare
            });

            setOrders(sortedOrders);
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
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 5000);
    }, []);

    // Function for searching orders
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setCurrentPage(1); // Reset to the first page on search

        const filtered = orders.filter((order) => {
            const tableNo = order.tableNo ? String(order.tableNo) : '';
            const date = order.createdOn ? new Date(order.createdOn).toLocaleDateString('ro-RO') : ''; // Format date

            // Search by orderNumber, tableNo, status, and date
            return (
                tableNo.toLowerCase().includes(term) ||
                date.includes(term) // Search by formatted date
            );
        });

        setFilteredOrders(filtered);
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  
 

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Slice filteredOrders based on currentPage and ordersPerPage
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder); // Get orders for the current page

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
                                Table No.
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Created On
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
                                    {order.tableNo || "Unknown"} {/* Display table number */}
                                </td>
                           
                           
                              

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {new Date(order.createdOn).toLocaleDateString('ro-RO')} {/* Display date in format day/month/year */}
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

export default QrCodes;
