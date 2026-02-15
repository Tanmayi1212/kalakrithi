"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentAdmin } from "@/src/utils/adminAuth";
import WorkshopBookingsView from "@/src/components/admin/WorkshopBookingsView";
import toast from "react-hot-toast";

export default function WorkshopBookingsPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const { user } = await getCurrentAdmin();
            if (!user) {
                toast.error("Unauthorized. Please login.");
                router.push("/admin/login");
                return;
            }
            setLoading(false);
        } catch (error) {
            console.error("Auth Error:", error);
            router.push("/admin/login");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <WorkshopBookingsView />
            </div>
        </div>
    );
}
