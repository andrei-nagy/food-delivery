import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import axios from "axios"; // Make sure you have axios imported
import { useEffect, useState } from "react";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const SalesChannelChart = () => {
    const [paymentData, setPaymentData] = useState([]);
    const url = 'http://localhost:4000'; // Your API base URL

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                const response = await axios.get(`${url}/api/order/list`); // Adjust the endpoint if necessary
				if (response.data.success) {
                    const orders = response.data.data.filter(order => order.status === 'Delivered');

                    // Process payment methods and values
                    const paymentSummary = payments.reduce((acc, payment) => {
                        const method = payment.paymentMethod;
                        acc[method] = (acc[method] || 0) + payment.amount; // Assuming each payment has an amount field
                        return acc;
                    }, {});

                    // Convert to array format for the chart
                    const formattedData = Object.entries(paymentSummary).map(([name, value]) => ({ name, value }));
                    setPaymentData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
            }
        };

        fetchPaymentData();
    }, [url]);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 lg:col-span-2 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Payments by Method</h2>

            <div className='h-80'>
                <ResponsiveContainer>
                    <BarChart data={paymentData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
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
                        <Bar dataKey={"value"} fill='#8884d8'>
                            {paymentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SalesChannelChart;