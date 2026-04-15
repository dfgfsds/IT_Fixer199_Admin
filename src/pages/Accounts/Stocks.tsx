// import { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";
// import Select from "react-select";
// import Pagination from "../../components/Pagination";
// import * as XLSX from "xlsx";
// // Icons mattum puthusa add panniruken, design nalla irukka
// import { Download, RotateCcw, Search, Package, Eye } from "lucide-react";

// const Stocks: React.FC = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   // 🔥 FILTERS
//   const [filters, setFilters] = useState({
//     search: "",
//     brand_id: "",
//     category_id: "",
//     hub_id: "",
//     vendor_id: "",
//   });

//   // 🔥 PAGINATION
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [pagination, setPagination] = useState<any>({});
//   const [totalPages, setTotalPages] = useState(1);

//   // 🔥 DROPDOWN DATA
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [hubs, setHubs] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [brands, setBrands] = useState<any[]>([]);

//   const [showModal, setShowModal] = useState(false);
//   const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
//   const [searchSerial, setSearchSerial] = useState("");


//   const handleViewSerials = (item: any) => {
//     let serials: string[] = [];

//     if (item.available_serials?.length) {
//       serials = item.available_serials
//         .flatMap((s: string) => s.split(","))
//         .map((s: string) => s.trim());
//     }

//     setSelectedSerials(serials);
//     setShowModal(true);
//   };


//   // ================= STOCK API =================
//   const fetchStocks = async () => {
//     try {
//       setLoading(true);

//       const res = await axiosInstance.get(Api.consolidatedStock, {
//         params: {
//           ...filters,
//           page,
//           size: pageSize,
//         },
//       });

//       setData(res.data?.consolidated_stock || []);
//       setPagination(res.data?.pagination || {});
//       setTotalPages(res.data?.pagination?.total_pages || 1);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= FILTER APIS =================
//   const fetchVendors = async () => {
//     const res = await axiosInstance.get(`${Api.vendor}?size=10000`);
//     setVendors(
//       res.data?.vendors?.map((v: any) => ({
//         label: v.name,
//         value: v.id,
//       }))
//     );
//   };

//   const fetchHubs = async () => {
//     const res = await axiosInstance.get(`${Api.allHubs}`);
//     setHubs(
//       res.data?.hubs?.map((h: any) => ({
//         label: h.name,
//         value: h.id,
//       }))
//     );
//   };

//   const fetchCategories = async () => {
//     const res = await axiosInstance.get(`${Api.categories}`);
//     setCategories(
//       res.data?.data?.map((c: any) => ({
//         label: c.name,
//         value: c.id,
//       }))
//     );
//   };

//   const fetchBrands = async () => {
//     const res = await axiosInstance.get(`${Api.allBrands}`);
//     setBrands(
//       res.data?.brands?.map((b: any) => ({
//         label: b.name,
//         value: b.id,
//       }))
//     );
//   };

//   // ================= EFFECT =================
//   useEffect(() => {
//     fetchStocks();
//   }, [filters, page, pageSize]);

//   useEffect(() => {
//     fetchVendors();
//     fetchHubs();
//     fetchCategories();
//     fetchBrands();
//   }, []);

//   // ================= HANDLERS =================
//   const handleFilterChange = (key: string, value: any) => {
//     setFilters((prev) => ({
//       ...prev,
//       [key]: value || "",
//     }));
//     setPage(1);
//   };

//   const handleClearFilters = () => {
//     setFilters({
//       search: "",
//       brand_id: "",
//       category_id: "",
//       hub_id: "",
//       vendor_id: "",
//     });
//     setPage(1);
//   };

//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//   };

//   const handlePageSizeChange = (size: number) => {
//     setPageSize(size);
//     setPage(1);
//   };

//   // ================= EXCEL =================
//   const handleDownload = () => {
//     if (!data.length) return;

//     const formatted = data.map((item, index) => ({
//       "S.No": index + 1,
//       Product: item.product?.name,
//       Category: item.product?.categories?.[0]?.name || "-",
//       Brand: item.product?.brand?.name || "-",
//       Hub: item.hub_name,
//       Vendor: item.vendor_name,
//       "Available Stock": item.available_stock,
//       "Net Amount": item.net_amount,
//     }));

//     const ws = XLSX.utils.json_to_sheet(formatted);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Stocks");

//     XLSX.writeFile(wb, "Stocks_Report.xlsx");
//   };

//   // React-Select custom styles for a cleaner look
//   const customSelectStyles = {
//     control: (base: any) => ({
//       ...base,
//       borderColor: '#e2e8f0', // slate-200
//       borderRadius: '0.5rem', // rounded-lg
//       padding: '1px',
//       '&:hover': {
//         borderColor: '#cbd5e1', // slate-300
//       },
//     }),
//   };

//   useEffect(() => {
//     const handleScan = (e: KeyboardEvent) => {
//       if (e.key === "Enter") {
//         setSearchSerial(""); // 🔥 scan panna search clear
//       }
//     };

//     window.addEventListener("keydown", handleScan);
//     return () => window.removeEventListener("keydown", handleScan);
//   }, []);

//   const filteredSerials = (selectedSerials || []).filter((serial) =>
//     (serial || "").toLowerCase().includes(searchSerial.toLowerCase())
//   );

//   useEffect(() => {
//     const handleScan = (e: KeyboardEvent) => {
//       if (e.key === "Enter") {
//         setSearchSerial("");
//       }
//     };

//     window.addEventListener("keydown", handleScan);
//     return () => window.removeEventListener("keydown", handleScan);
//   }, []);



//   return (
//     <div className="bg-[#f8fafc] min-h-screen font-sans">

//       {/* 🔥 HEADER & ACTIONS */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
//             Stocks Report
//           </h1>
//           <p className="text-slate-500 text-sm mt-1">
//             View consolidated stock details across all hubs and vendors.
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleClearFilters}
//             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
//           >
//             <RotateCcw size={16} />
//             Clear
//           </button>

//           <button
//             onClick={handleDownload}
//             disabled={!data.length}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md ${data.length
//               ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
//               : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
//               }`}
//           >
//             <Download size={16} />
//             Excel
//           </button>
//         </div>
//       </div>

//       {/* 🔥 FILTERS CARD */}
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

//           <div className="space-y-1">
//             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Vendor</label>
//             <Select
//               options={vendors}
//               onChange={(val: any) => handleFilterChange("vendor_id", val?.value)}
//               isClearable
//               placeholder="Select Vendor"
//               styles={customSelectStyles}
//             />
//           </div>

//           <div className="space-y-1">
//             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Hub</label>
//             <Select
//               options={hubs}
//               onChange={(val: any) => handleFilterChange("hub_id", val?.value)}
//               isClearable
//               placeholder="Select Hub"
//               styles={customSelectStyles}
//             />
//           </div>

//           <div className="space-y-1">
//             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Category</label>
//             <Select
//               options={categories}
//               onChange={(val: any) => handleFilterChange("category_id", val?.value)}
//               isClearable
//               placeholder="Select Category"
//               styles={customSelectStyles}
//             />
//           </div>

//           <div className="space-y-1">
//             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Brand</label>
//             <Select
//               options={brands}
//               onChange={(val: any) => handleFilterChange("brand_id", val?.value)}
//               isClearable
//               placeholder="Select Brand"
//               styles={customSelectStyles}
//             />
//           </div>

//         </div>
//       </div>

//       {/* 🔥 TABLE CARD */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm border-collapse">
//             <thead className="bg-slate-50/50 border-b border-slate-100">
//               <tr>
//                 {/* 🔥 HEADERS ARE EXACTLY THE SAME AS YOUR ORIGINAL CODE
//                    Just added padding, color, and uppercase for better design.
//                 */}
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Barcode</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Product</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Category</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Brand</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Hub</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Vendor</th>
//                 <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider text-xs">Stock</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Net Amount</th>
//                 <th className="px-6 py-4 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Action</th>

