import { useEffect, useState } from "react"; // Import necessary hooks
import { motion } from "framer-motion";
import axios from "axios"; // Import axios for API calls

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import SalesSectionOverviewChart from "../components/sales/SalesOverviewChart";
import SalesByCategoryChart from "../components/sales/SalesByCategoryChart";
import DailySalesTrend from "../components/sales/DailySalesTrend";

const SalesPage = () => {
	const [salesStats, setSalesStats] = useState({
		totalRevenue: "$0.00",
		averageOrderValue: "$0.00",
		conversionRate: "3.45%", // This might need to be updated based on your business logic
		salesGrowth: "12.3%", // This could be dynamic based on the growth logic you have
	});
	const url = 'http://localhost:4000';
	const fetchSalesData = async () => {
		try {
			const response = await axios.get(`${url}/api/order/list`);
			const orders = response.data.data; // Adjust this if your API structure is different

			if (Array.isArray(orders) && orders.length > 0) {
				const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0); // Sum of amounts
				const averageOrderValue = totalRevenue / orders.length; // Average

				setSalesStats({
					totalRevenue: `$${totalRevenue.toLocaleString()}`, // Format total revenue
					averageOrderValue: `$${averageOrderValue.toFixed(2)}`, // Format average order value
					conversionRate: "3.45%", // Keep as static or fetch if dynamic
					salesGrowth: "12.3%", // Keep as static or fetch if dynamic
				});
			}
		} catch (error) {
			console.error("Error fetching sales data:", error);
		}
	};

	// Fetch sales data when the component mounts
	useEffect(() => {
		fetchSalesData();
	}, []); // Empty dependency array means this runs once on mount

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Sales Dashboard' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* SALES STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Total Revenue' icon={DollarSign} value={salesStats.totalRevenue} color='#6366F1' />
					<StatCard
						name='Avg. Order Value'
						icon={ShoppingCart}
						value={salesStats.averageOrderValue}
						color='#10B981'
					/>
					<StatCard
						name='Conversion Rate'
						icon={TrendingUp}
						value={salesStats.conversionRate}
						color='#F59E0B'
					/>
					<StatCard name='Sales Growth' icon={CreditCard} value={salesStats.salesGrowth} color='#EF4444' />
				</motion.div>

				<SalesSectionOverviewChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<SalesByCategoryChart />
					<DailySalesTrend />
				</div>
			</main>
		</div>
	);
};

export default SalesPage;
