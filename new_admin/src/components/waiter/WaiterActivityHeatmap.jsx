import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, ChevronDown, Filter } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const WaiterActivityHeatmap = () => {
    const [userActivityData, setUserActivityData] = useState([]);
    const [dateRange, setDateRange] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const url = 'https://api.orderly-app.com';

    // Initialize dates to the current week
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        
        const today = new Date();
        const currentDay = today.getDay();
    
        const firstDayOfWeek = new Date(today); 
        if (currentDay === 0) {
            firstDayOfWeek.setDate(today.getDate() - 6);
        } else {
            firstDayOfWeek.setDate(today.getDate() - currentDay + 1);
        }
    
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        setStartDate(firstDayOfWeek);
        setEndDate(lastDayOfWeek);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchList = async (start, end) => {
        if (!start || !end) return;
        try {
            const startDateParam = start ? start.toISOString() : undefined;
            const endDateParam = end ? end.toISOString() : undefined;

            const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`, {
                params: { startDate: startDateParam, endDate: endDateParam }
            });

            if (response.data.success) {
                const newList = response.data.data;

                if (newList.length === 0) {
                    setDateRange("No data available");
                    setUserActivityData([]);
                    return;
                }

                // Format date based on screen size
                const formatDate = (date) => {
                    if (!date) return "";
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    if (isMobile) return `${month}/${day}`;
                    if (isTablet) return `${day}/${month}`;
                    return `${day}/${month}/${date.getFullYear().toString().slice(2)}`;
                };
                
                setDateRange(`${formatDate(start)} - ${formatDate(end)}`);

                // Generate user activity data
                const userActivityData = [];
                const currentDate = new Date(start);

                while (currentDate <= end) {
                    const dayData = {
                        date: formatDate(currentDate),
                        "0-4": 0,
                        "4-8": 0,
                        "8-12": 0,
                        "12-16": 0,
                        "16-20": 0,
                        "20-24": 0,
                    };

                    newList.forEach(item => {
                        const createdDate = new Date(item.createdOn);
                        if (createdDate.toDateString() === currentDate.toDateString()) {
                            const hour = createdDate.getHours();
                            if (hour >= 0 && hour < 4) dayData["0-4"]++;
                            else if (hour >= 4 && hour < 8) dayData["4-8"]++;
                            else if (hour >= 8 && hour < 12) dayData["8-12"]++;
                            else if (hour >= 12 && hour < 16) dayData["12-16"]++;
                            else if (hour >= 16 && hour < 20) dayData["16-20"]++;
                            else if (hour >= 20 && hour < 24) dayData["20-24"]++;
                        }
                    });

                    userActivityData.push(dayData);
                    currentDate.setDate(currentDate.getDate() + 1);
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
    }, [startDate, endDate]);

    // Calculate chart dimensions based on screen size
    const getChartDimensions = () => {
        if (isMobile) {
            return { 
                height: 320, 
                margin: { top: 20, right: 10, left: 10, bottom: 40 },
                xAxisFontSize: 10,
                yAxisWidth: 30,
                legendFontSize: 10
            };
        } else if (isTablet) {
            return { 
                height: 350, 
                margin: { top: 20, right: 20, left: 20, bottom: 50 },
                xAxisFontSize: 11,
                yAxisWidth: 40,
                legendFontSize: 11
            };
        } else {
            return { 
                height: 380, 
                margin: { top: 20, right: 30, left: 30, bottom: 60 },
                xAxisFontSize: 12,
                yAxisWidth: 45,
                legendFontSize: 12
            };
        }
    };

    const chartDims = getChartDimensions();

    // Mobile Date Range Display Component
    const MobileDateRangeDisplay = () => {
        const formatDateForDisplay = (date) => {
            if (!date) return "";
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-100">Date Range</h3>
                    </div>
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        {showDatePicker ? 
                            <ChevronDown className="w-4 h-4 text-gray-300 transform rotate-180" /> : 
                            <Filter className="w-4 h-4 text-gray-300" />
                        }
                    </button>
                </div>
                
                <div className="flex justify-between items-center mb-3 p-3 bg-gray-900 rounded-lg">
                    <div className="text-center min-w-0 flex-1">
                        <div className="text-xs text-gray-400">From</div>
                        <div className="text-sm font-medium text-gray-100 truncate">
                            {startDate ? formatDateForDisplay(startDate) : "Select"}
                        </div>
                    </div>
                    <div className="text-gray-500 px-2">→</div>
                    <div className="text-center min-w-0 flex-1">
                        <div className="text-xs text-gray-400">To</div>
                        <div className="text-sm font-medium text-gray-100 truncate">
                            {endDate ? formatDateForDisplay(endDate) : "Select"}
                        </div>
                    </div>
                </div>

                {showDatePicker && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">Start Date</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    if (date && endDate && date > endDate) {
                                        setEndDate(date);
                                    }
                                }}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Select start date"
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 text-sm"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1 block">End Date</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="Select end date"
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 text-sm"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    const weekAgo = new Date(today);
                                    weekAgo.setDate(today.getDate() - 7);
                                    setStartDate(weekAgo);
                                    setEndDate(today);
                                    setShowDatePicker(false);
                                }}
                                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Last Week
                            </button>
                            <button
                                onClick={() => {
                                    const today = new Date();
                                    setStartDate(today);
                                    setEndDate(today);
                                    setShowDatePicker(false);
                                }}
                                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg min-w-[200px]">
                    <p className="text-sm font-semibold text-gray-100 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-gray-300">{entry.dataKey}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-100">{entry.value}</span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Total:</span>
                            <span className="text-sm font-bold text-blue-400">
                                {payload.reduce((sum, entry) => sum + entry.value, 0)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Color palette for bars
    const barColors = [
        '#6366F1', // 0-4
        '#8B5CF6', // 4-8
        '#EC4899', // 8-12
        '#10B981', // 12-16
        '#F59E0B', // 16-20
        '#3B82F6', // 20-24
    ];

    // Mobile Legend
    const MobileLegend = () => (
        <div className="md:hidden mt-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Time Slots</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["0-4", "4-8", "8-12", "12-16", "16-20", "20-24"].map((slot, index) => (
                    <div key={slot} className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                        <div 
                            className="w-3 h-3 rounded flex-shrink-0" 
                            style={{ backgroundColor: barColors[index] }}
                        />
                        <span className="text-xs text-gray-300 truncate">{slot}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-3 md:p-4 lg:p-6 border border-gray-700 mb-8'>
            {/* Mobile Header */}
            <div className="md:hidden mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="min-w-0">
                        <h2 className='text-lg font-semibold text-gray-100 truncate'>Waiter Activity Heatmap</h2>
                        <p className='text-xs text-gray-400 truncate'>Time of scanning / Period: {dateRange}</p>
                    </div>
                </div>
                
                <MobileDateRangeDisplay />
                
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Total Days</div>
                        <div className="text-lg font-bold text-blue-400">
                            {userActivityData.length}
                        </div>
                    </div>
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Total Requests</div>
                        <div className="text-lg font-bold text-green-400">
                            {userActivityData.reduce((total, day) => 
                                total + Object.values(day).slice(1).reduce((sum, val) => sum + val, 0), 0
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-900 bg-opacity-30 p-3 rounded-xl border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Avg/Day</div>
                        <div className="text-lg font-bold text-yellow-400">
                            {userActivityData.length > 0 
                                ? Math.round(userActivityData.reduce((total, day) => 
                                    total + Object.values(day).slice(1).reduce((sum, val) => sum + val, 0), 0
                                ) / userActivityData.length)
                                : 0
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet Header */}
            <div className='hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-3 lg:gap-4'>
                <div className="min-w-0">
                    <h2 className='text-lg lg:text-xl font-semibold text-gray-100 truncate'>Waiter Requests Activity Heatmap</h2>
                    <p className='text-xs lg:text-sm text-gray-400 mt-1 truncate'>Time of scanning / Period: {dateRange}</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 lg:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                if (date && endDate && date > endDate) {
                                    setEndDate(date);
                                }
                            }}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Start Date"
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px]"
                            dateFormat="dd/MM/yy"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="End Date"
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px]"
                            dateFormat="dd/MM/yy"
                        />
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => {
                                const today = new Date();
                                const weekAgo = new Date(today);
                                weekAgo.setDate(today.getDate() - 7);
                                setStartDate(weekAgo);
                                setEndDate(today);
                            }}
                            className="px-3 lg:px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm whitespace-nowrap"
                        >
                            Last Week
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                setStartDate(today);
                                setEndDate(today);
                            }}
                            className="px-3 lg:px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm whitespace-nowrap"
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop/Tablet Stats */}
            <div className='hidden md:grid grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6'>
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Total Days</div>
                            <div className='text-lg lg:text-2xl font-bold text-blue-400'>
                                {userActivityData.length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Total Requests</div>
                            <div className='text-lg lg:text-2xl font-bold text-green-400'>
                                {userActivityData.reduce((total, day) => 
                                    total + Object.values(day).slice(1).reduce((sum, val) => sum + val, 0), 0
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className='bg-gray-900 bg-opacity-30 p-3 lg:p-4 rounded-xl border border-gray-700'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='text-xs lg:text-sm text-gray-400'>Average Per Day</div>
                            <div className='text-lg lg:text-2xl font-bold text-yellow-400'>
                                {userActivityData.length > 0 
                                    ? Math.round(userActivityData.reduce((total, day) => 
                                        total + Object.values(day).slice(1).reduce((sum, val) => sum + val, 0), 0
                                    ) / userActivityData.length)
                                    : 0
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="w-full" style={{ height: chartDims.height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={userActivityData}
                        margin={chartDims.margin}
                    >
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis 
                            dataKey='date' 
                            stroke='#9CA3AF'
                            fontSize={chartDims.xAxisFontSize}
                            tickMargin={5}
                            interval={0}
                            minTickGap={-1}
                        />
                        <YAxis 
                            stroke='#9CA3AF'
                            fontSize={chartDims.xAxisFontSize}
                            width={chartDims.yAxisWidth}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                        />
                        {!isMobile && (
                            <Legend 
                                wrapperStyle={{ 
                                    fontSize: chartDims.legendFontSize,
                                    paddingTop: '10px'
                                }}
                                formatter={(value) => (
                                    <span className="text-gray-300 text-xs">
                                        {value}
                                    </span>
                                )}
                            />
                        )}
                        <Bar dataKey='0-4' stackId='a' fill='#6366F1' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='4-8' stackId='a' fill='#8B5CF6' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='8-12' stackId='a' fill='#EC4899' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='12-16' stackId='a' fill='#10B981' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='16-20' stackId='a' fill='#F59E0B' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='20-24' stackId='a' fill='#3B82F6' radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Mobile Legend */}
            {isMobile && <MobileLegend />}

            {/* No Data Message */}
            {userActivityData.length === 0 && (
                <div className="text-center py-8 lg:py-12">
                    <div className="text-gray-400 mb-2">No data available for selected period</div>
                    <div className="text-sm text-gray-500">Try selecting a different date range</div>
                </div>
            )}

            {/* Time Slot Explanation */}
            <div className="mt-3 lg:mt-4 text-xs text-gray-400">
                <p className="break-words">
                    Time slots: 0-4 (Midnight - 4AM), 4-8 (4AM - 8AM), 8-12 (8AM - Noon), 12-16 (Noon - 4PM), 16-20 (4PM - 8PM), 20-24 (8PM - Midnight)
                </p>
            </div>
        </div>
    );
};

export default WaiterActivityHeatmap;