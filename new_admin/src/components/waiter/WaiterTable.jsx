import { useEffect, useRef, useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp, Bell, Clock, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const WaiterTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { url } = useUrl();
    const [list, setList] = useState([]);
    const [newRequests, setNewRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState("pending"); // "all", "pending", "completed"
    const audioRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState(null);
    const filtersRef = useRef(null);
    const [isUpdating, setIsUpdating] = useState({}); // Track which requests are being updated

    // Paginare
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Detect window width and handle clicks outside filters
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setShowFilters(false);
            }
        };
        
        const handleClickOutside = (event) => {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchList = async () => {
        try {
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);

            if (response.data.success) {
                const newList = response.data.data;
                
                // Only update if the list has actually changed (ignore periodic refreshes)
                if (JSON.stringify(newList) !== JSON.stringify(list)) {
                    const pendingRequests = newList.filter(item => item.status === 'Pending');

                    // Obține cererile noi - exclude cele care sunt în curs de actualizare
                    const newlyAddedRequests = pendingRequests.filter(item => 
                        !list.some(existingItem => existingItem._id === item._id) &&
                        !isUpdating[item._id]
                    );
                    
                    if (newlyAddedRequests.length > 0) {
                        setNewRequests(prev => [...prev, ...newlyAddedRequests]);

                        // Play sound only if there are new requests
                        // if (audioRef.current) {
                        //     try {
                        //         audioRef.current.play().catch(error => {
                        //             console.log('Sound play blocked by browser:', error);
                        //         });
                        //         toast.info(`${newlyAddedRequests.length} new waiter request${newlyAddedRequests.length > 1 ? 's' : ''} received!`, {
                        //             theme: "dark",
                        //             autoClose: 3000
                        //         });
                        //     } catch (error) {
                        //         console.log('Audio error:', error);
                        //     }
                        // }
                    }

                    setList(newList);
                    applyFilters(searchTerm, statusFilter, newList);
                }
            } else {
                toast.error("Error fetching requests", { theme: "dark" });
            }
        } catch (error) {
            console.error("Fetch error:", error);
            if (!error.response || error.response.status !== 401) {
                toast.error("Network error", { theme: "dark" });
            }
        }
    };

    useEffect(() => {
        fetchList();
        const intervalId = setInterval(() => {
            fetchList();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const applyFilters = (term, filterType, data) => {
        if (!data) return;
        
        let filtered = data;
        
        // Apply search filter
        if (term) {
            filtered = filtered.filter((request) => {
                return (
                    request.tableNo?.toString().toLowerCase().includes(term) || 
                    request.action?.toLowerCase().includes(term)
                );
            });
        }
        
        // Apply status filter
        if (filterType === "pending") {
            filtered = filtered.filter(item => item.status === 'Pending');
        } else if (filterType === "completed") {
            filtered = filtered.filter(item => item.status === 'Completed');
        }
        // "all" - no status filter
        
        setFilteredRequests(filtered);
    };

    useEffect(() => {
        applyFilters(searchTerm, statusFilter, list);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, list]);

    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value;
        
        try {
            // Mark as updating
            setIsUpdating(prev => ({ ...prev, [orderId]: true }));
            
            // Remove from new requests immediately
            setNewRequests(prev => prev.filter(req => req._id !== orderId));
            
            // Collapse if expanded
            setExpandedRequest(null);

            // Update UI immediately for better UX
            const updatedList = list.map(item => 
                item._id === orderId ? { ...item, status: newStatus } : item
            );
            setList(updatedList);

            // Send request to server
            const response = await axios.post(url + "/api/waiterorders/status", {
                orderId,
                status: newStatus
            });

            if (response.data.success) {
                toast.success(`Request marked as ${newStatus.toLowerCase()}`, { theme: "dark" });
                
                // Force a refresh after successful update to get fresh data
                setTimeout(() => {
                    fetchList();
                }, 100);
            } else {
                toast.error("Failed to update status", { theme: "dark" });
                // Revert if failed
                fetchList();
            }
        } catch (error) {
            toast.error("Network error", { theme: "dark" });
            // Revert if error
            fetchList();
        } finally {
            // Clear updating flag after a delay
            setTimeout(() => {
                setIsUpdating(prev => {
                    const newState = { ...prev };
                    delete newState[orderId];
                    return newState;
                });
            }, 2000);
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

    const formatTimeAgo = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) !== 1 ? 's' : ''} ago`;
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    };

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
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Mobile Request Card
    const MobileRequestCard = ({ item }) => {
        const isNew = newRequests.some(newRequest => newRequest._id === item._id) && !isUpdating[item._id];
        const timeAgo = formatTimeAgo(item.createdOn);
        const isBeingUpdated = isUpdating[item._id];
        
        return (
            <div
                className={`bg-gray-800 border rounded-xl p-4 mb-3 transition-all duration-300 ${
                    isNew && !isBeingUpdated ? 'border-l-4 border-green-500 bg-green-900 bg-opacity-10' :
                    item.status === 'Completed' ? 'border-gray-700 opacity-75' :
                    isBeingUpdated ? 'border-blue-500 bg-blue-900 bg-opacity-10' :
                    'border-gray-700'
                }`}
            >
                <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => !isBeingUpdated && setExpandedRequest(expandedRequest === item._id ? null : item._id)}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`
                            h-10 w-10 rounded-lg border-2 flex items-center justify-center text-white font-bold transition-all duration-300
                            ${isNew && !isBeingUpdated ? 'bg-green-600 border-green-500' :
                              item.status === 'Completed' ? 'bg-gray-600 border-gray-500' :
                              isBeingUpdated ? 'bg-blue-600 border-blue-500 animate-pulse' :
                              'bg-blue-600 border-blue-500'}
                        `}>
                            {item.tableNo}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-100">Table {item.tableNo}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{timeAgo}</span>
                                {isNew && !isBeingUpdated && (
                                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                        New
                                    </span>
                                )}
                                {item.status === 'Completed' && (
                                    <span className="px-2 py-0.5 bg-green-800 text-green-200 text-xs rounded-full">
                                        Completed
                                    </span>
                                )}
                                {isBeingUpdated && (
                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full animate-pulse">
                                        Updating...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        {!isBeingUpdated && (expandedRequest === item._id ? 
                            <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                </div>

                {expandedRequest === item._id && !isBeingUpdated && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                        <div className="bg-gray-900 p-3 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Request</div>
                            <div className="text-sm text-gray-100 font-medium">{item.action}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-900 p-2 rounded">
                                <div className="text-xs text-gray-400">Created</div>
                                <div className="text-sm text-white">
                                    {formatDateTime(item.createdOn)}
                                </div>
                            </div>
                            <div className="bg-gray-900 p-2 rounded">
                                <div className="text-xs text-gray-400">Status</div>
                                <div className={`text-sm font-medium ${
                                    item.status === 'Pending' ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                    {item.status}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {item.status === 'Pending' ? (
                                <button
                                    onClick={(e) => statusHandler(e, item._id)}
                                    value="Completed"
                                    disabled={isBeingUpdated}
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Complete
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => statusHandler(e, item._id)}
                                    value="Pending"
                                    disabled={isBeingUpdated}
                                    className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Clock className="w-4 h-4" />
                                    Reopen
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Mobile Filters
    const MobileFilters = () => (
        <>
            {showFilters && (
                <div
                    ref={filtersRef}
                    className="md:hidden bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4"
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                                aria-label="Close filters"
                            >
                                <XCircle className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Status</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setStatusFilter("pending");
                                        setShowFilters(false);
                                    }}
                                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                                        statusFilter === "pending" 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter("completed");
                                        setShowFilters(false);
                                    }}
                                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                                        statusFilter === "completed" 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    Completed
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter("all");
                                        setShowFilters(false);
                                    }}
                                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                                        statusFilter === "all" 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // Mobile Stats Cards
    const MobileStatsCards = () => (
        <div className="md:hidden mb-4">
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-400">Pending</div>
                            <div className="text-lg font-bold text-yellow-400">
                                {list.filter(r => r.status === 'Pending').length}
                            </div>
                        </div>
                        <Bell className="w-6 h-6 text-yellow-500" />
                    </div>
                </div>
                
                <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-400">New</div>
                            <div className="text-lg font-bold text-green-400">
                                {newRequests.length}
                            </div>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                </div>
                
                <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-400">Completed</div>
                            <div className="text-lg font-bold text-gray-400">
                                {list.filter(r => r.status === 'Completed').length}
                            </div>
                        </div>
                        <XCircle className="w-6 h-6 text-gray-500" />
                    </div>
                </div>
                
                <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-400">Updating</div>
                            <div className="text-lg font-bold text-blue-400">
                                {Object.keys(isUpdating).length}
                            </div>
                        </div>
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Audio element for notifications */}
            <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />
            
            <div
                className='bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-3 md:p-6 border border-gray-700 mb-8'
            >
                {/* Mobile Header */}
                <div className="md:hidden mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-100">Waiter Requests</h2>
                            <p className="text-xs text-gray-400">
                                {list.filter(r => r.status === 'Pending').length} pending • {newRequests.length} new
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                aria-label={showFilters ? "Hide filters" : "Show filters"}
                            >
                                <Filter size={20} className="text-gray-300" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="relative mb-3">
                        <input
                            type='text'
                            placeholder='Search requests...'
                            className='w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                    </div>

                    {/* Status filter buttons for mobile */}
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setStatusFilter("pending")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                                statusFilter === "pending" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setStatusFilter("completed")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                                statusFilter === "completed" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                                statusFilter === "all" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            All
                        </button>
                    </div>

                    {/* Mobile Stats */}
                    <MobileStatsCards />

                    {/* Mobile Filters */}
                    <MobileFilters />
                </div>

                {/* Desktop Header */}
                <div className='hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4'>
                    <div>
                        <h2 className='text-xl font-semibold text-gray-100'>Waiter Requests</h2>
                        <p className='text-sm text-gray-400 mt-1'>
                            {list.filter(r => r.status === 'Pending').length} pending requests • 
                            <span className='text-green-400 ml-2'>{newRequests.length} new</span>
                            {Object.keys(isUpdating).length > 0 && (
                                <span className='text-blue-400 ml-2'>• {Object.keys(isUpdating).length} updating</span>
                            )}
                        </p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-900 bg-opacity-50 p-1 rounded-lg">
                            <button
                                onClick={() => setStatusFilter("pending")}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    statusFilter === "pending" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setStatusFilter("completed")}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    statusFilter === "completed" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    statusFilter === "all" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                All
                            </button>
                        </div>
                        
                        <div className='relative'>
                            <input
                                type='text'
                                placeholder='Search requests...'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64'
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                        </div>
                    </div>
                </div>

                {/* Desktop Stats */}
                <div className='hidden md:grid grid-cols-4 gap-4 mb-6'>
                    <div className='bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <div className='text-sm text-gray-400'>Pending Requests</div>
                                <div className='text-2xl font-bold text-yellow-400'>
                                    {list.filter(r => r.status === 'Pending').length}
                                </div>
                            </div>
                            <Bell className='w-8 h-8 text-yellow-500' />
                        </div>
                    </div>
                    
                    <div className='bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <div className='text-sm text-gray-400'>New Requests</div>
                                <div className='text-2xl font-bold text-green-400'>
                                    {newRequests.length}
                                </div>
                            </div>
                            <CheckCircle className='w-8 h-8 text-green-500' />
                        </div>
                    </div>
                    
                    <div className='bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <div className='text-sm text-gray-400'>Completed</div>
                                <div className='text-2xl font-bold text-gray-400'>
                                    {list.filter(r => r.status === 'Completed').length}
                                </div>
                            </div>
                            <XCircle className='w-8 h-8 text-gray-500' />
                        </div>
                    </div>
                    
                    <div className='bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <div className='text-sm text-gray-400'>Updating</div>
                                <div className='text-2xl font-bold text-blue-400'>
                                    {Object.keys(isUpdating).length}
                                </div>
                            </div>
                            <Clock className='w-8 h-8 text-blue-500' />
                        </div>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {statusFilter === "pending" 
                                    ? "No pending requests" 
                                    : statusFilter === "completed" 
                                    ? "No completed requests" 
                                    : "No requests found"}
                            </div>
                            <div className="text-sm text-gray-500">
                                {statusFilter === "pending" 
                                    ? "All waiter requests have been completed" 
                                    : "Try changing your search or filters"}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {currentRequests.map((item) => (
                                <MobileRequestCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop View */}
                <div className='hidden md:block'>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-700'>
                            <thead>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Table no.</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Action</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created On</th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                                </tr>
                            </thead>

                            <tbody className='divide-y divide-gray-700'>
                                {currentRequests.map((item) => {
                                    const isNew = newRequests.some(newRequest => newRequest._id === item._id) && !isUpdating[item._id];
                                    const isBeingUpdated = isUpdating[item._id];
                                    
                                    return (
                                        <tr
                                            key={item._id}
                                            className={`
                                                ${isNew && !isBeingUpdated ? 'bg-green-900 bg-opacity-10' : ''} 
                                                ${item.status === 'Completed' ? 'opacity-75' : ''}
                                                ${isBeingUpdated ? 'bg-blue-900 bg-opacity-10' : ''}
                                            `}
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center'>
                                                    <div className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                                                        isNew && !isBeingUpdated 
                                                            ? 'bg-green-600 border-green-500' 
                                                            : item.status === 'Completed'
                                                            ? 'bg-gray-600 border-gray-500'
                                                            : isBeingUpdated
                                                            ? 'bg-blue-600 border-blue-500'
                                                            : 'bg-blue-600 border-blue-500'
                                                    }`}>
                                                        {item.tableNo}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='px-6 py-4'>
                                                <span className='px-4 py-2 inline-flex text-sm font-medium text-gray-100 leading-5 rounded-lg border border-gray-700 bg-gray-800'>
                                                    {item.action}
                                                </span>
                                            </td>

                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.status === 'Pending' 
                                                        ? 'bg-yellow-900 text-yellow-200' 
                                                        : 'bg-green-900 text-green-200'
                                                }`}>
                                                    {item.status}
                                                    {isBeingUpdated && " (Updating...)"}
                                                </span>
                                            </td>

                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='text-sm text-gray-300'>{formatDateTime(item.createdOn)}</div>
                                                <div className='text-xs text-gray-500'>{formatTimeAgo(item.createdOn)}</div>
                                            </td>

                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className="flex gap-2">
                                                    {item.status === 'Pending' ? (
                                                        <button
                                                            onClick={(e) => statusHandler(e, item._id)}
                                                            value="Completed"
                                                            disabled={isBeingUpdated}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {isBeingUpdated ? "Updating..." : "Mark as Complete"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => statusHandler(e, item._id)}
                                                            value="Pending"
                                                            disabled={isBeingUpdated}
                                                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                            {isBeingUpdated ? "Updating..." : "Reopen"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* No requests message */}
                {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            {statusFilter === "pending" 
                                ? "No pending requests" 
                                : statusFilter === "completed" 
                                ? "No completed requests" 
                                : "No requests found"}
                        </div>
                        <div className="text-sm text-gray-500">
                            {statusFilter === "pending" 
                                ? "All waiter requests have been completed" 
                                : "Try changing your search or filters"}
                        </div>
                    </div>
                )}

                {/* Paginare */}
                {filteredRequests.length > 0 && (
                    <div className='flex flex-col md:flex-row justify-between items-center mt-6 gap-4'>
                        <div className='text-gray-300 text-sm'>
                            Showing {indexOfFirstRequest + 1}-{Math.min(indexOfLastRequest, filteredRequests.length)} of {filteredRequests.length} requests
                            {statusFilter !== "all" && ` (${statusFilter})`}
                        </div>
                        <div className='flex items-center gap-1'>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg text-sm ${
                                    currentPage === 1
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                ←
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const pageNum = index + 1;
                                if (totalPages <= 5) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                
                                // Logic for ellipsis on large page counts
                                if (pageNum === 1 || pageNum === totalPages || 
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                
                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                                }
                                
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg text-sm ${
                                    currentPage === totalPages
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default WaiterTable;