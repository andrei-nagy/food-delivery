import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

const WaiterActivityHeatmap = () => {
    const [userActivityData, setUserActivityData] = useState([]);
    const [dateRange, setDateRange] = useState(""); // Stocăm intervalul de date
    const url = 'http://localhost:4000';

    const fetchList = async () => {
        try {
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);

            if (response.data.success) {
                const newList = response.data.data;

                // Verificăm dacă avem date
                if (newList.length === 0) {
                    setDateRange("No data available");
                    return;
                }

                // Determinăm prima și ultima dată
                const createdDates = newList.map(item => new Date(item.createdOn));
                const minDate = new Date(Math.min(...createdDates));
                const maxDate = new Date(Math.max(...createdDates));

                // Setăm intervalul de date în formatul dorit
                const formatDate = (date) => `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
                setDateRange(`${formatDate(minDate)} - ${formatDate(maxDate)}`);

                // Statistici pentru cereri
                const userActivityData = [
                    { name: "Mon", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                    { name: "Tue", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                    { name: "Wed", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                    { name: "Thu", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                    { name: "Fri", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                    { name: "Sat", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                    { name: "Sun", "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 },
                ];

                // Procesăm fiecare cerere
                newList.forEach(item => {
                    const createdDate = new Date(item.createdOn);
                    const dayOfWeek = createdDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    const hour = createdDate.getHours();

                    // Calculăm ziua corespunzătoare
                    const dayIndex = (dayOfWeek + 6) % 7; // Transformăm Sunday (0) în index 6 pentru a-l muta la final

                    // Incrementăm numărul de cereri în funcție de ora
                    if (hour >= 0 && hour < 4) {
                        userActivityData[dayIndex]["0-4"]++;
                    } else if (hour >= 4 && hour < 8) {
                        userActivityData[dayIndex]["4-8"]++;
                    } else if (hour >= 8 && hour < 12) {
                        userActivityData[dayIndex]["8-12"]++;
                    } else if (hour >= 12 && hour < 16) {
                        userActivityData[dayIndex]["12-16"]++;
                    } else if (hour >= 16 && hour < 20) {
                        userActivityData[dayIndex]["16-20"]++;
                    } else if (hour >= 20 && hour < 24) {
                        userActivityData[dayIndex]["20-24"]++;
                    }
                });

                // Setăm datele în stare
                setUserActivityData(userActivityData);
                
            } else {
                console.error("Error fetching waiter requests");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>User Activity Heatmap</h2>
            <p className='text-gray-300 mb-4'>Time of scanning / Period: {dateRange}</p> {/* Afișăm intervalul de date */}
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={userActivityData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey='name' stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                        <Bar dataKey='0-4' stackId='a' fill='#6366F1' />
                        <Bar dataKey='4-8' stackId='a' fill='#8B5CF6' />
                        <Bar dataKey='8-12' stackId='a' fill='#EC4899' />
                        <Bar dataKey='12-16' stackId='a' fill='#10B981' />
                        <Bar dataKey='16-20' stackId='a' fill='#F59E0B' />
                        <Bar dataKey='20-24' stackId='a' fill='#3B82F6' />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default WaiterActivityHeatmap;
