"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    subscribeToPendingPayments,
    confirmPayment,
    rejectPayment,
} from "@/src/utils/adminService";
import { getCurrentAdmin } from "@/src/utils/adminAuth";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Card } from "../ui/Card";

export default function PendingPaymentsTable() {
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        loadAdminUser();
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToPendingPayments((data) => {
            setPayments(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    async function loadAdminUser() {
        const { user } = await getCurrentAdmin();
        setAdminUser(user);
    }

    async function handleConfirm() {
        if (!selectedPayment || !adminUser) return;

        setProcessingId(selectedPayment.id);
        setShowConfirmModal(false);

        const result = await confirmPayment(selectedPayment.id, adminUser.uid);

        if (result.success) {
            setSelectedPayment(null);
        }

        setProcessingId(null);
    }

    async function handleReject() {
        if (!selectedPayment || !adminUser) return;

        setProcessingId(selectedPayment.id);
        setShowRejectModal(false);

        const result = await rejectPayment(selectedPayment.id, adminUser.uid);

        if (result.success) {
            setSelectedPayment(null);
        }

        setProcessingId(null);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pending Payments</h1>
                        <p className="text-sm text-gray-600 mt-1">Review and approve payment submissions</p>
                    </div>
                </div>
                <Card className="animate-pulse">
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded" />
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Payments</h1>
                    <p className="text-sm text-gray-600 mt-1">Review and approve payment submissions</p>
                </div>
                <Badge variant="warning" className="text-base px-4 py-2">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {payments.length} Pending
                </Badge>
            </div>

            {/* Table */}
            {payments.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h2>
                        <p className="text-gray-600">No pending payments to review</p>
                    </div>
                </Card>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Workshop
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slot
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{payment.name}</div>
                                            <div className="text-sm text-gray-500">{payment.rollNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{payment.workshopName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{payment.slotTime}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-teal-600">₹{payment.amount}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono text-gray-500">{payment.transactionId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {payment.createdAt
                                                    ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowConfirmModal(true);
                                                    }}
                                                    disabled={processingId === payment.id}
                                                    variant="success"
                                                    size="sm"
                                                    icon={processingId === payment.id ? Loader2 : CheckCircle}
                                                >
                                                    {processingId === payment.id ? "Processing..." : "Confirm"}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowRejectModal(true);
                                                    }}
                                                    disabled={processingId === payment.id}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Confirm Modal */}
            <Modal
                isOpen={showConfirmModal && selectedPayment}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedPayment(null);
                }}
                title="Confirm Payment?"
                footer={
                    <div className="flex gap-3">
                        <Button onClick={handleConfirm} variant="success" className="flex-1">
                            Yes, Confirm
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirmModal(false);
                                setSelectedPayment(null);
                            }}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                }
            >
                <p className="text-gray-600">
                    Are you sure you want to confirm this payment and create a booking for{" "}
                    <span className="font-semibold text-gray-900">{selectedPayment?.name}</span>?
                </p>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal && selectedPayment}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                }}
                title="Reject Payment?"
                footer={
                    <div className="flex gap-3">
                        <Button onClick={handleReject} variant="danger" className="flex-1">
                            Yes, Reject
                        </Button>
                        <Button
                            onClick={() => {
                                setShowRejectModal(false);
                                setSelectedPayment(null);
                            }}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                }
            >
                <p className="text-gray-600">
                    Are you sure you want to reject this payment from{" "}
                    <span className="font-semibold text-gray-900">{selectedPayment?.name}</span>? This action
                    cannot be undone.
                </p>
            </Modal>
        </div>
    );
}
