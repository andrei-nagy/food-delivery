import { useEffect, useState } from "react";
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import WaiterRequestsGrowthChart from "../components/waiter/WaiterRequestsGrowthChartGrowthChart";
import WaiterActivityHeatmap from "../components/waiter/WaiterActivityHeatmap";
import WaiterActionsChart from "../components/waiter/WaiterActionsChart";
import AccountsTable from "../components/accounts/Accounts";

const AccountsPage = () => {
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsers: 0,
    
    });

    const url = 'http://localhost:4000';

    const fetchList = async () => {
        try {
            const response = await axios.get(`${url}/admin/admins`);

            if (response.data.success) {
                const newList = response.data.data;
console.log(newList)
                // Calculăm statisticile
                const totalUsers = newList.length; // Total cereri
                const adminAccounts = newList.filter(item => item.userRole === 'Admin').length;
                const waiterAccounts = newList.filter(item => item.userRole === 'Waiter').length;
console.log(adminAccounts)
console.log(waiterAccounts)
                const activeUsers = newList.filter(item => item.status === 'Completed').length; // Cereri completate

                // Setăm statisticile
                setUserStats({
                    totalUsers,
                    adminAccounts,
                    waiterAccounts,
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
            <Header title='Admin Panel Accounts' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard
                        name='Total Accounts'
                        icon={UsersIcon}
                        value={userStats.totalUsers.toLocaleString()}
                        color='#6366F1'
                    />
                    <StatCard 
                        name='Admin Accounts' 
                        icon={UserPlus} 
                        value={userStats.adminAccounts} 
                        color='#10B981' 
                    />
                    <StatCard
                        name='Waiter Accounts'
                        icon={UserCheck}
                        value={userStats.waiterAccounts.toLocaleString()}
                        color='#F59E0B'
                    />
            
                </motion.div>

                <AccountsTable />

                {/* USER CHARTS */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
                 
                </div>
            </main>
        </div>
    );
};

export default AccountsPage;
