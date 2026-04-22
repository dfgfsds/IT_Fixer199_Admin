import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Select from "react-select";

const SalesPaymentModeWise: React.FC = () => {
    const [reportData, setReportData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        payment_status_filter: "ALL",
        platform: "ALL"
    });

    const statusOptions = [
        { label: "All Status", value: "ALL" },
        { label: "Fully Paid", value: "FULLY_PAID" },
        { label: "Partially Paid", value: "PARTIALLY_PAID" }
    ];

    const platformOptions = [
        { label: "All Platforms", value: "ALL" },
        { label: "WhatsApp", value: "WHATSAPP" },
        { label: "Own Platform", value: "OWN_PLATFORM" },
        { label: "Shop", value: "SHOP" }
    ];

    const fetchReport = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.start_date) params.append("start_date", filters.start_date);
            if (filters.end_date) params.append("end_date", filters.end_date);
            if (filters.payment_status_filter !== "ALL") params.append("payment_status_filter", filters.payment_status_filter);
            if (filters.platform !== "ALL") params.append("platform", filters.platform);

            const res = await axiosInstance.get(`${Api.salesPaymentModeWise}?${params.toString()}`);
            setReportData(res.data?.data?.report || []);
            setSummary(res.data?.data?.summary || null);
        } catch (err) {
            console.error("Failed to fetch sales report", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales Report (Payment Mode Wise)</h1>
                    <p className="text-sm text-gray-500">Analyze revenue distribution across different payment methods</p>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
                        <p className="text-xs font-bold text-blue-500 uppercase">Total Revenue</p>
                        <h2 className="text-xl font-bold text-gray-800">₹{summary.total_revenue?.toLocaleString("en-IN")}</h2>
                        <p className="text-xs text-gray-400 mt-1">{summary.total_orders} Orders</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
                        <p className="text-xs font-bold text-green-600 uppercase">Order Amount</p>
                        <h2 className="text-xl font-bold text-gray-800">₹{summary.order_amount?.toLocaleString("en-IN")}</h2>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
                        <p className="text-xs font-bold text-red-500 uppercase">Total Refunds</p>
                        <h2 className="text-xl font-bold text-gray-800">₹{summary.total_refund_amount?.toLocaleString("en-IN")}</h2>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                        <p className="text-xs font-bold text-orange-500 uppercase">Fully Paid</p>
                        <h2 className="text-xl font-bold text-gray-800">{summary.fully_paid_orders}</h2>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                    <input 
                        type="date" 
                        className="border border-gray-200 p-2 rounded-lg text-sm outline-none"
                        value={filters.start_date}
                        onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                    <input 
                        type="date" 
                        className="border border-gray-200 p-2 rounded-lg text-sm outline-none"
                        value={filters.end_date}
                        onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                    <Select 
                        options={statusOptions} 
                        className="text-sm"
                        defaultValue={statusOptions[0]}
                        onChange={(val: any) => setFilters({...filters, payment_status_filter: val.value})}
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Platform</label>
                    <Select 
                        options={platformOptions} 
                        className="text-sm"
                        defaultValue={platformOptions[0]}
                        onChange={(val: any) => setFilters({...filters, platform: val.value})}
                    />
                </div>
                <button 
                    onClick={fetchReport}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                    Apply
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-4 border-b text-gray-600">Date</th>
                            <th className="p-4 border-b text-gray-600">Payment Details</th>
                            <th className="p-4 border-b text-right text-gray-600">Total Amount</th>
                            <th className="p-4 border-b text-right text-gray-600">Total Refunds</th>
                            <th className="p-4 border-b text-right text-gray-600">Total Transactions</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-20 font-medium text-gray-500 animate-pulse">Loading Report...</td></tr>
                        ) : reportData.map((day, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition">
                                <td className="p-4 align-top font-bold text-gray-700">{day.date}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {day.payment_modes.length > 0 ? day.payment_modes.map((mode: any, mIdx: number) => (
                                            <div key={mIdx} className="bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 min-w-[140px]">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">{mode.payment_method}</div>
                                                <div className="font-bold text-gray-800">₹{mode.total_amount.toLocaleString("en-IN")}</div>
                                                <div className="text-[10px] text-gray-500">{mode.transaction_count} Trans.</div>
                                            </div>
                                        )) : <span className="text-gray-300 italic text-xs">No transactions</span>}
                                    </div>
                                </td>
                                <td className="p-4 align-top text-right font-bold text-blue-600 text-base">
                                    ₹{day.total_amount.toLocaleString("en-IN")}
                                </td>
                                   <td className="p-4 align-top text-right text-blue-600 ">
                                    {day?.total_transactions?.toLocaleString("en-IN")}
                                </td>
                                <td className="p-4 align-top text-right text-red-500">
                                    ₹{day.total_refund.toLocaleString("en-IN")}
                                </td>
                             
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesPaymentModeWise;