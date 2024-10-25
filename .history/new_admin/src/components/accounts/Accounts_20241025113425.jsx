import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import { useNavigate } from "react-router-dom";

const AccountsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { url } = useUrl();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemsPerPage] = useState(10); // numărul de cereri pe pagină
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate()

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const removeFood = async (itemId) => {
        const response = await axios.post(`${url}/admin/admins/remove`, { id: itemId });
        await fetchAdmins();

        if (response.data.success) {
            toast.success(response.data.message, {theme: "dark"});
        } else {
            toast.error(response.data.message, {theme: "dark"});
        }
    };

    const editProduct = (item) => {
        // setCurrentProduct(product);
        // setUpdatedProduct({
        //     name: product.name,
        //     category: product.category,
        //     description: product.description,
        //     price: product.price.toFixed(2),
        //     image: null
        // });
        // setIsEditing(true);
    };
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await axios.get(`${url}/admin/admins`); // Asigură-te că URL-ul este corect
                if (response.data.success) {
                    //  console.log(response.data.data)
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
                request.userRole.toLowerCase().includes(searchTerm))
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
            <button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    onClick={() => navigate('/create-account')}
                >
                    Create an account
                </button>
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created On</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>

                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentRequests.map((item) => (
                            <motion.tr
                                key={item._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                      
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {item.name}{/* Display total */}
                                </td>
                          

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {item.email}{/* Display total */}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <span className='px-4 py-1 inline-flex text-sm font-medium text-gray-100 leading-5 font-semibold rounded-lg border-2 border-gray-700  text-blue-100 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>
                                        {item.userRole}
                                    </span>
                                </td>

                          

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className='text-sm text-gray-300'>{formatDateTime(item.createdOn)}</div>
                                </td>
                                {/* {/* <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'> */}
                                    <button onClick={() => editAccount(item)} className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Edit size={18} />
                                    </button>
                                    {/* <button onClick={() => removeAccount(item._id)} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button> */}
                                {/* </td> */} */}
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
                            className={`mx-1 px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
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
