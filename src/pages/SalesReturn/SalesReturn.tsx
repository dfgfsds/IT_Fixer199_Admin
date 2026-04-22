import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Pagination from "../../components/Pagination";
import Api from "../../api-endpoints/ApiUrls";
import { Eye, RotateCcw, Search, Calendar, Package, ArrowLeft, Loader2, X } from "lucide-react";

interface SalesReturnItem {
  id: string;
  product_name: string;
  product_id: string;
  quantity: string;
  rate: string;
  serial_numbers: string[];
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
  });

  const [selectedRow, setSelectedRow] = useState<SalesReturnType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSalesReturns = async (p = page, size = pageSize) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: p.toString(),
        size: size.toString(),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.status && { status: filters.status }),
        ...(filters.sale_order_id && { sale_order_id: filters.sale_order_id }),
      }).toString();

      const res = await axiosInstance.get(`${Api?.salesReturns}?${query}`);
      const result = res?.data?.data;
      setData(result?.sales_returns || []);
      setTotalPages(result?.pagination?.total_pages || 1);
      setPagination(result?.pagination || null);
    } catch (err) {
      console.error("API Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReturns();
  }, [page, pageSize]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchSalesReturns(1, pageSize);
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      status: "",
      sale_order_id: "",
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

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <Calendar size={14} className="ml-2 text-gray-400" />
          <input
            type="date"
            className="bg-transparent border-none text-xs font-bold p-1 outline-none"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
          <span className="text-gray-300">/</span>
          <input
            type="date"
            className="bg-transparent border-none text-xs font-bold p-1 outline-none"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
        </div>

        <select
          className="bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white p-2.5 rounded-2xl text-xs font-bold outline-none transition-all cursor-pointer"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">ALL STATUS</option>
          <option value="DRAFT">DRAFT</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <button
          onClick={handleApplyFilters}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
        >
          Apply
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">S.No</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Return Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 font-black">Sale Order</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                    <td className="px-6 py-4 font-bold text-gray-400 italic">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-700">
                      {new Date(row.return_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-orange-600">
                      #{row.sale_order?.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(row)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic font-bold">
                    No sales return records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="border-t border-gray-50 bg-gray-50/30">
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={pagination?.total_elements || 0}
              onPageChange={(p: number) => setPage(p)}
              onPageSizeChange={(size: number) => { setPageSize(size); setPage(1); }}
            />
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white p-7 flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="font-black text-xl tracking-tight leading-none mb-1">Return Items</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sale Order: #{selectedRow.sale_order?.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Product</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Rate</th>
                      <th className="px-6 py-4 text-right">Serial Numbers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedRow.items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-800">{item.product_name}</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-600">{Number(item.quantity).toFixed(0)}</td>
                        <td className="px-6 py-4 text-right font-medium">₹{Number(item.rate).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            {item.serial_numbers?.map((sn, idx) => (
                              <span key={idx} className="bg-gray-100 text-[9px] font-black px-1.5 py-0.5 rounded text-gray-500 border border-gray-200 uppercase tracking-tighter">
                                {sn}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Item Details Summary (Condition) */}
              {selectedRow.item_details?.length > 0 && (
                <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2">
                    <div className="w-3 h-[2px] bg-indigo-400"></div> Settlement Data
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-tight">Status:</span>
                      <span className="font-black text-indigo-700">{selectedRow.item_details[0].condition_status}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-tight">Settlement:</span>
                      <span className="font-black text-indigo-700">{selectedRow.item_details[0].settlement_type}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg active:scale-95 transition-all"
              >
                Close Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReturn;