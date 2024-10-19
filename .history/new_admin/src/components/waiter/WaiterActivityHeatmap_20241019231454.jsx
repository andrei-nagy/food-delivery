import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Make sure to import the CSS for the date picker

const WaiterActivityHeatmap = () => {
    const [userActivityData, setUserActivityData] = useState([]);
    const [dateRange, setDateRange] = useState(""); // For displaying the date range
    const [startDate, setStartDate] = useState(null); // State for the start date
    const [endDate, setEndDate] = useState(null); // State for the end date
    const url = 'http://localhost:4000';

    const fetchList = async (start, end) => {
        try {
            // Convert dates to the correct format for your API, if needed
            const startDateParam = start ? start.toISOString() : undefined;
            const endDateParam = end ? end.toISOString() : undefined;

            // Pass the selected date range to the API (make sure your API supports this)
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`, {
                params: { startDate: startDateParam, endDate: endDateParam } // Adjust your API accordingly
            });

            if (response.data.success) {
                const newList = response.data.data;

                // Check if there is data
                if (newList.length === 0) {
                    setDateRange("No data available");
                    return;
                }

                // Determine the min and max date
                const createdDates = newList.map(item => new Date(item.createdOn));
                const minDate = new Date(Math.min(...createdDates));
                const maxDate = new Date(Math.max(...createdDates));

                // Set the date range in the desired format
                const formatDate = (date) => {
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${month}/${day}/${date.getFullYear()}`;
                };
                setDateRange(`${formatDate(minDate)} - ${formatDate(maxDate)}`);

                // Statistics for requests
                const userActivityData = Array.from({ length: 7 }, (_, i) => ({
                    name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
                    "0-4": 0,
                    "4-8": 0,
                    "8-12": 0,
                    "12-16": 0,
                    "16-20": 0,
                    "20-24": 0,
                }));

                // Process each request
                newList.forEach(item => {
                    const createdDate = new Date(item.createdOn);
                    const dayOfWeek = createdDate.getDay();
                    const hour = createdDate.getHours();
                    const dayIndex = (dayOfWeek + 6) % 7;

                    // Increment the count based on the hour
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
				console.log("User Activity Data:", userActivityData);

                // Set the data in state
                setUserActivityData(userActivityData);
            } else {
                console.error("Error fetching waiter requests");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

	useEffect(() => {
		console.log("Start Date:", startDate);
		console.log("End Date:", endDate);
		fetchList(startDate, endDate);
	}, [startDate, endDate]);
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
            <p className='text-gray-300 mb-4'>Time of scanning / Period: {dateRange}</p> {/* Display the date range */}
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
