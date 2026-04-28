import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import OrderDetailsTabsModal from "../Orders/OrderViewModal";
import { Eye } from "lucide-react";

const AgentOrderList: React.FC<{ userId: any }> = ({ userId }) => {

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [dateRange, setDateRange] = useState({
        start_date: "",
        end_date: "",
    });

    const fetchOrders = async () => {
        if (!userId) return;
        const params = new URLSearchParams();
        if (dateRange.start_date) params.append("start_date", dateRange.start_date);
        if (dateRange.end_date) params.append("end_date", dateRange.end_date);
        try {
            setLoading(true);

            const res = await axiosInstance.get(
                `${Api.orders}?assigned_agent_id=${userId}&${params.toString()}` // 🔥 pass agent id
            );

            setOrders(res?.data?.orders || []);
        } catch (err) {
            console.error("Order fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
    };


    useEffect(() => {
        fetchOrders();
    }, [userId, dateRange]);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        const past = new Date(Date.now() - 7 * 86400000)
            .toISOString()
            .split("T")[0];

        setDateRange({
            start_date: past,
            end_date: today,
        });
    }, []);

    return (
        <div className="bg-white border rounded-xl p-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center mb-5">

                <h2 className="text-lg font-semibold">Agent Orders</h2>

                {/* DATE FILTER */}
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateRange.start_date}
                        onChange={(e) =>
                            setDateRange({ ...dateRange, start_date: e.target.value })
                        }
                        className="border px-3 py-2 rounded-lg text-sm"
                    />

                    <input
                        type="date"
                        value={dateRange.end_date}
                        onChange={(e) =>
                            setDateRange({ ...dateRange, end_date: e.target.value })
                        }
                        className="border px-3 py-2 rounded-lg text-sm"
                    />

                    {/* <button
                        onClick={fetchOrders}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                        Apply
                    </button> */}
                </div>
            </div>
            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">

                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">S.No</th>
                            <th className="px-4 py-3 text-left">Order ID</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Mobile</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">

                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-400">
                                    No Orders Found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order, i) => (
                                <tr key={order.id} className="hover:bg-gray-50">

                                    {/* S.No */}
                                    <td className="px-4 py-4">{i + 1}</td>

                                    {/* Order ID */}
                                    <td className="px-4 py-4 text-xs">
                                        {order.id}
                                    </td>

                                    {/* Customer */}
                                    <td className="px-4 py-4 font-medium">
                                        {order.customer_name}
                                    </td>

                                    {/* Mobile */}
                                    <td className="px-4 py-4">
                                        {order.customer_number}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-4 py-4">
                                        ₹{Number(order.total_price).toLocaleString("en-IN")}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium
                                            ${order.order_status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.order_status === "CANCELLED"
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {order.order_status}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-4">
                                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="text-gray-600 hover:text-black"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODALS */}
            {selectedOrder && (
                <OrderDetailsTabsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default AgentOrderList;