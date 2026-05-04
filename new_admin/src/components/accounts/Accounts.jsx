import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import { useNavigate } from "react-router-dom";
import {
    Edit, Search, Trash2, X, Check,
    ChevronLeft, ChevronRight, User, Mail, Shield, Calendar, Eye, EyeOff
} from "lucide-react";

// ── Roluri disponibile în sistem ──────────────────────────────
const ROLES = [
    { value: "Admin",        label: "Admin",        color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { value: "Waiter",       label: "Waiter",       color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { value: "Orderly",      label: "Orderly Team", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
];

const getRoleColor = (role) => {
    const found = ROLES.find(r => r.value?.toLowerCase() === role?.toLowerCase());
    return found?.color ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

const getRoleLabel = (role) => {
    const found = ROLES.find(r => r.value?.toLowerCase() === role?.toLowerCase());
    return found?.label ?? role ?? "—";
};

const AccountsTable = () => {
    const [searchTerm, setSearchTerm]         = useState("");
    const { url }                              = useUrl();
    const [admins, setAdmins]                  = useState([]);
    const [loading, setLoading]                = useState(true);
    const [error, setError]                    = useState(null);
    const [itemsPerPage]                       = useState(10);
    const [currentPage, setCurrentPage]        = useState(1);
    const [isEditing, setIsEditing]            = useState(false);
    const [currentAccount, setCurrentAccount]  = useState(null);
    const [updatedAccount, setUpdatedAccount]  = useState({ name: "", email: "", userRole: "", password: "" });
    const [confirmPassword, setConfirmPassword]= useState("");
    const [showPassword, setShowPassword]      = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isDeleting, setIsDeleting]          = useState(false);
    const [accountToDelete, setAccountToDelete]= useState(null);
    const navigate = useNavigate();

    // ── Fetch ─────────────────────────────────────────────────
    const fetchAdmins = async () => {
        setLoading(true);
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

    useEffect(() => { fetchAdmins(); }, []);

    // ── Helpers ───────────────────────────────────────────────
    const formatDateTime = (isoString) => {
        if (!isoString) return '—';
        const d = new Date(isoString);
        return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };

    // ── Actions ───────────────────────────────────────────────
    const removeAccount = async (itemId) => {
        try {
            const response = await axios.post(`${url}/admin/remove`, { id: itemId });
            await fetchAdmins();
            if (response.data.success) {
                toast.success(response.data.message, { theme: "dark" });
                setIsDeleting(false);
                setAccountToDelete(null);
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (err) {
            toast.error('Error deleting account', { theme: "dark" });
        }
    };

    const confirmDelete = (account) => {
        setAccountToDelete(account);
        setIsDeleting(true);
    };

    const editAccount = (item) => {
        setCurrentAccount(item);
        setUpdatedAccount({ name: item.name, email: item.email, userRole: item.userRole, password: "" });
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsEditing(true);
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        if (updatedAccount.password && updatedAccount.password !== confirmPassword) {
            toast.error("Passwords do not match.", { theme: "dark" });
            return;
        }
        try {
            const payload = { id: currentAccount._id, ...updatedAccount };
            if (!updatedAccount.password) delete payload.password;

            const response = await axios.post(`${url}/admin/update`, payload);
            if (response.data.success) {
                toast.success(response.data.message, { theme: "dark" });
                fetchAdmins();
                setIsEditing(false);
                setCurrentAccount(null);
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (err) {
            toast.error("Error updating account", { theme: "dark" });
        }
    };

    // ── Filtering & pagination ────────────────────────────────
    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
        setCurrentPage(1);
    };

    const filteredAdmins = admins.filter(a =>
        a.name?.toLowerCase().includes(searchTerm) ||
        a.userRole?.toLowerCase().includes(searchTerm) ||
        a.email?.toLowerCase().includes(searchTerm)
    );

    const totalPages          = Math.ceil(filteredAdmins.length / itemsPerPage);
    const indexOfLast         = currentPage * itemsPerPage;
    const indexOfFirst        = indexOfLast - itemsPerPage;
    const currentItems        = [...filteredAdmins]
        .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
        .slice(indexOfFirst, indexOfLast);

    const getVisiblePages = () => {
        const total = 5;
        let start = Math.max(1, currentPage - Math.floor(total / 2));
        let end   = Math.min(totalPages, start + total - 1);
        if (end - start + 1 < total) start = Math.max(1, end - total + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    // ── Render ────────────────────────────────────────────────
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-4 sm:p-6 border border-gray-700 mx-2 sm:mx-0'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                <button
                    className="bg-gray-800 text-white font-semibold rounded-lg px-4 sm:px-6 py-2.5 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 w-full sm:w-auto text-sm"
                    onClick={() => navigate('/create-account')}
                >
                    + Create New Account
                </button>
                <div className='relative w-full sm:w-auto'>
                    <input
                        type='text'
                        placeholder='Search accounts...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <p className="text-red-400">{error}</p>
                    <button onClick={fetchAdmins} className="mt-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">Retry</button>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredAdmins.length === 0 && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No accounts found</p>
                </div>
            )}

            {/* Table */}
            {!loading && !error && filteredAdmins.length > 0 && (
                <>
                    <div className='overflow-x-auto rounded-lg border border-gray-700'>
                        <table className='min-w-full divide-y divide-gray-700'>
                            <thead className="bg-gray-800/50">
                                <tr>
                                    {[
                                        { label: 'Name',       icon: <User size={14} /> },
                                        { label: 'Email',      icon: <Mail size={14} />,     hidden: 'hidden sm:table-cell' },
                                        { label: 'Role',       icon: <Shield size={14} /> },
                                        { label: 'Created On', icon: <Calendar size={14} />, hidden: 'hidden lg:table-cell' },
                                        { label: 'Actions' },
                                    ].map(col => (
                                        <th key={col.label}
                                            className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${col.hidden ?? ''}`}>
                                            <div className="flex items-center gap-2">
                                                {col.icon && <span className="hidden sm:inline">{col.icon}</span>}
                                                {col.label}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-700 bg-gray-800/30'>
                                {currentItems.map((item) => (
                                    <motion.tr key={item._id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className='px-4 py-4'>
                                            <div className="flex flex-col">
                                                <span className='text-sm font-medium text-gray-100'>{item.name}</span>
                                                <span className='text-xs text-gray-400 sm:hidden mt-1'>{item.email}</span>
                                            </div>
                                        </td>
                                        <td className='px-4 py-4 text-sm text-gray-100 hidden sm:table-cell'>{item.email}</td>
                                        <td className='px-4 py-4'>
                                            <span className={`px-3 py-1 inline-flex text-xs font-medium leading-5 rounded-full border ${getRoleColor(item.userRole)}`}>
                                                {getRoleLabel(item.userRole)}
                                            </span>
                                        </td>
                                        <td className='px-4 py-4 text-sm text-gray-300 hidden lg:table-cell whitespace-nowrap'>
                                            {formatDateTime(item.createdOn)}
                                        </td>
                                        <td className='px-4 py-4 whitespace-nowrap'>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => editAccount(item)}
                                                    className='p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors' title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => confirmDelete(item)}
                                                    className='p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors' title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-6'>
                            <div className="text-sm text-gray-400">
                                Showing <span className="font-medium text-gray-300">{indexOfFirst + 1}</span> to{" "}
                                <span className="font-medium text-gray-300">{Math.min(indexOfLast, filteredAdmins.length)}</span> of{" "}
                                <span className="font-medium text-gray-300">{filteredAdmins.length}</span> accounts
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                                    className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="hidden sm:flex gap-1">
                                    {getVisiblePages().map(page => (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <div className="sm:hidden text-sm text-gray-300 px-3 py-1.5 bg-gray-700 rounded-lg">
                                    {currentPage} / {totalPages}
                                </div>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Edit Modal ── */}
            {isEditing && (
                <motion.div
                    className='fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 z-50'
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsEditing(false)}
                >
                    <motion.div
                        className='bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className='text-xl font-semibold text-gray-100'>Edit Account</h2>
                            <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAccount} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>Name</label>
                                <input type='text' required placeholder="Enter name"
                                    value={updatedAccount.name}
                                    onChange={e => setUpdatedAccount({ ...updatedAccount, name: e.target.value })}
                                    className='bg-gray-700 text-white rounded-lg w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' />
                            </div>

                            {/* Email */}
                            <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>Email</label>
                                <input type='email' required placeholder="Enter email"
                                    value={updatedAccount.email}
                                    onChange={e => setUpdatedAccount({ ...updatedAccount, email: e.target.value })}
                                    className='bg-gray-700 text-white rounded-lg w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' />
                            </div>

                            {/* Role — dropdown cu toate rolurile */}
                            <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>Role</label>
                                <select required
                                    value={updatedAccount.userRole}
                                    onChange={e => setUpdatedAccount({ ...updatedAccount, userRole: e.target.value })}
                                    className='bg-gray-700 text-white rounded-lg w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'>
                                    <option value="">Select role</option>
                                    {ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                {/* Preview badge */}
                                {updatedAccount.userRole && (
                                    <span className={`mt-2 inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(updatedAccount.userRole)}`}>
                                        {getRoleLabel(updatedAccount.userRole)}
                                    </span>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                    Password <span className="text-gray-500 font-normal">(leave empty to keep unchanged)</span>
                                </label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Enter new password"
                                        value={updatedAccount.password}
                                        onChange={e => { setUpdatedAccount({ ...updatedAccount, password: e.target.value }); setConfirmPassword(""); }}
                                        className='bg-gray-700 text-white rounded-lg w-full px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password — apare doar dacă s-a introdus o parolă */}
                            {updatedAccount.password && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-300 mb-2'>Confirm Password</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`bg-gray-700 text-white rounded-lg w-full px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 text-sm ${
                                                confirmPassword && updatedAccount.password !== confirmPassword ? 'ring-1 ring-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                                            }`} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {confirmPassword && updatedAccount.password !== confirmPassword && (
                                        <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                                    )}
                                </div>
                            )}

                            <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                                <button type='submit'
                                    className='flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium'>
                                    <Check size={18} /> Update Account
                                </button>
                                <button type='button' onClick={() => setIsEditing(false)}
                                    className='flex-1 bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-600 transition-colors text-sm font-medium'>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {isDeleting && accountToDelete && (
                <motion.div
                    className='fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 z-50'
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsDeleting(false)}
                >
                    <motion.div
                        className='bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md'
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <Trash2 className="text-red-400 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className='text-lg font-semibold text-gray-100'>Delete Account</h3>
                                <p className="text-sm text-gray-400">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                            <p className="text-gray-300 mb-2">
                                Are you sure you want to delete <span className="font-semibold text-white">{accountToDelete.name}</span>?
                            </p>
                            <p className="text-sm text-gray-400">
                                Role: <span className={`px-2 py-1 rounded-full text-xs border ${getRoleColor(accountToDelete.userRole)}`}>
                                    {getRoleLabel(accountToDelete.userRole)}
                                </span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">Email: {accountToDelete.email}</p>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <button onClick={() => removeAccount(accountToDelete._id)}
                                className='flex-1 bg-red-600 text-white rounded-lg px-4 py-2.5 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium'>
                                <Trash2 size={18} /> Delete Account
                            </button>
                            <button onClick={() => { setIsDeleting(false); setAccountToDelete(null); }}
                                className='flex-1 bg-gray-700 text-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-600 transition-colors text-sm font-medium'>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AccountsTable;