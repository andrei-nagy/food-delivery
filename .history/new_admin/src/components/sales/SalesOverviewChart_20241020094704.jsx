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

// Helper function to get the start and end of the current week
const getWeekRange = () => {
	const now = new Date();
	const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
	const lastDayOfWeek = new Date(now.setDate(firstDayOfWeek.getDate() + 6)); // Sunday
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
				<p>{`${payload[0].payload.month}: ${payload[0].value.toFixed(2)} €`}</p>
			</div>
		);
	}
	return null;
};

const SalesSectionOverviewChart = () => {
	const [salesData, setSalesData] = useState([]); // State for sales data
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");
	const url = 'http://localhost:4000'; // Your API base URL

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

			let filteredOrders = [];
			let salesByPeriod = {};

			// Filter data based on the selected time range
			if (selectedTimeRange === "This Week") {
				const range = getWeekRange();
				filteredOrders = filterSalesDataByRange(orders, range);
			} else if (selectedTimeRange === "This Month") {
				const range = getMonthRange();
				filteredOrders = filterSalesDataByRange(orders, range);
			} else if (selectedTimeRange === "This Quarter") {
				const range = getQuarterRange();
				filteredOrders = filterSalesDataByRange(orders, range);
			} else if (selectedTimeRange === "This Year") {
				const range = getYearRange();
				filteredOrders = filterSalesDataByRange(orders, range);
			}

			// Aggregate sales by month
			filteredOrders.forEach((order) => {
				const date = new Date(order.date || order.createdOn); // Adjust the date field as per your data structure
				const month = date.toLocaleString('default', { month: 'short' }); // Get the month name
				const amount = order.amount || 0; // Use a default value of 0 for amount if undefined

				if (!salesByPeriod[month]) {
					salesByPeriod[month] = { month, sales: 0 };
				}
				salesByPeriod[month].sales += amount; // Aggregate sales for the month/period
			});

			// Convert the aggregated object into an array and sort by month
			const sortedSalesData = Object.values(salesByPeriod).sort((a, b) => {
				return new Date(`1 ${a.month} 2023`) - new Date(`1 ${b.month} 2023`); // Sort by month
			});

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
						<XAxis dataKey='month' stroke='#9CA3AF' />
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
