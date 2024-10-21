import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#F59E0B", "#FBBF24", "#FCA5A1", "#FB7185"];

const MostPopularProductChart = () => {
    const [productData, setProductData] = useState([]);
    const url = 'http://localhost:4000';
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await axios.get(`${url}/api/order/list`);
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

                    // Transformă obiectul în array pentru grafic
                    const data = Object.entries(productCountMap).map(([name, value]) => ({
                        name,
                        value,
                    }));
                    // Sortează produsele după numărul de apariții și ia primele 5
                    const topProducts = data.sort((a, b) => b.value - a.value).slice(0, 5);

                    setProductData(topProducts);
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
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Most Popular Products</h2>
            <div className='h-80'>
                {productData.length > 0 ? (
                    <ResponsiveContainer width={"100%"} height={"100%"}>
                        <PieChart>
                            <Pie
                                data={productData}
                                cx={"50%"}
                                cy={"50%"}
                                labelLine={false}
                                outerRadius={80}
                                fill='#8884d8'
                                dataKey='value'
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {productData.map((entry, index) => (
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
                ) : (
                    <p className='text-gray-100'>Încă nu sunt date disponibile.</p>
                )}
            </div>
        </motion.div>
    );
};

export default MostPopularProductChart;
