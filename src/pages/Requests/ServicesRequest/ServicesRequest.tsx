import React, { useEffect, useRef, useState } from "react";
import { Search, Loader, Eye } from "lucide-react";
import axiosInstance from "../../../configs/axios-middleware";
import Api from '../../../api-endpoints/ApiUrls';

interface ServiceModification {
    id: string;
    order_details: any;
    original_service_details: any;
    new_service_details: any;
    zone_details: any;
    requested_by: any;
    status: string;
    modification_type: string;
    created_at: string;
}

const ServicesRequest: React.FC = () => {
    const [data, setData] = useState<ServiceModification[]>([]);
    const [filteredData, setFilteredData] = useState<ServiceModification[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(true);
    console.log(filteredData)
    const socketRef = useRef<WebSocket | null>(null);
    const emptyImage = 'https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE='

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const handleView = (item: any) => {
        setSelectedItem(item);
        setShowModal(true);
    };


    // ---------------- CONNECT SOCKET ----------------
    useEffect(() => {
        const token = localStorage.getItem("token");

        const ws = new WebSocket(
            `wss://api.itfixer199.com/ws/service-modifications/?token=${token}&size=500`
        );

        socketRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket Connected");
        };

        // ws.onmessage = (event) => {
        //     console.log(event)
        //     const message = JSON.parse(event.data);

        //     if (message.type === "initial_data") {
        //         setData(message.modifications || []);
        //         setLoading(false);
        //     }

        //     if (message.type === "update") {
        //         const updatedItem = message?.modification;
        //         console.log(updatedItem)
        //         setData((prev) => {
        //             const index = prev?.findIndex((item) => item?.id === updatedItem?.id);

        //             if (index !== -1) {
        //                 const updatedList = [...prev];
        //                 updatedList[index] = updatedItem; // 🔥 replace existing
        //                 return updatedList;
        //             } else {
        //                 return [updatedItem, ...prev];
        //             }
        //         });
        //     }
        // };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "initial_data" || message.type === "update") {
                setData(message.modifications || []);
                setLoading(false);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket Closed");
        };

        return () => {
            ws.close();
        };
    }, []);

    // ---------------- CHANGE DATE LIVE ----------------
    const handleDateChange = (value: string) => {
        setDate(value);

        if (socketRef.current) {
            // socketRef.current.send(JSON.stringify({ date: value }));
            socketRef.current.send(
                JSON.stringify({
                    start_date: value,
                    end_date: value,
                    page: 1,
                    size: 10
                })
            );
        }
    };

    // ---------------- FILTER LOGIC ----------------
    useEffect(() => {
        let temp = [...data];

        if (search) {
            temp = temp.filter(
                (item) =>
                    item?.order_details?.customer_name
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) ||
                    item?.new_service_details?.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            temp = temp?.filter((item) => item?.status === statusFilter);
        }

        setFilteredData(temp);
    }, [search, statusFilter, data]);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAdminApproval = async (id: string, isApproved: boolean) => {
        try {
            setLoadingId(id);

            await axiosInstance.post(
                `${Api?.serviceModificationOrders}/${id}/admin-approval/`,
                { is_approved: isApproved }
            );

            // 🔥 Trigger websocket refresh
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(
                    JSON.stringify({
                        action: "refresh_modifications"
                    })
                );
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };


    return (
        <div className="p-0 space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900">
                Service Modification Requests (Live)
            </h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or service..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="all">All Status</option>
                    <option value="APPLIED">APPLIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                </select>

                {/* Date Filter */}
                {/* <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                /> */}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin" />
                    </div>
                ) : (
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-3 text-left">S.No</th>
                                <th className="px-6 py-3 text-left">Customer</th>
                                <th className="px-6 py-3 text-left">Zone</th>
                                <th className="px-6 py-3 text-left">Original Service</th>
                                <th className="px-6 py-3 text-left">New Service</th>
                                <th className="px-6 py-3 text-left">Type</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Approved </th>
                                <th className="px-6 py-3 text-left">Created</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-400">
                                        No Data Found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item: any, index: number) => (
                                    <tr key={item?.id} className="hover:bg-gray-50 capitalize">
                                        <td className="px-6 py-4">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item?.order_details?.customer_name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {item?.zone_details?.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item?.original_service_details?.name}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            {item?.new_service_details?.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {item?.modification_type}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                {item?.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item?.is_admin_approved === true ? (
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                    Approved
                                                </span>
                                            ) : item?.is_admin_approved === false && item?.status === "REJECTED" ? (
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                                                    Rejected
                                                </span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAdminApproval(item?.id, true)}
                                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() => handleAdminApproval(item?.id, false)}
                                                        className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(item?.created_at)?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6">

                    <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">

                        {/* HEADER */}
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold tracking-wide">
                                    Service Modification
                                </h2>
                            </div>

                            <div className="flex items-center gap-4">
                                <span
                                    className={`px-4 py-1 rounded-full text-xs font-semibold
            ${selectedItem.status === "APPLIED"
                                            ? "bg-green-500"
                                            : selectedItem.status === "PENDING"
                                                ? "bg-yellow-400 text-black"
                                                : "bg-gray-500"
                                        }`}
                                >
                                    {selectedItem.status}
                                </span>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white text-xl hover:scale-110 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="overflow-y-auto px-12 py-10 bg-gray-50 space-y-12">

                            {/* SUMMARY STRIP */}
                            <div className="grid md:grid-cols-4 gap-6 text-center">

                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase">Customer</p>
                                    <p className="font-semibold text-gray-900 mt-2 capitalize">
                                        {selectedItem.order_details?.customer_name}
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase">Zone</p>
                                    <p className="font-semibold text-gray-900 mt-2 capitalize">
                                        {selectedItem.zone_details?.name}
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase">Modification</p>
                                    <p className="font-semibold text-gray-900 mt-2">
                                        {selectedItem.modification_type}
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                                    <p className="font-semibold text-indigo-600 text-lg mt-2">
                                        ₹{selectedItem.order_details?.total_price}
                                    </p>
                                </div>

                            </div>

                            {/* MAIN DETAILS */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">

                                <div className="grid md:grid-cols-2 gap-16">

                                    {/* CUSTOMER */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                                            Customer Details
                                        </h3>

                                        <div className="space-y-4 text-sm text-gray-700">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Phone</span>
                                                <span className="font-medium">{selectedItem.order_details?.customer_number}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Order Status</span>
                                                <span className="font-medium">{selectedItem.order_details?.order_status}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Payment</span>
                                                <span className="font-medium">{selectedItem.order_details?.payment_status}</span>
                                            </div>

                                            <div className="pt-4 border-t text-xs text-gray-500 leading-relaxed">
                                                {selectedItem.order_details?.address}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AGENT */}
                                    {selectedItem.agent_details && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                                                Agent Details
                                            </h3>

                                            <div className="space-y-4 text-sm text-gray-700">

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Name</span>
                                                    <span className="font-medium capitalize">
                                                        {selectedItem.agent_details?.user_details?.name}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Email</span>
                                                    <span className="font-medium">
                                                        {selectedItem.agent_details?.user_details?.email}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Mobile</span>
                                                    <span className="font-medium">
                                                        {selectedItem.agent_details?.user_details?.mobile_number}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Hub</span>
                                                    <span className="font-medium">
                                                        {selectedItem.agent_details?.hub_name || "-"}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* SERVICE COMPARISON */}
                            <div className="mt-16">

                                <h3 className="text-xl font-semibold text-gray-900 text-center mb-12">
                                    Service Replacement
                                </h3>

                                <div className="relative grid md:grid-cols-3 gap-8 items-center">

                                    {/* ORIGINAL */}
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">

                                        <p className="text-xs text-red-500 font-semibold uppercase mb-6">
                                            Original
                                        </p>

                                        <img
                                            src={
                                                selectedItem?.order_item_details?.item_details?.full_details?.media_files?.[0]?.image_url ||
                                                emptyImage
                                            }
                                            className="w-full h-40 object-cover rounded-xl mb-6"
                                        />

                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {selectedItem.original_service_details?.name}
                                        </h4>

                                        <p className="text-sm text-gray-500 line-clamp-3">
                                            {selectedItem.original_service_details?.description}
                                        </p>

                                        <p className="mt-6 text-lg font-bold text-red-500">
                                            ₹{selectedItem.original_price}
                                        </p>

                                    </div>

                                    {/* CENTER ARROW */}
                                    <div className="flex justify-center">
                                        <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold">
                                            →
                                        </div>
                                    </div>

                                    {/* NEW */}
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">

                                        <p className="text-xs text-green-600 font-semibold uppercase mb-6">
                                            New
                                        </p>

                                        <img
                                            src={
                                                selectedItem?.new_service_details?.media_files?.[0]?.image_url ||
                                                emptyImage
                                            }
                                            className="w-full h-40 object-cover rounded-xl mb-6"
                                        />

                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {selectedItem.new_service_details?.name}
                                        </h4>

                                        <p className="text-sm text-gray-500 line-clamp-3">
                                            {selectedItem.new_service_details?.description}
                                        </p>

                                        <p className="mt-6 text-lg font-bold text-green-600">
                                            ₹{selectedItem.new_price}
                                        </p>

                                    </div>

                                </div>

                                {/* PRICE DIFFERENCE */}
                                <div className="flex justify-center mt-12">
                                    <div className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full text-sm font-semibold shadow-lg">
                                        Price Difference ₹
                                        {(
                                            parseFloat(selectedItem.new_price || "0") -
                                            parseFloat(selectedItem.original_price || "0")
                                        ).toFixed(2)}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="px-8 py-5 border-t bg-white flex justify-between items-center">
                            <p className="text-xs text-gray-400">
                                Created At: {selectedItem.created_at}
                            </p>

                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-black transition"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesRequest;