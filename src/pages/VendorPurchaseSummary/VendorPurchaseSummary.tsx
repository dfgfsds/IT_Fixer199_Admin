import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Select from "react-select";

const VendorPurchaseSummary: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [vendorOptions, setVendorOptions] = useState<any[]>([]);

    // filters - HSN removed
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        vendor_id: "",
    });

    const fetchVendors = async () => {
        try {
            const res = await axiosInstance.get(`${Api.vendor}?size=10000`);
            const options = res.data?.vendors?.map((v: any) => ({
                label: v.name,
                value: v.id,
            }));
            setVendorOptions(options || []);
        } catch (err) {
            console.error("Vendor list load failed", err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.start_date) params.append("start_date", filters.start_date);
            if (filters.end_date) params.append("end_date", filters.end_date);
            if (filters.vendor_id) params.append("vendor_id", filters.vendor_id);

            const res = await axiosInstance.get(
                `${Api?.vendorPurchaseSummary}?${params.toString()}`
            );
            setData(res?.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
        fetchData();
    }, [filters]);

    return (
        <div className=" bg-gray-50 min-h-screen">
            {/* 🔥 PAGE HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Vendor Purchase Summary</h1>
                <p className="text-sm text-gray-500">Track and analyze vendor-wise purchase totals and tax distributions</p>
            </div>

            {/* 🛠️ FILTERS SECTION */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-5 items-end">
                <div className="flex flex-col gap-1.5 min-w-[180px]">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                    <input
                        type="date"
                        className="border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={filters.start_date}
                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5 min-w-[180px]">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                    <input
                        type="date"
                        className="border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={filters.end_date}
                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor Filter</label>
                    <Select
                        isClearable
                        placeholder="Search & select a vendor..."
                        options={vendorOptions}
                        className="text-sm"
                        onChange={(selected: any) => 
                            setFilters({ ...filters, vendor_id: selected?.value || "" })
                        }
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: '0.5rem',
                                padding: '2px',
                                borderColor: '#e5e7eb'
                            })
                        }}
                    />
                </div>

                <button
                    onClick={fetchData}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
                >
                    Apply Filters
                </button>
            </div>

            {/* 📊 DATA TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="max-h-[65vh] overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 ">
                            <tr>
                                <th className="p-4 border-b text-left font-bold text-gray-600">S.No</th>
                                <th className="p-4 border-b text-left font-bold text-gray-600">Vendor Name</th>
                                <th className="p-4 border-b text-right font-bold text-gray-600">Amount (Exc. Tax)</th>
                                <th className="p-4 border-b text-right font-bold text-gray-600">Tax Amount</th>
                                <th className="p-4 border-b text-right font-bold text-gray-600">Total (Inc. Tax)</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-16">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 font-medium">Generating Report...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length ? (
                                data.map((item, index) => (
                                    <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 text-gray-400 font-mono">{index + 1}</td>
                                        <td className="p-4 font-semibold text-gray-700">{item.vendor_name}</td>
                                        <td className="p-4 text-right text-gray-600">
                                            ₹{Number(item.total_amount_without_tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-right text-orange-500 font-medium">
                                            ₹{Number(item.tax_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-right font-bold text-green-600 bg-green-50/20 group-hover:bg-transparent">
                                            ₹{Number(item.total_amount_with_tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-16 text-gray-400 italic">
                                        No transaction summary found for the selected timeframe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorPurchaseSummary;