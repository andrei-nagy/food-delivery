import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Asigurați-vă că importați CSS-ul pentru date picker

const OrdersActivityHeatmap = () => {
    const [userActivityData, setUserActivityData] = useState([]);
    const [dateRange, setDateRange] = useState(""); // Pentru a afișa intervalul de date
    const [startDate, setStartDate] = useState(null); // Stare pentru data de început
    const [endDate, setEndDate] = useState(null); // Stare pentru data de sfârșit
    const url = 'http://localhost:4000';

    // Inițializează datele pentru săptămâna curentă
    useEffect(() => {
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Luni
        const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7)); // Duminica
        setStartDate(firstDayOfWeek);
        setEndDate(lastDayOfWeek);
    }, []);

    const fetchList = async (start, end) => {
        if (!start || !end) return; // Verifică că ambele date sunt setate
        try {
            // Convertește datele în formatul corect pentru API
            const startDateParam = start ? start.toISOString() : undefined;
            const endDateParam = end ? end.toISOString() : undefined;

            // Fetch data for waiter requests
            const response = await axios.get(`${url}/api/order/list`);

            // Verifică răspunsul pentru cererile waiter
            if (response.data.success) {
                const requestsData = response.data.data;

                if (requestsData.length === 0) {
                    setDateRange("No data available");
                    setUserActivityData([]); // Resetează datele
                    return;
                }

                // Setează intervalul de date
                const formatDate = (date) => {
                    if (!date) return ""; // Verifică că data nu este null
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${month}/${day}/${date.getFullYear()}`;
                };
                setDateRange(`${formatDate(start)} - ${formatDate(end)}`);

                // Generare date activitate utilizator pentru fiecare zi în intervalul selectat
                const userActivityData = [];
                const currentDate = new Date(start);

                // Parcurge intervalul de date
                while (currentDate <= end) {
                    const dayData = {
                        date: formatDate(currentDate),
                        "0-4": 0,
                        "4-8": 0,
                        "8-12": 0,
                        "12-16": 0,
                        "16-20": 0,
                        "20-24": 0,
                        total: 0 // Adaugă un total pentru ziua respectivă
                    };

                    // Procesare cereri pentru data curentă
                    requestsData.forEach(item => {
                        const createdDate = new Date(item.createdOn);
                        if (createdDate.toDateString() === currentDate.toDateString()) {
                            const hour = createdDate.getHours();
                            // Incrementarea contorului în funcție de oră
                            if (hour >= 0 && hour < 4) {
                                dayData["0-4"]++;
                            } else if (hour >= 4 && hour < 8) {
                                dayData["4-8"]++;
                            } else if (hour >= 8 && hour < 12) {
                                dayData["8-12"]++;
                            } else if (hour >= 12 && hour < 16) {
                                dayData["12-16"]++;
                            } else if (hour >= 16 && hour < 20) {
                                dayData["16-20"]++;
                            } else if (hour >= 20 && hour < 24) {
                                dayData["20-24"]++;
                            }
                            dayData.total++; // Incrementăm totalul cererilor
                        }
                    });

                    // Procesare comenzi pentru data curentă
                    response.data.forEach(item => {
                        const orderDate = new Date(item.createdOn);
                        if (orderDate.toDateString() === currentDate.toDateString()) {
                            const hour = orderDate.getHours();
                            // Incrementarea contorului în funcție de oră
                            if (hour >= 0 && hour < 4) {
                                dayData["0-4"]++;
                            } else if (hour >= 4 && hour < 8) {
                                dayData["4-8"]++;
                            } else if (hour >= 8 && hour < 12) {
                                dayData["8-12"]++;
                            } else if (hour >= 12 && hour < 16) {
                                dayData["12-16"]++;
                            } else if (hour >= 16 && hour < 20) {
                                dayData["16-20"]++;
                            } else if (hour >= 20 && hour < 24) {
                                dayData["20-24"]++;
                            }
                            dayData.total++; // Incrementăm totalul comenzilor
                        }
                    });

                    userActivityData.push(dayData);
                    currentDate.setDate(currentDate.getDate() + 1); // Mergi la ziua următoare
                }

                setUserActivityData(userActivityData);
            } else {
                console.error("Error fetching waiter requests");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchList(startDate, endDate);
    }, [startDate, endDate]); // Fetch data only when dates change

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Waiter Requests Activity Heatmap</h2>
            <div className="flex space-x-4 mb-4">
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)} // Setează data de început
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="p-2 rounded bg-gray-700 text-gray-200"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)} // Setează data de sfârșit
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="End Date"
                    className="p-2 rounded bg-gray-700 text-gray-200"
                />
            </div>
            <p className='text-gray-300 mb-4'>Time of scanning / Period: {dateRange}</p> {/* Afișează intervalul de date */}
            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={userActivityData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey='date' stroke='#9CA3AF' />
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
                        <Bar dataKey='total' fill='#FF5722' /> {/* Afișează totalul comenzilor */}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default OrdersActivityHeatmap;
