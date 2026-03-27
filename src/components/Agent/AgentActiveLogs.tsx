import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { useParams } from "react-router-dom";
import Pagination from "../Pagination";
import AgentTrackingModal from "../Modals/AgentTrackingModal";
import { MapPin } from "lucide-react";

const AgentActiveLogs: React.FC<{ userId: string }> = ({ userId }) => {
    const { id } = useParams();

    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [trackingModal, setTrackingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    const [dateRange, setDateRange] = useState({
        start_date: "",
        end_date: "",
    });

    // 🔥 FETCH LOGS
    const fetchLogs = async () => {
        if (!dateRange.start_date || !dateRange.end_date) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${Api.loginLogs}${userId}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}&page=${page}&size=${pageSize}`
            );
            const data = res?.data;
            setLogs(data?.logs || []);
            if (data?.pagination) {
                setPagination(data.pagination);
                setTotalPages(data.pagination.total_pages);
                setPage(data.pagination.page);
            }
        } catch (err) {
            // console.error("Log fetch error:", err);
        } finally {
            setLoading(false);
        }
    };


    // 🔥 INITIAL DATE (Last 7 days)
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

    // 🔥 FETCH TRIGGER
    useEffect(() => {
        fetchLogs();
    }, [page, pageSize, dateRange]);

    // 🔥 HANDLERS
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    return (
        <div className="bg-white border rounded-xl p-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center mb-5">
                <h2 className="text-lg font-semibold">Login Activity</h2>

                {/* DATE FILTER */}
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateRange.start_date}
                        onChange={(e) => {
                            setPage(1);
                            setDateRange({ ...dateRange, start_date: e.target.value });
                        }}
                        className="border px-3 py-2 rounded-lg text-sm"
                    />

                    <input
                        type="date"
                        value={dateRange.end_date}
                        onChange={(e) => {
                            setPage(1);
                            setDateRange({ ...dateRange, end_date: e.target.value });
                        }}
                        className="border px-3 py-2 rounded-lg text-sm"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">

                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">S.No</th>
                            <th className="px-4 py-3 text-left">Device</th>
                            <th className="px-4 py-3 text-left">Device ID</th>
                            <th className="px-4 py-3 text-left">IP Address</th>
                            <th className="px-4 py-3 text-left">Login Time</th>
                            <th className="px-4 py-3 text-left">Tracking</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">

                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-400">
                                    No Logs Found
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, i) => (
                                <tr key={i} className="hover:bg-gray-50">

                                    {/* S.No */}
                                    <td className="px-4 py-4 text-gray-700">
                                        {i + 1}
                                    </td>

                                    {/* DEVICE */}
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {log.device_name || "-"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {log.device_type}
                                            </span>
                                        </div>
                                    </td>

                                    {/* DEVICE ID */}
                                    <td className="px-4 py-4 text-gray-700">
                                        {log.device_id || "-"}
                                    </td>

                                    {/* IP */}
                                    <td className="px-4 py-4 text-gray-700">
                                        {log.ip_address || "-"}
                                    </td>

                                    {/* TIME */}
                                    <td className="px-4 py-4 text-gray-700">
                                        {log.logged_in_at
                                            ? new Date(log.logged_in_at).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td className="px-4 py-4">
                                        {/* <button
                                            onClick={() => {
                                                const date = log.logged_in_at?.split("T")[0]; // ✅ extract date

                                                setSelectedDate(date);
                                                setTrackingModal(true);
                                            }}
                                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                        >
                                            Track
                                        </button> */}
                                        <button
                                            onClick={() => {
                                                const date = log.logged_in_at?.split("T")[0];
                                                setSelectedDate(date);
                                                setTrackingModal(true);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                        >
                                            Tracking
                                            <MapPin className="w-3 h-3" />
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {!loading && pagination && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={pagination.total_elements}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <AgentTrackingModal
                isOpen={trackingModal}
                onClose={() => setTrackingModal(false)}
                agentId={id}
                agentName="Agent"
                selectedDate={selectedDate} // ✅ PASS DATE
            />

        </div>
    );
};

export default AgentActiveLogs;