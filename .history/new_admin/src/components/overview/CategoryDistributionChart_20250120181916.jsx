import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const CategoryDistributionChart = () => {
	const [categoryData, setCategoryData] = useState([]);

	useEffect(() => {
		const fetchOrderData = async () => {
			try {
				const response = await axios.get("https://admin.orderly-app.com/api/order/list");
				if (response.data.success) {
					const orders = response.data.data.filter(order => order.status === 'Delivered');

					// Contorizează categoriile
					const categoryCount = {};
					let totalCount = 0;

					orders.forEach(order => {
						if (order.items) {
							order.items.forEach(item => {
								const category = item.category; // Asigură-te că acest atribut există
								if (category) {
									categoryCount[category] = (categoryCount[category] || 0) + 1;
									totalCount++;
								}
							});
						}
					});

					// Transformă în format pentru grafic
					const data = Object.entries(categoryCount).map(([name, value]) => ({
						name,
						value,
					}));
					// Sortează produsele după numărul de apariții și ia primele 5
					const topCategories = data.sort((a, b) => b.value - a.value).slice(0, 5);

					setCategoryData(topCategories);

				} else {
					console.error("Eroare la obținerea comenzilor:", response.data.message);
				}
			} catch (error) {
				console.error("Eroare la obținerea comenzilor:", error);
			}
		};

		fetchOrderData();
	}, []);

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-lg font-medium mb-4 text-gray-100'>Sales by Category</h2>
			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					<PieChart>
						<Pie
							data={categoryData}
							cx={"50%"}
							cy={"50%"}
							labelLine={false}
							outerRadius={80}
							fill='#8884d8'
							dataKey='value'
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{categoryData.map((entry, index) => (
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

export default CategoryDistributionChart;
