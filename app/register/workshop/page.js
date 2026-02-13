"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect old workshop registration URL to new 15-minute slot system
 */
export default function WorkshopRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/register/workshops");
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 mx-auto mb-4" />
                <p className="text-xl text-gray-700">Redirecting to workshop registration...</p>
            </div>
        </div>
    );
}
