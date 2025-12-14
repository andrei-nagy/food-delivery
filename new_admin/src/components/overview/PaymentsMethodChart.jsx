import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import axios from "axios"; // Make sure axios is imported
import { useEffect, useState } from "react";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const PaymentsMethodChart
 = () => {
    const [paymentData, setPaymentData] = useState([]);
    const url = 'https://api.orderly-app.com'; // Your API base URL

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await axios.get(`${url}/api/order/list`);
                if (response.data.success) {
                    const orders = response.data.data.filter(order => order.status === 'Delivered');;
console.log(orders)
                    // Count occurrences of each payment method
                    const paymentMethodCounts = orders.reduce((acc, order) => {
                        const method = order.paymentMethod; // Access the paymentMethod
                        if (method) {
                            acc[method] = (acc[method] || 0) + 1; // Count occurrences
                        }
                        return acc;
                    }, {});

                    // Convert the counts to an array format for the chart
                    const formattedData = Object.entries(paymentMethodCounts).map(([name, count]) => ({ name, value: count }));
                    setPaymentData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching order data:", error);
            }
        };

        fetchOrderData();
    }, [url]);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 lg:col-span-2 border border-gray-700'
            style={{ zIndex: -1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Payment Methods Count</h2>

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

export default PaymentsMethodChart
;
