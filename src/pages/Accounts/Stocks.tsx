import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Select from "react-select";
import Pagination from "../../components/Pagination";
import * as XLSX from "xlsx";
import { Download, RotateCcw, Search, Package, Eye, X, Barcode } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const Stocks: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // FILTERS
  const [filters, setFilters] = useState({
    search: "",
    brand_id: "",
    category_id: "",
    hub_id: "",
    vendor_id: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // PAGINATION
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<any>({});
  const [totalPages, setTotalPages] = useState(1);

  // DROPDOWN DATA
  const [vendors, setVendors] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchSerial, setSearchSerial] = useState("");
  const [activeTab, setActiveTab] = useState<"opening" | "purchased" | "sales" | "closing">("opening");

  const fetchStocks = async () => {
    if (!filters.hub_id) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.get(Api.consolidatedInventoryLog, {
        params: {
          hub_id: filters.hub_id,
          start_date: filters.startDate,
          end_date: filters.endDate,
          barcode: filters.search
        },
      });

      // The data is coming under a key named "null" based on your response
      const items = res.data?.null || [];

      const formattedData = items.map((item: any) => {
        // Handle if 'product' is an object or just a string/ID
        const product = item.product;
        const isObj = typeof product === 'object' && product !== null;

        return {
          productId: isObj ? product.id : (item.product_id || product),
          name: isObj ? product.name : (item.product_name || "Unknown Product"),
          barcode: isObj ? (product.barcode || "") : (item.barcode || ""),
          opening: item.opening_stock?.count || 0,
          purchased: item.purchased_stock?.count || 0,
          sales: item.total_sales?.count || 0,
          closing: item.closing_stock?.count || 0,
          serials: {
            opening: item.opening_stock?.serial_numbers || [],
            purchased: item.purchased_stock?.serial_numbers || [],
            sales: item.total_sales?.serial_numbers || [],
            closing: item.closing_stock?.serial_numbers || [],
          }
        };
      });

      setData(formattedData);
      setPagination({ total_elements: formattedData.length });
      setTotalPages(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch inventory log");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    const res = await axiosInstance.get(`${Api.vendor}?size=10000`);
    setVendors(res.data?.vendors?.map((v: any) => ({ label: v.name, value: v.id })));
  };

  const fetchHubs = async () => {
    if (user?.role === "HUB_MANAGER" || user?.role === "MANAGER") return;
    try {
      const res = await axiosInstance.get(`${Api.allHubs}`);
      const hubOptions = res.data?.hubs?.map((h: any) => ({ label: h.name, value: h.id })) || [];
      setHubs(hubOptions);
      if (hubOptions.length > 0 && !filters.hub_id) {
        setFilters(prev => ({ ...prev, hub_id: hubOptions[0].value }));
      }
    } catch (err) {
      console.error("Error fetching hubs:", err);
    }
  };

  const fetchCategories = async () => {
    const res = await axiosInstance.get(`${Api.categories}`);
    setCategories(res.data?.data?.map((c: any) => ({ label: c.name, value: c.id })));
  };

  const fetchBrands = async () => {
    const res = await axiosInstance.get(`${Api.allBrands}`);
    setBrands(res.data?.brands?.map((b: any) => ({ label: b.name, value: b.id })));
  };

  // Initial Load of Dropdown Data
  useEffect(() => {
    fetchVendors();
    fetchHubs();
    fetchCategories();
    fetchBrands();
  }, [user?.role]);

  // Role-based hub_id enforcement
  useEffect(() => {
    if ((user?.role === "HUB_MANAGER" || user?.role === "MANAGER") && user?.hub_id) {
      if (filters.hub_id !== user.hub_id) {
        setFilters(prev => ({ ...prev, hub_id: user.hub_id! }));
      }
    }
  }, [user]);

  // Fetch Stocks when filters or pagination change
  useEffect(() => {
    if (filters.hub_id) {
      fetchStocks();
    }
  }, [filters, page, pageSize]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      brand_id: "",
      category_id: "",
      hub_id: "",
      vendor_id: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setPage(1);
  };

  const handleDownload = () => {
    if (!data.length) return;
    const formatted = data.map((item, index) => ({
      "S.No": index + 1,
      "Product Name": item.name,
      "Barcode": item.barcode,
      "Opening Stock": item.opening,
      "Purchased Stock": item.purchased,
      "Total Sales": item.sales,
      "Closing Stock": item.closing,
    }));
    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stocks");
    XLSX.writeFile(wb, "Stocks_Report.xlsx");
  };

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#e2e8f0',
      borderRadius: '0.75rem',
      padding: '2px',
      fontSize: '0.875rem',
      boxShadow: 'none',
      '&:hover': { borderColor: '#94a3b8' },
    }),
  };

  const filteredSerials = (selectedProduct?.serials?.[activeTab] || []).filter((s: string) =>
    s.toLowerCase().includes(searchSerial.toLowerCase())
  );

  const handleExportSerials = () => {
    if (!selectedProduct) return;
    const hubName = hubs.find(h => h.value === filters.hub_id)?.label || filters.hub_id;

    const formatDateIN = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const dateRange = `${formatDateIN(filters.startDate)} - ${formatDateIN(filters.endDate)}`;

    const opening: string[] = selectedProduct.serials?.opening || [];
    const purchased: string[] = selectedProduct.serials?.purchased || [];
    const sales: string[] = selectedProduct.serials?.sales || [];
    const closing: string[] = selectedProduct.serials?.closing || [];

    const maxRows = Math.max(opening.length, purchased.length, sales.length, closing.length, 1);

    const rows: any[] = [];

    for (let i = 0; i < maxRows; i++) {
      rows.push({
        "Hub": hubName,
        "Date Range": dateRange,
        "Product": selectedProduct.name,
        "Opening Stock": opening[i] || "-",
        "Purchased Stock": purchased[i] || "-",
        "Total Sales": sales[i] || "-",
        "Closing Stock": closing[i] || "-",
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serials");
    XLSX.writeFile(wb, `Serials_${selectedProduct.name}_${formatDateIN(filters.startDate)}.xlsx`);
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen  text-slate-900">

      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="text-indigo-600" /> Inventory Insights
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time stock monitoring across your ecosystem.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleClearFilters}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!data.length}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg active:scale-95"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Search Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Enter Barcode"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
          {!((user?.role === "HUB_MANAGER" || user?.role === "MANAGER") && user?.hub_id) && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Hub</label>
              <Select
                options={hubs}
                styles={customSelectStyles}
                placeholder="Select Hub"
                isClearable={true}
                value={hubs.find(h => h.value === filters.hub_id) || null}
                onChange={(v: any) => handleFilterChange("hub_id", v?.value)}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Start Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">End Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          {/* 
          <div className="space-y-1 opacity-50 cursor-not-allowed">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Category</label>
            <Select options={categories} styles={customSelectStyles} placeholder="N/A" isDisabled />
          </div>
          <div className="space-y-1 opacity-50 cursor-not-allowed">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Brand</label>
            <Select options={brands} styles={customSelectStyles} placeholder="N/A" isDisabled />
          </div> 
          */}
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <th className="px-6 py-5 text-left font-bold uppercase tracking-widest text-[10px]">Product Name</th>
                <th className="px-6 py-5 text-center font-bold uppercase tracking-widest text-[10px]">Opening Stock</th>
                <th className="px-6 py-5 text-center font-bold uppercase tracking-widest text-[10px]">Purchased</th>
                <th className="px-6 py-5 text-center font-bold uppercase tracking-widest text-[10px]">Sales</th>
                <th className="px-6 py-5 text-center font-bold uppercase tracking-widest text-[10px]">Closing Stock</th>
                <th className="px-6 py-5 text-center font-bold uppercase tracking-widest text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center grayscale opacity-40">
                      <Package size={64} className="mb-4 text-indigo-200" />
                      <h3 className="text-xl font-bold text-slate-600">No Inventory Found</h3>
                      <p className="text-slate-400">Refine your search or filters to find what you need.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base">{item.name}</span>
                        <span className="text-[12px] text-slate-500 font-mono tracking-tighter uppercase">{item.barcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-sm">
                        {item.opening}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-sm">
                        {item.purchased}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex px-3 py-1 bg-rose-50 text-rose-600 rounded-full font-bold text-sm">
                        {item.sales}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-sm">
                        {item.closing}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setActiveTab("opening");
                          setSearchSerial("");
                          setShowModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm"
                        title="View Serials"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {/* 
        {!loading && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={pagination?.total_elements || 0}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )} 
         */}
      </div>

      {/* SERIAL MODAL */}
      {showModal && selectedProduct && (() => {
        const tabs = [
          { key: "opening", label: "Opening", color: "bg-slate-100 text-slate-700", active: "bg-slate-800 text-white", dot: "bg-slate-500" },
          { key: "purchased", label: "Purchased", color: "bg-blue-50 text-blue-700", active: "bg-blue-600 text-white", dot: "bg-blue-500" },
          { key: "sales", label: "Sold", color: "bg-rose-50 text-rose-700", active: "bg-rose-500 text-white", dot: "bg-rose-500" },
          { key: "closing", label: "Closing", color: "bg-emerald-50 text-emerald-700", active: "bg-emerald-600 text-white", dot: "bg-emerald-500" },
        ] as const;

        const currentSerials: string[] = selectedProduct.serials?.[activeTab] || [];
        const filtered = currentSerials.filter(s => s.toLowerCase().includes(searchSerial.toLowerCase()));
        const hubName = hubs.find(h => h.value === filters.hub_id)?.label || "—";

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col" style={{ maxHeight: "calc(100vh - 48px)" }}>

              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-slate-900 truncate">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Date Range: </span>
                        {new Date(filters.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {' '}-{' '}
                        {new Date(filters.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Hub: </span>{hubName}
                      </span>
                      {selectedProduct.barcode && <span className="text-[11px] font-mono text-slate-400"># {selectedProduct.barcode}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={handleExportSerials}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all"
                    >
                      <Download size={14} /> Export
                    </button>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Summary badges */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key as any); setSearchSerial(""); }}
                      className={`rounded-2xl p-3 text-left transition-all border-2 ${activeTab === tab.key
                        ? `${tab.active} border-transparent shadow-lg scale-[1.02]`
                        : `${tab.color} border-transparent hover:border-slate-200`
                        }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{tab.label}</div>
                      <div className="text-2xl font-black">{(selectedProduct.serials?.[tab.key] || []).length}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">serial{(selectedProduct.serials?.[tab.key] || []).length !== 1 ? "s" : ""}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="px-6 py-3 border-b border-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder={`Search in ${tabs.find(t => t.key === activeTab)?.label}...`}
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Serial list */}
              <div className="p-6 overflow-y-auto">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filtered.map((serial, i) => (
                      <div
                        key={i}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 transition-all flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                        <span className="truncate">{serial}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                    <Package size={40} className="mb-3" />
                    <p className="text-sm font-semibold">
                      {currentSerials.length === 0 ? "No serials in this category" : "No matches found"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">
                  Showing {filtered.length} of {currentSerials.length} serial{currentSerials.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Stocks;