import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { assets } from "../../../../frontend/src/assets/assets"; // ajustează calea dacă este necesar

const userStats = {
  totalUsers: 152845,
  newUsersToday: 243,
  activeUsers: 98520,
  churnRate: "2.4%",
};

const WaiterTable = ({ url }) => {
  const [list, setList] = useState([]);
  const [newRequests, setNewRequests] = useState([]);
  const audioRef = useRef(null); // Referință pentru redare audio

  // Funcția de preluare a listei de comenzi
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
      if (response.data.success) {
        const newList = response.data.data;

        // Verificăm cererile noi
        if (JSON.stringify(newList) !== JSON.stringify(list)) {
          const pendingRequests = newList.filter((item) => item.status === "Pending");
          setNewRequests(pendingRequests.filter((item) => !list.includes(item)));

          if (audioRef.current) {
            audioRef.current.play().catch((error) => console.log("Sound play blocked:", error));
          }

          toast.success("New waiter request received!");
          setList(newList);
        }
      } else {
        toast.error("Error fetching waiter requests.");
      }
    } catch (error) {
      toast.error("Error");
    }
  };

  // Facem polling la fiecare 5 secunde
  useEffect(() => {
    fetchList();
    const intervalId = setInterval(fetchList, 5000);
    return () => clearInterval(intervalId); // Cleanup interval
  }, [list]);

  // Schimbare status comenzi
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/waiterorders/status`, {
        orderId,
        status: event.target.value,
      });
      if (response.data.success) {
        toast.success("Status updated successfully.");
        await fetchList();
      } else {
        toast.error("Error updating status.");
      }
    } catch (error) {
      toast.error("Error");
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Waiter Requests" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Users" icon={UsersIcon} value={userStats.totalUsers.toLocaleString()} color="#6366F1" />
          <StatCard name="New Users Today" icon={UserPlus} value={userStats.newUsersToday} color="#10B981" />
          <StatCard name="Active Users" icon={UserCheck} value={userStats.activeUsers.toLocaleString()} color="#F59E0B" />
          <StatCard name="Churn Rate" icon={UserX} value={userStats.churnRate} color="#EF4444" />
        </motion.div>

        {/* Waiter Table */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Pending Requests"
            value={list.filter((item) => item.status === "Pending").length}
            color="#F59E0B"
          />
          <StatCard
            name="Completed Requests"
            value={list.filter((item) => item.status === "Completed").length}
            color="#10B981"
          />
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Pending Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Table No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {list
                  .filter((item) => item.status === "Pending")
                  .map((item) => (
                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{item.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.tableNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          onChange={(event) => statusHandler(event, item._id)}
                          value={item.status}
                          className="bg-gray-700 text-white rounded-md"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Completed Requests */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Completed Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Table No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {list
                  .filter((item) => item.status === "Completed")
                  .map((item) => (
                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{item.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.tableNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          onChange={(event) => statusHandler(event, item._id)}
                          value={item.status}
                          className="bg-gray-700 text-white rounded-md"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Audio notification */}
        <audio ref={audioRef} src={assets.notification_sound} preload="auto" />
      </main>
    </div>
  );
};

export default WaiterTable;
