import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";

const SalesOverviewChart = () => {
    const [salesData, setSalesData] = useState([]);
    const url = 'https://api.orderly-app.com';
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await axios.get(`${url}/api/order/list`);
                if (response.data.success) {
                    const orders = response.data.data.filter(order => order.status === 'Delivered');

                    // Centralizare a sumelor vânzărilor pe lună
                    const monthlySales = {};

                    orders.forEach(order => {
                        const date = new Date(order.date); // Convertim data la un obiect Date
                        const month = date.toLocaleString('default', { month: 'short' }); // Obținem numele lunii scurt
                        const year = date.getFullYear(); // Obținem anul

                        // Formăm un cheie unică pentru lună și an
                        const monthYear = `${month} ${year}`;

                        // Adăugăm suma prețului la totalul pe lună
                        monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.amount;
                    });

                    // Transformăm în formatul necesar pentru grafic
                    const data = Object.entries(monthlySales).map(([name, value]) => ({
                        name,
                        sales: value,
                    }));

                    // Sortăm datele după lună
                    data.sort((a, b) => new Date(`1 ${a.name}`) - new Date(`1 ${b.name}`));

                    setSalesData(data);
                } else {
                    console.error("Eroare la obținerea comenzilor:", response.data.message);
                }
            } catch (error) {
                console.error("Eroare la obținerea comenzilor:", error);
            }
        };

        fetchSalesData();
    }, []);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            style={{ zIndex: -1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview</h2>

            <div className='h-80'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
                        <XAxis dataKey={"name"} stroke='#9ca3af' />
                        <YAxis stroke='#9ca3af' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Line
                            type='monotone'
                            dataKey='sales'
                            stroke='#6366F1'
                            strokeWidth={3}
                            dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SalesOverviewChart;
