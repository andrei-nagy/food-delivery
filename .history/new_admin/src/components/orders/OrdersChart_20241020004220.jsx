import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Importing the CSS for the date picker

const OrdersActivityHeatmap = () => {
    const [userActivityData, setUserActivityData] = useState([]);
    const [dateRange, setDateRange] = useState(""); // For displaying the date range
    const [startDate, setStartDate] = useState(null); // State for start date
    const [endDate, setEndDate] = useState(null); // State for end date
    const url = 'http://localhost:4000';

    // Initialize data for the current week
    useEffect(() => {
        const today = new Date();
        const currentDay = today.getDay(); // Ziua curentă a săptămânii (0 = duminică, 1 = luni, ..., 6 = sâmbătă)
        const firstDayOfWeek = new Date(today); // Creați o copie a zilei de azi
    
        // Dacă suntem în ziua de luni, setăm firstDayOfWeek să fie săptămâna trecută
        if (currentDay === 1) { // Dacă astăzi este luni
            firstDayOfWeek.setDate(today.getDate() - 7); // Mergem înapoi cu o săptămână
        } else {
            firstDayOfWeek.setDate(today.getDate() - currentDay + 1); // Mergem la prima zi a săptămânii curente
        }
    
        const lastDayOfWeek = new Date(firstDayOfWeek); // Copiem prima zi a săptămânii
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Setăm ultima zi a săptămânii
    
        setStartDate(firstDayOfWeek);
        setEndDate(lastDayOfWeek);
    }, []);
    

    const fetchOrders = async (start, end) => {
        if (!start || !end) return; // Ensure both dates are set
        try {
            // Convert dates to the correct format for the API
            const startDateParam = start ? start.toISOString() : undefined;
            const endDateParam = end ? end.toISOString() : undefined;
    
            // Fetch data for orders
            const ordersResponse = await axios.get(`${url}/api/order/list`, {
                params: { startDate: startDateParam, endDate: endDateParam }
            });
            console.log('orders', ordersResponse.data); // Ensure to log the correct response object
    
            // Check the response for orders
            if (ordersResponse.data.success) {
                const ordersData = ordersResponse.data.data;
    
                if (ordersData.length === 0) {
                    setDateRange("No data available");
                    setUserActivityData([]); // Reset data
                    return;
                }
    
                // Set date range
                const formatDate = (date) => {
                    if (!date) return ""; // Check if date is not null
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${month}/${day}/${date.getFullYear()}`;
                };
                setDateRange(`${formatDate(start)} - ${formatDate(end)}`);
    
                // Generate user activity data for each day in the selected range
                const userActivityData = [];
                const currentDate = new Date(start);
    
                // Iterate over the date range
                while (currentDate <= end) {
                    const dayData = {
                        date: formatDate(currentDate),
                        "0-4": 0,
                        "4-8": 0,
                        "8-12": 0,
                        "12-16": 0,
                        "16-20": 0,
                        "20-24": 0,
                        total: 0 // Add total for the respective day
                    };
    
                    // Process orders for the current date
                    ordersData.forEach(item => {
                        const orderDate = new Date(item.date); // Use the correct field 'date'
                        if (orderDate.toDateString() === currentDate.toDateString()) {
                            const hour = orderDate.getHours();
                            // Increment the counter based on the hour
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
                            dayData.total++; // Increment total orders
                        }
                    });
    
                    userActivityData.push(dayData);
                    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
                }
    
                setUserActivityData(userActivityData);
            } else {
                console.error("Error fetching orders");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    

    useEffect(() => {
        fetchOrders(startDate, endDate);
    }, [startDate, endDate]); // Fetch data only when dates change

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Orders Activity Heatmap</h2>
            <div className="flex space-x-4 mb-4">
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)} // Set start date
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="p-2 rounded bg-gray-700 text-gray-200"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)} // Set end date
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="End Date"
                    className="p-2 rounded bg-gray-700 text-gray-200"
                />
            </div>
            <p className='text-gray-300 mb-4'>Time of scanning / Period: {dateRange}</p> {/* Display date range */}
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
                        {/* <Bar dataKey='total' fill='#FF5722' /> Show total orders */}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default OrdersActivityHeatmap;
