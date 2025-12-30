import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Grid, Table, Clock, Users, AlertCircle, CheckCircle, XCircle, DollarSign, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import { useNavigate } from "react-router-dom";

const OrdersToCloseTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState({
    tableNo: "",
    paymentMethod: "",
    status: "",
    date: "",
    tableStatus: ""
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [combinedOrders, setCombinedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [relatedOrders, setRelatedOrders] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedTableNo, setSelectedTableNo] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [viewMode, setViewMode] = useState("map");
  const [tableTimers, setTableTimers] = useState({});
  const [urgentTables, setUrgentTables] = useState([]);
  const [tableTotals, setTableTotals] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedTable, setExpandedTable] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigate = useNavigate();
  const { url } = useUrl();
  const ordersPerPage = 10;
  const filtersRef = useRef(null);

  // Layout configuration for tables - Mobile version has 3 columns
  const tableLayoutMobile = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
    [19, 20]
  ];

  const tableLayoutDesktop = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20]
  ];

  // Detect window width and handle clicks outside filters
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close mobile filters when switching to desktop
      if (window.innerWidth >= 768) {
        setShowMobileFilters(false);
      }
    };
    
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowMobileFilters(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch orders and users from the API
  const fetchData = async () => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        axios.get(`${url}/api/order/list`),
        axios.get(`${url}/api/user/list`),
      ]);

      if (ordersResponse.data.success && usersResponse.data.success) {
        let orders = ordersResponse.data.data;
        const users = usersResponse.data.users;

        const filteredOrders = orders.filter(
          (order) => order.orderNumber && order.tableNo
        );

        const combined = filteredOrders.map((order) => {
          const user = users.find((u) => u._id === order.userId);
          return {
            ...order,
            user,
          };
        });

        const sortedCombined = combined.sort(
          (a, b) => b.orderNumber - a.orderNumber
        );

        setCombinedOrders(sortedCombined);
        
        const activeUsersOrders = sortedCombined.filter(
          (order) => order.user?.isActive === true
        );
        const uniqueUsers = getUniqueUsers(activeUsersOrders);
        
        const totals = {};
        const timers = {};
        const urgent = [];
        
        uniqueUsers.forEach((userOrder) => {
          const userOrders = sortedCombined.filter(
            (order) => order.userId === userOrder.userId
          );
          
          let totalAmount = 0;
          userOrders.forEach((order) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                totalAmount += price * quantity;
              });
            }
          });
          
          totals[userOrder.tableNo] = totalAmount.toFixed(2);
          
          if (userOrder.user?.tokenExpiry) {
            const expiryTime = new Date(userOrder.user.tokenExpiry).getTime();
            const now = new Date().getTime();
            const timeLeft = expiryTime - now;
            
            timers[userOrder.tableNo] = {
              expiryTime,
              timeLeft,
              formatted: formatTimeLeft(timeLeft)
            };
            
            if (timeLeft > 0 && timeLeft < 15 * 60 * 1000) {
              urgent.push(userOrder.tableNo);
            }
          }
        });
        
        const usersWithTotals = uniqueUsers.map(userOrder => ({
          ...userOrder,
          totalAmount: totals[userOrder.tableNo] || "0.00"
        }));
        
        setFilteredOrders(usersWithTotals);
        setTableTimers(timers);
        setUrgentTables(urgent);
        setTableTotals(totals);
      } else {
        console.error("Failed to fetch data.");
        setFilteredOrders([]);
        setTableTimers({});
        setUrgentTables([]);
        setTableTotals({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Update timers every second
  useEffect(() => {
    fetchData();
    const dataIntervalId = setInterval(() => {
      fetchData();
    }, 5000);

    const timerIntervalId = setInterval(() => {
      updateTimers();
    }, 1000);

    return () => {
      clearInterval(dataIntervalId);
      clearInterval(timerIntervalId);
    };
  }, []);

  // Update timers function
  const updateTimers = () => {
    const updatedTimers = { ...tableTimers };
    const updatedUrgent = [];
    let hasChanges = false;

    Object.keys(updatedTimers).forEach(tableNo => {
      const timer = updatedTimers[tableNo];
      const now = new Date().getTime();
      const timeLeft = timer.expiryTime - now;
      
      if (timeLeft !== timer.timeLeft) {
        hasChanges = true;
        updatedTimers[tableNo] = {
          ...timer,
          timeLeft,
          formatted: formatTimeLeft(timeLeft)
        };
        
        if (timeLeft > 0 && timeLeft < 15 * 60 * 1000) {
          updatedUrgent.push(tableNo);
        }
      }
    });

    if (hasChanges) {
      setTableTimers(updatedTimers);
      setUrgentTables(updatedUrgent);
    }
  };

  // Format time left
  const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return "Expired";
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Get timer color based on time left
  const getTimerColor = (timeLeft) => {
    if (timeLeft <= 0) return "text-red-500";
    if (timeLeft < 5 * 60 * 1000) return "text-red-400 animate-pulse";
    if (timeLeft < 15 * 60 * 1000) return "text-yellow-400";
    return "text-green-400";
  };

  // Handle Global Search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, columnFilters);
  };

  // Handle Column Filtering
  const handleColumnFilter = (column, value) => {
    const newFilters = {
      ...columnFilters,
      [column]: value.toLowerCase()
    };
    setColumnFilters(newFilters);
    applyFilters(searchTerm, newFilters);
    
    // On mobile, close filters after applying (optional)
    if (isMobile && column !== "tableNo") {
      setTimeout(() => setShowMobileFilters(false), 300);
    }
  };

  // Function to apply all filters
  const applyFilters = (globalSearch, columnFilters) => {
    let filtered = getUniqueUsers(
      combinedOrders.filter(order => order.user?.isActive === true)
    );

    const totals = {};
    filtered.forEach((userOrder) => {
      const userOrders = combinedOrders.filter(
        (order) => order.userId === userOrder.userId
      );
      
      let totalAmount = 0;
      userOrders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            totalAmount += price * quantity;
          });
        }
      });
      
      totals[userOrder.tableNo] = totalAmount.toFixed(2);
      userOrder.totalAmount = totals[userOrder.tableNo];
    });

    if (globalSearch) {
      filtered = filtered.filter((userOrder) => {
        const tableNo = userOrder.tableNo ? String(userOrder.tableNo) : "";
        const paymentMethod = userOrder.paymentMethod ? String(userOrder.paymentMethod) : "";
        const status = userOrder.status ? String(userOrder.status) : "";
        const date = userOrder.date ? new Date(userOrder.date).toLocaleDateString("ro-RO") : "";
        const total = userOrder.totalAmount || "0.00";
        const tableStatus = "in service";

        return (
          tableNo.toLowerCase().includes(globalSearch) ||
          paymentMethod.toLowerCase().includes(globalSearch) ||
          status.toLowerCase().includes(globalSearch) ||
          date.includes(globalSearch) ||
          total.includes(globalSearch) ||
          tableStatus.includes(globalSearch)
        );
      });
    }

    if (columnFilters.tableNo) {
      filtered = filtered.filter(userOrder => 
        userOrder.tableNo?.toString().toLowerCase().includes(columnFilters.tableNo)
      );
    }

    if (columnFilters.paymentMethod) {
      filtered = filtered.filter(userOrder => 
        userOrder.paymentMethod?.toLowerCase().includes(columnFilters.paymentMethod)
      );
    }

    if (columnFilters.status) {
      filtered = filtered.filter(userOrder => 
        userOrder.status?.toLowerCase().includes(columnFilters.status)
      );
    }

    if (columnFilters.date) {
      filtered = filtered.filter(userOrder => {
        if (columnFilters.date === "urgent") {
          return urgentTables.includes(userOrder.tableNo);
        } else if (columnFilters.date === "expired") {
          const timer = tableTimers[userOrder.tableNo];
          return timer?.timeLeft <= 0;
        }
        return new Date(userOrder.date).toLocaleDateString("ro-RO").includes(columnFilters.date);
      });
    }

    if (columnFilters.tableStatus) {
      filtered = filtered.filter(userOrder => {
        const tableStatus = "in service";
        return tableStatus.includes(columnFilters.tableStatus);
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setColumnFilters({
      tableNo: "",
      paymentMethod: "",
      status: "",
      date: "",
      tableStatus: ""
    });
    
    const activeUsersOrders = combinedOrders.filter(
      (order) => order.user?.isActive === true
    );
    const uniqueUsers = getUniqueUsers(activeUsersOrders);
    
    const totals = {};
    uniqueUsers.forEach((userOrder) => {
      const userOrders = combinedOrders.filter(
        (order) => order.userId === userOrder.userId
      );
      
      let totalAmount = 0;
      userOrders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            totalAmount += price * quantity;
          });
        }
      });
      
      totals[userOrder.tableNo] = totalAmount.toFixed(2);
      userOrder.totalAmount = totals[userOrder.tableNo];
    });
    
    setFilteredOrders(uniqueUsers);
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  // Function to get unique users based on orders
  const getUniqueUsers = (orders) => {
    const userMap = new Map();

    orders.forEach((order) => {
      if (order.userId && !userMap.has(order.userId)) {
        userMap.set(order.userId, {
          ...order,
          orderCount: 1,
        });
      } else if (userMap.has(order.userId)) {
        const existingOrder = userMap.get(order.userId);
        existingOrder.orderCount++;
      }
    });

    return Array.from(userMap.values());
  };

  // Check if a table is active
  const isTableActive = (tableNumber) => {
    const tableOrder = filteredOrders.find(order => 
      order.tableNo === tableNumber
    );
    return !!tableOrder;
  };

  // Get table details for a specific table
  const getTableDetails = (tableNumber) => {
    return filteredOrders.find(order => 
      order.tableNo === tableNumber
    );
  };

  // Handle table click
  const handleTableClick = (tableNumber) => {
    const tableDetails = getTableDetails(tableNumber);
    if (tableDetails) {
      handleCheckOrderClick(tableDetails);
    }
  };

  // Function to handle opening the modal and setting the selected order items
  const handleCheckOrderClick = (userOrder) => {
    setSelectedUserId(userOrder.userId);
    setSelectedTableNo(userOrder.tableNo);

    if (userOrder.user && userOrder.user.token) {
      setSelectedToken(userOrder.user.token);
    } else {
      const fallbackToken = localStorage.getItem("token");
      setSelectedToken(fallbackToken);
    }

    const ordersForUser = combinedOrders.filter(
      (order) => order.userId === userOrder.userId
    );
    setRelatedOrders(ordersForUser);
    setIsModalOpen(true);
  };

  // Calculate total for related orders in modal
  const calculateModalTotal = () => {
    let total = 0;
    relatedOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 1;
          total += price * quantity;
        });
      }
    });
    return total.toFixed(2);
  };

  // Handle updating isActive status
  const handleIsActiveChange = async (userId, newStatus) => {
    try {
      const response = await axios.put(
        `${url}/api/user/update-status/${userId}`,
        {
          isActive: newStatus,
        }
      );

      if (response.data.success) {
        toast.success("Table closed successfully.", { theme: "dark" });
        fetchData();
      } else {
        toast.error("Failed to update table status.", { theme: "dark" });
      }
    } catch (error) {
      toast.error("Error updating table status.", { theme: "dark" });
    }
  };

  const handleAllPaymentStatusChange = async (
    paymentStatus,
    userId,
    newIsActiveStatus
  ) => {
    const unpaidOrders = relatedOrders.filter(order => !order.payment);
    
    if (unpaidOrders.length > 0) {
      setShowConfirmation(true);
      return;
    }

    await processPaymentAndCloseTable(paymentStatus, userId, newIsActiveStatus);
  };

  const processPaymentAndCloseTable = async (paymentStatus, userId, newIsActiveStatus) => {
    const promises = relatedOrders.map((order) =>
      axios.post(`${url}/api/order/payment-status`, {
        orderId: order._id,
        payment: paymentStatus,
      })
    );

    try {
      const results = await Promise.all(promises);
      const success = results.every((result) => result.data.success);

      if (success) {
        toast.success("Payment status updated successfully for all orders.", {
          theme: "dark",
        });

        await handleIsActiveChange(userId, newIsActiveStatus);
        fetchData();
        setRelatedOrders(
          (prevOrders) =>
            prevOrders.map((order) => ({ ...order, payment: paymentStatus }))
        );
        
        setIsModalOpen(false);
        setShowConfirmation(false);
      } else {
        toast.error("Failed to update payment status for some orders.", {
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error("Error updating payment status.", { theme: "dark" });
    }
  };

  const handleConfirmCloseTable = async () => {
    setShowConfirmation(false);
    await processPaymentAndCloseTable(true, selectedUserId, false);
  };

  const handleCancelCloseTable = () => {
    setShowConfirmation(false);
    toast.info("Table closure cancelled.", { theme: "dark" });
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderItems(null);
    setShowConfirmation(false);
  };

  // Mobile Filter Component
  const MobileFilters = () => (
    <AnimatePresence>
      {showMobileFilters && (
        <motion.div
          ref={filtersRef}
          className="md:hidden bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Close filters"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Table Number</label>
              <input
                type="text"
                placeholder="Filter by table..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={columnFilters.tableNo}
                onChange={(e) => handleColumnFilter("tableNo", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Time Status</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={columnFilters.date}
                onChange={(e) => handleColumnFilter('date', e.target.value)}
              >
                <option value="">All Tables</option>
                <option value="urgent">Urgent (&lt;15min)</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Order Status</label>
              <input
                type="text"
                placeholder="Filter status..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={columnFilters.status}
                onChange={(e) => handleColumnFilter('status', e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Mobile Table Card
  const MobileTableCard = ({ tableNumber }) => {
    const isActive = isTableActive(tableNumber);
    const tableDetails = getTableDetails(tableNumber);
    const timer = tableTimers[tableNumber];
    const isUrgent = urgentTables.includes(tableNumber);
    const isExpired = timer?.timeLeft <= 0;
    const isCritical = timer?.timeLeft > 0 && timer?.timeLeft < 5 * 60 * 1000;
    const totalAmount = tableDetails?.totalAmount || "0.00";
    
    if (!isActive) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800 border rounded-xl p-3 mb-2 ${
          isExpired ? 'border-red-500 bg-red-900 bg-opacity-10' :
          isCritical ? 'border-red-500 bg-red-900 bg-opacity-10 animate-pulse' :
          isUrgent ? 'border-yellow-500 bg-yellow-900 bg-opacity-10' :
          'border-gray-700'
        }`}
      >
        <div 
          className="flex justify-between items-start cursor-pointer"
          onClick={() => setExpandedTable(expandedTable === tableNumber ? null : tableNumber)}
        >
          <div className="flex items-center space-x-3">
            <div className={`
              h-10 w-10 rounded-lg border-2 flex items-center justify-center text-white font-bold
              ${isExpired ? 'bg-red-600 border-red-500' :
                isCritical ? 'bg-red-600 border-red-500' :
                isUrgent ? 'bg-yellow-600 border-yellow-500' :
                'bg-green-600 border-green-500'}
            `}>
              {tableNumber}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-100">Table {tableNumber}</div>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="w-3 h-3 text-green-400" />
                <span className="text-sm text-green-300 font-bold">${totalAmount}</span>
                <span className="text-gray-500">•</span>
                <div className={`flex items-center gap-1 text-xs ${getTimerColor(timer?.timeLeft)}`}>
                  <Clock className="w-3 h-3" />
                  <span>{timer?.formatted || "Active"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {tableDetails?.orderCount || 1}
              </span>
            </div>
            {expandedTable === tableNumber ? 
              <ChevronUp className="w-4 h-4 text-gray-400 mt-1" /> : 
              <ChevronDown className="w-4 h-4 text-gray-400 mt-1" />
            }
          </div>
        </div>

        {expandedTable === tableNumber && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-gray-700 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{tableDetails?.orderCount || 1} orders</span>
              </div>
              <div className="flex items-center gap-2">
                {(isUrgent || isCritical || isExpired) && (
                  <AlertCircle className={`w-4 h-4 ${
                    isExpired ? 'text-red-500' :
                    isCritical ? 'text-red-500 animate-pulse' :
                    'text-yellow-500'
                  }`} />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-xs text-gray-400">Last Order</div>
                <div className="text-sm text-white">
                  {tableDetails?.date ? new Date(tableDetails.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <div className="text-xs text-gray-400">Status</div>
                <div className="text-sm text-white">{tableDetails?.status || "Active"}</div>
              </div>
            </div>
            
            <button
              onClick={() => handleCheckOrderClick(tableDetails)}
              className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Manage Table
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Mobile Summary Cards
  const MobileSummaryCards = () => (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Active Tables</div>
              <div className="text-lg font-bold text-green-400">
                {filteredOrders.length}
              </div>
            </div>
            <Users className="w-6 h-6 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Urgent</div>
              <div className="text-lg font-bold text-yellow-400">
                {urgentTables.length}
              </div>
            </div>
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Revenue</div>
              <div className="text-lg font-bold text-blue-400">
                ${filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}
              </div>
            </div>
            <DollarSign className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Available</div>
              <div className="text-lg font-bold text-gray-400">
                {20 - filteredOrders.length}
              </div>
            </div>
            <XCircle className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Map View
  const renderMobileMapView = () => (
    <div className="md:hidden">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-300">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-300">Urgent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs text-gray-300">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <span className="text-xs text-gray-300">Available</span>
          </div>
        </div>
      </div>

      {/* Tables Grid for Mobile */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Array.from({ length: 20 }, (_, i) => i + 1).map(tableNumber => {
          const isActive = isTableActive(tableNumber);
          const timer = tableTimers[tableNumber];
          const isUrgent = urgentTables.includes(tableNumber);
          const isExpired = timer?.timeLeft <= 0;
          const isCritical = timer?.timeLeft > 0 && timer?.timeLeft < 5 * 60 * 1000;
          
          return (
            <motion.div
              key={tableNumber}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <button
                onClick={() => isActive && handleTableClick(tableNumber)}
                disabled={!isActive}
                className={`
                  w-full aspect-square rounded-lg flex flex-col items-center justify-center
                  border transition-all duration-200
                  ${isExpired ? 'bg-red-600 border-red-500' :
                    isCritical ? 'bg-red-600 border-red-500 animate-pulse' :
                    isUrgent ? 'bg-yellow-600 border-yellow-500' :
                    isActive ? 'bg-green-600 border-green-500' :
                    'bg-gray-700 border-gray-600'}
                  ${isActive ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                <div className="text-lg font-bold text-white mb-1">
                  {tableNumber}
                </div>
                
                {isActive && (
                  <>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {getTableDetails(tableNumber)?.orderCount || 1}
                      </span>
                    </div>
                    <div className="text-[10px] text-white text-center px-1">
                      ${getTableDetails(tableNumber)?.totalAmount || "0.00"}
                    </div>
                  </>
                )}
              </button>
              
              {(isUrgent || isCritical || isExpired) && (
                <div className="absolute -top-2 -right-2">
                  <AlertCircle className={`w-4 h-4 ${
                    isExpired ? 'text-red-500' :
                    isCritical ? 'text-red-500 animate-pulse' :
                    'text-yellow-500'
                  }`} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Active Tables List */}
      {filteredOrders.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Active Tables Details</h3>
          <div className="space-y-2">
            {filteredOrders.map((activeOrder) => (
              <MobileTableCard key={activeOrder._id} tableNumber={activeOrder.tableNo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Table View
  const renderTableView = () => {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentUsers = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="hidden md:table-header-group">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Filter size={14} />
                      Table No.
                    </div>
                    <input
                      type="text"
                      placeholder="Filter table..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={columnFilters.tableNo}
                      onChange={(e) => handleColumnFilter('tableNo', e.target.value)}
                    />
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="space-y-2">
                    <div>Total Amount</div>
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="space-y-2">
                    <div>Time Left</div>
                    <select
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={columnFilters.date}
                      onChange={(e) => handleColumnFilter('date', e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="urgent">Urgent (&lt;15min)</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="space-y-2">
                    <div>Orders</div>
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="space-y-2">
                    <div>Status</div>
                    <input
                      type="text"
                      placeholder="Filter status..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={columnFilters.status}
                      onChange={(e) => handleColumnFilter('status', e.target.value)}
                    />
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide divide-gray-700">
              {currentUsers.map((userOrder) => {
                const timer = tableTimers[userOrder.tableNo];
                const isUrgent = urgentTables.includes(userOrder.tableNo);
                const isExpired = timer?.timeLeft <= 0;
                
                return (
                  <motion.tr
                    key={userOrder._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`border-b ${isUrgent ? 'bg-red-900 bg-opacity-20' : ''} ${isExpired ? 'bg-gray-900 bg-opacity-30' : ''}`}
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 md:h-10 w-8 md:w-10 rounded-lg border-2 flex items-center justify-center text-white font-semibold hover:opacity-90 focus:ring-2 focus:ring-blue-100 focus:outline-none ${
                          isExpired ? 'bg-red-600 border-red-500' :
                          isUrgent ? 'bg-yellow-600 border-yellow-500 animate-pulse' :
                          'bg-green-600 border-green-500'
                        }`}>
                          {userOrder.tableNo}
                        </div>
                        {isUrgent && (
                          <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-yellow-500 animate-pulse" />
                        )}
                        <div className="md:hidden">
                          <div className="text-sm font-medium text-gray-100">Table {userOrder.tableNo}</div>
                          <div className="text-xs text-gray-400">{userOrder.orderCount || 1} orders</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 md:w-4 h-3 md:h-4 text-green-400" />
                        <span className="text-base md:text-lg font-bold text-green-300">
                          ${userOrder.totalAmount || "0.00"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3 md:w-4 h-3 md:h-4 ${getTimerColor(timer?.timeLeft)}`} />
                        <span className={`text-xs md:text-sm font-medium ${getTimerColor(timer?.timeLeft)}`}>
                          {timer?.formatted || "No timer"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-100">
                          {userOrder.orderCount || 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 hidden md:table-cell">
                      {userOrder.status || "Active"}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        className="bg-gray-800 text-white font-semibold rounded-md px-3 md:px-6 py-2 md:py-3 border border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none text-xs md:text-base"
                        onClick={() => handleCheckOrderClick(userOrder)}
                      >
                        {isMobile ? "View" : "Manage"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {currentUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No active tables at the moment.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm ${
                currentPage === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ←
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
        )}
      </>
    );
  };

  // Render Map View for Desktop
  const renderDesktopMapView = () => {
    const currentLayout = isMobile ? tableLayoutMobile : tableLayoutDesktop;

    return (
      <div className="hidden md:block p-4 bg-gray-900 bg-opacity-30 rounded-xl border border-gray-700">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-300">Active (Normal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-300">Urgent (&lt;15min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-gray-300">Expired/Critical (&lt;5min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <span className="text-sm text-gray-300">Available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {currentLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-6">
              {row.map(tableNumber => {
                const isActive = isTableActive(tableNumber);
                const tableDetails = getTableDetails(tableNumber);
                const timer = tableTimers[tableNumber];
                const isUrgent = urgentTables.includes(tableNumber);
                const isExpired = timer?.timeLeft <= 0;
                const isCritical = timer?.timeLeft > 0 && timer?.timeLeft < 5 * 60 * 1000;
                const totalAmount = tableDetails?.totalAmount || "0.00";
                
                let tableColor = "bg-gray-800 border-gray-700";
                let shadowColor = "";
                
                if (isActive) {
                  if (isExpired) {
                    tableColor = "bg-red-600 border-red-500";
                    shadowColor = "shadow-lg shadow-red-500/20";
                  } else if (isCritical) {
                    tableColor = "bg-red-600 border-red-500 animate-pulse";
                    shadowColor = "shadow-lg shadow-red-500/30";
                  } else if (isUrgent) {
                    tableColor = "bg-yellow-600 border-yellow-500";
                    shadowColor = "shadow-lg shadow-yellow-500/20";
                  } else {
                    tableColor = "bg-green-600 border-green-500";
                    shadowColor = "shadow-lg shadow-green-500/20";
                  }
                }
                
                return (
                  <motion.div
                    key={tableNumber}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <button
                      onClick={() => handleTableClick(tableNumber)}
                      disabled={!isActive}
                      className={`
                        w-24 h-24 rounded-xl flex flex-col items-center justify-center
                        border-2 transition-all duration-200 ${tableColor} ${shadowColor}
                        ${isActive ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}
                      `}
                    >
                      <div className="text-2xl font-bold text-white mb-1">
                        {tableNumber}
                      </div>
                      
                      <div className="text-xs text-gray-200 mb-1">
                        {isActive ? (
                          timer?.formatted ? (
                            <div className={`flex items-center gap-1 ${getTimerColor(timer.timeLeft)}`}>
                              <Clock className="w-3 h-3" />
                              <span>{timer.formatted}</span>
                            </div>
                          ) : "Active"
                        ) : "Available"}
                      </div>
                      
                      {isActive && (
                        <>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {tableDetails?.orderCount || 1}
                            </span>
                          </div>
                          <div className="mt-1 text-xs">
                            <div className="text-white font-medium flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{totalAmount}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                    
                    {(isUrgent || isCritical || isExpired) && (
                      <div className="absolute -top-3 -left-3">
                        <AlertCircle className={`w-6 h-6 ${
                          isExpired ? 'text-red-500' :
                          isCritical ? 'text-red-500 animate-pulse' :
                          'text-yellow-500'
                        }`} />
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-1">
                      <div className={`w-4 h-2 ${
                        isExpired ? 'bg-red-700' :
                        isCritical ? 'bg-red-700' :
                        isUrgent ? 'bg-yellow-700' :
                        isActive ? 'bg-green-700' : 'bg-gray-700'
                      } rounded-sm`}></div>
                      <div className={`w-4 h-2 ${
                        isExpired ? 'bg-red-700' :
                        isCritical ? 'bg-red-700' :
                        isUrgent ? 'bg-yellow-700' :
                        isActive ? 'bg-green-700' : 'bg-gray-700'
                      } rounded-sm`}></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredOrders.map((activeOrder) => {
            const timer = tableTimers[activeOrder.tableNo];
            const isUrgent = urgentTables.includes(activeOrder.tableNo);
            const isExpired = timer?.timeLeft <= 0;
            
            return (
              <div 
                key={activeOrder._id} 
                className={`bg-gray-800 p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                  isExpired ? 'border-red-500 bg-red-900 bg-opacity-20' :
                  isUrgent ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' :
                  'border-gray-700 hover:bg-gray-750'
                }`}
                onClick={() => handleCheckOrderClick(activeOrder)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isExpired ? 'bg-red-500' :
                      isUrgent ? 'bg-yellow-500 animate-pulse' :
                      'bg-green-500'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-white">Table {activeOrder.tableNo}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-sm text-green-300 font-bold">
                          ${activeOrder.totalAmount || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getTimerColor(timer?.timeLeft)}`}>
                      {timer?.formatted || "No timer"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activeOrder.date).toLocaleDateString("ro-RO")}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{activeOrder.orderCount || 1} orders</span>
                    </div>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded-lg text-sm transition-colors">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No active tables at the moment</div>
            <div className="text-sm text-gray-500">All tables are available for new customers</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-3 md:p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Mobile Header */}
      <div className="md:hidden mb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Tables</h2>
            <p className="text-xs text-gray-400">
              {filteredOrders.length} active, {urgentTables.length} urgent
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`p-2 rounded-lg transition-colors ${showMobileFilters ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label={showMobileFilters ? "Hide filters" : "Show filters"}
            >
              <Filter size={20} className="text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === "map" ? "table" : "map")}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              aria-label={`Switch to ${viewMode === "map" ? "table" : "map"} view`}
            >
              {viewMode === "map" ? 
                <Table size={20} className="text-gray-300" /> : 
                <Grid size={20} className="text-gray-300" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search tables..."
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        {/* Mobile Summary */}
        <MobileSummaryCards />

        {/* Mobile Filters */}
        <MobileFilters />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Restaurant Tables Map</h2>
          <p className="text-sm text-gray-400 mt-1">
            Showing {filteredOrders.length} active table{filteredOrders.length !== 1 ? 's' : ''}
            {urgentTables.length > 0 && (
              <span className="ml-2 text-yellow-400">
                • {urgentTables.length} urgent table{urgentTables.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 bg-opacity-50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "map" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid size={18} />
                <span>Map View</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "table" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Table size={18} />
                <span>Table View</span>
              </div>
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search tables or amounts..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:block mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Active Tables</div>
                <div className="text-2xl font-bold text-green-400">
                  {filteredOrders.length}
                </div>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Urgent Tables</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {urgentTables.length}
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-400">
                  ${filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0).toFixed(2)}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Available Tables</div>
                <div className="text-2xl font-bold text-gray-400">
                  {20 - filteredOrders.length}
                </div>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {viewMode === "map" ? renderMobileMapView() : renderTableView()}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {viewMode === "map" ? renderDesktopMapView() : renderTableView()}
      </div>

      {/* Modal for related orders */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 md:p-4">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 relative max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h2 className="text-lg font-semibold text-gray-100">
                Orders for Table {selectedTableNo}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-green-900 bg-opacity-30 px-3 py-1 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-bold text-green-300">
                    Total: ${calculateModalTotal()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Timer info */}
            {tableTimers[selectedTableNo] && (
              <div className={`mb-4 p-3 rounded-lg border ${
                tableTimers[selectedTableNo].timeLeft <= 0 ? 'bg-red-900 bg-opacity-30 border-red-500' :
                tableTimers[selectedTableNo].timeLeft < 5 * 60 * 1000 ? 'bg-red-900 bg-opacity-20 border-red-500' :
                tableTimers[selectedTableNo].timeLeft < 15 * 60 * 1000 ? 'bg-yellow-900 bg-opacity-20 border-yellow-500' :
                'bg-green-900 bg-opacity-20 border-green-500'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${getTimerColor(tableTimers[selectedTableNo].timeLeft)}`} />
                    <span className={`font-medium ${getTimerColor(tableTimers[selectedTableNo].timeLeft)}`}>
                      Time remaining: {tableTimers[selectedTableNo].formatted}
                    </span>
                  </div>
                  {urgentTables.includes(selectedTableNo) && (
                    <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />
                  )}
                </div>
              </div>
            )}
            
            {relatedOrders.some(order => !order.payment) && (
              <div className="mb-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  ⚠️ There are {relatedOrders.filter(order => !order.payment).length} unpaid order(s). 
                  Make sure payment is received before closing the table.
                </p>
              </div>
            )}

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Items & Quantity
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Item Price
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide divide-gray-700">
                  {relatedOrders.map((order) => {
                    let orderTotal = 0;
                    if (order.items && Array.isArray(order.items)) {
                      order.items.forEach((item) => {
                        const price = parseFloat(item.price) || 0;
                        const quantity = parseInt(item.quantity) || 1;
                        orderTotal += price * quantity;
                      });
                    }
                    
                    return (
                      <tr key={order._id}>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                          {order.orderNumber || "N/A"}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-300">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{item.name} x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No items</p>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-300">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index}>
                                  ${parseFloat(item.price || 0).toFixed(2)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>-</p>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-green-300">
                          ${orderTotal.toFixed(2)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment 
                              ? 'bg-green-900 text-green-200' 
                              : 'bg-red-900 text-red-200'
                          }`}>
                            {order.payment ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                          {order.status || "Pending"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-900">
                  <tr>
                    <td colSpan="3" className="px-4 md:px-6 py-4 text-right text-sm font-medium text-gray-400">
                      Grand Total:
                    </td>
                    <td className="px-4 md:px-6 py-4 text-lg font-bold text-green-300">
                      ${calculateModalTotal()}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button
              className="absolute top-2 md:top-4 right-2 md:right-4 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-red-700 border border-red-500 transition-colors"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex flex-col md:flex-row justify-center mt-4 gap-2 md:gap-[10px]">
              <button
                className="bg-gray-800 text-white font-semibold rounded-md px-4 py-2 md:px-6 md:py-3 border border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm md:text-base transition-colors"
                onClick={() => {
                  const tokenToUse =
                    selectedToken || localStorage.getItem("token");
                  navigate(
                    `/add-products?tableNo=${selectedTableNo}&userId=${selectedUserId}&token=${tokenToUse}`
                  );
                }}
              >
                Add more products
              </button>
              <button
                className="bg-green-600 text-white font-semibold rounded-md px-4 py-2 md:px-6 md:py-3 border border-gray-700 hover:bg-green-700 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm md:text-base transition-colors"
                onClick={() =>
                  handleAllPaymentStatusChange(true, selectedUserId, false)
                }
              >
                Complete Order & Close Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Table Closure
            </h3>
            <p className="text-gray-300 mb-6 text-sm md:text-base">
              There are {relatedOrders.filter(order => !order.payment).length} unpaid order(s) 
              totaling ${calculateModalTotal()}. 
              Are you sure you want to close the table and mark all orders as paid?
            </p>
            <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={handleCancelCloseTable}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCloseTable}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm md:text-base"
              >
                Yes, Close Table
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersToCloseTable;