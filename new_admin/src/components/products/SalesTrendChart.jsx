import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar, DollarSign, Package, BarChart3, LineChart as LineChartIcon, Filter, ChevronDown } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SalesTrendChart = () => {
    const [salesData, setSalesData] = useState([]);
    const [dateRange, setDateRange] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [viewMode, setViewMode] = useState("line"); // "line" or "bar"
    const [timeframe, setTimeframe] = useState("week"); // "day", "week", "month"
    const url = 'https://api.orderly-app.com';

    // Initialize dates
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        
        setStartDate(weekAgo);
        setEndDate(today);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchSalesData = async (start, end, period) => {
        if (!start || !end) return;
        
        try {
            const startDateParam = start ? start.toISOString() : undefined;
            const endDateParam = end ? end.toISOString() : undefined;

            const response = await axios.get(`${url}/api/order/list`, {
                params: { 
                    startDate: startDateParam, 
                    endDate: endDateParam 
                }
            });

            if (response.data.success) {
                const ordersData = response.data.data;

                if (ordersData.length === 0) {
                    setDateRange("No data available");
                    setSalesData([]);
                    return;
                }

                // Format date range display
                const formatDate = (date) => {
                    if (!date) return "";
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    if (isMobile) return `${month}/${day}`;
                    if (isTablet) return `${day}/${month}`;
                    return `${day}/${month}/${date.getFullYear().toString().slice(2)}`;
                };
                
                setDateRange(`${formatDate(start)} - ${formatDate(end)}`);

                // Group data by time period
                const groupedData = {};
                const currentDate = new Date(start);
                
                // Initialize all periods
                while (currentDate <= end) {
                    let periodKey;
                    if (period === "day") {
                        periodKey = formatDate(currentDate);
                    } else if (period === "week") {
                        const weekNum = Math.ceil(currentDate.getDate() / 7);
                        periodKey = `Week ${weekNum}`;
                    } else {
                        periodKey = currentDate.toLocaleString('default', { month: 'short' });
                    }
                    
                    if (!groupedData[periodKey]) {
                        groupedData[periodKey] = {
                            period: periodKey,
                            sales: 0,
                            orders: 0,
                            revenue: 0
                        };
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Process orders
                ordersData.forEach(order => {
                    const orderDate = new Date(order.date);
                    let periodKey;
                    
                    if (period === "day") {
                        periodKey = formatDate(orderDate);
                    } else if (period === "week") {
                        const weekNum = Math.ceil(orderDate.getDate() / 7);
                        periodKey = `Week ${weekNum}`;
                    } else {
                        periodKey = orderDate.toLocaleString('default', { month: 'short' });
                    }

                    if (groupedData[periodKey]) {
                        groupedData[periodKey].orders++;
                        
                        // Calculate revenue from order items
                        let orderTotal = 0;
                        if (order.items && Array.isArray(order.items)) {
                            order.items.forEach(item => {
                                const price = parseFloat(item.price) || 0;
                                const quantity = parseInt(item.quantity) || 1;
                                orderTotal += price * quantity;
                            });
                        }
                        
                        groupedData[periodKey].revenue += orderTotal;
                        groupedData[periodKey].sales = groupedData[periodKey].orders; // For backward compatibility
                    }
                });

                // Convert to array and sort
                const chartData = Object.values(groupedData).sort((a, b) => {
                    if (period === "month") {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return months.indexOf(a.period) - months.indexOf(b.period);
                    }
                    return 0;
                });

                setSalesData(chartData);
            }
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchSalesData(startDate, endDate, timeframe);
        }
    }, [startDate, endDate, timeframe]);

    // Calculate statistics
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
    const growthRate = salesData.length > 1 ? 
        ((salesData[salesData.length - 1].revenue - salesData[0].revenue) / salesData[0].revenue * 100).toFixed(1) : 0;

    // Calculate chart dimensions
    const getChartDimensions = () => {
        if (isMobile) {
            return { 
                height: 280, 
                margin: { top: 20, right: 10, left: 10, bottom: 40 },
                fontSize: 10
            };
        } else if (isTablet) {
            return { 
                height: 320, 
                margin: { top: 20, right: 20, left: 20, bottom: 50 },
                fontSize: 11
            };
        } else {
            return { 
                height: 350, 
                margin: { top: 20, right: 30, left: 30, bottom: 60 },
                fontSize: 12
            };
        }
    };

    const chartDims = getChartDimensions();

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg min-w-[200px]">
                    <p className="text-sm font-semibold text-gray-100 mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Revenue:</span>
                            <span className="text-sm font-bold text-green-400">
                                ${data.revenue.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Orders:</span>
                            <span className="text-sm font-bold text-blue-400">{data.orders}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Avg. Order:</span>
                            <span className="text-sm font-bold text-yellow-400">
                                ${data.orders > 0 ? (data.revenue / data.orders).toFixed(2) : "0.00"}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Mobile Date Range Display
    const MobileDateRangeDisplay = () => {
        const formatDateForDisplay = (date) => {
            if (!date) return "";
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-100">Date Range</h3>
                    </div>
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        {showDatePicker ? 
                            <ChevronDown className="w-4 h-4 text-gray-300 transform rotate-180" /> : 
                            <Filter className="w-4 h-4 text-gray-300" />
                        }
                    </button>
                </div>
                
                <div className="flex justify-between items-center mb-3 p-3 bg-gray-900 rounded-lg">
                    <div className="text-center min-w-0 flex-1">
                        <div className="text-xs text-gray-400">From</div>
                        <div className="text-sm font-medium text-gray-100 truncate">
                            {startDate ? formatDateForDisplay(startDate) : "Select"}
                        </div>
                    </div>
                    <div className="text-gray-500 px-2">→</div>
                    <div className="text-center min-w-0 flex-1">
                        <div className="text-xs text-gray-400">To</div>
                        <div className="text-sm font-medium text-gray-100 truncate">
                            {endDate ? formatDateForDisplay(endDate) : "Select"}
                        </div>
                    </div>
                </div>

                {showDatePicker && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Time Frame</label>
                            <div className="flex gap-2">
                                {["day", "week", "month"].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => {
                                            setTimeframe(period);
                                            setShowDatePicker(false);
                                        }}
                                        className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm capitalize ${
                                            timeframe === period 
                                                ? "bg-blue-600 text-white" 
                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Start Date</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    if (date && endDate && date > endDate) {
                                        setEndDate(date);
                                    }
                                }}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Select start date"
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 text-sm"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">End Date</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="Select end date"
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 text-sm"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const weekAgo = new Date(today);
                                    weekAgo.setDate(today.getDate() - 7);
                                    setStartDate(weekAgo);
                                    setEndDate(today);
                                    setShowDatePicker(false);
                                }}
                                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Last Week
                            </button>
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const monthAgo = new Date(today);
                                    monthAgo.setMonth(today.getMonth() - 1);
                                    setStartDate(monthAgo);
                                    setEndDate(today);
                                    setShowDatePicker(false);
                                }}
                                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Last Month
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-3 md:p-4 lg:p-6 border border-gray-700 mb-8'>
            {/* Mobile Header */}
            <div className="md:hidden mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="min-w-0">
                        <h2 className='text-lg font-semibold text-gray-100 truncate'>Sales Trend</h2>
                        <p className='text-xs text-gray-400 truncate'>Period: {dateRange} • {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => setViewMode(viewMode === "line" ? "bar" : "line")}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                        >
                            {viewMode === "line" ? 
                                <BarChart3 className="w-4 h-4 text-gray-300" /> : 
                                <LineChartIcon className="w-4 h-4 text-gray-300" />
                            }
                        </button>
                    </div>
                </div>
                
                <MobileDateRangeDisplay />
                
                {/* Mobile Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Revenue</div>
                                <div className="text-lg font-bold text-green-400">
                                    ${totalRevenue.toFixed(2)}
                                </div>
                            </div>
                            <DollarSign className="w-6 h-6 text-green-500 flex-shrink-0" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Orders</div>
                                <div className="text-lg font-bold text-blue-400">
                                    {totalOrders}
                                </div>
                            </div>
                            <Package className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Avg. Order</div>
                                <div className="text-lg font-bold text-yellow-400">
                                    ${averageOrderValue}
                                </div>
                            </div>
                            <TrendingUp className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Growth</div>
                                <div className={`text-lg font-bold ${growthRate >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                                    {growthRate >= 0 ? '+' : ''}{growthRate}%
                                </div>
                            </div>
                            <Calendar className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet Header */}
            <div className='hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-3 lg:gap-4'>
                <div className="min-w-0">
                    <h2 className='text-lg lg:text-xl font-semibold text-gray-100 truncate'>Sales Trend Analysis</h2>
                    <p className='text-xs lg:text-sm text-gray-400 mt-1 truncate'>
                        Period: {dateRange} • {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} view • 
                        <span className={`ml-2 ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {growthRate >= 0 ? '+' : ''}{growthRate}% growth
                        </span>
                    </p>
                </div>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 lg:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-900 bg-opacity-50 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("line")}
                            className={`px-3 lg:px-4 py-2 rounded-md transition-colors text-sm ${
                                viewMode === "line" 
                                    ? "bg-blue-600 text-white" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                            }`}
                        >
                            <div className="flex items-center gap-1 lg:gap-2">
                                <LineChartIcon size={16} className="lg:size-[18px]" />
                                <span className="hidden sm:inline">Line Chart</span>
                                <span className="sm:hidden">Line</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode("bar")}
                            className={`px-3 lg:px-4 py-2 rounded-md transition-colors text-sm ${
                                viewMode === "bar" 
                                    ? "bg-blue-600 text-white" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                            }`}
                        >
                            <div className="flex items-center gap-1 lg:gap-2">
                                <BarChart3 size={16} className="lg:size-[18px]" />
                                <span className="hidden sm:inline">Bar Chart</span>
                                <span className="sm:hidden">Bar</span>
                            </div>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs lg:text-sm text-gray-400 whitespace-nowrap">Group by:</span>
                        <div className="flex gap-1">
                            {["day", "week", "month"].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimeframe(period)}
                                    className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm capitalize ${
                                        timeframe === period 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                if (date && endDate && date > endDate) {
                                    setEndDate(date);
                                }
                            }}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Start Date"
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px]"
                            dateFormat="dd/MM/yy"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="End Date"
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px]"
                            dateFormat="dd/MM/yy"
                        />
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet Stats */}
            <div className='hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6'>
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Total Revenue</div>
                            <div className='text-lg lg:text-2xl font-bold text-green-400'>
                                ${totalRevenue.toFixed(2)}
                            </div>
                        </div>
                        <DollarSign className='w-6 h-6 lg:w-8 lg:h-8 text-green-500 flex-shrink-0' />
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Total Orders</div>
                            <div className='text-lg lg:text-2xl font-bold text-blue-400'>
                                {totalOrders}
                            </div>
                        </div>
                        <Package className='w-6 h-6 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0' />
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Avg. Order Value</div>
                            <div className='text-lg lg:text-2xl font-bold text-yellow-400'>
                                ${averageOrderValue}
                            </div>
                        </div>
                        <TrendingUp className='w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 flex-shrink-0' />
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Growth Rate</div>
                            <div className={`text-lg lg:text-2xl font-bold ${growthRate >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                                {growthRate >= 0 ? '+' : ''}{growthRate}%
                            </div>
                        </div>
                        <Calendar className='w-6 h-6 lg:w-8 lg:h-8 text-purple-500 flex-shrink-0' />
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="w-full" style={{ height: chartDims.height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {viewMode === "line" ? (
                        <LineChart data={salesData} margin={chartDims.margin}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                            <XAxis 
                                dataKey='period' 
                                stroke='#9CA3AF'
                                fontSize={chartDims.fontSize}
                                tickMargin={5}
                            />
                            <YAxis 
                                stroke='#9CA3AF'
                                fontSize={chartDims.fontSize}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{ fontSize: chartDims.fontSize }}
                                formatter={(value) => (
                                    <span className="text-gray-300 capitalize">
                                        {value === 'revenue' ? 'Revenue ($)' : value}
                                    </span>
                                )}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#8B5CF6" 
                                fill="#8B5CF6" 
                                fillOpacity={0.1}
                                strokeWidth={2}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="orders" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={salesData} margin={chartDims.margin}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                            <XAxis 
                                dataKey='period' 
                                stroke='#9CA3AF'
                                fontSize={chartDims.fontSize}
                                tickMargin={5}
                            />
                            <YAxis 
                                stroke='#9CA3AF'
                                fontSize={chartDims.fontSize}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{ fontSize: chartDims.fontSize }}
                                formatter={(value) => (
                                    <span className="text-gray-300 capitalize">
                                        {value === 'revenue' ? 'Revenue ($)' : value}
                                    </span>
                                )}
                            />
                            <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* No Data Message */}
            {salesData.length === 0 && (
                <div className="text-center py-8 lg:py-12">
                    <div className="text-gray-400 mb-2">No sales data available for selected period</div>
                    <div className="text-sm text-gray-500">Try selecting a different date range or time frame</div>
                </div>
            )}

            {/* Insights */}
            {salesData.length > 0 && (
                <div className="mt-4 p-3 lg:p-4 bg-gray-900 bg-opacity-30 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Insights</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                        <p>• Total revenue generated: <span className="text-green-400 font-medium">${totalRevenue.toFixed(2)}</span></p>
                        <p>• Average order value: <span className="text-yellow-400 font-medium">${averageOrderValue}</span></p>
                        <p>• Growth rate: <span className={`font-medium ${growthRate >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                            {growthRate >= 0 ? '+' : ''}{growthRate}%
                        </span></p>
                        <p>• Time period: <span className="text-blue-400 font-medium">{dateRange}</span> ({timeframe} view)</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesTrendChart;