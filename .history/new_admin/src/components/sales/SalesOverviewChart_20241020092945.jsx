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
import axios from "axios"; // Import axios to make API calls

const SalesSectionOverviewChart = () => {
	const [monthlySalesData, setMonthlySalesData] = useState([]); // State for sales data
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");
	const url = 'http://localhost:4000'; // Your API base URL

	const fetchSalesData = async () => {
		try {
			const response = await axios.get(`${url}/api/order/list`);
			const orders = response.data.data; // Adjust based on your API response structure

			// Transform orders into monthly sales data
			const salesByMonth = orders.reduce((acc, order) => {
				const date = new Date(order.date); // Adjust the date field as per your data structure
				const month = date.toLocaleString('default', { month: 'short' }); // Get the month name
				const amount = order.amount || 0; // Use a default value of 0 for amount if undefined

				if (!acc[month]) {
					acc[month] = { month, sales: 0 };
				}
				acc[month].sales += amount; // Aggregate sales for the month

				return acc;
			}, {});

			// Convert the aggregated object into an array and sort by month
			const sortedMonthlySalesData = Object.values(salesByMonth).sort((a, b) => {
				return new Date(`1 ${a.month} 2023`) - new Date(`1 ${b.month} 2023`); // Sort by month
			});

			setMonthlySalesData(sortedMonthlySalesData); // Update the state with the new sales data
		} catch (error) {
			console.error("Error fetching sales data:", error);
		}
	};

	useEffect(() => {
		fetchSalesData(); // Fetch sales data on component mount
	}, []);

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
					<AreaChart data={monthlySalesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='month' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
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