//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan={7} className="text-center py-10">
//                     <div className="flex justify-center items-center gap-2 text-indigo-600 font-medium">
//                       <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//                       Loading stock data...
//                     </div>
//                   </td>
//                 </tr>
//               ) : data.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="text-center py-16 text-slate-500">
//                     <div className="flex flex-col items-center gap-3 opacity-60">
//                       <Package size={40} className="text-slate-400" />
//                       <span className="font-medium text-lg">No Data Found</span>
//                       <p className="text-sm">Try adjusting your filters or clear them to see all results.</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 data.map((item: any, index: number) => (
//                   <tr key={index} className="hover:bg-slate-50/50 transition-colors">
//                     <td className="px-6 py-4 font-semibold text-slate-900">{item.product?.barcode}</td>
//                     <td className="px-6 py-4 font-semibold text-slate-900">{item.product?.name}</td>
//                     <td className="px-6 py-4 text-slate-700">{item.product?.categories?.[0]?.name || "-"}</td>
//                     <td className="px-6 py-4 text-slate-700">{item.product?.brand?.name || "-"}</td>
//                     <td className="px-6 py-4 text-slate-700 font-medium">{item.hub_name}</td>
//                     <td className="px-6 py-4 text-slate-600">{item.vendor_name}</td>
//                     <td className="px-6 py-4 text-center">
//                       {/* Using a subtle badge for stock for better readability */}
//                       <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${item.available_stock > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'
//                         }`}>
//                         {item.available_stock}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-emerald-700 font-semibold text-base">
//                       ₹ {item.net_amount.toLocaleString('en-IN')}
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <button
//                         onClick={() => handleViewSerials(item)}
//                         className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md text-indigo-700 text-xs hover:bg-indigo-100"
//                       >
//                         <Eye size={14} /> View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* 🔥 PAGINATION FOOTER */}
//         {!loading && pagination && (
//           <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-3">
//             <Pagination
//               page={page}
//               totalPages={totalPages}
//               pageSize={pageSize}
//               totalItems={pagination.total_elements}
//               onPageChange={handlePageChange}
//               onPageSizeChange={handlePageSizeChange}
//             />
//           </div>
//         )}
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//           <div className="bg-white w-[500px] max-h-[80vh] rounded-xl p-5 shadow-lg flex flex-col">

//             {/* HEADER */}
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-bold">Serial Numbers</h2>
//               <button onClick={() => setShowModal(false)}>❌</button>
//             </div>

//             {/* SEARCH */}
//             <input
//               type="text"
//               placeholder="Search / Scan Serial..."
//               value={searchSerial}
//               onChange={(e) => setSearchSerial(e.target.value)}
//               className="border px-3 py-2 rounded-lg mb-4"
//             />

//             {/* LIST */}
//             <div className="overflow-y-auto flex-1 border rounded-lg">
//               {filteredSerials.length ? (
//                 filteredSerials.map((serial, i) => (
//                   <div
//                     key={i}
//                     className="px-3 py-2 border-b text-sm hover:bg-slate-50"
//                   >
//                     {serial}
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center text-gray-500">
//                   No serials found
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default Stocks;

