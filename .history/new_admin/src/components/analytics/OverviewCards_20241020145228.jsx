import { motion } from "framer-motion";
import { DollarSign, Users, ShoppingBag, Eye, ArrowDownRight, ArrowUpRight, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios"; // Asigură-te că axios este importat

const OverviewCards = () => {
	const [userCount, setUserCount] = useState(null); // State pentru numărul total de utilizatori
	const [ordersCount, setOrdersCount] = useState(null);
	const [ordersRevenue, setOrdersRevenue] = useState(null);

	const url = 'http://localhost:4000'; // URL-ul API-ului tău

	useEffect(() => {
		// Funcția pentru a prelua numărul total de utilizatori
		const fetchUserCount = async () => {
			try {
				const response = await axios.get(`${url}/api/user/count`); // End-point pentru numărul de utilizatori
				if (response.data.success) {
					setUserCount(response.data.count); // Setăm numărul total de utilizatori
				}
			} catch (error) {
				console.error("Eroare la preluarea numărului de utilizatori:", error);
			}
		};
		const fetchOrdersCount = async () => {
			try {
				const response = await axios.get(`${url}/api/order/list`);
				if (response.data.success) {
					const orders = response.data.data;
					setOrdersCount(response.data.data.length); // Setăm numărul total de utilizatori

					const totalRevenue = orders.reduce((acc, order) => acc + (order.amount || 0), 0);
					setOrdersRevenue(totalRevenue); // Setăm suma totală
				}
			} catch (error) {
				console.error("Eroare la preluarea numărului de utilizatori:", error);
			}
		}
		fetchOrdersCount();
		fetchUserCount(); // Apelăm funcția de preluare a datelor la montarea componentei
	}, [url]);

	const overviewData = [
		{ name: "Revenue", value: ordersRevenue !== null ? `${ordersRevenue.toLocaleString()} €` : "Loading...", change: 12.5, icon: DollarSign },
		{ name: "QR Scanned", value: userCount !== null ? userCount.toLocaleString() : "Loading...", change: 8.3, icon: QrCode }, // Afișăm numărul de utilizatori dinamic
		{ name: "Orders", value: ordersCount !== null ? ordersCount.toLocaleString() : 'Loading...', change: -3.2, icon: ShoppingBag },
		{ name: "Page Views", value: "1,234,567", change: 15.7, icon: Eye },
	];

	return (
		<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
			{overviewData.map((item, index) => (
				<motion.div
					key={item.name}
					className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg
            rounded-xl p-6 border border-gray-700
          '
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<div className='flex items-center justify-between'>
						<div>
							<h3 className='text-sm font-medium text-gray-400'>{item.name}</h3>
							<p className='mt-1 text-xl font-semibold text-gray-100'>{item.value}</p>
						</div>

						<div
							className={`p-3 rounded-full bg-opacity-20 ${item.change >= 0 ? "bg-green-500" : "bg-red-500"
								}`}
						>
							<item.icon className={`size-6 ${item.change >= 0 ? "text-green-500" : "text-red-500"}`} />
						</div>
					</div>
					<div
						className={`mt-4 flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}
					>
						{item.change >= 0 ? <ArrowUpRight size='20' /> : <ArrowDownRight size='20' />}
						<span className='ml-1 text-sm font-medium'>{Math.abs(item.change)}%</span>
						<span className='ml-2 text-sm text-gray-400'>vs last period</span>
					</div>
				</motion.div>
			))}
		</div>
	);
};

export default OverviewCards;
