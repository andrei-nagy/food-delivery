import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import { useNavigate } from "react-router-dom";
import { Edit, Search, Trash2 } from "lucide-react";

const AccountsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { url } = useUrl();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [updatedAccount, setUpdatedAccount] = useState({ name: "", email: "", userRole: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState(""); // State pentru confirmarea parolei
    const navigate = useNavigate();

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${url}/admin/admins`);
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

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const removeAccount = async (itemId) => {
        const response = await axios.post(`${url}/admin/remove`, { id: itemId });
        await fetchAdmins();

        if (response.data.success) {
            toast.success(response.data.message, { theme: "dark" });
        } else {
            toast.error(response.data.message, { theme: "dark" });
        }
    };

    const editAccount = (item) => {
        setCurrentAccount(item);
        setUpdatedAccount({
            name: item.name,
            email: item.email,
            userRole: item.userRole,
            password: ""
        });
        setConfirmPassword(""); // Resetăm confirmarea parolei
        setIsEditing(true);
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();

        // Verifică dacă parola și confirmarea parolei se potrivesc
        if (updatedAccount.password && updatedAccount.password !== confirmPassword) {
            toast.error("Passwords do not match.", { theme: "dark" });
            return;
        }

        try {
            const response = await axios.post(`${url}/admin/update`, {
                id: currentAccount._id,
                ...updatedAccount
            });
            if (response.data.success) {
                toast.success(response.data.message, { theme: "dark" });
                fetchAdmins(); // Reîncarcă lista de admins
                setIsEditing(false); // Închide modalul
                setCurrentAccount(null);
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (err) {
            toast.error("Error updating account", { theme: "dark" });
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    };

    const filteredRequests = admins.filter((request) => {
        return (
            (request.name.toLowerCase().includes(searchTerm) ||
                request.userRole.toLowerCase().includes(searchTerm))
        );
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
    const currentRequests = filteredRequests
        .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
        .slice(indexOfFirstRequest, indexOfLastRequest);

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
                                    {item.name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {item.email}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <span className='px-4 py-1 inline-flex text-sm font-medium text-gray-100 leading-5 font-semibold rounded-lg border-2 border-gray-700 text-blue-100 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>
                                        {item.userRole}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className='text-sm text-gray-300'>{formatDateTime(item.createdOn)}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <button onClick={() => editAccount(item)} className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => removeAccount(item._id)} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

            {isEditing && (
                <motion.div
                    className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className='bg-gray-800 rounded-lg p-6 w-96'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <h2 className='text-xl font-semibold text-gray-100 mb-4'>Edit Account</h2>
                        <form onSubmit={handleUpdateAccount}>
                            <div className='mb-4'>
                                <label className='block text-gray-300'>Name</label>
                                <input
                                    type='text'
                                    value={updatedAccount.name}
                                    onChange={(e) => setUpdatedAccount({ ...updatedAccount, name: e.target.value })}
                                    className='bg-gray-700 text-white rounded-md w-full p-2'
                                    required
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-300'>Email</label>
                                <input
                                    type='email'
                                    value={updatedAccount.email}
                                    onChange={(e) => setUpdatedAccount({ ...updatedAccount, email: e.target.value })}
                                    className='bg-gray-700 text-white rounded-md w-full p-2'
                                    required
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-300'>Role</label>
                                <input
                                    type='text'
                                    value={updatedAccount.userRole}
                                    onChange={(e) => setUpdatedAccount({ ...updatedAccount, userRole: e.target.value })}
                                    className='bg-gray-700 text-white rounded-md w-full p-2'
                                    required
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-300'>Password (leave empty to keep unchanged)</label>
                                <input
                                    type='password'
                                    value={updatedAccount.password}
                                    onChange={(e) => {
                                        setUpdatedAccount({ ...updatedAccount, password: e.target.value });
                                        setConfirmPassword(""); // Reset confirm password when changing password
                                    }}
                                    className='bg-gray-700 text-white rounded-md w-full p-2'
                                />
                            </div>
                            {/* Câmp pentru confirmarea parolei */}
                            {updatedAccount.password && (
                                <div className='mb-4'>
                                    <label className='block text-gray-300'>Confirm Password</label>
                                    <input
                                        type='password'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='bg-gray-700 text-white rounded-md w-full p-2'
                                    />
                                </div>
                            )}
                            <div className='flex justify-end'>
                                <button type='submit' className='bg-blue-600 text-white rounded-md px-4 py-2'>Update</button>
                                <button type='button' className='bg-red-600 text-white rounded-md px-4 py-2 ml-2' onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AccountsTable;
