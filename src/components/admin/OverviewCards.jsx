"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getWorkshopBookingCounts } from "@/src/services/adminWorkshopService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, CheckCircle2, Clock, Lock, RefreshCw } from "lucide-react";
import { StatCard } from "../ui/StatCard";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";

export default function OverviewCards() {
    const [stats, setStats] = useState({
        totalWorkshops: 0,
        totalConfirmedBookings: 0,
        totalPendingPayments: 0,
        fullSlotsCount: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [statsData, bookingCounts] = await Promise.all([
            getDashboardStats(),
            getWorkshopBookingCounts(),
        ]);

        setStats(statsData);
        setChartData(bookingCounts);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                        <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
                            <div className="h-8 bg-gray-200 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
                </div>
                <Button onClick={loadData} variant="secondary" icon={RefreshCw}>
                    Refresh
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Workshops"
                    value={stats.totalWorkshops}
                    icon={LayoutDashboard}
                    color="teal"
                />
                <StatCard
                    title="Confirmed Bookings"
                    value={stats.totalConfirmedBookings}
                    icon={CheckCircle2}
                    color="green"
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.totalPendingPayments}
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    title="Full Slots"
                    value={stats.fullSlotsCount}
                    icon={Lock}
                    color="red"
                />
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Workshop Bookings</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Total confirmed bookings per workshop</p>
                </CardHeader>
                <CardContent className="pt-4">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="workshopName"
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    tickLine={false}
                                />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    cursor={{ fill: "#f9fafb" }}
                                />
                                <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <p className="text-sm">No bookings data available yet</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
