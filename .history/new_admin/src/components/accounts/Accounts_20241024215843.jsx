import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const AccountsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const {url} = useUrl();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemsPerPage] = useState(10); // numărul de cereri pe pagină
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get(`${url}/admin/admins`); // Asigură-te că URL-ul este corect
                if (response.data.success) {
                 
                    setAdmins(response.data.data);
                  
                } else {
                    setError('Failed to fetch admin accounts');
                }
            } catch (err) {
                setError('Error fetching admin accounts');
            } finally {
                setLoading(false);
            }
        };
        console.log(admins)
        fetchAdmins();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    };

    // Filtrare cereri pe baza termenului de căutare
    const filteredRequests = admins.filter((request) => {
        return (
            (request.name.toLowerCase().includes(searchTerm) || 
            request.role.toLowerCase().includes(searchTerm))
        );
    });

    // Calculul paginilor
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
    const currentRequests = filteredRequests
        .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
        .slice(indexOfFirstRequest, indexOfLastRequest);

    // Navigare pagină
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Admin Accounts</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search request...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Email</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Role</th>
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created On</th> */}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentRequests.map((item) => (
                            <motion.tr
                                key={item._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                // className={`${
                                //     newRequests.some(newRequest => newRequest._id === item._id) ? 'border-l-4 border-green-500' : ''
                                // }`}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                        <div className='h-10 w-10 rounded-lg border-2 border-gray-700  flex items-center justify-center text-white font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>
                                        {item.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <span className='px-4 py-1 inline-flex text-sm font-medium text-gray-100 leading-5 font-semibold rounded-lg border-2 border-gray-700  text-blue-100 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>
                                        {item.email}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <span className='px-4 py-1 inline-flex text-sm font-medium text-gray-100 leading-5 font-semibold rounded-lg border-2 border-gray-700  text-blue-100 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>
                                        {item.role}
                                    </span>
                                </td>
                                {/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <select
                                        value={item.status}
                                        onChange={(e) => statusHandler(e, item._id)}
                                        className={`px-4 py-1 inline-flextext-sm font-medium text-gray-100 font-semibold rounded-lg ${
                                            item.status === "Active" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100 "
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td> */}

                                {/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className='text-sm text-gray-300'>{formatDateTime(item.createdOn)}</div>
                                </td> */}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginare */}
            <div className='flex justify-between items-center mt-4'>
                <div>
                    <span className='text-gray-300'>Page {currentPage} of {totalPages}</span>
                </div>
                <div>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`mx-1 px-4 py-2 rounded-md ${
                                currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AccountsTable;
