import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const OrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState({
    orderNumber: "",
    tableNo: "",
    items: "",
    total: "",
    paymentMethod: "",
    payment: "",
    date: "",
    status: "",
  });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { url } = useUrl();
  const ordersPerPage = 10;

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
    let filtered = orders;

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

        return (
          orderNumber.toLowerCase().includes(globalSearch) ||
          tableNo.toLowerCase().includes(globalSearch) ||
          status.toLowerCase().includes(globalSearch) ||
          date.includes(globalSearch) ||
          paymentMethod.toLowerCase().includes(globalSearch) ||
          paymentStatus.includes(globalSearch) ||
          itemsText.includes(globalSearch)
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
    console.log(
      "🔄 [DEBUG] Changing status for order:",
      orderId,
      "to:",
      newStatus
    );

    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus,
      });

      if (response.data.success) {
        console.log("✅ [DEBUG] Status updated successfully");
        toast.success("Status updated successfully.");
        await fetchOrders();
      } else {
        console.log("❌ [DEBUG] Failed to update status");
        toast.error("Failed to update status.");
      }
    } catch (error) {
      console.error("❌ [DEBUG] Error updating status:", error);
      toast.error("Error updating status.");
    }
  };
  // Function to get class for status
  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500";
      case "Food Processing":
        return "bg-red-500";
      case "Out for delivery":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Slice filteredOrders based on currentPage and ordersPerPage
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
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
        <h2 className="text-xl font-semibold text-gray-100">Order List</h2>
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
      {(searchTerm ||
        Object.values(columnFilters).some((filter) => filter !== "")) && (
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
                    Order Number
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
                  <div>Table No.</div>
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
                Instructions
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
                  <div>Payment Method</div>
                  <input
                    type="text"
                    placeholder="Filter method..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.paymentMethod}
                    onChange={(e) =>
                      handleColumnFilter("paymentMethod", e.target.value)
                    }
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="space-y-2">
                  <div>Paid?</div>
                  <input
                    type="text"
                    placeholder="Type 'paid' or 'unpaid'"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={columnFilters.payment}
                    onChange={(e) =>
                      handleColumnFilter("payment", e.target.value)
                    }
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
                    onChange={(e) => handleColumnFilter("date", e.target.value)}
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
                    onChange={(e) =>
                      handleColumnFilter("status", e.target.value)
                    }
                  />
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
                className="border-b border-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  <div className="h-10 w-10 rounded-lg border-2 border-gray-700 flex items-center justify-center text-white font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none">
                    {order.orderNumber || "Unknown"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {order.tableNo || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
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
                  {order.specialInstructions || "No instructions"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {order.amount?.toFixed(2)}€
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
                  {order.date
                    ? new Date(order.date).toLocaleDateString("ro-RO")
                    : "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className={`text-white rounded-lg p-2 ${getStatusClass(
                      order.status
                    )}`}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* No results message */}
        {currentOrders.length === 0 && (
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
    </motion.div>
  );
};

export default OrdersTable;