import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Select from "react-select";
import Pagination from "../../components/Pagination";
import * as XLSX from "xlsx";
import { Download, RotateCcw, Search, Package, Eye, X, Barcode } from "lucide-react";

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

  const [showModal, setShowModal] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [searchSerial, setSearchSerial] = useState("");

  const handleViewSerials = (item: any) => {
    let serials: string[] = [];
    if (item.available_serials?.length) {
      serials = item.available_serials
        .flatMap((s: string) => s.split(","))
        .map((s: string) => s.trim());
    }
    setSelectedSerials(serials);
    setShowModal(true);
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(Api.consolidatedStock, {
        params: { ...filters, page, size: pageSize },
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

  useEffect(() => {
    fetchStocks();
    fetchVendors();
    fetchHubs();
    fetchCategories();
    fetchBrands();
  }, [filters, page, pageSize]);

  const fetchVendors = async () => {
    const res = await axiosInstance.get(`${Api.vendor}?size=10000`);
    setVendors(res.data?.vendors?.map((v: any) => ({ label: v.name, value: v.id })));
  };

  const fetchHubs = async () => {
    const res = await axiosInstance.get(`${Api.allHubs}`);
    setHubs(res.data?.hubs?.map((h: any) => ({ label: h.name, value: h.id })));
  };

  const fetchCategories = async () => {
    const res = await axiosInstance.get(`${Api.categories}`);
    setCategories(res.data?.data?.map((c: any) => ({ label: c.name, value: c.id })));
  };

  const fetchBrands = async () => {
    const res = await axiosInstance.get(`${Api.allBrands}`);
    setBrands(res.data?.brands?.map((b: any) => ({ label: b.name, value: b.id })));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: "", brand_id: "", category_id: "", hub_id: "", vendor_id: "" });
    setPage(1);
  };

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

  const filteredSerials = (selectedSerials || []).filter((serial) =>
    (serial || "").toLowerCase().includes(searchSerial.toLowerCase())
  );

  return (
    <div className="bg-[#fcfdfe] min-h-screen  text-slate-900">
      
      {/* 🟢 TOP HEADER */}
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

      {/* 🟠 FILTERS SECTION */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1 relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Search Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Name or Barcode..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Vendor</label>
            <Select options={vendors} styles={customSelectStyles} placeholder="All Vendors" isClearable onChange={(v: any) => handleFilterChange("vendor_id", v?.value)} />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Hub</label>
            <Select options={hubs} styles={customSelectStyles} placeholder="All Hubs" isClearable onChange={(v: any) => handleFilterChange("hub_id", v?.value)} />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Category</label>
            <Select options={categories} styles={customSelectStyles} placeholder="Categories" isClearable onChange={(v: any) => handleFilterChange("category_id", v?.value)} />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Brand</label>
            <Select options={brands} styles={customSelectStyles} placeholder="Brands" isClearable onChange={(v: any) => handleFilterChange("brand_id", v?.value)} />
          </div>
        </div>
      </div>

      {/* 🔵 TABLE DATA */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <th className="px-6 py-5 text-left font-bold uppercase tracking-widest text-[10px]">Product Details</th>
                <th className="px-6 py-5 text-left font-bold uppercase tracking-widest text-[10px]">Category / Brand</th>
                <th className="px-6 py-5 text-left font-bold uppercase tracking-widest text-[10px]">Location & Vendor</th>
                <th className="px-6 py-5 text-center font-bold uppercase tracking-widest text-[10px]">Stock Status</th>
                <th className="px-6 py-5 text-right font-bold uppercase tracking-widest text-[10px]">Net Value</th>
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
                  <tr key={index} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base">{item.product?.name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Barcode size={12} /> {item.product?.barcode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold w-fit">
                          {item.product?.categories?.[0]?.name || "Uncategorized"}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{item.product?.brand?.name || "No Brand"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-slate-700 font-semibold">{item.hub_name}</div>
                      <div className="text-xs text-slate-400">{item.vendor_name}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className={`inline-flex flex-col px-3 py-1.5 rounded-2xl ${item.available_stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                         <span className="text-lg font-black leading-none">{item.available_stock}</span>
                         <span className="text-[9px] font-bold uppercase mt-1 tracking-tighter">Units Available</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-lg font-bold text-slate-900">₹{item.net_amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleViewSerials(item)}
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

        {/* 📑 PAGINATION */}
        {!loading && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={pagination.total_elements}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* 🖼️ SERIAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900">Serial Directory</h2>
                <p className="text-xs text-slate-400 font-medium">Tracking {selectedSerials.length} active units</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Scan or search serial number..."
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 grid grid-cols-1 gap-2">
              {filteredSerials.length ? (
                filteredSerials.map((serial, i) => (
                  <div key={i} className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-mono text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex justify-between items-center group">
                    <span>{serial}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md font-sans font-bold">SERIAL_ID</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-30 italic text-slate-400">No matches found.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-50 text-center">
              <button onClick={() => setShowModal(false)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">Close Directory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;