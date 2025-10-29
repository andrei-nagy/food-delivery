import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";

const OrdersHistoryTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({
        orderNumber: "",
        tableNo: "",
        items: "",
        total: "",
        paymentMethod: "",
        payment: "",
        date: "",
        status: ""
    });
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const {url} = useUrl();
    const ordersPerPage = 10;

    // Function to fetch orders from the API
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`);
            if (response.data.success && Array.isArray(response.data.data)) {
                // Filtrează comenzile doar cu statusul "delivered"
                const deliveredOrders = response.data.data.filter(order => order.status === 'Delivered');

                // Sortează comenzile în funcție de orderNumber în ordine descrescătoare
                const sortedOrders = deliveredOrders.sort((a, b) => {
                    const orderNumberA = a.orderNumber ? Number(a.orderNumber) : 0;
                    const orderNumberB = b.orderNumber ? Number(b.orderNumber) : 0;

                    return orderNumberB - orderNumberA;
                });

                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders);
            } else {
                console.error("Structura răspunsului nu este așa cum era de așteptat:", response.data);
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error("Eroare la preluarea comenzilor:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
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
            [column]: value.toLowerCase()
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
                const orderNumber = order.orderNumber ? String(order.orderNumber) : '';
                const tableNo = order.tableNo ? String(order.tableNo) : '';
                const status = order.status ? String(order.status) : '';
                const date = order.date ? new Date(order.date).toLocaleDateString('ro-RO') : '';
                const paymentMethod = order.paymentMethod ? String(order.paymentMethod) : '';
                const paymentStatus = order.payment ? "paid" : "unpaid";
                const itemsText = order.items.map(item => item.name).join(' ').toLowerCase();

                return (
                    orderNumber.toLowerCase().includes(globalSearch) ||
                    tableNo.toLowerCase().includes(globalSearch) ||
                    status.toLowerCase().includes(globalSearch) ||
                    paymentMethod.toLowerCase().includes(globalSearch) ||
                    paymentStatus.includes(globalSearch) ||
                    itemsText.includes(globalSearch) ||
                    date.includes(globalSearch)
                );
            });
        }

        // Column filters
        if (columnFilters.orderNumber) {
            filtered = filtered.filter(order => 
                order.orderNumber?.toString().toLowerCase().includes(columnFilters.orderNumber)
            );
        }

        if (columnFilters.tableNo) {
            filtered = filtered.filter(order => 
                order.tableNo?.toString().toLowerCase().includes(columnFilters.tableNo)
            );
        }

        if (columnFilters.items) {
            filtered = filtered.filter(order =>
                order.items.some(item => 
                    item.name.toLowerCase().includes(columnFilters.items)
                )
            );
        }

        if (columnFilters.total) {
            filtered = filtered.filter(order => 
                order.amount?.toString().includes(columnFilters.total)
            );
        }

        if (columnFilters.paymentMethod) {
            filtered = filtered.filter(order => 
                order.paymentMethod?.toLowerCase().includes(columnFilters.paymentMethod)
            );
        }

        if (columnFilters.payment) {
            const paymentFilter = columnFilters.payment;
            filtered = filtered.filter(order => {
                const paymentStatus = order.payment ? "paid" : "unpaid";
                return paymentStatus.includes(paymentFilter);
            });
        }

        if (columnFilters.date) {
            filtered = filtered.filter(order => 
                new Date(order.date).toLocaleDateString('ro-RO').includes(columnFilters.date)
            );
        }

        if (columnFilters.status) {
            filtered = filtered.filter(order => 
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
            status: ""
        });
        setFilteredOrders(orders);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Slice filteredOrders based on currentPage and ordersPerPage
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Order History List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search all orders...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
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
                                        onChange={(e) => handleColumnFilter('orderNumber', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Table No.</div>
                                    <input
                                        type="text"
                                        placeholder="Filter table..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.tableNo}
                                        onChange={(e) => handleColumnFilter('tableNo', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Items</div>
                                    <input
                                        type="text"
                                        placeholder="Filter items..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.items}
                                        onChange={(e) => handleColumnFilter('items', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Instructions
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Total</div>
                                    <input
                                        type="text"
                                        placeholder="Filter total..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.total}
                                        onChange={(e) => handleColumnFilter('total', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Paid?</div>
                                    <input
                                        type="text"
                                        placeholder="Type 'paid' or 'unpaid'"
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.payment}
                                        onChange={(e) => handleColumnFilter('payment', e.target.value)}
                                    />
                                </div>
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                <div className="space-y-2">
                                    <div>Status</div>
                                    <input
                                        type="text"
                                        placeholder="Filter status..."
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={columnFilters.status}
                                        onChange={(e) => handleColumnFilter('status', e.target.value)}
                                    />
                                    <div className="text-xs text-gray-500">
                                        Type "delivered"
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide divide-gray-700'>
                        {currentOrders.map((order) => (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="border-b border-gray-700"
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <div className='h-10 w-10 rounded-lg border-2 border-gray-700 flex items-center justify-center text-white font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none'>
                                        {order.orderNumber || "Unknown"}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.tableNo || "Unknown"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
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
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.specialInstructions || "No instructions"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.amount?.toFixed(2)}€
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.paymentMethod || "Unknown"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.payment ? (
                                        <span className="text-green-500">Successful</span>
                                    ) : (
                                        <span className="text-red-500">Not paid</span>
                                    )}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.date ? new Date(order.date).toLocaleDateString('ro-RO') : "Unknown"}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {order.status === 'Delivered' ? (
                                        <span className="text-green-500">Delivered</span>
                                    ) : (
                                        <span className="text-red-500">Not Delivered</span>
                                    )}
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
  <div className="flex justify-center items-center mt-6 space-x-2">
    {/* Buton Previous */}
    <button
      onClick={() => paginate(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className={`px-3 py-2 rounded-lg ${
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
          className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          1
        </button>
        {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
      </>
    )}

    {/* Paginile din mijloc */}
    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      let pageNum;
      if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - 4 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      if (pageNum < 1 || pageNum > totalPages) return null;

      return (
        <button
          key={pageNum}
          onClick={() => paginate(pageNum)}
          className={`px-3 py-2 rounded-lg ${
            currentPage === pageNum
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {pageNum}
        </button>
      );
    })}

    {/* Ultima pagină */}
    {currentPage < totalPages - 2 && (
      <>
        {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
        <button
          onClick={() => paginate(totalPages)}
          className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
        >
          {totalPages}
        </button>
      </>
    )}

    {/* Buton Next */}
    <button
      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      className={`px-3 py-2 rounded-lg ${
        currentPage === totalPages
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      →
    </button>
  </div>
)}
        </motion.div>
    );
};

export default OrdersHistoryTable;