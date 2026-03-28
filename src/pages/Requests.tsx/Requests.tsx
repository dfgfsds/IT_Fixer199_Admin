import React, { useEffect, useState, useRef, useMemo } from "react";
import { Eye, Loader2, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import AgentAssign from "../Requests/Requests.tsx/AgentAssign";
import TrackingModal from "../Requests/Requests.tsx/TrackingModal";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import toast from "react-hot-toast";

interface RequestType {
    id: string;
    request_type: string;
    status: string;
    hub_status: string;
    approval_status: string;
    created_at: string;
    requested_by_role: string;
}

const STATUS_STYLE: any = {
    REQUESTED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    RESCHEDULED: "bg-purple-100 text-purple-700",
    REFUND_IN_PROGRESS: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-gray-200 text-gray-700",
};

const Requests: React.FC = () => {
    const [requests, setRequests] = useState<RequestType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [currentRefundId, setCurrentRefundId] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [approvalAction, setApprovalAction] = useState<boolean>(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");


    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [trackingModal, setTrackingModal] = useState(false)


    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (startDate) params.append("start_date", startDate);
            if (endDate) params.append("end_date", endDate);
            const res = await axiosInstance.get(`${Api.Requests}/?${params.toString()}`);
            setRequests(res?.data?.data || res?.data || []);
        } catch (error) {
            toast.error(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [startDate, endDate, statusFilter]);


    // ---------------- FILTER LOGIC ----------------
    const filteredRequests = useMemo(() => {
        return requests?.filter((req: any) => {
            const matchesSearch =
                req.request_type
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                req.id?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus =
                statusFilter === "all" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [requests, search, statusFilter]);

    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAdminApproval = async (
        req: any,
        approvalStatus: "APPROVED" | "REJECTED"
    ) => {
        try {
            setLoadingId(req.id);
            const isApproved = approvalStatus === "APPROVED";
            if (req.request_type === "REFUND") {
                const updateApi = await axiosInstance.post(
                    `${Api?.requestApprovalOtp}/${req.id}/`
                );
                if (updateApi) {
                    fetchRequests();
                    setCurrentRefundId(req.id);
                    setApprovalAction(isApproved);
                    setOtpModalOpen(true);
                }
            } else {
                const updatedApi = await axiosInstance.post(
                    `${Api?.adminRequestApproval}/${req.id}/`,
                    {
                        is_approved: isApproved,
                        review_notes: "Reviewed via admin panel"
                    }
                );
                if (updatedApi) {
                    fetchRequests();
                }
            }
        } catch (error) {
            toast.error(extractErrorMessage(error));
        } finally {
            setLoadingId(null);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            if (!currentRefundId) return;
            const updatedApi = await axiosInstance.post(
                `${Api?.approvalOtpVerify}/${currentRefundId}/`,
                {
                    otp,
                    is_approved: approvalAction,
                    review_notes: "Refund reviewed via admin panel"
                }
            );
            if (updatedApi) {
                fetchRequests();
                setOtpModalOpen(false);
                setOtp("");
                setCurrentRefundId(null);
            }
        } catch (error) {
            toast.error(extractErrorMessage(error));
        }
    };

    return (
        <div className="p-0 space-y-6">
            <h1 className="text-xl font-bold">Requests</h1>

            {/* 🔎 FILTER DESIGN */}
            <div className="bg-white p-4 rounded-lg border flex flex-wrap gap-6 items-end">

                {/* SEARCH */}
                <div className="flex flex-col min-w-[250px] flex-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                        Search
                    </label>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search by ID or Request Type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                {/* START DATE */}
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                        Start Date
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    />
                </div>

                {/* END DATE */}
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                        End Date
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    />
                </div>

                {/* STATUS FILTER */}
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                        Status
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="all">All Status</option>
                        {Object.keys(STATUS_STYLE).map((status: any) => (
                            <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CLEAR BUTTON */}
                <div className="flex items-end">
                    <button
                        onClick={() => {
                            setSearch("");
                            setStartDate("");
                            setEndDate("");
                            setStatusFilter("all");
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm font-semibold rounded-lg"
                    >
                        Clear Filters
                    </button>
                </div>

            </div>

            {/* TABLE */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin h-6 w-6 text-orange-600" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No requests found
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">S.No</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Requested By</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                {/* <th className="px-4 py-3 text-left">Hub Status</th> */}
                                <th className="px-4 py-3 text-left">Approval</th>
                                <th className="px-4 py-3 text-left">Created</th>
                                <th className="px-6 py-3 text-right">Action</th>

                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req: any, index: number) => (
                                <tr key={req.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-3 capitalize">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">
                                                {req?.order_details?.customer_name || "-"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {req?.order_details?.customer_number || ""}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        {req?.request_type}
                                    </td>
                                    <td className="px-4 py-3 ">
                                        {req?.requested_by_role}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full font-semibold ${STATUS_STYLE[req.status] ||
                                                "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {req?.status.replaceAll("_", " ")}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        {req.approval_status === "APPROVED" ? (
                                            <>
                                                <span className="px-3 py-1 cursor-pointer text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                    Approved
                                                </span>
                                                {req?.request_type === "CANCELLATION" && req?.requested_by_role !== "CUSTOMER" && !req?.order_details?.assigned_agent_id && req?.order_details?.order_status !== "CANCELLED" && (
                                                    <span
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setAssignModalOpen(true);
                                                        }}
                                                        className="px-3 cursor-pointer ml-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                                        Assign
                                                    </span>
                                                )}
                                                {req?.request_type === "HUB_SERVICE" && req?.approval_status === "APPROVED" && req?.status === "APPROVED"
                                                    && (
                                                        <span
                                                            onClick={() => {
                                                                setSelectedRequest(req)
                                                                setTrackingModal(true)
                                                            }}
                                                            className="px-3 cursor-pointer ml-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                                            Tracking
                                                        </span>
                                                    )}
                                            </>
                                        ) : req.approval_status === "REJECTED" ? (
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                                                Rejected
                                            </span>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAdminApproval(req, "APPROVED")}
                                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => handleAdminApproval(req, "REJECTED")}
                                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>


                                    <td className="px-4 py-3">
                                        {req?.created_at ? new Date(req.created_at).toLocaleString() : "-"}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setShowModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            <AgentAssign
                show={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                order={selectedRequest?.order_details}
            />

            <TrackingModal
                show={trackingModal}
                onClose={() => setTrackingModal(false)}
                requestId={selectedRequest?.id}
            />

            {showModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">

                    <div className="bg-white w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl">

                        {/* HEADER */}
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-6 flex justify-between items-center rounded-t-3xl">
                            <div>
                                <h2 className="text-2xl font-bold">Request Details</h2>
                                <p className="text-sm opacity-80">Request ID: {selectedRequest.id}</p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white text-xl hover:scale-110 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-10 space-y-12">

                            {/* STATUS SECTION */}
                            <div className="bg-gray-50 rounded-2xl p-6 grid md:grid-cols-4 gap-6 text-center">

                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Request Status</p>
                                    <p className="font-semibold text-blue-600 mt-2">
                                        {selectedRequest.status?.replaceAll("_", " ")}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Approval Status</p>
                                    <p className="font-semibold text-green-600 mt-2">
                                        {selectedRequest.approval_status || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Hub Status</p>
                                    <p className="font-semibold text-purple-600 mt-2">
                                        {selectedRequest.hub_status || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Request Type</p>
                                    <p className="font-semibold text-indigo-600 mt-2">
                                        {selectedRequest.request_type}
                                    </p>
                                </div>

                            </div>

                            {/* CUSTOMER + AGENT */}
                            <div className="grid md:grid-cols-2 gap-10">

                                {/* CUSTOMER */}
                                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-6">
                                        Customer Information
                                    </h3>

                                    <div className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name</span>
                                            <span className="font-medium">{selectedRequest.order_details?.customer_name}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Mobile</span>
                                            <span className="font-medium">{selectedRequest.order_details?.customer_number}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Order Status</span>
                                            <span className="font-medium">{selectedRequest.order_details?.order_status}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Payment Status</span>
                                            <span className="font-medium">{selectedRequest.order_details?.payment_status}</span>
                                        </div>

                                        <div>
                                            <p className="text-gray-500 mb-1">Address</p>
                                            <p className="text-gray-700 text-sm">
                                                {selectedRequest.order_details?.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* AGENT */}
                                {selectedRequest.agent_details && (
                                    <div className="bg-white border rounded-2xl p-8 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-6">
                                            Agent Information
                                        </h3>

                                        <div className="space-y-4 text-sm">

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Agent Name</span>
                                                <span className="font-medium">
                                                    {selectedRequest.agent_details?.user_details?.name}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Email</span>
                                                <span className="font-medium">
                                                    {selectedRequest.agent_details?.user_details?.email}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Mobile</span>
                                                <span className="font-medium">
                                                    {selectedRequest.agent_details?.user_details?.mobile_number}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Hub</span>
                                                <span className="font-medium">
                                                    {selectedRequest.agent_details?.hub_name || "-"}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* SERVICE SECTION */}
                            {selectedRequest.order_item_details && (
                                <div className="bg-white border rounded-2xl p-10 shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-8">
                                        Service Information
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-10">

                                        <div>
                                            <img
                                                src={
                                                    selectedRequest.order_item_details?.item_details?.full_details?.media_files?.[0]?.image_url
                                                }
                                                className="w-full h-56 object-cover rounded-xl mb-6"
                                            />

                                            <h4 className="font-semibold text-lg">
                                                {selectedRequest.order_item_details?.item_details?.full_details?.name}
                                            </h4>

                                            <p className="text-sm text-gray-500 mt-2">
                                                {selectedRequest.order_item_details?.item_details?.full_details?.description}
                                            </p>
                                        </div>

                                        <div className="space-y-4 text-sm">

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Price</span>
                                                <span className="font-medium">
                                                    ₹{selectedRequest.order_item_details?.price}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Quantity</span>
                                                <span className="font-medium">
                                                    {selectedRequest.order_item_details?.quantity}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Item Status</span>
                                                <span className="font-medium">
                                                    {selectedRequest.order_item_details?.status}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Customer Confirmation</span>
                                                <span className="font-medium">
                                                    {selectedRequest.order_item_details?.customer_confirmation}
                                                </span>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* MEDIA SECTION */}
                            {(selectedRequest.images?.length > 0 ||
                                selectedRequest.videos?.length > 0) && (
                                    <div className="bg-white border rounded-2xl p-8 shadow-sm">

                                        <h3 className="font-semibold text-gray-800 mb-8">
                                            Attached Media
                                        </h3>

                                        {/* IMAGES */}
                                        {selectedRequest.images?.length > 0 && (
                                            <div className="mb-10">
                                                <p className="text-sm font-semibold text-gray-500 uppercase mb-4">
                                                    Images
                                                </p>

                                                <div className="grid md:grid-cols-4 gap-6">
                                                    {selectedRequest.images.map((img: any) => (
                                                        <div key={img.id} className="group ">
                                                            <img
                                                                src={img.image_url}
                                                                className="rounded-xl h-40 w-full object-cover border"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* VIDEOS */}
                                        {selectedRequest.videos?.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500 uppercase mb-4">
                                                    Videos
                                                </p>

                                                <div className="grid md:grid-cols-3 gap-6">
                                                    {selectedRequest.videos.map((vid: any) => (
                                                        <div key={vid.id} className="rounded-xl overflow-hidden border bg-black">
                                                            <video
                                                                controls
                                                                className="w-full h-56 object-cover"
                                                                src={vid.video_url}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}


                            {/* REVIEW NOTES */}
                            {selectedRequest.review_notes && (
                                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                                    <h3 className="font-semibold text-gray-800 mb-4">
                                        Review Notes
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedRequest.review_notes}
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}

            {otpModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6">

                        <h2 className="text-xl font-bold text-gray-800">
                            Enter Refund OTP
                        </h2>

                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-lg tracking-widest"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setOtpModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleVerifyOtp}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;