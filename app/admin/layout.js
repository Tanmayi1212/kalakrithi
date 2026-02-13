"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentAdmin } from "@/src/utils/adminAuth";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    // Don't check auth on the login page
    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        // Skip auth check for login page
        if (isLoginPage) {
            setLoading(false);
            setAuthorized(true);
            return;
        }

        async function checkAuth() {
            const { isAdmin } = await getCurrentAdmin();

            if (!isAdmin) {
                router.push("/admin/login");
                return;
            }

            setAuthorized(true);
            setLoading(false);
        }

        checkAuth();
    }, [router, isLoginPage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-700 font-semibold">
                        Verifying credentials...
                    </p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            {children}
        </div>
    );
}
