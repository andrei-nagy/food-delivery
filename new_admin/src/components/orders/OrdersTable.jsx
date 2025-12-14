import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Clock, DollarSign, CheckCircle, XCircle, Package, Truck, Home, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const OrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState({
    orderNumber: "",
    tableNo: "",
    items: "",
    extras: "",
    specialInstructions: "",
    total: "",
    paymentMethod: "",
    payment: "",
    date: "",
    status: "",
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" sau "table"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "total"
  const [newOrders, setNewOrders] = useState(new Set()); // Track new orders with green border
  const { url } = useUrl();
  const ordersPerPage = viewMode === "grid" ? 12 : 10;

  // Function to fetch orders from the API
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success && Array.isArray(response.data.data)) {
        // Filtrare: Exclude comenzile cu statusul "Delivered"
        const filteredOrders = response.data.data.filter(
          (order) => order.status !== "Delivered"
        );

        // Sortează comenzile rămase în funcție de orderNumber în ordine descrescătoare
        const sortedOrders = filteredOrders.sort((a, b) => {
          const orderNumberA = a.orderNumber ? Number(a.orderNumber) : 0;
          const orderNumberB = b.orderNumber ? Number(b.orderNumber) : 0;
          return orderNumberB - orderNumberA;
        });

        // Identify new orders that are "Food Processing" and not already marked
        const updatedNewOrders = new Set(newOrders);
        
        // Adaugă doar cele mai recente comenzi cu status "Food Processing"
        // (maximum ultimele 10 comenzi pentru a nu marca prea multe)
        const recentProcessingOrders = sortedOrders
          .filter(order => order.status === "Food Processing")
          .slice(0, 10); // Limitează la ultimele 10 pentru a nu marca prea multe
        
        recentProcessingOrders.forEach(order => {
          updatedNewOrders.add(order._id);
        });

        // Elimină comenzile care nu mai sunt "Food Processing"
        updatedNewOrders.forEach(orderId => {
          const order = sortedOrders.find(o => o._id === orderId);
          if (!order || order.status !== "Food Processing") {
            updatedNewOrders.delete(orderId);
          }
        });

        setNewOrders(updatedNewOrders);
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } else {
        console.error(
          "Structura răspunsului nu este așa cum era de așteptat:",
          response.data
        );
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
    return () => clearInterval(intervalId);
  }, []);

  // Function for global search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, columnFilters);
  };

  // Function for column filtering
  const handleColumnFilter = (column, value) => {
    const newFilters = {
      ...columnFilters,
      [column]: value.toLowerCase(),
    };
    setColumnFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  // Function to apply all filters
  const applyFilters = (globalSearch, columnFilters) => {
    let filtered = [...orders];

    // Sortare
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "total":
        filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        break;
    }

    // Global search
    if (globalSearch) {
      filtered = filtered.filter((order) => {
        const orderNumber = order.orderNumber ? String(order.orderNumber) : "";
        const tableNo = order.tableNo ? String(order.tableNo) : "";
        const status = order.status ? String(order.status) : "";
        const date = order.date
          ? new Date(order.date).toLocaleDateString("ro-RO")
          : "";
        const paymentMethod = order.paymentMethod
          ? String(order.paymentMethod)
          : "";
        const paymentStatus = order.payment ? "paid" : "unpaid";
        const itemsText = order.items
          .map((item) => item.name)
          .join(" ")
          .toLowerCase();
        const extrasText = order.items
          .map((item) => item.selectedOptions?.join(", ") || "")
          .join(" ")
          .toLowerCase();
        const instructionsText = (order.specialInstructions || order.items.map(item => item.specialInstructions).filter(Boolean).join(" "))?.toLowerCase() || "";

        return (
          orderNumber.toLowerCase().includes(globalSearch) ||
          tableNo.toLowerCase().includes(globalSearch) ||
          status.toLowerCase().includes(globalSearch) ||
          date.includes(globalSearch) ||
          paymentMethod.toLowerCase().includes(globalSearch) ||
          paymentStatus.includes(globalSearch) ||
          itemsText.includes(globalSearch) ||
          extrasText.includes(globalSearch) ||
          instructionsText.includes(globalSearch)
        );
      });
    }

    // Column filters
    if (columnFilters.orderNumber) {
      filtered = filtered.filter((order) =>
        order.orderNumber
          ?.toString()
          .toLowerCase()
          .includes(columnFilters.orderNumber)
      );
    }

    if (columnFilters.tableNo) {
      filtered = filtered.filter((order) =>
        order.tableNo?.toString().toLowerCase().includes(columnFilters.tableNo)
      );
    }

    if (columnFilters.items) {
      filtered = filtered.filter((order) =>
        order.items.some((item) =>
          item.name.toLowerCase().includes(columnFilters.items)
        )
      );
    }

    if (columnFilters.extras) {
      filtered = filtered.filter((order) =>
        order.items.some((item) =>
          item.selectedOptions?.some((extra) =>
            extra.toLowerCase().includes(columnFilters.extras)
          )
        )
      );
    }

    if (columnFilters.specialInstructions) {
      filtered = filtered.filter((order) => {
        const orderInstructions = order.specialInstructions || "";
        const itemInstructions = order.items.map(item => item.specialInstructions).filter(Boolean).join(" ");
        const allInstructions = (orderInstructions + " " + itemInstructions).toLowerCase();
        return allInstructions.includes(columnFilters.specialInstructions);
      });
    }

    if (columnFilters.total) {
      filtered = filtered.filter((order) =>
        order.amount?.toString().includes(columnFilters.total)
      );
    }

    if (columnFilters.paymentMethod) {
      filtered = filtered.filter((order) =>
        order.paymentMethod?.toLowerCase().includes(columnFilters.paymentMethod)
      );
    }

    if (columnFilters.payment) {
      const paymentFilter = columnFilters.payment;
      filtered = filtered.filter((order) => {
        const paymentStatus = order.payment ? "paid" : "unpaid";
        return paymentStatus.includes(paymentFilter);
      });
    }

    if (columnFilters.date) {
      filtered = filtered.filter((order) =>
        new Date(order.date)
          .toLocaleDateString("ro-RO")
          .includes(columnFilters.date)
      );
    }

    if (columnFilters.status) {
      filtered = filtered.filter((order) =>
        order.status?.toLowerCase().includes(columnFilters.status)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setColumnFilters({
      orderNumber: "",
      tableNo: "",
      items: "",
      extras: "",
      specialInstructions: "",
      total: "",
      paymentMethod: "",
      payment: "",
      date: "",
      status: "",
    });
    setFilteredOrders(orders);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Function to change order status
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;

    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus,
      });

      if (response.data.success) {
        // Remove green border when status changes from "Food Processing"
        if (newStatus !== "Food Processing") {
          const updatedNewOrders = new Set(newOrders);
          updatedNewOrders.delete(orderId);
          setNewOrders(updatedNewOrders);
        }
        
        toast.success("Status updated successfully.");
        await fetchOrders();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("Error updating status.");
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <Home className="w-4 h-4" />;
      case "Food Processing":
        return <Package className="w-4 h-4" />;
      case "In progress":
        return <Truck className="w-4 h-4" />;
      case "Out for delivery":
        return <Truck className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Food Processing":
        return "bg-red-500";
      case "In progress":
        return "bg-orange-500";
      case "Out for delivery":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  // Function to get status text color
  const getStatusTextColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-300";
      case "Food Processing":
        return "text-red-300";
      case "In progress":
        return "text-orange-300";
      case "Out for delivery":
        return "text-yellow-300";
      default:
        return "text-red-300";
    }
  };

  // Check if order should have green border
  const hasGreenBorder = (orderId) => {
    return newOrders.has(orderId);
  };

  // Function to get payment status badge
  const getPaymentBadge = (payment) => {
    return payment ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Unpaid
      </span>
    );
  };

  // Function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInSeconds = Math.floor((now - orderDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Slice filteredOrders based on currentPage and ordersPerPage
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  // Function to format extras for display
  const formatExtras = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) return "No extras";
    return selectedOptions.join(", ");
  };

  // Calculate totals for summary
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const totalOrders = filteredOrders.length;
  const paidOrders = filteredOrders.filter(order => order.payment).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const newProcessingOrders = filteredOrders.filter(order => 
    order.status === "Food Processing" && hasGreenBorder(order._id)
  ).length;

  // Render Grid View
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentOrders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-gray-800 border rounded-xl p-4 hover:bg-gray-750 transition-all duration-200 hover:shadow-lg hover:border-blue-500/30 ${
              hasGreenBorder(order._id) 
                ? 'border-green-500 border-2 shadow-lg shadow-green-500/20' 
                : 'border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-10 w-10 rounded-lg border-2 border-gray-700 flex items-center justify-center text-white font-bold ${getStatusColor(order.status)}`}>
                  {order.orderNumber}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-100">Order #{order.orderNumber}</div>
                  <div className="text-xs text-gray-400">
                    {getTimeAgo(order.date)}
                  </div>
                </div>
              </div>
              {getPaymentBadge(order.payment)}
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></div>
                  <div className={`text-xs font-medium ${getStatusTextColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg">
                  <span className="text-xs text-gray-400">Table</span>
                  <span className="text-sm font-bold text-white">{order.tableNo || "-"}</span>
                </div>
              </div>

              <div className="text-sm text-gray-300 mb-1">
                <span className="text-gray-400">Method:</span> {order.paymentMethod || "Unknown"}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">Items ({order.items.length})</div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 truncate">
                      {item.name} ×{item.quantity}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {item.selectedOptions?.length > 0 ? `+${item.selectedOptions.length} extras` : ""}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-bold text-green-300">
                    {order.amount?.toFixed(2)}€
                  </span>
                </div>
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  className={`text-white rounded-lg p-2 text-xs ${getStatusColor(order.status)}`}
                >
                  <option value="Food Processing">Processing</option>
                  <option value="In progress">In progress</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              {(order.specialInstructions || order.items.some(item => item.specialInstructions)) && (
                <div className="mt-2 text-xs text-gray-400 bg-gray-900 bg-opacity-50 p-2 rounded-lg">
                  <div className="font-medium mb-1">Instructions:</div>
                  {order.specialInstructions && (
                    <div className="text-gray-300 mb-1">{order.specialInstructions}</div>
                  )}
                  {order.items.map((item, index) => 
                    item.specialInstructions && (
                      <div key={index} className="text-gray-400 text-xs">
                        • {item.name}: {item.specialInstructions}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render Table View
  const renderTableView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Filter size={14} />
                    Order #
                  </div>
                  <input
                    type="text"
                    placeholder="Filter order #..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.orderNumber}
                    onChange={(e) =>
                      handleColumnFilter("orderNumber", e.target.value)
                    }
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Table</div>
                  <input
                    type="text"
                    placeholder="Filter table..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.tableNo}
                    onChange={(e) =>
                      handleColumnFilter("tableNo", e.target.value)
                    }
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Items</div>
                  <input
                    type="text"
                    placeholder="Filter items..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.items}
                    onChange={(e) =>
                      handleColumnFilter("items", e.target.value)
                    }
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Status</div>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.status}
                    onChange={(e) =>
                      handleColumnFilter("status", e.target.value)
                    }
                  >
                    <option value="">All Status</option>
                    <option value="food processing">Processing</option>
                    <option value="in progress">In progress</option>
                    <option value="out for delivery">Out for delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Payment</div>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.payment}
                    onChange={(e) =>
                      handleColumnFilter("payment", e.target.value)
                    }
                  >
                    <option value="">All</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Total</div>
                  <input
                    type="text"
                    placeholder="Filter total..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.total}
                    onChange={(e) =>
                      handleColumnFilter("total", e.target.value)
                    }
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Time</div>
                  <input
                    type="text"
                    placeholder="Filter date..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.date}
                    onChange={(e) => handleColumnFilter("date", e.target.value)}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Actions</div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide divide-gray-700">
            {currentOrders.map((order) => (
              <motion.tr
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`border-b hover:bg-gray-750 ${
                  hasGreenBorder(order._id) 
                    ? 'border-l-4 border-l-green-500 bg-green-900 bg-opacity-10' 
                    : 'border-gray-700'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center text-white font-bold ${getStatusColor(order.status)}`}>
                      {order.orderNumber}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-100">#{order.orderNumber}</div>
                      <div className="text-xs text-gray-400">
                        {getTimeAgo(order.date)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-100">
                      {order.tableNo || "-"}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({order.paymentMethod || "Unknown"})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300 max-w-xs">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="mb-1">
                        <div className="font-medium">{item.name} ×{item.quantity}</div>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-xs text-gray-400">
                            Extras: {formatExtras(item.selectedOptions)}
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} text-white`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPaymentBadge(order.payment)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-bold text-green-300">
                      {order.amount?.toFixed(2)}€
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.date).toLocaleDateString("ro-RO")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className={`text-white rounded-lg p-2 text-sm ${getStatusColor(order.status)}`}
                  >
                    <option value="Food Processing">Processing</option>
                    <option value="In progress">In progress</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Order History</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time tracking of all restaurant orders
            {newProcessingOrders > 0 && (
              <span className="ml-2 text-green-400 font-medium">
                • {newProcessingOrders} new order{newProcessingOrders !== 1 ? 's' : ''} pending
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-900 bg-opacity-50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "grid" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "table" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              Table View
            </button>
          </div>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total">Highest Total</option>
          </select>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Orders</div>
                <div className="text-2xl font-bold text-blue-400">
                  {totalOrders}
                </div>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Total Revenue</div>
                <div className="text-2xl font-bold text-green-400">
                  {totalRevenue.toFixed(2)}€
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">New Orders</div>
                <div className="text-2xl font-bold text-green-400">
                  {newProcessingOrders}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 bg-opacity-30 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Paid Orders</div>
                <div className="text-2xl font-bold text-green-400">
                  {paidOrders}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Legend for new orders */}
      {newProcessingOrders > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Green border indicates new orders pending action</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="mb-6 p-4 bg-gray-900 bg-opacity-30 rounded-xl border border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Table Number</label>
            <input
              type="text"
              placeholder="Filter by table..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={columnFilters.tableNo}
              onChange={(e) => handleColumnFilter("tableNo", e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={columnFilters.status}
              onChange={(e) => handleColumnFilter("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="food processing">Food Processing</option>
              <option value="in progress">In progress</option>
              <option value="out for delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Payment Status</label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={columnFilters.payment}
              onChange={(e) => handleColumnFilter("payment", e.target.value)}
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Render the selected view */}
      {viewMode === "grid" ? renderGridView() : renderTableView()}

      {/* No results message */}
      {currentOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No orders found</div>
          <div className="text-gray-500 text-sm">
            {filteredOrders.length === 0 ? "No orders in the system" : "No orders match your filters"}
          </div>
        </div>
      )}

      {/* Pagination - FIXED */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-1">
          {/* Buton Previous */}
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg text-sm ${
              currentPage === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ←
          </button>

          {/* Prima pagină */}
          {currentPage > 3 && (
            <>
              <button
                onClick={() => paginate(1)}
                className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm"
              >
                1
              </button>
              {currentPage > 4 && <span className="px-1 text-gray-400">...</span>}
            </>
          )}

          {/* Paginile din mijloc (maxim 5) */}
          {(() => {
            const pages = [];
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);
            
            // Adjust if we're near the beginning
            if (currentPage <= 3) {
              endPage = Math.min(5, totalPages);
            }
            
            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
              startPage = Math.max(1, totalPages - 4);
            }
            
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => paginate(i)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    currentPage === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {i}
                </button>
              );
            }
            return pages;
          })()}

          {/* Ultima pagină */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-1 text-gray-400">...</span>}
              <button
                onClick={() => paginate(totalPages)}
                className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Buton Next */}
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg text-sm ${
              currentPage === totalPages
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            →
          </button>

          {/* Jump to page input */}
          <div className="flex items-center ml-4 space-x-2">
            <span className="text-sm text-gray-400">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  paginate(page);
                }
              }}
            />
            <span className="text-sm text-gray-400">of {totalPages}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersTable;