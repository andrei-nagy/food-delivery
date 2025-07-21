import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import axios from "axios"; // Nu uita să adaugi axios

const WaiterRequestsGrowthChart = () => {
    const [userGrowthData, setUserGrowthData] = useState([]); // State pentru a stoca datele utilizatorilor
    const url = 'https://api.orderly-app.com'; // URL-ul API-ului tău

    const fetchUserGrowthData = async () => {
        try {
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
            if (response.data.success) {
                const requests = response.data.data;

                // Prelucrarea datelor pentru a obține numărul de înregistrări pe lună
                const monthlyData = {};

                requests.forEach(item => {
                    const createdDate = new Date(item.createdOn);
                    const month = createdDate.toLocaleString('default', { month: 'short' }); // Obține luna abreviată (ex: Jan, Feb)
                    
                    if (!monthlyData[month]) {
                        monthlyData[month] = 0; // Inițializează luna în obiect
                    }
                    monthlyData[month]++; // Incrementează contorul pentru luna respectivă
                });

                // Transformăm obiectul în array pentru Recharts
                const formattedData = Object.entries(monthlyData).map(([month, users]) => ({
                    month,
                    users
                }));

                // Sortăm datele după lună
                const sortedData = formattedData.sort((a, b) => new Date(`1 ${a.month} 2022`) - new Date(`1 ${b.month} 2022`));

                setUserGrowthData(sortedData); // Setăm datele în state
            }
        } catch (error) {
            console.error("Error fetching user growth data:", error);
        }
    };

    useEffect(() => {
        fetchUserGrowthData(); // Fetch the data when the component mounts
    }, []);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Waiter Requests Growth</h2>
            <div className='h-[320px]'>
                <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey='month' stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Line
                            type='monotone'
                            dataKey='users'
                            stroke='#8B5CF6'
                            strokeWidth={2}
                            dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default WaiterRequestsGrowthChart;
