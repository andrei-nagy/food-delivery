import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";
import axios from "axios";
import { useEffect, useState } from "react";

const OverviewPage = () => {
	const [totalProducts, setTotalProducts] = useState(0); // Starea pentru totalProducts
	const [totalSales, setTotalSales] = useState('0€'); // Starea pentru Total Sales
	const [newUsers, setNewUsers] = useState(0); // Starea pentru New Users
	const url = "http://localhost:4000";

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await axios.get(`${url}/api/food/list`);
				setTotalProducts(response.data.data.length); // Actualizează totalProducts cu lungimea listei
			} catch (error) {
				console.error("Eroare la obținerea produselor:", error);
			}
		};

		const fetchTotalSales = async () => {
            try {
				const response = await axios.get(`${url}/api/order/list`);
                if (response.data.success) {
                    const deliveredOrders = response.data.data.filter(order => order.status === 'Delivered');
					const total = deliveredOrders.reduce((acc, order) => acc + order.amount, 0); // Suma prețurilor
                    setTotalSales(`$${total.toLocaleString()}`); // Setează valoarea formatată
                } else {
                    console.error("Eroare la obținerea comenzilor:", response.data.message);
                }
            } catch (error) {
                console.error("Eroare la obținerea comenzilor:", error);
            }
        };

		const fetchNewUsers = async () => {
            try {
				const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
                if (response.data.success) {
                    const completedRequests = response.data.data.filter(request => request.status === 'Completed');
					setNewUsers(completedRequests.length); // Actualizează newUsers cu numărul de cereri completate
                } else {
                    console.error("Eroare la obținerea cererilor:", response.data.message);
                }
            } catch (error) {
                console.error("Eroare la obținerea cererilor:", error);
            }
        };

		fetchProducts();
		fetchTotalSales();
		fetchNewUsers(); // Apelează funcția pentru a obține utilizatorii noi
	}, []); // Array gol pentru a rula doar la montarea componentelor

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Overview' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Total Sales' icon={Zap} value={totalSales} color='#6366F1' />
					<StatCard name='Total Waiter Requests' icon={Users} value={newUsers} color='#8B5CF6' /> {/* Aici am actualizat pentru New Users */}
					<StatCard name='Total Products' icon={ShoppingBag} value={totalProducts} color='#EC4899' />
					<StatCard name='Conversion Rate' icon={BarChart2} value='12.5%' color='#10B981' />
				</motion.div>

				{/* CHARTS */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<SalesOverviewChart />
					<CategoryDistributionChart />
					<SalesChannelChart />
				</div>
			</main>
		</div>
	);
};

export default OverviewPage;
