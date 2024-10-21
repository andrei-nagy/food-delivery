import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

const targetData = [
	{ month: "Jan", target: 275 },
	{ month: "Feb", target: 500 },
	{ month: "Mar", target: 245 },
	{ month: "Apr", target: 400 },
	{ month: "May", target: 420 },
	{ month: "Jun", target: 600 },
	{ month: "Jul", target: 650 },
	{ month: "Aug", target: 580 },
	{ month: "Sep", target: 356 },
	{ month: "Oct", target: 760 },
	{ month: "Nov", target: 980 },
	{ month: "Dec", target: 1050 },
];


const RevenueChart = () => {
	const [revenueData, setRevenueData] = useState([]);
	const [selectedTimeRange, setSelectedTimeRange] = useState("This Month");
	const url = 'http://localhost:4000'; // URL-ul API-ului tău

	useEffect(() => {
		// Funcția de preluare a datelor din comenzile livrate
		const fetchRevenueData = async () => {
			try {
				const response = await axios.get(`${url}/api/order/list`);
				if (response.data.success) {
					const orders = response.data.data;
					const deliveredOrders = orders.filter(order => order.status === 'Delivered');
	
					// Agregăm veniturile din comenzile livrate, grupate pe lună
					const revenueByMonth = deliveredOrders.reduce((acc, order) => {
						const month = new Date(order.date).toLocaleString('default', { month: 'short' });
						const amount = order.amount ? order.amount.toFixed(2) : 0; // Formatăm cu două zecimale doar dacă există order.amount

						
						if (!acc[month]) {
							acc[month] = 0;
						}
						acc[month] += amount;
						return acc;
					}, {});


					// Formatarea datelor combinate cu valorile target
					const formattedData = targetData.map(data => ({
						month: data.month,
						Target: data.target,
						Revenue: revenueByMonth[data.month] || 0, // Setăm 0 dacă nu avem venit pentru luna respectivă
					}));

					setRevenueData(formattedData); // Setăm datele în state
				}
			} catch (error) {
				console.error("Eroare la preluarea datelor despre comenzi:", error);
			}
		};

		fetchRevenueData(); // Apelăm funcția de preluare a datelor
	}, [url]);

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-100'>Revenue vs Target</h2>
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

			<div style={{ width: "100%", height: 400 }}>
				<ResponsiveContainer>
					<AreaChart data={revenueData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='month' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							formatter={(value) => `${value}€`} // Adăugăm simbolul euro la tooltip
							contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
						<Area type='monotone' dataKey='Revenue' stroke='#8B5CF6' fill='#8B5CF6' fillOpacity={0.3} />
						<Area type='monotone' dataKey='Target' stroke='#10B981' fill='#10B981' fillOpacity={0.3} />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default RevenueChart;
