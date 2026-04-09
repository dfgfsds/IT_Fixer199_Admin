import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Select from "react-select";
import Pagination from "../../components/Pagination";
import * as XLSX from "xlsx";
// Icons mattum puthusa add panniruken, design nalla irukka
import { Download, RotateCcw, Search, Package } from "lucide-react";

const Stocks: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 FILTERS
  const [filters, setFilters] = useState({
    search: "",
    brand_id: "",
    category_id: "",
    hub_id: "",
    vendor_id: "",
  });

  // 🔥 PAGINATION
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<any>({});
  const [totalPages, setTotalPages] = useState(1);

  // 🔥 DROPDOWN DATA
  const [vendors, setVendors] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // ================= STOCK API =================
  const fetchStocks = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(Api.consolidatedStock, {
        params: {
          ...filters,
          page,
          size: pageSize,
        },
      });

      setData(res.data?.consolidated_stock || []);
      setPagination(res.data?.pagination || {});
      setTotalPages(res.data?.pagination?.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER APIS =================
  const fetchVendors = async () => {
    const res = await axiosInstance.get(`${Api.vendor}?size=10000`);
    setVendors(
      res.data?.vendors?.map((v: any) => ({
        label: v.name,
        value: v.id,
      }))
    );
  };

  const fetchHubs = async () => {
    const res = await axiosInstance.get(`${Api.allHubs}`);
    setHubs(
      res.data?.hubs?.map((h: any) => ({
        label: h.name,
        value: h.id,
      }))
    );
  };

  const fetchCategories = async () => {
    const res = await axiosInstance.get(`${Api.categories}`);
    setCategories(
      res.data?.data?.map((c: any) => ({
        label: c.name,
        value: c.id,
      }))
    );
  };

  const fetchBrands = async () => {
    const res = await axiosInstance.get(`${Api.allBrands}`);
    setBrands(
      res.data?.brands?.map((b: any) => ({
        label: b.name,
        value: b.id,
      }))
    );
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchStocks();
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchVendors();
    fetchHubs();
    fetchCategories();
    fetchBrands();
  }, []);

  // ================= HANDLERS =================
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      brand_id: "",
      category_id: "",
      hub_id: "",
      vendor_id: "",
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // ================= EXCEL =================
  const handleDownload = () => {
    if (!data.length) return;

    const formatted = data.map((item, index) => ({
      "S.No": index + 1,
      Product: item.product?.name,
      Category: item.product?.categories?.[0]?.name || "-",
      Brand: item.product?.brand?.name || "-",
      Hub: item.hub_name,
      Vendor: item.vendor_name,
      "Available Stock": item.available_stock,
      "Net Amount": item.net_amount,
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stocks");

    XLSX.writeFile(wb, "Stocks_Report.xlsx");
  };

  // React-Select custom styles for a cleaner look
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#e2e8f0', // slate-200
      borderRadius: '0.5rem', // rounded-lg
      padding: '1px',
      '&:hover': {
        borderColor: '#cbd5e1', // slate-300
      },
    }),
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">

      {/* 🔥 HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Stocks Report
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View consolidated stock details across all hubs and vendors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <RotateCcw size={16} />
            Clear
          </button>

          <button
            onClick={handleDownload}
            disabled={!data.length}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md ${
              data.length
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* 🔥 FILTERS CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Vendor</label>
            <Select
              options={vendors}
              onChange={(val: any) => handleFilterChange("vendor_id", val?.value)}
              isClearable
              placeholder="Select Vendor"
              styles={customSelectStyles}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Hub</label>
            <Select
              options={hubs}
              onChange={(val: any) => handleFilterChange("hub_id", val?.value)}
              isClearable
              placeholder="Select Hub"
              styles={customSelectStyles}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Category</label>
            <Select
              options={categories}
              onChange={(val: any) => handleFilterChange("category_id", val?.value)}
              isClearable
              placeholder="Select Category"
              styles={customSelectStyles}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Brand</label>
            <Select
              options={brands}
              onChange={(val: any) => handleFilterChange("brand_id", val?.value)}
              isClearable
              placeholder="Select Brand"
              styles={customSelectStyles}
            />
          </div>

        </div>
      </div>

      {/* 🔥 TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {/* 🔥 HEADERS ARE EXACTLY THE SAME AS YOUR ORIGINAL CODE
                   Just added padding, color, and uppercase for better design.
                */}
                <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Brand</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Hub</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Vendor</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider text-xs">Stock</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Net Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-indigo-600 font-medium">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading stock data...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center gap-3 opacity-60">
                      <Package size={40} className="text-slate-400" />
                      <span className="font-medium text-lg">No Data Found</span>
                      <p className="text-sm">Try adjusting your filters or clear them to see all results.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.product?.name}</td>
                    <td className="px-6 py-4 text-slate-700">{item.product?.categories?.[0]?.name || "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{item.product?.brand?.name || "-"}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{item.hub_name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.vendor_name}</td>
                    <td className="px-6 py-4 text-center">
                      {/* Using a subtle badge for stock for better readability */}
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                        item.available_stock > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {item.available_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-700 font-semibold text-base">
                      ₹ {item.net_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔥 PAGINATION FOOTER */}
        {!loading && pagination && (
          <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-3">
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={pagination.total_elements}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default Stocks;