"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Clock,
    CheckCircle,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { signOutAdmin } from "@/src/utils/adminAuth";
import { useRouter } from "next/navigation";

const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "workshops", label: "Workshop Bookings", icon: Clock },
    { id: "pending", label: "Pending Payments", icon: Clock },
    { id: "confirmed", label: "Confirmed Bookings", icon: CheckCircle },
    { id: "slots", label: "Slot Management", icon: Settings },
];

export default function ModernSidebar({ currentView, setCurrentView }) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    async function handleLogout() {
        await signOutAdmin();
        router.push("/admin/login");
    }

    const SidebarContent = () => (
        <>
            {/* Logo/Header */}
            <div className="px-6 py-5 border-b border-gray-200">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Kalakrithi Admin
                </h1>
                <p className="text-xs text-gray-500 mt-1">Event Management</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setCurrentView(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-teal-50 text-teal-700 shadow-sm"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-teal-600" : "text-gray-500"}`} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="lg:hidden flex flex-col w-64 bg-white fixed left-0 top-0 h-screen z-50 shadow-2xl">
                        <SidebarContent />
                    </aside>
                </>
            )}
        </>
    );
}
