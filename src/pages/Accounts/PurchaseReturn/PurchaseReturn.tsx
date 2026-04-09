import React, { useEffect, useState } from "react";
import axiosInstance from "../../../configs/axios-middleware";
import Api from "../../../api-endpoints/ApiUrls";
import Pagination from "../../../components/Pagination";
import { Download } from "lucide-react";
import { saveAs } from "file-saver";
const PurchaseReturn: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pagination, setPagination] = useState<any>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<any>(null);

    const [filters, setFilters] = useState({
        vendor_id: "",
        hub_id: "",
        start_date: "",
        end_date: "",
    });

    const [vendors, setVendors] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);

    // Fetch dropdowns for filters
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const v = await axiosInstance.get(Api.vendor);
                const h = await axiosInstance.get(Api.allHubs);
                setVendors(v?.data?.vendors || []);
                setHubs(h?.data?.hubs || []);
            } catch (err) { console.log(err); }
        };
        fetchDropdowns();
    }, []);

    // Main data fetching
    const fetchData = async (p = page, size = pageSize) => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                page: String(p),
                size: String(size),
                ...(filters.vendor_id && { vendor_id: filters.vendor_id }),
                ...(filters.hub_id && { hub_id: filters.hub_id }),
                ...(filters.start_date && { start_date: filters.start_date }),
                ...(filters.end_date && { end_date: filters.end_date }),
            }).toString();

            const res = await axiosInstance.get(`${Api.purchaseReturn}?${query}`);
            const response = res.data?.data;
            setData(response?.returns || []);
            if (response?.pagination) {
                setPagination(response.pagination);
                setPage(response.pagination.page);
            }
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const handleExcelDownload = async () => {
        try {
            const res = await axiosInstance.get(
                Api.purchaseReturn,
                {
                    params: {
                        page: 1,
                        size: 1000, // 🔥 get max data for export
                        ...(filters.vendor_id && { vendor_id: filters.vendor_id }),
                        ...(filters.hub_id && { hub_id: filters.hub_id }),
                        ...(filters.start_date && { start_date: filters.start_date }),
                        ...(filters.end_date && { end_date: filters.end_date }),
                    },
                }
            );

            const exportData = res.data?.data?.returns || [];

            // 🔥 convert to CSV
            const csvRows = [];

            const headers = [
                "S.No",
                "PR Number",
                "Vendor",
                "Hub",
                "GRN",
                "Date",
                "Amount",
                //   "Status",
            ];

            csvRows.push(headers.join(","));

            exportData.forEach((item: any, index: number) => {
                csvRows.push([
                    index + 1,
                    item.pr_number,
                    item.vendor_name,
                    item.hub_name,
                    item.grn_number,
                    new Date(item.return_date).toLocaleDateString(),
                    item.subtotal,
                    // item.status,
                ].join(","));
            });

            const blob = new Blob([csvRows.join("\n")], {
                type: "text/csv;charset=utf-8;",
            });

            saveAs(blob, "Purchase_Return_Report.csv");

        } catch (err) {
            console.log(err);
            alert("Download failed");
        }
    };

    useEffect(() => {
        fetchData(1, pageSize);
    }, [filters]);

    return (
        <div className=" space-y-6">
            {/* 🔥 HEADER SECTION */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Purchase Returns</h1>
                    <p className="text-sm text-gray-400">Manage returns and export reports</p>
                </div>
                <button
                    onClick={handleExcelDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md active:scale-95"
                >
                    <Download size={18} /> Export Excel
                </button>
            </div>

            {/* 🔥 FILTERS SECTION */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
                <select
                    value={filters.vendor_id}
                    onChange={(e) => setFilters({ ...filters, vendor_id: e.target.value })}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all min-w-[150px]"
                >
                    <option value="">All Vendors</option>
                    {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>

                <select
                    value={filters.hub_id}
                    onChange={(e) => setFilters({ ...filters, hub_id: e.target.value })}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all min-w-[150px]"
                >
                    <option value="">All Hubs</option>
                    {hubs.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
                    <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        className="bg-transparent py-2 text-sm outline-none"
                    />
                    <span className="text-gray-300">-</span>
                    <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        className="bg-transparent py-2 text-sm outline-none"
                    />
                </div>

                <button
                    onClick={() => setFilters({ vendor_id: "", hub_id: "", start_date: "", end_date: "" })}
                    className="px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors ml-auto"
                >
                    Clear All
                </button>
            </div>

            {/* 🔥 TABLE SECTION */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b">
                            <tr>
                                <th className="p-4">S.No</th>
                                <th className="p-4">PR Number</th>
                                <th className="p-4">Vendor Name</th>
                                <th className="p-4">GRN Number</th>
                                <th className="p-4">Return Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-medium">Loading records...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-medium">No return records found</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                                        <td className="p-4 text-gray-400">{(page - 1) * pageSize + index + 1}</td>
                                        <td className="p-4 font-bold text-gray-800">{item.pr_number}</td>
                                        <td className="p-4 font-medium">{item.vendor_name}</td>
                                        <td className="p-4 text-gray-500">{item.grn_number}</td>
                                        <td className="p-4 text-gray-600">{new Date(item.return_date).toLocaleDateString()}</td>
                                        <td className="p-4 font-black text-orange-600">₹{Number(item.subtotal).toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => { setSelectedReturn(item); setShowViewModal(true); }}
                                                className="px-5 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-black hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                            >
                                                VIEW
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div className="p-4 border-t bg-gray-50/50">
                        <Pagination
                            page={page}
                            totalPages={pagination.total_pages}
                            pageSize={pageSize}
                            totalItems={pagination.total_elements}
                            onPageChange={(p: number) => fetchData(p, pageSize)}
                            onPageSizeChange={(size: number) => { setPageSize(size); fetchData(1, size); }}
                        />
                    </div>
                )}
            </div>

            {/* 🔥 VIEW MODAL */}
            {showViewModal && selectedReturn && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="font-black text-gray-800 text-lg uppercase tracking-tight">Return Details</h2>
                                <p className="text-xs text-orange-600 font-bold">{selectedReturn.pr_number}</p>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-800 text-2xl px-2">×</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/30">
                            <div className="grid grid-cols-2 gap-6 text-xs bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div>
                                    <p className="text-gray-400 font-bold uppercase mb-1">Vendor</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedReturn.vendor_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold uppercase mb-1">GRN Reference</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedReturn.grn_number}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-400 font-bold uppercase mb-1">Return Reason</p>
                                    <p className="font-medium text-gray-700 text-sm italic">"{selectedReturn.reason || 'No reason provided'}"</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left border-b">
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Product</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Qty</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {selectedReturn.items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="p-4 font-bold text-gray-700">{item.product_name}</td>
                                                <td className="p-4 text-gray-600 font-medium">{item.quantity}</td>
                                                <td className="p-4 text-right font-black text-gray-800">₹{Number(item.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-orange-600 text-white font-bold">
                                        <tr>
                                            <td colSpan={2} className="p-4 text-right text-xs uppercase tracking-widest">Total Refund</td>
                                            <td className="p-4 text-right text-base">₹{Number(selectedReturn.subtotal).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="p-5 border-t flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-10 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black text-xs transition-all"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseReturn;