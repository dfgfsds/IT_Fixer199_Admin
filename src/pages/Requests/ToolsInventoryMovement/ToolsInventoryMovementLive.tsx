import * as React from "react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Search, Loader2, Eye } from "lucide-react";
import axiosInstance from "../../../configs/axios-middleware";
import Api from "../../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../../utils/extractErrorMessage ";

interface MovementType {
    id: string;
    tool: any;
    agent: any;
    hub_name: string;
    stock: number;
    type: string;
    approved_status: string;
    created_at: string;
}

const ToolsInventoryMovementLive: React.FC = () => {

    const [movements, setMovements] = useState<MovementType[]>([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<WebSocket | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleView = (item: any) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const connect = () => {
            const ws = new WebSocket(
                `wss://api-test.itfixer199.com/ws/tool-movements/?token=${token}&size=1000`
                // `wss://api.itfixer199.com/ws/requests/?token=${token}&size=1000`
            );

            socketRef.current = ws;
            ws.onopen = () => {
                console.log("Tool Movement WS Connected");
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                // console.log("WS DATA:", message);
                setLoading(false);
                // 🔵 Initial load
                if (message.type === "initial_data" && message.movements) {
                    setMovements(message.movements);
                    setLoading(false);
                }

                // 🟢 movement_update (THIS IS YOUR CASE)
                if (message.type === "movement_update" && message.movements) {
                    setMovements(message.movements);
                    setLoading(false);
                }

                // 🟡 fallback single update
                if (message.type === "update" && message.movement) {
                    const updatedItem = message.movement;

                    setMovements((prev) => {
                        const index = prev.findIndex(
                            (item) => item.id === updatedItem.id
                        );

                        if (index !== -1) {
                            const updated = [...prev];
                            updated[index] = updatedItem;
                            return updated;
                        }

                        return [updatedItem, ...prev];
                    });
                    setLoading(false);
                }
            };

            ws.onclose = () => {
                console.log("Tool Movement WS reconnecting...");
                setTimeout(connect, 3000);
            };

        };
        connect();
        return () => {
            socketRef.current?.close();
        };
    }, []);

    const handleAdminApproval = async (id: string, action: "approve" | "reject") => {
        try {
            setLoadingId(id);
            await axiosInstance.post(
                `${Api?.toolsInventoryMovement}/${id}/${action}/`
            );
            socketRef.current?.close();
        } catch (error) {
            toast.error(extractErrorMessage(error));
        } finally {
            setLoadingId(null);
        }
    };


    const filteredData = useMemo(() => {

        return movements.filter((item) => {

            const matchesSearch =
                item.tool?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
                item.agent?.user_name?.toLowerCase()?.includes(search.toLowerCase()) ||
                item.hub_name?.toLowerCase()?.includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL"
                    ? true
                    : item.approved_status === statusFilter;

            return matchesSearch && matchesStatus;

        });

    }, [movements, search, statusFilter]);

    const [loadingId, setLoadingId] = useState<string | null>(null);

    // const handleAdminApproval = async (id: string, action: "approve" | "reject") => {
    //     try {
    //         setLoadingId(id);

    //         await axiosInstance.post(
    //             `${Api?.toolsInventoryMovement}/${id}/${action}/`)

    //         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
    //             socketRef.current.send(
    //                 JSON.stringify({
    //                     action: "refresh_modifications"
    //                 })
    //             );
    //         }

    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         setLoadingId(null);
    //     }
    // };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-xl font-bold">Tools Inventory Movement (Live)</h1>
                <p className="text-gray-500 text-sm">
                    Realtime tools movement tracking
                </p>
            </div>

            {/* FILTERS */}
            <div className="bg-white border rounded-lg p-4 flex gap-4">

                {/* SEARCH */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tool / agent / hub..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg"
                    />
                </div>

                {/* STATUS FILTER */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>

            </div>

            {/* TABLE */}

            <div className="bg-white border rounded-lg overflow-x-auto">

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-orange-600" />
                    </div>
                ) : (

                    <table className="w-full text-sm">

                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">S.No</th>
                                <th className="px-4 py-3 text-left">Tool</th>
                                <th className="px-4 py-3 text-left">Agent</th>
                                <th className="px-4 py-3 text-left">Hub</th>
                                <th className="px-4 py-3 text-left">Stock</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredData.length === 0 ? (

                                <tr>
                                    <td colSpan={9} className="text-center py-12">

                                        <div className="flex flex-col items-center justify-center text-gray-400">

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-12 h-12 mb-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9 17v-2h6v2m-6-6h6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z"
                                                />
                                            </svg>

                                            <p className="text-sm font-medium">
                                                No Tool Movements Found
                                            </p>

                                        </div>

                                    </td>
                                </tr>

                            ) :
                                (
                                    <>
                                        {filteredData.map((item, index) => (

                                            <tr key={item.id} className="border-b hover:bg-gray-50 capitalize">

                                                <td className="px-4 py-3">
                                                    {index + 1}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.tool?.name}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.agent?.user_name || "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.hub_name || "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.stock}
                                                </td>

                                                <td className="px-4 py-3">

                                                    <span className={`px-2 py-1 text-xs rounded-full font-semibold
                        ${item.type === "GET"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : item.type === "GIVE"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : item.type === "REMOVE"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                        }`}>

                                                        {item.type}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">
                                                    {item.approved_status === "APPROVED" ? (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                            Approved
                                                        </span>
                                                    ) : item.approved_status === "REJECTED" ? (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                                                            Rejected
                                                        </span>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAdminApproval(item.id, "approve")}
                                                                className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() => handleAdminApproval(item.id, "reject")}
                                                                className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleView(item)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>

                                        ))}
                                    </>
                                )}
                        </tbody>

                    </table>

                )}

            </div>

            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">

                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                        {/* HEADER */}
                        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">

                            <h2 className="text-lg font-bold text-gray-900">
                                Tool Movement Details
                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-red-500 text-xl"
                            >
                                ✕
                            </button>

                        </div>


                        {/* BODY SCROLL */}
                        <div className="overflow-y-auto p-6 space-y-8">

                            {/* TOOL INFO */}
                            <div className="bg-gray-50 p-5 rounded-xl">

                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Tool Details
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                                    <div>
                                        <p className="text-xs text-gray-400">Tool Name</p>
                                        <p className="font-semibold">{selectedItem.tool?.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Model</p>
                                        <p className="font-semibold">{selectedItem.tool?.model}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Price</p>
                                        <p className="font-semibold">₹{selectedItem.tool?.price}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Status</p>
                                        <p className="font-semibold">{selectedItem.tool?.status}</p>
                                    </div>

                                </div>

                            </div>


                            {/* AGENT INFO */}
                            <div className="bg-gray-50 p-5 rounded-xl">

                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Agent Details
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                                    <div>
                                        <p className="text-xs text-gray-400">Name</p>
                                        <p className="font-semibold">
                                            {selectedItem.agent?.user_name || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Email</p>
                                        <p className="font-semibold">
                                            {selectedItem.agent?.user_details?.email || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Mobile</p>
                                        <p className="font-semibold">
                                            {selectedItem.agent?.user_details?.mobile_number || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Role</p>
                                        <p className="font-semibold">
                                            {selectedItem.agent?.user_details?.role || "-"}
                                        </p>
                                    </div>

                                </div>

                            </div>


                            {/* MOVEMENT INFO */}
                            <div className="bg-gray-50 p-5 rounded-xl">

                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Movement Details
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                                    <div>
                                        <p className="text-xs text-gray-400">Hub</p>
                                        <p className="font-semibold">{selectedItem.hub_name}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Stock</p>
                                        <p className="font-semibold">{selectedItem.stock}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Type</p>
                                        <p className="font-semibold">{selectedItem.type}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Status</p>

                                        <span className={`px-2 py-1 text-xs rounded-full
${selectedItem.approved_status === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : selectedItem.approved_status === "REJECTED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {selectedItem.approved_status}
                                        </span>

                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">Created</p>
                                        <p className="font-semibold">
                                            {new Date(selectedItem.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* FOOTER */}
                        <div className="border-t px-6 py-4 flex justify-end bg-white">

                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-black"
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

export default ToolsInventoryMovementLive;