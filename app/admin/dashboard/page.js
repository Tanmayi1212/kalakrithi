"use client";

import { useState } from "react";
import ModernSidebar from "@/src/components/admin/Sidebar";
import OverviewCards from "@/src/components/admin/OverviewCards";
import PendingPaymentsTable from "@/src/components/admin/PendingPaymentsTable";
import BookingsTable from "@/src/components/admin/BookingsTable";
import SlotManager from "@/src/components/admin/SlotManager";

export default function AdminDashboard() {
    const [currentView, setCurrentView] = useState("overview");

    const renderView = () => {
        switch (currentView) {
            case "overview":
                return <OverviewCards />;
            case "pending":
                return <PendingPaymentsTable />;
            case "confirmed":
                return <BookingsTable />;
            case "slots":
                return <SlotManager />;
            default:
                return <OverviewCards />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <ModernSidebar currentView={currentView} setCurrentView={setCurrentView} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    {renderView()}
                </div>
            </div>
        </div>
    );
}
