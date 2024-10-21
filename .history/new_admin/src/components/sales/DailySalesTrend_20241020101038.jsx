import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Helper function to convert date to day of the week
const getDayOfWeek = (dateString) => {
	const date = new Date(dateString);
	const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return daysOfWeek[date.getDay()];
};

// Custom tooltip to display sales, orders, and avg order amount with € and 2 decimal places
const customTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-gray-800 text-gray-100 p-2 rounded">
				<p>{`${payload[0].name}:`}</p>
				<p>{`Total Sales: ${payload[0].value.toFixed(2)} €`}</p>
				<p>{`Orders: ${payload[1].value}`}</p>
				<p>{`Avg. Order Amount: ${payload[2].value.toFixed(2)} €`}</p>
			</div>
		);
	}
	return null;
};

// Component for displaying sales trend
const DailySalesTrend = () => {
	const [salesData, setSalesData] = useState([
		{ name: "Mon", sales: 0, orders: 0, avgOrderAmount: 0 },
		{ name: "Tue", sales: 0, orders: 0, avgOrderAmount: 0 },
		{ name: "Wed", sales: 0, orders: 0, avgOrderAmount: 0 },
		{ name: "Thu", sales: 0, orders: 0, avgOrderAmount: 0 },
		{ name: "Fri", sales: 0, orders: 0, avgOrderAmount: 0 },
		{ name: "Sat", sales: 0, orders: 0, avgOrderAmount: 0 },
		{ name: "Sun", sales: 0, orders: 0, avgOrderAmount: 0 },
	]);

	const url = 'http://localhost:4000'; // Your API endpoint

// Function to fetch and process sales data
const fetchSalesData = async () => {
    try {
        const response = await axios.get(`${url}/api/order/list`);
        const orders = response.data.data; // Adjust this based on your API structure

        // Filter to include only orders with status 'Delivered'
        const deliveredOrders = orders.filter(order => order.status === 'Delivered');

        // Initialize sales and order counts per day
        const salesPerDay = {
            Mon: { sales: 0, orders: 0 },
            Tue: { sales: 0, orders: 0 },
            Wed: { sales: 0, orders: 0 },
            Thu: { sales: 0, orders: 0 },
            Fri: { sales: 0, orders: 0 },
            Sat: { sales: 0, orders: 0 },
            Sun: { sales: 0, orders: 0 },
        };

        // Process each delivered order and accumulate sales and orders per day
        deliveredOrders.forEach((order) => {
			console.log(order.date)
            const day = getDayOfWeek(order.date); // Extract day from date
            salesPerDay[day].sales += order.amount; // Sum sales for the respective day
            salesPerDay[day].orders += 1; // Count orders for the respective day
        });

        // Convert the object into an array suitable for the chart, and calculate avgOrderAmount
        const updatedSalesData = Object.keys(salesPerDay).map((day) => {
            const { sales, orders } = salesPerDay[day];
            const avgOrderAmount = orders > 0 ? sales / orders : 0; // Avoid division by zero
            return {
                name: day,
                sales: sales,
                orders: orders,
                avgOrderAmount: avgOrderAmount,
            };
        });

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
						<YAxis yAxisId="left" stroke='#9CA3AF' />
						<YAxis yAxisId="right" orientation="right" stroke='#9CA3AF' />
						<Tooltip content={customTooltip} />
						<Legend />
						<Bar yAxisId="left" dataKey='sales' fill='#10B981' name="Total Sales (€)" />
						<Bar yAxisId="right" dataKey='orders' fill='#3B82F6' name="Orders" />
						<Bar yAxisId="right" dataKey='avgOrderAmount' fill='#F59E0B' name="Avg. Order Amount (€)" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default DailySalesTrend;
