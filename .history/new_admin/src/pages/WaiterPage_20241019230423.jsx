import { useEffect, useState } from "react";
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UserGrowthChart from "../components/waiter/UserGrowthChart";
import WaiterActivityHeatmap from "../components/waiter/WaiterActivityHeatmap";
import UserDemographicsChart from "../components/waiter/UserDemographicsChart";
import WaiterTable from "../components/waiter/WaiterTable";

const WaiterPage = () => {
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsers: 0,
    
    });

    const url = 'http://localhost:4000';

    const fetchList = async () => {
        try {
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);

            if (response.data.success) {
                const newList = response.data.data;

                // Calculăm statisticile
                const totalUsers = newList.length; // Total cereri
                const newUsersToday = newList.filter(item => {
                    const createdDate = new Date(item.createdOn);
                    const today = new Date();
                    return createdDate.getDate() === today.getDate() &&
                           createdDate.getMonth() === today.getMonth() &&
                           createdDate.getFullYear() === today.getFullYear();
                }).length; // Cereri de astăzi

                const activeUsers = newList.filter(item => item.status === 'Completed').length; // Cereri completate

                // Setăm statisticile
                setUserStats({
                    totalUsers,
                    newUsersToday,
                    activeUsers,
                    churnRate: "2.4%", // Păstrăm valoarea existentă pentru churn rate
                });
            } else {
                console.error("Error fetching waiter requests");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchList();
        const intervalId = setInterval(() => {
            fetchList();
        }, 5000); // Actualizăm datele la fiecare 5 secunde

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Waiter Requests' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard
                        name='Total Requests'
                        icon={UsersIcon}
                        value={userStats.totalUsers.toLocaleString()}
                        color='#6366F1'
                    />
                    <StatCard 
                        name='New Requests Today' 
                        icon={UserPlus} 
                        value={userStats.newUsersToday} 
                        color='#10B981' 
                    />
                    <StatCard
                        name='Completed Requests'
                        icon={UserCheck}
                        value={userStats.activeUsers.toLocaleString()}
                        color='#F59E0B'
                    />
            
                </motion.div>

                <WaiterTable />

                {/* USER CHARTS */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
                    <UserGrowthChart />
                    <WaiterActivityHeatmap />
                    <UserDemographicsChart />
                </div>
            </main>
        </div>
    );
};

export default WaiterPage;
