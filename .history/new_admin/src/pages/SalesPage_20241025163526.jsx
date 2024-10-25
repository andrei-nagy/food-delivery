import { useEffect, useState } from "react"; // Import necessary hooks
import { motion } from "framer-motion";
import axios from "axios"; // Import axios for API calls

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { CreditCard, DollarSign, EuroIcon, ShoppingCart, TrendingUp } from "lucide-react";
import SalesSectionOverviewChart from "../components/sales/SalesOverviewChart";
import SalesByCategoryChart from "../components/sales/SalesByCategoryChart";
import DailySalesTrend from "../components/sales/DailySalesTrend";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import { useUrl } from "../components/context/UrlContext";
import PDFButton from "../components/pdfGenerator/PdfGenerator";

const SalesPage = () => {
	const [salesStats, setSalesStats] = useState({
		totalRevenue: "$0.00",
		averageOrderValue: "$0.00",
		conversionRate: "3.45%", // This might need to be updated based on your business logic
		salesGrowth: "12.3%", // This could be dynamic based on the growth logic you have
	});
	const {url} = useUrl();

	const fetchSalesData = async () => {
		try {
			const response = await axios.get(`${url}/api/order/list`);
			const orders = response.data.data; // Adjust this if your API structure is different

			if (Array.isArray(orders) && orders.length > 0) {
				const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0); // Sum of amounts
				const averageOrderValue = totalRevenue / orders.length; // Average

				setSalesStats({
					totalRevenue: `${totalRevenue.toLocaleString()}€`, // Format total revenue
					averageOrderValue: `${averageOrderValue.toFixed(2)}€`, // Format average order value
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
			<PDFButton apiUrl="http://localhost:4000/api/order/list" documentTitle="Sales Raport"  />
			<button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                   
                >
                    Add a new product
                </button>
			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* SALES STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Total Revenue' icon={EuroIcon} value={salesStats.totalRevenue} color='#6366F1' />
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
					{/* <StatCard name='Generate Sales Report' icon={CreditCard} value={salesStats.salesGrowth} color='#EF4444' /> */}
					<button
                    className="bg-gray-800 text-white font-semibold rounded-md px-6 py-3 border-2 border-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                   
                >
                    Generate Sales Report
                </button>
				</motion.div>

				<SalesSectionOverviewChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<CategoryDistributionChart />
					<DailySalesTrend />
				</div>
			</main>
		</div>
	);
};

export default SalesPage;
