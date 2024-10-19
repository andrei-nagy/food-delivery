import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const WaiterTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequests, setFilteredRequests] = useState([]);
    const url = 'http://localhost:4000';
    const [list, setList] = useState([]);
    const [newRequests, setNewRequests] = useState([]);
    const audioRef = useRef(null);

    const fetchList = async () => {
        const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);

        if (response.data.success) {
            const newList = response.data.data;

            if (JSON.stringify(newList) !== JSON.stringify(list)) {
                const pendingRequests = newList.filter(item => item.status === 'Pending');

                setNewRequests(pendingRequests.filter(item => !list.includes(item)));

                if (audioRef.current) {
                    audioRef.current.play().catch(error => {
                        console.log('Sound play blocked by browser:', error);
                    });
                }

                toast.success("New waiter request received!");
                setList(newList);
            }
        } else {
            toast.error("Error");
        }
    };

    useEffect(() => {
        fetchList();
        const intervalId = setInterval(() => {
            fetchList();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [list]);

    const statusHandler = async (event, orderId) => {
        const response = await axios.post(url + "/api/waiterorders/status", {
            orderId,
            status: event.target.value
        });

        if (response.data.success) {
            toast.success("Status updated successfully.");
            await fetchList();
        } else {
            toast.error("Error");
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

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = newRequests.filter(
            (request) => request.tableNo.toLowerCase().includes(term) || request.action.toLowerCase().includes(term)
        );
        setFilteredRequests(filtered);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Waiter Requests</h2>
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Table no.</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Action</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created On</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {list
                            .filter(item => item.status === 'Pending')
                            .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))
                            .map((item) => (
                                <motion.tr
                                    key={item._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='flex items-center'>
                                            <div className='flex-shrink-0 h-10 w-10'>
                                                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                    {item.tableNo}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
                                            {item.action}
                                        </span>
                                    </td>

                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <select
                                            value={item.status}
                                            onChange={(e) => statusHandler(e, item._id)}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === "Active" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                                            }`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>

                                    <td className='px-2 py-4 whitespace-nowrap'>
                                        <div className='text-sm text-gray-300'>{formatDateTime(item.createdOn)}</div>
                                    </td>
                                </motion.tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default WaiterTable;
