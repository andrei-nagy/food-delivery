import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios"; // Asigură-te că axios este importat
import { useEffect, useState } from "react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"];

const ChannelPerformance = () => {
	const [paymentData, setPaymentData] = useState([]);
	const url = 'http://localhost:4000'; // URL-ul API-ului tău

	// Funcția de preluare a datelor din API
	useEffect(() => {
		const fetchOrderData = async () => {
			try {
				const response = await axios.get(`${url}/api/order/list`);
				if (response.data.success) {
					const orders = response.data.data.filter(order => order.status === 'Delivered');

					// Numărăm metodele de plată
					const paymentMethodCounts = orders.reduce((acc, order) => {
						const method = order.paymentMethod; // Accesăm paymentMethod
						if (method) {
							acc[method] = (acc[method] || 0) + 1; // Numărăm ocaziile
						}
						return acc;
					}, {});

					// Convertim numărătorile într-un format compatibil cu graficul
					const formattedData = Object.entries(paymentMethodCounts).map(([name, count]) => ({ name, value: count }));
					setPaymentData(formattedData);
				}
			} catch (error) {
				console.error("Eroare la preluarea datelor din comenzi:", error);
			}
		};

		fetchOrderData();
	}, [url]);

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-gray-100 mb-4'>Payment Methods Performance</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={paymentData} // Înlocuim datele hardcodate cu cele preluate din API
							cx='50%'
							cy='50%'
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Afișăm procentajul
						>
							{paymentData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4B5563",
							}}
							itemStyle={{ color: "#E5E7EB" }}
						/>
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default ChannelPerformance;
