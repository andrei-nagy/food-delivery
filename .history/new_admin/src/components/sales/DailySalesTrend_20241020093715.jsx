import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Helper function to convert date to day of the week
const getDayOfWeek = (dateString) => {
	const date = new Date(dateString);
	const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return daysOfWeek[date.getDay()];
};

// Component for displaying sales trend
const DailySalesTrend = () => {
	const [salesData, setSalesData] = useState([
		{ name: "Mon", sales: 0 },
		{ name: "Tue", sales: 0 },
		{ name: "Wed", sales: 0 },
		{ name: "Thu", sales: 0 },
		{ name: "Fri", sales: 0 },
		{ name: "Sat", sales: 0 },
		{ name: "Sun", sales: 0 },
	]);

	const url = 'http://localhost:4000'; // Your API endpoint

	// Function to fetch and process sales data
	const fetchSalesData = async () => {
		try {
			const response = await axios.get(`${url}/api/order/list`);
			const orders = response.data.data; // Adjust this based on your API structure

			// Initialize sales per day
			const salesPerDay = {
				Mon: 0,
				Tue: 0,
				Wed: 0,
				Thu: 0,
				Fri: 0,
				Sat: 0,
				Sun: 0,
			};

			// Process each order and accumulate sales per day
			orders.forEach((order) => {
				const day = getDayOfWeek(order.date || order.createdOn); // Extract day from date
				salesPerDay[day] += order.amount; // Sum sales for the respective day
			});

			// Convert the object into an array suitable for the chart
			const updatedSalesData = Object.keys(salesPerDay).map((day) => ({
				name: day,
				sales: salesPerDay[day],
			}));

			setSalesData(updatedSalesData); // Update the state with processed data
		} catch (error) {
			console.error("Error fetching sales data:", error);
		}
	};

	// Fetch sales data on component mount
	useEffect(() => {
		fetchSalesData();
	}, []);

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<h2 className='text-xl font-semibold text-gray-100 mb-4'>Daily Sales Trend</h2>

			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart data={salesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='name' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Bar dataKey='sales' fill='#10B981' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default DailySalesTrend;
