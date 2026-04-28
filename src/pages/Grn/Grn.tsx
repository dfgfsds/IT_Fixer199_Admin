import { useEffect, useRef, useState } from "react";
import { CreditCard, Edit3, Eye, Loader2, MoreVertical, Plus, Printer, Search, Undo2 } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import Pagination from "../../components/Pagination";
// import PurchaseOrderModal from "./PurchaseOrderModal";
import Api from "../../api-endpoints/ApiUrls";
import { useReactToPrint } from "react-to-print";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import GrnOrderModal from "./GrnOrderModal";
import Logo from "../../../public/images/logo.webp";
import GrnInvoicePrint from "./GrnInvoicePrint";
import SerialNumberModal from "./SerialNumberModal";

const Grn: React.FC = () => {

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewData, setViewData] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedGRNData, setSelectedGRNData] = useState<any[]>([]);

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [showSerialModal, setShowSerialModal] = useState(false);

    console.log(selectedGRNData)
    const [dateFilter, setDateFilter] = useState({
        start_date: "",
        end_date: "",
    });


    const handleView = (item: any) => {
        setViewData(item);
        setShowViewModal(true);
    };


    const handlePay = (item: any) => {
        setSelectedPO(item);
        setShowPayModal(true);
    };

    const [filters, setFilters] = useState({
        vendor_id: "",
        hub_id: "",
    });

    const [vendors, setVendors] = useState([]);
    const [hubs, setHubs] = useState([]);


    const [form, setForm] = useState({
        payment_date: "",
        payment_method: "",
        amount_paid: "",
        payment_reference: "",
        notes: "",
    });

    console.log(selectedPO?.id)

    const submitPayment = async () => {
        try {
            if (!form.payment_date) {
                return setApiErrors("Payment date is required");
            }

            if (!form.payment_method) {
                return setApiErrors("Payment method is required");
            }

            if (!form.amount_paid) {
                return setApiErrors("Amount is required");
            }

            const payload = {
                links: [
                    {
                        grn: selectedPO?.id,
                        amount: Number(form.amount_paid),
                    }
                ],
                payment_date: new Date(form.payment_date).toISOString(),
                payment_method: form.payment_method,
                amount_paid: Number(form.amount_paid),
                payment_reference: form.payment_reference || "",
                notes: form.notes || "",
            };

            const updatedApi = await axiosInstance.post(
                `${Api.purchasePayment}`,
                payload
            );

            if (updatedApi) {
                alert("Payment Added Successfully");

                setShowPayModal(false);
                fetchData(page, pageSize);
            }

        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        }
    };

    useEffect(() => {
        if (showPayModal) {
            setForm({
                payment_date: new Date().toISOString().slice(0, 16),
                payment_method: "",
                amount_paid: (Number(selectedPO?.grand_total_amount || 0) - Number(selectedPO?.total_paid || 0)).toString(),
                payment_reference: "",
                notes: "",
            });
        }
    }, [showPayModal]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            const v = await axiosInstance.get(Api.vendor);
            const h = await axiosInstance.get(Api.allHubs);

            setVendors(v?.data?.vendors || []);
            setHubs(h?.data?.hubs || []);
        };

        fetchDropdowns();
    }, []);

    // 🔥 FETCH DATA
    const fetchData = async (p = page, size = pageSize) => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                page: String(p),
                size: String(size),
                ...(filters.vendor_id && { vendor_id: filters.vendor_id }),
                ...(filters.hub_id && { hub_id: filters.hub_id }),
                ...(search && { search: search }), // 🔥 ADD THIS
                start_date: dateFilter.start_date,
                end_date: dateFilter.end_date,
            }).toString();

            const res = await axiosInstance.get(`${Api.purchaseGRN}?${query}`);
            const response = res.data;
            if (res) {
                setData(res?.data?.items);

                if (res?.data?.pagination) {
                    const p = res?.data?.pagination;
                    setPagination(p);
                    setPage(p?.page);
                    setTotalPages(p?.total_pages);
                }
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pageSize);
    }, [filters, search, dateFilter]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchData(1, pageSize);
        }, 500);

        return () => clearTimeout(delay);
    }, [search, filters]);

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });


    // const handleGrnInvoice = async (item: any) => {
    //     try {
    //         const updatedApi: any = await axiosInstance.get(`${Api.purchaseGRNList}/${item.id}/grns/`);
    //         console.log(updatedApi)
    //         if (updatedApi) {
    //             setGrnInvoiceData(updatedApi?.data?.data);
    //             setSelectedInvoice(item);
    //             setShowInvoiceModal(true);
    //         }
    //     } catch (error) {

    //     }
    // }

    const handleDownloadExcel = async () => {
        try {
            const query = new URLSearchParams({
                ...(filters.vendor_id && { vendor_id: filters.vendor_id }),
                ...(filters.hub_id && { hub_id: filters.hub_id }),
                ...(search && { search }),
                size: "100000",
            }).toString();

            const res = await axiosInstance.get(`${Api.orderPurchase}?${query}&size=100000`);

            const list = res?.data?.items || [];

            if (!list.length) {
                return alert("No data to export");
            }

            let totalGrand = 0;
            let totalPaid = 0;

            const excelData = list.map((item: any, index: number) => {
                const grand = Number(item.grand_total || 0);
                const paid = Number(item.total_paid || 0);

                totalGrand += grand;
                totalPaid += paid;

                return {
                    "S.No": index + 1,
                    "PO Number": item.po_number,
                    "Vendor": item.vendor_name,
                    "Hub": item.hub_name,
                    "Grand Total": grand,
                    "Total Paid": paid,
                    "Balance": grand - paid,
                    "Status": item.payment_status,
                    "Order Date": item.order_date,
                };
            });

            // 🔥 ADD TOTAL ROW
            excelData.push({
                "S.No": "",
                "PO Number": "TOTAL",
                "Vendor": "",
                "Hub": "",
                "Grand Total": totalGrand,
                "Total Paid": totalPaid,
                "Balance": totalGrand - totalPaid,
                "Status": "",
                "Order Date": "",
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "PurchaseOrders.xlsx");

        } catch (error) {
            console.log(error);
            alert("Excel download failed");
        }
    };

    const handlePrintGRN = (data: any) => {
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Popup blocked! Allow popups.");
            return;
        }

        const html = `
    <html>
    <head>
      <title>GRN Print</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial;
          padding: 20px;
          color: #333;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #eee;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .company {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }

        .company-details h2 {
          margin: 0;
          font-size: 18px;
        }

        .company-details p {
          margin: 2px 0;
          font-size: 12px;
          color: #666;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h1 {
          margin: 0;
          font-size: 22px;
        }

        .info {
          margin-bottom: 20px;
          font-size: 13px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th {
          background: #f4f6f8;
          text-align: left;
          font-size: 12px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          font-size: 12px;
        }

        .right {
          text-align: right;
        }

        .totals {
          margin-top: 20px;
          width: 300px;
          margin-left: auto;
        }

        .totals div {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 13px;
        }

        .grand {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #000;
          padding-top: 5px;
        }

      </style>
    </head>

    <body>

      <!-- 🔥 HEADER -->
      <div class="header">
        
        <div class="company">
        <img src="${Logo}" class="logo"/>
          
          <div class="company-details">
            <h2>ITFixer Pvt Ltd</h2>
            <p>No.91, Ground Floor,</p>
<p>Kothari Nagar 2nd Main Road</p>
            <p>Ramapuram, Chennai - 600089</p>
            <p>Phone: +91 9385939985</p>
            <p>Email: info@itfixer199.com</p>
          </div>
        </div>

        <div class="invoice-title">
          <h1>GRN</h1>
          <p><b>No:</b> ${data.grn_number}</p>
        </div>

      </div>

      <!-- 🔥 INFO -->
      <div class="info">
        <p><b>Invoice No:</b> ${data.invoice_number}</p>
        <p><b>Vendor:</b> ${data.vendor_name}</p>
      </div>

      <!-- 🔥 TABLE -->
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Tax %</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
                ?.map(
                    (item: any) => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.received_quantity}</td>
              <td>₹${item.rate}</td>
              <td>${item.tax_percentage}%</td>
              <td class="right">₹${item.net_amount}</td>
            </tr>
          `
                )
                .join("")}
        </tbody>
      </table>

      <!-- 🔥 TOTALS -->
      <div class="totals">
        <div><span>Subtotal</span><span>₹${data.subtotal_amount}</span></div>
        <div><span>Tax</span><span>₹${data.total_tax_amount}</span></div>
        <div class="grand"><span>Grand Total</span><span>₹${data.grand_total_amount}</span></div>
        <div class="grand"><span>Paid Amount</span><span>₹${Number(viewData?.total_paid).toLocaleString('en-IN')}</span></div>
        <div class="grand"><span>Balance Amount</span><span>₹${(Number(viewData?.grand_total_amount) - Number(viewData.total_paid)).toLocaleString('en-IN')}</span></div>
      </div>
    </body>
    </html>
    `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    const maxAmount =
        Number(selectedPO?.grand_total_amount || 0) -
        Number(selectedPO?.total_paid || 0);


    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-xl font-bold">GRN List</h1>
                    {/* <p className="text-sm text-gray-500 font-medium">Manage and track your inventory procurements</p> */}
                </div>

                <button
                    onClick={() => {
                        // setEditData(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-gray-200 active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} />  GRN
                </button>
            </div>

            {/* FILTERS */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex gap-4 mb-6 shadow-sm flex-wrap">
                {/* SEARCH */}
                {/* <div className="relative flex-1">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by PO number or vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:border-orange-500 focus:bg-white border-2 rounded-xl text-sm font-medium transition-all outline-none"
                    />
                </div> */}

                {/* VENDOR FILTER */}
                <select
                    className="px-4 py-2.5 capitalize bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl text-sm  outline-none cursor-pointer transition-all"
                    value={filters.vendor_id}
                    onChange={(e) => setFilters({ ...filters, vendor_id: e.target.value })}
                >
                    <option value="">All Vendors</option>
                    {vendors.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>

                {/* HUB FILTER */}
                <select
                    className="px-4 py-2.5 capitalize bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl text-sm  outline-none cursor-pointer transition-all"
                    value={filters.hub_id}
                    onChange={(e) => setFilters({ ...filters, hub_id: e.target.value })}
                >
                    <option value="">All Hubs</option>
                    {hubs.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>

                {/* START DATE */}
                <input
                    type="date"
                    value={dateFilter.start_date}
                    onChange={(e) =>
                        setDateFilter({ ...dateFilter, start_date: e.target.value })
                    }
                    className="px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl text-sm outline-none"
                />

                {/* END DATE */}
                <input
                    type="date"
                    value={dateFilter.end_date}
                    onChange={(e) =>
                        setDateFilter({ ...dateFilter, end_date: e.target.value })
                    }
                    className="px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl text-sm outline-none"
                />

                <button
                    onClick={handleDownloadExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                >
                    Download Excel
                </button>

                <button
                    onClick={() => {
                        setFilters({
                            vendor_id: "",
                            hub_id: "",
                        });
                        setSearch("");
                        fetchData(1, pageSize);
                    }}
                    className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm  hover:bg-red-200"
                >
                    Clear All
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

                <div className="w-full overflow-x-auto"> {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Data...</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                                <th className="px-6 py-4 text-left">S.No</th>
                                <th className="px-6 py-4 text-left">Order Details</th>
                                <th className="px-6 py-4 text-left">Hub / Location</th>
                                <th className="px-6 py-4 text-left">Quantity</th>
                                <th className="px-6 py-4 text-right">Payment Info</th>
                                {/* <th className="px-6 py-4 text-center">Serial</th> */}
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {data?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 text-gray-400 font-bold italic">
                                        No Purchase Orders Found
                                    </td>
                                </tr>
                            ) : (
                                data?.map((item: any, index: number) => {
                                    const balance = Number(item.grand_total) - Number(item?.grn_actual_pending_amount);
                                    const isFullyPaid = balance <= 0;
                                    const pendingAmount =
                                        Number(item.grand_total_amount) - Number(item.total_paid);
                                    const receivedQuantity = item.items?.reduce((a: number, b: any) => a + Number(b.received_quantity), 0) || 0;


                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-400">
                                                {(page - 1) * pageSize + index + 1}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{item?.grn_number}</p>
                                                <p className="text-[11px] text-gray-500 font-bold uppercase">{item?.vendor_name}</p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-semibold text-gray-600 uppercase">
                                                    {item.hub_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 align-top">
                                                {/* <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2"> */}

                                                {/* <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-gray-500">Total Qty</span> */}
                                                <span className="px-2 py-1 bg-gray-100 font-bold  rounded text-[10px] text-gray-600 uppercase">
                                                    {receivedQuantity}
                                                </span>
                                                {/* </div> */}

                                                {/* <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-green-600">Received</span>
                                                        <span>
                                                            {Number(item.items?.map((i: any) => i.received_quantity).reduce((a: number, b: number) => a + b, 0)).toLocaleString('en-IN')}
                                                        </span>
                                                    </div> */}

                                                {/* <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-red-500">Pending</span>
                                                        <span>
                                                            {Number(item.items?.map((i: any) => i.pending_quantity).reduce((a: number, b: number) => a + b, 0)).toLocaleString('en-IN')}
                                                        </span>
                                                    </div> */}

                                                {/* </div> */}
                                            </td>

                                            {/* <td className="px-4 py-5 align-top">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-bold">
                                                        ₹{Number(item?.grand_total_amount)?.toLocaleString('en-IN')}
                                                    </span>
                                                </div> */}

                                            {/* <div className="bg-black text-white rounded-xl p-3 space-y-2">

                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-400">Grand Total</span>
                                                        <span className="font-bold">
                                                            ₹{Number(item?.grand_total_amount)?.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-green-400">Paid</span>
                                                        <span>

                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-red-400">Balance</span>
                                                        <span>

                                                        </span>
                                                    </div>

                                                </div> */}
                                            {/* </td> */}

                                            <td className="px-6 py-4 text-right bg-gray-50/30">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Grand:</span>
                                                        <span className="text-gray-900 font-black">₹{Number(item.grand_total_amount).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[9px] font-bold text-green-400 uppercase">Paid:</span>
                                                        <span className="text-green-700 font-bold">₹{Number(item.total_paid).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[9px] font-bold text-red-400 uppercase">
                                                            Bal:
                                                        </span>


                                                        <span className="font-black text-red-600">
                                                            ₹{Number(item.grand_total_amount) - Number(item.total_paid)}
                                                        </span>


                                                        {/* {balance === 0 && (
                                                            <span className="font-black text-green-600">
                                                                PAID
                                                            </span>
                                                        )} */}

                                                        {/* {balance < 0 && (
                                                            <span className="font-black text-blue-600">
                                                                ADV ₹{Math.abs(balance).toLocaleString("en-IN")}
                                                            </span>
                                                        )} */}

                                                    </div>
                                                </div>
                                            </td>


                                            {/* <td className="px-6 py-4 text-right  text-gray-900">
                                                ₹{Number(item.grand_total).toLocaleString('en-IN')}
                                            </td>

                                            <td className="px-6 py-4 text-right  text-green-600">
                                                ₹{Number(item.total_paid).toLocaleString('en-IN')}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-semibold ${item?.po_pending_amount > 0 ? 'text-red-500 ' : 'text-gray-300'}`}>
                                                    ₹{item?.po_pending_amount?.toLocaleString('en-IN')}
                                                </span>
                                            </td> */}

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        disabled={pendingAmount <= 0}
                                                        onClick={() => handlePay(item)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${pendingAmount > 0
                                                            ? "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        Pay
                                                    </button>

                                                    <button
                                                        onClick={() => handlePrintGRN(item)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleView(item)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <div
                                                        className="relative"
                                                        // 🔥 Inga thaan ref assign pannanum
                                                        ref={(el) => (dropdownRefs.current[item.id] = el)}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenDropdown(openDropdown === item.id ? null : item.id);
                                                            }}
                                                            className="text-gray-600 hover:text-black"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>

                                                        {openDropdown === item.id && (
                                                            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg w-40 z-10 overflow-hidden">
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation(); // Parent row click aagama irukka

                                                                        setSelectedGRNData(item);
                                                                        setShowSerialModal(true);
                                                                        setOpenDropdown(null);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                                >
                                                                    Add Serial number
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}

                    {/* PAGINATION */}
                    {!loading && pagination && (
                        <div className="border-t border-gray-50 bg-gray-50/30">
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={pagination.total_elements}
                                onPageChange={(p: number) => fetchData(p, pageSize)}
                                onPageSizeChange={(size: number) => {
                                    setPageSize(size);
                                    fetchData(1, size);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: "none" }}>
                <GrnInvoicePrint ref={componentRef} data={selectedOrder} />
            </div>

            {showViewModal && viewData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] p-4">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">

                        {/* 1. HEADER SECTION */}
                        <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                                    <Search size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-black text-xl tracking-tight leading-none mb-1">
                                        GRN Details
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-black text-orange-400 uppercase tracking-widest">
                                            {viewData?.grn_number}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                            Created on: {new Date(viewData?.received_date).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* 2. BODY CONTENT */}
                        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">

                            {/* FULL DETAILS GRID - Label & Values */}
                            <section>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="w-4 h-[2px] bg-orange-500"></div> General Information
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                    <DetailItem label="Vendor Name" value={viewData?.vendor_name} />
                                    {/* <DetailItem label="Vendor ID" value={`#${viewData.vendor_id}`} isCode /> */}
                                    <DetailItem label="Hub Name" value={viewData?.hub_name} />
                                    {/* <DetailItem label="Hub ID" value={`#${viewData.hub_id}`} isCode /> */}
                                    {/* <DetailItem label="Reference No" value={viewData.reference_number || "N/A"} /> */}
                                    <DetailItem label="Order Date" value={new Date(viewData?.received_date).toLocaleDateString()} />
                                    <DetailItem
                                        label="Status"
                                        value={Number(viewData.grand_total) <= Number(viewData.total_paid) ? "Completed" : "Pending"}
                                        isStatus
                                        statusType={Number(viewData.grand_total) <= Number(viewData.total_paid) ? "success" : "warning"}
                                    />
                                    {/* <DetailItem label="Last Updated" value={new Date(viewData.updated_at).toLocaleDateString()} /> */}
                                </div>
                            </section>

                            {/* ITEMS BREAKDOWN TABLE */}
                            <section>
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Itemized List</h3>
                                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4">Item Description</th>
                                                <th className="px-6 py-4 text-center">Quantity</th>
                                                <th className="px-6 py-4 text-right">Unit Price</th>
                                                <th className="px-6 py-4 text-right">Tax (%)</th>
                                                <th className="px-6 py-4 text-right">Total Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-gray-700">
                                            {viewData.items?.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-black text-gray-900">{item?.product_name}</p>
                                                        {/* <p className="text-[10px] text-gray-400 font-bold uppercase">SKU: {item.item_id || 'N/A'}</p> */}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-gray-600">{Number(item?.received_quantity)}</td>
                                                    <td className="px-6 py-4 text-right font-medium">₹{Number(item?.rate).toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{Number(item?.tax_percentage) || '0'}%</td>
                                                    <td className="px-6 py-4 text-right font-black text-gray-900">₹{Number(item?.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* PAYMENT & FINANCIALS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Transaction Log */}
                                {/* <div>
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Payment Log</h3>
                                    <div className="space-y-3">
                                        {viewData.payments?.length > 0 ? (
                                            viewData.payments.map((p: any, i: number) => (
                                                <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-gray-900">{p.payment_method}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold">{p.payment_reference || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-green-600">₹{Number(p.amount_paid).toLocaleString('en-IN')}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(p.payment_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 text-xs font-bold italic">
                                                No payment records found.
                                            </div>
                                        )}
                                    </div>
                                </div> */}

                                {/* Financial Summary */}
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Calculation</h3>
                                    <div className="space-y-4">
                                        <SummaryRow label="Sub Total" value={viewData?.subtotal_amount || viewData?.grand_total_amount} />
                                        <SummaryRow label="Tax Amount" value={viewData?.total_tax_amount || 0} />
                                        {viewData?.total_discount_amount > 0 && (
                                            <SummaryRow label="Discount" value={viewData?.total_discount_amount || 0} isDiscount />

                                        )}

                                        <div className="h-[1px] bg-gray-200 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-gray-900 uppercase">Grand Total</span>
                                            <span className="text-2xl font-black text-orange-600">₹{Number(viewData?.grand_total_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600 pt-2">
                                            <span className="text-[10px] font-black uppercase">Total Paid</span>
                                            <span className="text-sm font-black">₹{Number(viewData?.total_paid).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-red-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Balance Due</span>
                                            <span className="text-sm font-black underline underline-offset-4">₹{(Number(viewData?.grand_total_amount) - Number(viewData.total_paid)).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NOTES SECTION */}
                            {viewData.notes && (
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Internal Notes:</p>
                                    <p className="text-sm text-gray-700 italic font-medium">"{viewData.notes}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showPayModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                    <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">

                        {/* Header */}
                        <div className="bg-gray-900 p-5 flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                            </div>
                            <div>
                                <h2 className="text-white font-black uppercase tracking-widest text-sm">Add New Payment</h2>
                                <p className="text-gray-400 text-[10px] uppercase font-bold">Record a transaction for this order</p>
                            </div>
                        </div>


                        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">

                            {/* LEFT */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Payable Amount
                                </p>
                                <p className="text-lg font-extrabold text-gray-900">
                                    ₹{Number(selectedPO.grand_total_amount) - Number(selectedPO.total_paid)}
                                </p>
                            </div>

                        </div>

                        <div className="p-6 space-y-5">
                            {/* DATE FIELD */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Payment Date & Time</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        className="w-full border-2 border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
                                        value={form.payment_date}
                                        onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* METHOD SELECT */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Payment Method</label>
                                <select
                                    className="w-full border-2 border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm font-bold focus:border-orange-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                    value={form.payment_method}
                                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                >
                                    <option value="">Choose Method</option>
                                    <option value="CASH">💵 Cash</option>
                                    <option value="UPI">📱 UPI / QR Scan</option>
                                    <option value="BANK">🏦 Bank Transfer</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* AMOUNT */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={form.amount_paid ?? ""} // ✅ controlled input
                                        className="w-full border-2 border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm font-black text-green-600 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                        onChange={(e) => {
                                            let val = e.target.value;

                                            // ✅ allow empty (user typing)
                                            if (val === "") {
                                                setForm({ ...form, amount_paid: "" });
                                                return;
                                            }

                                            let num: any = Number(val);

                                            // ❌ prevent invalid
                                            if (isNaN(num)) return;

                                            // ❌ prevent negative
                                            if (num < 0) num = 0;

                                            // ❌ prevent exceeding
                                            if (num > maxAmount) num = maxAmount;

                                            // ✅ fix decimal (2 or 4 based on backend)
                                            num = Number(num.toFixed(2));

                                            setForm({
                                                ...form,
                                                amount_paid: num,
                                            });
                                        }}
                                    />
                                </div>

                                {/* REFERENCE */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Ref / Trans ID</label>
                                    <input
                                        type="text"
                                        placeholder="TXN123..."
                                        className="w-full border-2 border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm font-bold focus:border-orange-500 focus:bg-white outline-none transition-all"
                                        value={form.payment_reference}
                                        onChange={(e) => setForm({ ...form, payment_reference: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* NOTES */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Notes</label>
                                <textarea
                                    placeholder="Enter additional payment details..."
                                    rows={2}
                                    className="w-full border-2 border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm font-medium focus:border-orange-500 focus:bg-white outline-none transition-all resize-none"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>

                            {/* API Error Message */}
                            {apiErrors && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg animate-pulse">
                                    <p className="text-red-600 text-xs font-bold italic flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                        {apiErrors}
                                    </p>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowPayModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                                >
                                    Discard
                                </button>

                                <button
                                    onClick={submitPayment}
                                    className="flex-[2] px-4 py-3 bg-gray-900 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gray-200 transition-all active:scale-95"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <GrnOrderModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => fetchData(page, pageSize)}
            // editData={editData}
            />


            <SerialNumberModal
                show={showSerialModal}
                onClose={() => setShowSerialModal(false)}
                grnData={selectedGRNData}
            // serialData={serialData}
            // setSerialData={setSerialData}
            />

        </div>
    );
};

export default Grn;

{/* --- HELPER COMPONENTS FOR CLEANER CODE --- */ }
const DetailItem = ({ label, value, isCode = false, isStatus = false, statusType = "" }: any) => (
    <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</p>
        {isStatus ? (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${statusType === 'success' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {value}
            </span>
        ) : (
            <p className={`text-sm font-bold ${isCode ? 'font-mono text-xs text-blue-600' : 'text-gray-900'}`}>{value}</p>
        )}
    </div>
);

const SummaryRow = ({ label, value, isDiscount = false }: any) => (
    <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-gray-500 uppercase">{label}</span>
        <span className={isDiscount ? 'text-red-500' : 'text-gray-900'}>
            {isDiscount ? '-' : ''} ₹{Number(value).toLocaleString('en-IN')}
        </span>
    </div>
);