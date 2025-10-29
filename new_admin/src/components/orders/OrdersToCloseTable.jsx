import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
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

  const navigate = useNavigate();
  const { url } = useUrl();
  const ordersPerPage = 10;

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

        // Filtrare pentru a exclude comenzile fără orderNumber sau tableNo
        const filteredOrders = orders.filter(
          (order) => order.orderNumber && order.tableNo
        );

        // Combine orders with corresponding users
        const combined = filteredOrders.map((order) => {
          const user = users.find((u) => u._id === order.userId);
          return {
            ...order,
            user,
          };
        });

        // Sort orders by orderNumber in descending order
        const sortedCombined = combined.sort(
          (a, b) => b.orderNumber - a.orderNumber
        );

        setCombinedOrders(sortedCombined);
        // Apelarea lui getUniqueUsers aici
        const uniqueUsers = getUniqueUsers(sortedCombined);
        setFilteredOrders(uniqueUsers);
      } else {
        console.error("Failed to fetch data.");
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

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
  };

  // Function to apply all filters
  const applyFilters = (globalSearch, columnFilters) => {
    let filtered = getUniqueUsers(combinedOrders);

    // Global search
    if (globalSearch) {
      filtered = filtered.filter((userOrder) => {
        const tableNo = userOrder.tableNo ? String(userOrder.tableNo) : "";
        const paymentMethod = userOrder.paymentMethod ? String(userOrder.paymentMethod) : "";
        const status = userOrder.status ? String(userOrder.status) : "";
        const date = userOrder.date ? new Date(userOrder.date).toLocaleDateString("ro-RO") : "";
        const tableStatus = userOrder.user?.isActive ? "in service" : "closed";

        return (
          tableNo.toLowerCase().includes(globalSearch) ||
          paymentMethod.toLowerCase().includes(globalSearch) ||
          status.toLowerCase().includes(globalSearch) ||
          date.includes(globalSearch) ||
          tableStatus.includes(globalSearch)
        );
      });
    }

    // Column filters
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
      filtered = filtered.filter(userOrder => 
        new Date(userOrder.date).toLocaleDateString("ro-RO").includes(columnFilters.date)
      );
    }

    if (columnFilters.tableStatus) {
      filtered = filtered.filter(userOrder => {
        const tableStatus = userOrder.user?.isActive ? "in service" : "closed";
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
    const uniqueUsers = getUniqueUsers(combinedOrders);
    setFilteredOrders(uniqueUsers);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Get CSS class for status
  const getStatusClass = (isActive) => {
    if (isActive === true) {
      return "bg-green-500";
    } else if (isActive === false) {
      return "bg-red-500";
    } else {
      return "bg-gray-500";
    }
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
        userMap.get(order.userId).orderCount++;
      }
    });

    return Array.from(userMap.values());
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
        toast.success("User status updated successfully.", { theme: "dark" });
        fetchData();
      } else {
        toast.error("Failed to update user status.", { theme: "dark" });
      }
    } catch (error) {
      toast.error("Error updating user status.", { theme: "dark" });
    }
  };

  const handleAllPaymentStatusChange = async (
    paymentStatus,
    userId,
    newIsActiveStatus
  ) => {
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
      } else {
        toast.error("Failed to update payment status for some orders.", {
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error("Error updating payment status.", { theme: "dark" });
    }
  };

  // Handle updating payment status
  const handlePaymentStatusChange = async (orderId, paymentStatus) => {
    try {
      const response = await axios.post(`${url}/api/order/payment-status`, {
        orderId: orderId,
        payment: paymentStatus,
      });

      if (response.data.success) {
        setRelatedOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, payment: paymentStatus } : order
          )
        );
        toast.success("Payment status updated successfully.", {
          theme: "dark",
        });
        fetchData();
      } else {
        toast.error("Failed to update payment status.", { theme: "dark" });
      }
    } catch (error) {
      toast.error("Error updating payment status.", { theme: "dark" });
    }
  };

  // Function to handle opening the modal and setting the selected order items
  const handleCheckOrderClick = (userOrder) => {
    console.log("User order object:", userOrder);

    setSelectedUserId(userOrder.userId);
    setSelectedTableNo(userOrder.tableNo);

    if (userOrder.user && userOrder.user.token) {
      setSelectedToken(userOrder.user.token);
      console.log("Token set from user object:", userOrder.user.token);
    } else {
      const fallbackToken = localStorage.getItem("token");
      setSelectedToken(fallbackToken);
      console.log("Using fallback token from localStorage:", fallbackToken);
    }

    const ordersForUser = combinedOrders.filter(
      (order) => order.userId === userOrder.userId
    );
    setRelatedOrders(ordersForUser);
    setIsModalOpen(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderItems(null);
  };

  // Pagination logic
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentUsers = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Active Orders</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search all orders..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Reset filters button */}
      {(searchTerm || Object.values(columnFilters).some(filter => filter !== "")) && (
        <div className="mb-4">
          <button
            onClick={resetFilters}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Payment Method</div>
                  <input
                    type="text"
                    placeholder="Filter method..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.paymentMethod}
                    onChange={(e) => handleColumnFilter('paymentMethod', e.target.value)}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Date</div>
                  <input
                    type="text"
                    placeholder="Filter date..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.date}
                    onChange={(e) => handleColumnFilter('date', e.target.value)}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Table status</div>
                  <input
                    type="text"
                    placeholder="Type 'in service' or 'closed'"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.tableStatus}
                    onChange={(e) => handleColumnFilter('tableStatus', e.target.value)}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Items
              </th>
            </tr>
          </thead>

          <tbody className="divide divide-gray-700">
            {currentUsers.map((userOrder) => (
              <motion.tr
                key={userOrder._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  <div className="h-10 w-10 rounded-lg border-2 border-gray-700 flex items-center justify-center text-white font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none">
                    {userOrder.tableNo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {userOrder.paymentMethod || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {userOrder.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {new Date(userOrder.date).toLocaleDateString("ro-RO")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {userOrder.user?.isActive ? (
                    <span className="text-green-500">In service</span>
                  ) : (
                    <span className="text-red-500">Closed</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    onClick={() => handleCheckOrderClick(userOrder)}
                  >
                    Close order
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* No results message */}
        {currentUsers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No orders found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal for related orders */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg p-6 relative max-w-6xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Related Orders for Table {selectedTableNo}
            </h2>
            <table className="min-w-full divide-y divide-gray-700 mb-10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Instructions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Is paid?
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide divide-gray-700">
                {relatedOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order.orderNumber || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={index}>
                            {item.name} x {item.quantity}
                          </div>
                        ))
                      ) : (
                        <p>No items</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order.specialInstructions || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order.paymentMethod || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order.payment ? (
                        <span className="text-green-500">Successful</span>
                      ) : (
                        <span className="text-red-500">Not paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order.status || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(order.date).toLocaleDateString("ro-RO") ||
                        "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="absolute top-4 right-4 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 border-2 border-red-500"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
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
            <div className="flex justify-center mt-4 gap-x-[10px]">
              <button
                className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
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
                className="bg-green-600 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-green-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                onClick={() =>
                  handleAllPaymentStatusChange(true, selectedUserId, false)
                }
              >
                Order completed
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersToCloseTable;