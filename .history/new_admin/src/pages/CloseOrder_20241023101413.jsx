import { useState, useEffect } from "react"; // Import useState and useEffect
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import OrdersActivityHeatmap from "../components/orders/OrdersChart";
import OrderDistribution from "../components/orders/OrderDistribution";
import OrdersTable from "../components/orders/OrdersTable";
import axios from "axios"; // Import axios to fetch orders
import MostPopularProductChart from "../components/overview/MostPopularProduct";
import OrdersToCloseTable from "../components/close-order/OrdersToCloseTable";

const CloseOrder = () => {
    const [orders, setOrders] = useState([]); // State to store orders
    const url = "http://localhost:4000"; // URL-ul API-ului

    // Funcția pentru a prelua comenzile din API
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setOrders(response.data.data); // Stochează comenzile
            } else {
                console.error("Response structure is not as expected:", response.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders(); // Preia comenzile la montarea componentei
    }, []);

    // Calcularea statisticilor
    const totalOrders = orders.length; // Totalul comenzilor
    const pendingOrders = orders.filter(order => order.status === "Food processing").length; // Comenzile în procesare
    const completedOrders = orders.filter(order => order.status === "Delivered").length; // Comenzile livrate
	const totalRevenue = orders
	.filter(order => order.status === "Delivered") // Filtrează doar comenzile livrate
	.reduce((acc, order) => acc + (order.amount || 0), 0) // Suma totală a comenzilor livrate
	.toFixed(2); // Formatează la două zecimale

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <Header title={"Close an order / a table"} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Orders' icon={ShoppingBag} value={totalOrders.toString()} color='#6366F1' />
                    <StatCard name='Pending Orders' icon={Clock} value={pendingOrders.toString()} color='#F59E0B' />
                    <StatCard
                        name='Completed Orders'
                        icon={CheckCircle}
                        value={completedOrders.toString()}
                        color='#10B981'
                    />
                    <StatCard name='Total Revenue' icon={DollarSign} value={`$${totalRevenue}`} color='#EF4444' />
                </motion.div>
                <OrdersToCloseTable orders={orders} /> {/* Pass orders as a prop if needed */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    <OrdersActivityHeatmap />
                    <MostPopularProductChart />
                </div>
            </main>
        </div>
    );
};

export default CloseOrder;
