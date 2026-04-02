import React, { useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const ManualActivateModal = ({ order, onClose, onSuccess }: any) => {
    const [form, setForm] = useState({
        transaction_id: "",
        payment_method: "",
        gateway_response: "",
    });

    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    const handleSubmit = async () => {
        // ✅ validation
        if (!form.transaction_id) {
            toast.error("Transaction ID is required");
            return;
        }

        if (!form.payment_method) {
            toast.error("Select payment method");
            return;
        }

        let parsedGateway = {};

        if (form.gateway_response) {
            try {
                parsedGateway = JSON.parse(form.gateway_response);
            } catch {
                toast.error("Invalid JSON in gateway response");
                return;
            }
        }

        try {
            setLoading(true);

            const updatedApi = await axiosInstance.post(
                `${Api?.manualActivate}${order?.id}/manual-update/`,
                {
                    transaction_id: form.transaction_id,
                    payment_method: form.payment_method,
                    gateway_response: parsedGateway,
                }
            );
            if (updatedApi) {
                toast.success("Order Activated Successfully 🔥");
                onSuccess();
            }

        } catch (error: any) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

                {/* Title */}
                <h2 className="text-lg font-semibold mb-4">
                    Manual Order Activation
                </h2>

                {/* Order Info */}
                <p className="text-sm text-gray-500 mb-4">
                    Order ID: <span className="font-semibold">{order?.id}</span>
                </p>

                {/* Transaction ID */}
                <div className="mb-3">
                    <label className="text-sm font-medium">Transaction ID</label>
                    <input
                        type="text"
                        placeholder="Enter transaction id"
                        className="w-full border mt-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={form.transaction_id}
                        onChange={(e) =>
                            setForm({ ...form, transaction_id: e.target.value })
                        }
                    />
                </div>

                {/* Payment Method */}
                <div className="mb-3">
                    <label className="text-sm font-medium">Payment Method</label>
                    <select
                        className="w-full border mt-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={form.payment_method}
                        onChange={(e) =>
                            setForm({ ...form, payment_method: e.target.value })
                        }
                    >
                        <option value="">Select Payment Method</option>
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="CARD">Card</option>
                        <option value="NET_BANKING">Net Banking</option>
                        <option value="WALLET">Wallet</option>
                        <option value="COD">cod</option>

                    </select>
                </div>

                {/* Gateway Response */}
                <div className="mb-4">
                    <label className="text-sm font-medium">
                        Gateway Response (Optional JSON)
                    </label>
                    <textarea
                        rows={4}
                        placeholder='{"status":"success"}'
                        className="w-full border mt-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={form.gateway_response}
                        onChange={(e) =>
                            setForm({ ...form, gateway_response: e.target.value })
                        }
                    />
                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end px-6">
                        {apiErrors}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? "Activating..." : "Activate"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualActivateModal;