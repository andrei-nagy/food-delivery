import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Filter, ChevronDown, List, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import axios from "axios";

const COLORS = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6366F1", // Indigo
];

const WaiterActionsChart = () => {
    const [userDemographicsData, setUserDemographicsData] = useState([]);
    const [topActions, setTopActions] = useState([]);
    const [otherActions, setOtherActions] = useState([]);
    const [totalRequests, setTotalRequests] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
    const [viewMode, setViewMode] = useState("pie");
    const [showFilters, setShowFilters] = useState(false);
    const [maxActions, setMaxActions] = useState(5);
    const url = 'https://api.orderly-app.com';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
            if (window.innerWidth >= 768) {
                setShowFilters(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchWaiterActionsData = async () => {
        try {
            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
            if (response.data.success) {
                const requests = response.data.data;

                const actionCount = {};
                requests.forEach(item => {
                    const action = item.action || "Unknown";
                    if (!actionCount[action]) {
                        actionCount[action] = 0;
                    }
                    actionCount[action]++;
                });

                const allData = Object.entries(actionCount)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                setTotalRequests(allData.reduce((sum, item) => sum + item.value, 0));

                const topN = allData.slice(0, maxActions);
                setTopActions(topN);

                const remaining = allData.slice(maxActions);
                if (remaining.length > 0) {
                    const otherValue = remaining.reduce((sum, item) => sum + item.value, 0);
                    setOtherActions([{ name: `Other (${remaining.length})`, value: otherValue }]);
                } else {
                    setOtherActions([]);
                }

                const chartData = [...topN];
                if (remaining.length > 0) {
                    chartData.push({ 
                        name: `Other (${remaining.length})`, 
                        value: remaining.reduce((sum, item) => sum + item.value, 0) 
                    });
                }

                setUserDemographicsData(chartData);
            }
        } catch (error) {
            console.error("Error fetching user demographics data:", error);
        }
    };

    useEffect(() => {
        fetchWaiterActionsData();
    }, [maxActions]);

    // Format labels for better display
    const formatLabel = (name, percent) => {
        const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
        return `${shortName}\n${(percent * 100).toFixed(0)}%`;
    };

    // Calculate appropriate chart dimensions based on screen size
    const getChartDimensions = () => {
        if (isMobile) {
            return { height: 280, outerRadius: 80, innerRadius: 40, legendFontSize: 10 };
        } else if (isTablet) {
            return { height: 320, outerRadius: 90, innerRadius: 45, legendFontSize: 11 };
        } else {
            return { height: 350, outerRadius: 100, innerRadius: 50, legendFontSize: 12 };
        }
    };

    const chartDims = getChartDimensions();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / totalRequests) * 100).toFixed(1);
            
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg min-w-[180px]">
                    <p className="text-sm font-semibold text-gray-100 mb-2 break-words">{data.name}</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Requests:</span>
                            <span className="text-sm font-bold text-gray-100">{data.value}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Percentage:</span>
                            <span className="text-sm font-bold text-blue-400">{percentage}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Mobile Action Item
    const MobileActionItem = ({ item, index, total }) => {
        const percentage = ((item.value / total) * 100).toFixed(1);
        
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div 
                            className="flex-shrink-0 w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-100 truncate">
                            {item.name}
                        </span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-sm font-bold text-gray-100">{item.value}</div>
                        <div className="text-xs text-gray-400">{percentage}%</div>
                    </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                        }}
                    />
                </div>
            </div>
        );
    };

    // Mobile Filters
    const MobileFilters = () => (
        <div className="md:hidden bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-100">Display Options</h3>
                    <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                        aria-label="Close filters"
                    >
                        <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-180" />
                    </button>
                </div>
                
                <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">Show Top Actions</label>
                    <div className="flex gap-2">
                        {[3, 5, 7, 10].map(num => (
                            <button
                                key={num}
                                onClick={() => {
                                    setMaxActions(num);
                                    setShowFilters(false);
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                                    maxActions === num 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                            >
                                Top {num}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <label className="text-xs font-medium text-gray-400 mb-1 block">Chart Type</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setViewMode("pie");
                                setShowFilters(false);
                            }}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                                viewMode === "pie" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            <PieChartIcon className="w-4 h-4" />
                            Pie
                        </button>
                        <button
                            onClick={() => {
                                setViewMode("bar");
                                setShowFilters(false);
                            }}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                                viewMode === "bar" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Bar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-3 md:p-4 lg:p-6 border border-gray-700 mb-8'>
            {/* Mobile Header */}
            <div className="md:hidden mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="min-w-0">
                        <h2 className='text-lg font-semibold text-gray-100 truncate'>Waiter Request Actions</h2>
                        <p className="text-xs text-gray-400 truncate">
                            {topActions.length} actions • {totalRequests} total requests
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            aria-label={showFilters ? "Hide filters" : "Show filters"}
                        >
                            <Filter size={20} className="text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Mobile Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Top Actions</div>
                                <div className="text-lg font-bold text-blue-400">
                                    {maxActions}
                                </div>
                            </div>
                            <List className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Total Requests</div>
                                <div className="text-lg font-bold text-green-400">
                                    {totalRequests}
                                </div>
                            </div>
                            <BarChart3 className="w-6 h-6 text-green-500 flex-shrink-0" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Unique Actions</div>
                                <div className="text-lg font-bold text-yellow-400">
                                    {topActions.length + (otherActions.length > 0 ? 1 : 0)}
                                </div>
                            </div>
                            <PieChartIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400">Other Actions</div>
                                <div className="text-lg font-bold text-purple-400">
                                    {otherActions.length > 0 ? otherActions[0].value : 0}
                                </div>
                            </div>
                            <Filter className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && <MobileFilters />}
            </div>

            {/* Desktop/Tablet Header */}
            <div className='hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-3 lg:gap-4'>
                <div className="min-w-0">
                    <h2 className='text-lg lg:text-xl font-semibold text-gray-100 truncate'>Waiter Request Actions Distribution</h2>
                    <p className='text-xs lg:text-sm text-gray-400 mt-1 truncate'>
                        Showing top {maxActions} actions • {totalRequests} total requests
                    </p>
                </div>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 lg:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-1 lg:gap-2 bg-gray-900 bg-opacity-50 p-1 rounded-lg flex-wrap">
                        <button
                            onClick={() => setViewMode("pie")}
                            className={`px-3 lg:px-4 py-1 lg:py-2 rounded-md transition-colors text-sm ${
                                viewMode === "pie" 
                                    ? "bg-blue-600 text-white" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                            }`}
                        >
                            <div className="flex items-center gap-1 lg:gap-2">
                                <PieChartIcon size={16} className="lg:size-[18px]" />
                                <span className="hidden sm:inline">Pie Chart</span>
                                <span className="sm:hidden">Pie</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode("bar")}
                            className={`px-3 lg:px-4 py-1 lg:py-2 rounded-md transition-colors text-sm ${
                                viewMode === "bar" 
                                    ? "bg-blue-600 text-white" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                            }`}
                        >
                            <div className="flex items-center gap-1 lg:gap-2">
                                <BarChart3 size={16} className="lg:size-[18px]" />
                                <span className="hidden sm:inline">Bar Chart</span>
                                <span className="sm:hidden">Bar</span>
                            </div>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-1 lg:gap-2">
                        <span className="text-xs lg:text-sm text-gray-400 whitespace-nowrap">Show:</span>
                        <div className="flex gap-1 flex-wrap">
                            {[3, 5, 7, 10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setMaxActions(num)}
                                    className={`px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm ${
                                        maxActions === num 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    Top {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet Stats */}
            <div className='hidden md:grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-6'>
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Top Actions</div>
                            <div className='text-lg lg:text-2xl font-bold text-blue-400'>
                                {maxActions}
                            </div>
                        </div>
                        <List className='w-6 h-6 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0' />
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Total Requests</div>
                            <div className='text-lg lg:text-2xl font-bold text-green-400'>
                                {totalRequests}
                            </div>
                        </div>
                        <BarChart3 className='w-6 h-6 lg:w-8 lg:h-8 text-green-500 flex-shrink-0' />
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Unique Actions</div>
                            <div className='text-lg lg:text-2xl font-bold text-yellow-400'>
                                {topActions.length + (otherActions.length > 0 ? 1 : 0)}
                            </div>
                        </div>
                        <PieChartIcon className='w-6 h-6 lg:w-8 lg:h-8 text-yellow-500 flex-shrink-0' />
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>In "Other"</div>
                            <div className='text-lg lg:text-2xl font-bold text-purple-400'>
                                {otherActions.length > 0 ? otherActions[0].value : 0}
                            </div>
                        </div>
                        <Filter className='w-6 h-6 lg:w-8 lg:h-8 text-purple-500 flex-shrink-0' />
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {/* Chart for mobile */}
                <div className="w-full mb-4" style={{ height: chartDims.height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {viewMode === "pie" ? (
                            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <Pie
                                    data={userDemographicsData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={chartDims.outerRadius}
                                    innerRadius={chartDims.innerRadius}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => formatLabel(name, percent)}
                                    labelLine={false}
                                >
                                    {userDemographicsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        ) : (
                            <BarChart 
                                data={userDemographicsData}
                                margin={{ top: 20, right: 10, left: 0, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#9CA3AF"
                                    fontSize={10}
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                    interval={0}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={10} width={30} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* List of actions for mobile */}
                <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Top Actions</h3>
                    {topActions.map((item, index) => (
                        <MobileActionItem 
                            key={item.name} 
                            item={item} 
                            index={index} 
                            total={totalRequests}
                        />
                    ))}
                    {otherActions.length > 0 && (
                        <MobileActionItem 
                            key="other"
                            item={otherActions[0]} 
                            index={topActions.length}
                            total={totalRequests}
                        />
                    )}
                </div>
            </div>

            {/* Desktop/Tablet View */}
            <div className='hidden md:block'>
                <div className="w-full" style={{ height: chartDims.height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {viewMode === "pie" ? (
                            <PieChart margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
                                <Pie
                                    data={userDemographicsData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={chartDims.outerRadius}
                                    innerRadius={chartDims.innerRadius}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => formatLabel(name, percent)}
                                    labelLine={true}
                                >
                                    {userDemographicsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(31, 41, 55, 0.95)",
                                        borderColor: "#4B5563",
                                        borderRadius: "0.5rem",
                                        fontSize: "12px",
                                        maxWidth: "250px",
                                    }}
                                    itemStyle={{ color: "#E5E7EB" }}
                                />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    wrapperStyle={{ 
                                        fontSize: chartDims.legendFontSize,
                                        paddingLeft: "10px"
                                    }}
                                    formatter={(value) => (
                                        <span className="text-gray-300">
                                            {value.length > 20 ? value.substring(0, 20) + '...' : value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        ) : (
                            <BarChart 
                                data={userDemographicsData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#9CA3AF"
                                    fontSize={isTablet ? 11 : 12}
                                    angle={-30}
                                    textAnchor="end"
                                    height={isTablet ? 60 : 70}
                                    interval={0}
                                />
                                <YAxis 
                                    stroke="#9CA3AF" 
                                    fontSize={isTablet ? 11 : 12} 
                                    width={isTablet ? 35 : 40}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(31, 41, 55, 0.95)",
                                        borderColor: "#4B5563",
                                        borderRadius: "0.5rem",
                                        fontSize: "12px",
                                        maxWidth: "250px",
                                    }}
                                    itemStyle={{ color: "#E5E7EB" }}
                                />
                                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* No Data Message */}
            {userDemographicsData.length === 0 && (
                <div className="text-center py-8 lg:py-12">
                    <div className="text-gray-400 mb-2">No action data available</div>
                    <div className="text-sm text-gray-500">No waiter requests have been made yet</div>
                </div>
            )}

            {/* Footer Info */}
            <div className="mt-3 lg:mt-4 text-xs text-gray-400">
                <p className="break-words">
                    Showing the top {Math.min(maxActions, topActions.length)} most frequent actions. 
                    {otherActions.length > 0 && ` ${otherActions[0].value} requests are grouped under "Other".`}
                </p>
            </div>
        </div>
    );
};

export default WaiterActionsChart;