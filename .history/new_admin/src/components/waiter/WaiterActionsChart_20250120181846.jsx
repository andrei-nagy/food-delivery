import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import axios from "axios"; // Nu uita să adaugi axios

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const WaiterActionsChart = () => {
    const [userDemographicsData, setUserDemographicsData] = useState([]); // State pentru datele demografice
    const url = 'https://admin.orderly-app.com'; // URL-ul API-ului tău

    const fetchWaiterActionsData = async () => {
        try {
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
            if (response.data.success) {
                const requests = response.data.data;

                // Prelucrarea datelor pentru a calcula distribuția acțiunilor
                const actionCount = {};

                requests.forEach(item => {
                    const action = item.action; // Presupunem că 'action' este un string
                    if (!actionCount[action]) {
                        actionCount[action] = 0; // Inițializăm contorul pentru acțiune
                    }
                    actionCount[action]++; // Incrementează contorul pentru acțiunea respectivă
                });

                // Transformăm obiectul în array pentru Recharts
                const formattedData = Object.entries(actionCount).map(([name, value]) => ({
                    name,
                    value
                }));

                setUserDemographicsData(formattedData); // Setăm datele în state
            }
        } catch (error) {
            console.error("Error fetching user demographics data:", error);
        }
    };

    useEffect(() => {
        fetchWaiterActionsData(); // Fetch the data when the component mounts
    }, []);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 lg:col-span-2'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Waiter Requests Actions</h2>
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={userDemographicsData}
                            cx='50%'
                            cy='50%'
                            outerRadius={100}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {userDemographicsData.map((entry, index) => (
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

export default WaiterActionsChart;
