import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Select from "react-select";

const SalesProductWise: React.FC = () => {
    const [reportData, setReportData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        payment_status_filter: "ALL",
        platform: "ALL"
    });

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

            const res = await axiosInstance.get(`${Api.salesProductWise}?${params.toString()}`);
            setReportData(res.data?.data?.report || []);
            setSummary(res.data?.data?.summary || null);
        } catch (err) {
            console.error("Failed to fetch product report", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters]);

    return (
        <div className=" bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Product Wise Sales</h1>
                <p className="text-sm text-gray-500">Track which products are driving your revenue</p>
            </div>

            {/* --- Summary Cards Section --- */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                        <h2 className="text-2xl font-bold text-indigo-600">₹{summary.total_revenue?.toLocaleString("en-IN")}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
                        <h2 className="text-2xl font-bold text-gray-800">{summary.total_orders}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Paid Orders</p>
                        <h2 className="text-2xl font-bold text-emerald-500">{summary.fully_paid_orders}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Refund</p>
                        <h2 className="text-2xl font-bold text-rose-500">₹{summary.total_refund_amount?.toLocaleString("en-IN")}</h2>
                    </div>
                </div>
            )}

            {/* --- Filters Section --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Start Date</label>
                    <input type="date" className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">End Date</label>
                    <input type="date" className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Platform</label>
                    <Select options={platformOptions} className="text-sm" defaultValue={platformOptions[0]} onChange={(val: any) => setFilters({ ...filters, platform: val.value })} />
                </div>
                <button onClick={fetchReport} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100">Filter Report</button>
            </div>

            {/* --- Main Report Table --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date & Product Name</th>
                            <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                            <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Sales Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={3} className="p-16 text-center text-gray-400 animate-pulse font-medium">Loading sales data...</td></tr>
                        ) : reportData.length === 0 ? (
                            <tr><td colSpan={3} className="p-16 text-center text-gray-400">No records found for the selected range.</td></tr>
                        ) : (
                            reportData.map((dayGroup, idx) => (
                                <React.Fragment key={idx}>
                                    {/* Date Group Header Row */}
                                    <tr className="bg-indigo-50/30">
                                        <td className="p-4 font-bold text-gray-700">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                                {dayGroup.date}
                                                <span className="text-[10px] font-normal text-gray-400 ml-2">({dayGroup.total_orders} Orders)</span>
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-700">{dayGroup.total_quantity}</td>
                                        <td className="p-4 text-right font-extrabold text-indigo-700">₹{dayGroup.total_amount?.toLocaleString("en-IN")}</td>
                                    </tr>

                                    {/* Product Sub-rows */}
                                    {dayGroup.products.map((item: any, pIdx: number) => (
                                        <tr key={`${idx}-${pIdx}`} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 pl-10">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-800">{item.product_name}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.product_id.split('-')[0]}...</span>
                                                    
                                                    {item.serial_numbers?.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {item.serial_numbers.map((sn: string, sIdx: number) => (
                                                                <span key={sIdx} className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded border border-emerald-100 font-medium">
                                                                    SN: {sn}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-gray-600 text-sm font-medium">
                                                {item.quantity_sold}
                                            </td>
                                            <td className="p-4 text-right text-gray-600 text-sm font-semibold">
                                                ₹{item.total_amount?.toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesProductWise;