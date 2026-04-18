import React, { useState, useEffect } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const AddPaymentModal = ({ order, onClose, onSuccess }: any) => {
    const [form, setForm] = useState({
        amount: "",
        payment_method: "",
        transaction_id: "",
        transaction_type: "",
        user_id: "",
    });

    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setForm(prev => ({ ...prev, user_id: user.id || "" }));
        }
    }, []);

    const handleSubmit = async () => {
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!form.transaction_type) {
            toast.error("Please select a transaction type");
            return;
        }
        if (!form.payment_method) {
            toast.error("Please select a payment method");
            return;
        }
        if (!form.transaction_id) {
            toast.error("Transaction ID is required");
            return;
        }

        try {
            setLoading(true);
            setApiErrors("");

            const response = await axiosInstance.post(
                `${Api.createOrderPayment}${order?.id}/payment/`,
                {
                    amount: form.amount,
                    payment_method: form.payment_method,
                    transaction_id: form.transaction_id,
                    transaction_type: form.transaction_type,
                    user_id: form.user_id,
                }
            );

            if (response) {
                toast.success("Payment recorded successfully!");
                onSuccess();
            }
        } catch (error: any) {
            const errorMsg = extractErrorMessage(error);
            setApiErrors(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add Payment</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Adding manual payment for Order: <span className="font-semibold text-orange-600">#{order?.id}</span>
                    </p>
                </div>

                <div className="space-y-4">

                    {/* Transaction Type */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Type</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={form.transaction_type}
                            onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
                        >
                            <option value="">Select Type</option>
                            <option value="PAYMENT">Payment</option>
                            <option value="REFUND">Refund</option>
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (₹)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="Enter amount"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={form.payment_method}
                            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                        >
                            <option value="">Select Method</option>
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                            <option value="CHEQUE">Cheque</option>
                        </select>
                    </div>

                    {/* Transaction ID */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</label>
                        <input
                            type="text"
                            placeholder="Enter reference number"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            value={form.transaction_id}
                            onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                        />
                    </div>
                </div>

                {apiErrors && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs text-red-600 text-center font-medium">
                            {apiErrors}
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md shadow-orange-100 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {loading ? "Adding..." : "Add Payment"}
                    </button>

                </div>
            </div>
        </div>

    );
};

export default AddPaymentModal;
