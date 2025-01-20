import { motion } from "framer-motion";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";

// Helper function to get the start and end of the current week (Monday to Sunday)
const getWeekRange = () => {
	const now = new Date();
	const firstDayOfWeek = new Date(now);
	// Set to Monday of the current week
	firstDayOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // If today is Sunday, back to last Monday
	firstDayOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00

	const lastDayOfWeek = new Date(firstDayOfWeek);
	lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Add 6 days to get to Sunday
	lastDayOfWeek.setHours(23, 59, 59, 999); // Set time to 23:59:59 on Sunday

	return { start: firstDayOfWeek, end: lastDayOfWeek };
};

// Helper function to get the start and end of the current month
const getMonthRange = () => {
	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return { start: firstDayOfMonth, end: lastDayOfMonth };
};

// Helper function to get the start and end of the current quarter
const getQuarterRange = () => {
	const now = new Date();
	const currentMonth = now.getMonth();
	const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
	const firstDayOfQuarter = new Date(now.getFullYear(), quarterStartMonth, 1);
	const lastDayOfQuarter = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
	return { start: firstDayOfQuarter, end: lastDayOfQuarter };
};

// Helper function to get the start and end of the current year
const getYearRange = () => {
	const now = new Date();
	const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
	const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
	return { start: firstDayOfYear, end: lastDayOfYear };
};

// Custom tooltip to format sales values with euro sign and two decimals
const customTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-gray-800 text-gray-100 p-2 rounded">
				<p>{`${payload[0].payload.label}: ${payload[0].value.toFixed(2)} €`}</p>
			</div>
		);
	}
	return null;
};

const SalesSectionOverviewChart = () => {
	const [salesData, setSalesData] = useState([]); // State for sales data
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");
	const url = 'https://api.orderly-app.com'; // Your API base URL

	// Function to filter sales data by the selected time range
	const filterSalesDataByRange = (orders, range) => {
		return orders.filter((order) => {
			const orderDate = new Date(order.date || order.createdOn); // Adjust as per your API data structure
			return orderDate >= range.start && orderDate <= range.end;
		});
	};

// Function to fetch sales data and filter it based on the selected time range
const fetchSalesData = async () => {
    try {
        const response = await axios.get(`${url}/api/order/list`);
        const orders = response.data.data; // Adjust based on your API response structure

        // Filter orders to only include those with status 'Delivered'
        const deliveredOrders = orders.filter(order => order.status === 'Delivered');

        let filteredOrders = [];
        let salesByPeriod = [];

        // Filter data based on the selected time range
        if (selectedTimeRange === "This Week") {
            const range = getWeekRange();
            filteredOrders = filterSalesDataByRange(deliveredOrders, range);

            // Aggregate sales by day (Monday to Sunday)
            salesByPeriod = filteredOrders.reduce((acc, order) => {
                const day = new Date(order.date || order.createdOn).toLocaleString('en-US', { weekday: 'short' });
                const amount = order.amount || 0;

                if (!acc[day]) {
                    acc[day] = { label: day, sales: 0 };
                }
                acc[day].sales += amount;
                return acc;
            }, {});

        } else if (selectedTimeRange === "This Month") {
            const range = getMonthRange();
            filteredOrders = filterSalesDataByRange(deliveredOrders, range);

            // Aggregate sales by day of the month
            salesByPeriod = filteredOrders.reduce((acc, order) => {
                const day = new Date(order.date || order.createdOn).getDate(); // Day of the month
                const amount = order.amount || 0;

                if (!acc[day]) {
                    acc[day] = { label: day, sales: 0 };
                }
                acc[day].sales += amount;
                return acc;
            }, {});

        } else if (selectedTimeRange === "This Quarter") {
            const range = getQuarterRange();
            filteredOrders = filterSalesDataByRange(deliveredOrders, range);

            // Aggregate sales by month (in quarter)
            salesByPeriod = filteredOrders.reduce((acc, order) => {
                const month = new Date(order.date || order.createdOn).toLocaleString('en-US', { month: 'short' });
                const amount = order.amount || 0;

                if (!acc[month]) {
                    acc[month] = { label: month, sales: 0 };
                }
                acc[month].sales += amount;
                return acc;
            }, {});

            // Sort months in quarter by order (Jan, Feb, Mar, etc.)
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            salesByPeriod = Object.values(salesByPeriod).sort((a, b) => {
                return monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label);
            });

        } else if (selectedTimeRange === "This Year") {
            const range = getYearRange();
            filteredOrders = filterSalesDataByRange(deliveredOrders, range);

            // Aggregate sales by month (in year)
            salesByPeriod = filteredOrders.reduce((acc, order) => {
                const month = new Date(order.date || order.createdOn).toLocaleString('en-US', { month: 'short' });
                const amount = order.amount || 0;

                if (!acc[month]) {
                    acc[month] = { label: month, sales: 0 };
                }
                acc[month].sales += amount;
                return acc;
            }, {});

            // Sort months in year by order (Jan, Feb, Mar, etc.)
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            salesByPeriod = Object.values(salesByPeriod).sort((a, b) => {
                return monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label);
            });
        }

        // Convert the aggregated object into an array
        const sortedSalesData = Object.values(salesByPeriod);

        setSalesData(sortedSalesData); // Update the state with the filtered sales data
    } catch (error) {
        console.error("Error fetching sales data:", error);
    }
};



	// Fetch sales data whenever the selected time range changes
	useEffect(() => {
		fetchSalesData();
	}, [selectedTimeRange]);

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Sales Overview</h2>

				<select
					className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
					value={selectedTimeRange}
					onChange={(e) => setSelectedTimeRange(e.target.value)}
				>
					<option>This Week</option>
					<option>This Month</option>
					<option>This Quarter</option>
					<option>This Year</option>
				</select>
			</div>

			<div className='w-full h-80'>
				<ResponsiveContainer>
					<AreaChart data={salesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='label' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip content={customTooltip} />
						<Area
							type='monotone'
							dataKey='sales'
							stroke='#8B5CF6'
							fill='#8B5CF6'
							fillOpacity={0.3}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default SalesSectionOverviewChart;
