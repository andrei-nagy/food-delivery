import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const MostPopularProductChart = () => {
    const [mostPopularProduct, setMostPopularProduct] = useState(null);
    const [productCount, setProductCount] = useState(0);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/order/list");
                if (response.data.success) {
                    const orders = response.data.data.filter(order => order.status === 'Delivered');

                    // Contorizează produsele
                    const productCountMap = {};

                    orders.forEach(order => {
                        if (order.items) {
                            order.items.forEach(item => {
                                const productName = item.name; // Asigură-te că acest atribut există
                                if (productName) {
                                    productCountMap[productName] = (productCountMap[productName] || 0) + 1;
                                }
                            });
                        }
                    });

                    // Găsește produsul cu cele mai multe vânzări
                    const sortedProducts = Object.entries(productCountMap).sort((a, b) => b[1] - a[1]);
                    const mostPopular = sortedProducts[0]; // produsul cu cele mai multe vânzări

                    if (mostPopular) {
                        setMostPopularProduct({ name: mostPopular[0], value: mostPopular[1] });
                        setProductCount(mostPopular[1]);
                    }
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
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Cel mai popular produs</h2>
            <div className='h-80 flex items-center justify-center'>
                {mostPopularProduct ? (
                    <ResponsiveContainer width={"100%"} height={"100%"}>
                        <PieChart>
                            <Pie
                                data={[mostPopularProduct]}
                                cx={"50%"}
                                cy={"50%"}
                                labelLine={false}
                                outerRadius={80}
                                fill='#8884d8'
                                dataKey='value'
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                <Cell fill={COLORS[0]} />
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
                ) : (
                    <p className='text-gray-100'>Încă nu sunt date disponibile.</p>
                )}
            </div>
        </motion.div>
    );
};

export default MostPopularProductChart;
