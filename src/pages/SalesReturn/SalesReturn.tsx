import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Pagination from "../../components/Pagination";
import Api from "../../api-endpoints/ApiUrls";

interface SalesReturnItem {
    id: string;
    product_name: string;
    quantity: string;
    rate: string;
    serial_numbers: string[]; // Updated to array based on your response
}

interface SalesReturnType {
  id: string;
  return_date: string;
  status: string;
  sale_order: string;
  items: SalesReturnItem[];
  item_details: any[];
}

const SalesReturn: React.FC = () => {
    const [data, setData] = useState<SalesReturnType[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        status: "",
        sale_order_id: "",
        product_id: "",
    });
    setPage(1);
  };

  const openModal = (row: SalesReturnType) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-0">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Sales Returns</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manage customer product returns and refunds</p>
        </div>
        <button
          onClick={() => fetchSalesReturns()}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 flex gap-4 mb-6 shadow-sm flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Sale Order ID..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
            name="sale_order_id"
            value={filters.sale_order_id}
            onChange={(e) => setFilters({ ...filters, sale_order_id: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>

    const [selectedRow, setSelectedRow] = useState<SalesReturnType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🔥 Modal open-la irukkumpo background scroll lock panna
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isModalOpen]);

    const fetchSalesReturns = async () => {
        try {
            setLoading(true);
            const params: any = { page, size: pageSize, ...filters };
            Object.keys(params).forEach((key) => { if (!params[key]) delete params[key]; });

            const res = await axios.get(Api?.salesReturns, { params });
            setData(res?.data?.data?.sales_returns || []);
            setTotalPages(res.data?.data?.pagination?.total_pages || 1);
            setPagination(res.data?.data?.pagination || null);
        } catch (err) {
            console.error("API Error:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSalesReturns(); }, [page, pageSize, filters]);

    const handlePageChange = (p: number) => setPage(p);
    const handlePageSizeChange = (size: number) => { setPageSize(size); setPage(1); };
    const handleFilterChange = (e: any) => { setFilters({ ...filters, [e.target.name]: e.target.value }); setPage(1); };
    const clearFilters = () => setFilters({ start_date: "", end_date: "", status: "", sale_order_id: "", product_id: "" });

    const openModal = (row: SalesReturnType) => { setSelectedRow(row); setIsModalOpen(true); };
    const closeModal = () => { setSelectedRow(null); setIsModalOpen(false); };

    return (
        <div className=" bg-gray-50 min-h-screen">
            <div className="py-2">
          <h1 className="text-2xl font-bold text-gray-900">Sales Return</h1>
          {/* <p className="text-gray-500">Manage and track all service orders</p> */}
        </div>
            {/* 🔍 HEADER FILTER SECTION */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    {/* <input type="text" name="sale_order_id" placeholder="Order ID" value={filters.sale_order_id} onChange={handleFilterChange} className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" /> */}
                    {/* <input type="text" name="product_id" placeholder="Product ID" value={filters.product_id} onChange={handleFilterChange} className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" /> */}
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">All Status</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                    <button onClick={clearFilters} className="bg-gray-900 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-black transition-all">Clear</button>
                </div>
            </div>

            {/* 📊 MAIN TABLE */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">S.No</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Return Date</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sale Order</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-12 text-slate-400 font-medium">Loading records...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-12 text-slate-400 font-medium">No return records found.</td></tr>
                            ) : (
                                data.map((row, index) => (
                                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 text-sm font-bold text-gray-400">{(page - 1) * pageSize + index + 1}</td>
                                        <td className="p-4 text-sm font-bold text-gray-700">{new Date(row.return_date).toLocaleDateString('en-GB')}</td>
                                        <td className="p-4 text-sm font-medium text-gray-600 truncate max-w-[150px]">{row.sale_order}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 italic">"{row.reason || 'No reason'}"</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openModal(row)} className="bg-white border border-gray-200 text-gray-900 px-4 py-1.5 rounded-lg text-[11px] font-black hover:bg-gray-900 hover:text-white transition-all shadow-sm">VIEW</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📄 PAGINATION */}
            {!loading && (
                <div className="mt-6">
                    <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalItems={pagination?.total_elements || 0} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
                </div>
            )}

            {/* 🔥 CUSTOM VIEW MODAL (URBAN COMPANY STYLE) */}
            {isModalOpen && selectedRow && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-white">
                            <div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">{selectedRow.status}</span>
                                <h2 className="font-black text-slate-800 text-2xl mt-2 tracking-tight">Return Details</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {selectedRow.sale_order}</p>
                            </div>
                            <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-all text-2xl font-light">×</button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 bg-slate-50/30">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Return Date</p>
                                    <p className="font-bold text-slate-700">{new Date(selectedRow.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Reason</p>
                                    <p className="font-bold text-slate-700">{selectedRow.reason || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Items Summary</h3>
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 border-b border-slate-100">
                                            <tr>
                                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {selectedRow.items?.map((item: any) => (
                                                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-5">
                                                        <p className="font-black text-slate-800 text-sm">{item.product_name}</p>
                                                        {item.serial_numbers?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {item.serial_numbers.map((sn: string, i: number) => (
                                                                    <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold border border-slate-200 uppercase">SN: {sn}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-5 text-center font-bold text-slate-600 text-sm">{Number(item.quantity).toFixed(0)}</td>
                                                    <td className="p-5 text-right font-black text-slate-900 text-sm">₹{Number(item.rate).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end bg-white">
                            <button onClick={closeModal} className="px-12 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200">CLOSE WINDOW</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SalesReturn;