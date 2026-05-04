import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import Pagination from "../../components/Pagination";
import OrdersTable from "../../components/Orders/OrdersTable";
import { CreditCard, Eye, ListRestart, Printer, Search } from "lucide-react";
import AddPaymentModal from "../../components/Orders/AddPaymentModal";
import OrderDetailsTabsModal from "../../components/Orders/OrderViewModal";
import { useReactToPrint } from "react-to-print";
import SalesInvoicePrint from "./SalesInvoicePrint";
import Logo from "../../../public/images/logo.webp";
const Sales: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const getToday = () => {
        return new Date().toISOString().split("T")[0];
    };
    const [pagination, setPagination] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
    const [addPaymentOrder, setAddPaymentOrder] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState(null);


    const [filters, setFilters] = useState({
        status: "",
        search: "",
        startDate: getToday(), // 🔥 default today
        endDate: "",
        page: 1,
    });

    useEffect(() => {
        let data = [...orders];

        // 🔍 SEARCH
        if (filters.search.trim() !== '') {
            const searchValue = filters.search.toLowerCase();

            data = data.filter((order: any) =>
                order.customer_name?.toLowerCase().includes(searchValue) ||
                order.customer_number?.includes(searchValue) ||
                order.id?.toLowerCase().includes(searchValue)
            );
        }

        // 📅 DATE FILTER
        if (filters.startDate) {
            data = data.filter(
                (o: any) =>
                    new Date(o.created_at) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            data = data.filter(
                (o: any) =>
                    new Date(o.created_at) <= new Date(filters.endDate)
            );
        }

        // 🔥 SORT
        data.sort((a: any, b: any) => {
            const d1 = new Date(a.created_at).getTime();
            const d2 = new Date(b.created_at).getTime();

            return sortOrder === "recent" ? d2 - d1 : d1 - d2;
        });

        setFilteredOrders(data);
        setPage(1);

    }, [orders, filters, sortOrder]);

    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const paginatedOrders = filteredOrders.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    // ✅ FETCH ORDERS (API FILTER)
    const fetchOrders = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.append("page", String(filters.page));
            params.append("limit", "20");
            params.append("is_active", "true");
            params.append("order_platform", "SHOP");

            if (filters.search) params.append("search", filters.search);
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);



            const response = await axiosInstance.get(
                `${Api?.orders}?${params.toString()}`
            );

            setOrders(response?.data?.orders || []);
            setPagination(response?.data?.pagination || null);

        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ TRIGGER API
    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
    };

    const handlePrintInvoice = (order: any) => {
        console.log(order)
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Popup blocked! Allow popups.");
            return;
        }

        const numberToWords = (num: any) => {
            const a: any = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
            const b: any = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            if ((num = num.toString()).length > 9) return 'overflow';
            let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return '';
            let str: any = '';
            str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
            str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
            str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
            str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
            str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rs. Only' : '';
            return str;
        };

        // Modal calculations logic starts here
        const items = order.items || [];
        const totalQty = items.reduce((acc: any, curr: any) => acc + parseInt(curr?.quantity || 0), 0);
        const totalDiscount = items.reduce((acc: any, curr: any) => acc + (parseFloat(curr?.discount || 0)), 0);

        // Net Amount calculation (Price is inclusive of GST)
        const netAmount = items.reduce((acc: any, item: any) => {
            const qty = parseFloat(item?.quantity || 0);
            const price = parseFloat(item?.price || item?.selling_price || 0);
            const disc = parseFloat(item?.discount || 0);
            return acc + (qty * price - disc);
        }, 0);

        const taxableValue = netAmount / 1.18;
        const totalGst = netAmount - taxableValue;
        const cgst_sgst = totalGst / 2;

        const itemsCount = items.length;
        const emptyRowsNeeded = Math.max(0, 15 - itemsCount);

        const html = `
    <html>
    <head>
      <title>Invoice - SIGMAH ENTERPRISES</title>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 10mm; background: #fff; color: #000; }
        .main-container { border: 2px solid #000; width: 190mm; height: 277mm; margin: 0 auto; display: flex; flex-direction: column; box-sizing: border-box; }
        .top-header { display: flex; border-bottom: 2px solid #000; height: 110px; }
        .logo-section { flex: 0 0 180px; padding: 10px; border-right: 2px solid #000; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .logo-text { font-weight: bold; font-size: 18px; color: #666; line-height: 1.1; }
        .it-fixer { color: #28a745; font-size: 12px; font-weight: bold; margin-top: 5px; }
        .company-info { flex: 1; text-align: center; padding: 10px; }
        .company-info h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; }
        .company-info p { margin: 2px 0; font-size: 10px; line-height: 1.4; }
        .bill-details { display: grid; grid-template-columns: 1.5fr 1fr; border-bottom: 2px solid #000; min-height: 100px; }
        .to-section { padding: 10px; border-right: 2px solid #000; font-size: 11px; }
        .no-section table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .no-section td { padding: 5px 8px; }
        .items-container { flex-grow: 1; border-bottom: 2px solid #000; }
        .bill-table { width: 100%; border-collapse: collapse; table-layout: fixed; height: 100%;}
        .bill-table th { border-right: 1px solid #000; padding: 8px; font-size: 11px; border-bottom: 2px solid #000; background: #fff; font-weight: bold; text-align: center; }
        .bill-table td { border-right: 1px solid #000; padding: 6px; font-size: 11px; vertical-align: top; }
        .bill-table th:last-child, .bill-table td:last-child { border-right: none; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { border-top: 2px solid #000; font-weight: bold; }
        .summary-section { display: grid; grid-template-columns: 1.5fr 1fr; border-bottom: 2px solid #000; }
        .summary-left { padding: 10px; border-right: 2px solid #000; font-size: 11px; }
        .summary-right table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .summary-right td { padding: 5px 10px; border-bottom: 1px solid #000; border-left: 1px solid #000; }
        .gst-table { width: 100%; border-collapse: collapse; font-size: 10px; text-align: center; }
        .gst-table td, .gst-table th { border: 1px solid #000; padding: 4px; }
        .footer-area { padding: 10px; font-size: 9px; }
        .signature-section { margin-top: auto; padding: 15px; display: flex; justify-content: space-between; align-items: flex-end; }
        .sig-box { width: 200px; text-align: center; border-top: 1.5px solid #000; padding-top: 5px; font-size: 10px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="main-container">
        <div class="top-header">
          <div class="logo-section">
            <div class="logo-text">SIGMAH <br/> ENTERPRISES</div>
            <div class="it-fixer">IT Fixer</div>
          </div>
          <div class="company-info">
            <h1>SIGMAH ENTERPRISES</h1>
            <p>New No.29 / Old No.31 & 32, Jafferkhanpet, Opp to Kasi Theatre,<br/>
               Ashok Nagar, Chennai - 600083, <br/>
               GST No:- 33NVOPK6133G1Z8, PH: 9994156516</p>
          </div>
        </div>

        <div class="bill-details">
          <div class="to-section">
            <b>To:</b><br/>
            ${order?.customer_name?.toUpperCase()}<br/>
            PHN: ${order?.customer_number} | GST: ${order?.customer_gst || 'N/A'}
          </div>
          <div class="no-section">
            <table>
              <tr><td><b>Bill No</b></td><td>: ${order?.invoice_number || 'N/A'}</td></tr>
              <tr><td><b>Date</b></td><td>: ${new Date().toLocaleDateString('en-GB')}</td></tr>
            </table>
          </div>
        </div>

        <div class="items-container">
          <table class="bill-table">
            <thead>
              <tr>
                <th width="40">S.NO</th>
                <th>DESCRIPTION</th>
                <th width="60">HSN</th>
                <th width="40">QTY</th>
                <th width="80">RATE</th>
                <th width="70">CGST@9%</th>
                <th width="70">SGST@9%</th>
                <th width="90">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any, index: number) => {
            const qty = parseFloat(item?.quantity || 0);
            const rate = parseFloat(item?.price || item?.selling_price || 0);
            const itemGross = qty * rate;
            const itemTaxable = itemGross / 1.18;
            const itemTax = (itemGross - itemTaxable) / 2;
            return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td><b>${item?.item_details?.name || item?.name || 'Product'}</b></td>
                  <td class="text-center">${item?.hsn_code || item?.hsn || ''}</td>
                  <td class="text-center">${qty}</td>
                  <td class="text-right">${rate.toFixed(2)}</td>
                  <td class="text-right">${itemTax.toFixed(2)}</td>
                  <td class="text-right">${itemTax.toFixed(2)}</td>
                  <td class="text-right">${itemTaxable.toFixed(2)}</td>
                </tr>`
        }).join("")}
              
              ${Array(emptyRowsNeeded).fill(0).map(() => `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join("")}

              <tr class="total-row">
                <td colspan="3" class="text-center">Tot.Qty: ${totalQty}</td>
                <td colspan="2" class="text-center">Gross Amount</td>
                <td class="text-right">${cgst_sgst.toFixed(2)}</td>
                <td class="text-right">${cgst_sgst.toFixed(2)}</td>
                <td class="text-right">${taxableValue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="summary-section">
          <div class="summary-left">
            <b>Amount In Words:</b><br/>
            [${numberToWords(Math.round(netAmount))}]
          </div>
          <div class="summary-right">
            <table>
              <tr><td>Discount</td><td class="text-right">${totalDiscount.toFixed(2)}</td></tr>
              <tr><td>GST Amount</td><td class="text-right">${totalGst.toFixed(2)}</td></tr>
              <tr><td>Round Off</td><td class="text-right">0.00</td></tr>
              <tr style="font-weight: bold; font-size: 13px; background: #eee;">
                <td>Net Amount</td><td class="text-right">₹ ${netAmount.toFixed(2)}</td>
              </tr>
            </table>
            <table class="gst-table">
              <tr><th>GST %</th><th>GST Amt</th><th>Goods Value</th></tr>
              <tr><td>18%</td><td>${totalGst.toFixed(2)}</td><td>${taxableValue.toFixed(2)}</td></tr>
            </table>
          </div>
        </div>

        <div class="signature-section">
          <div class="sig-box">Customer Signature</div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 45px;">For SIGMAH ENTERPRISES</div>
            <div class="sig-box" style="margin-left: auto;">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </body>
    </html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => { setTimeout(() => { printWindow.print(); printWindow.close(); }, 500); };
    };

    return (
        <>
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sales Lists</h1>
                        {/* <p className="text-gray-500">Manage and track all service orders</p> */}
                    </div>
                </div>

                {/* FILTER UI */}
                <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-sm">

                    {/* TITLE */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Filters
                        </h2>

                        <button
                            onClick={() => {
                                setFilters({
                                    status: "",
                                    search: "",
                                    startDate: getToday(),
                                    endDate: "",
                                    page: 1,
                                });
                                setSortOrder("recent");
                            }}
                            className="flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition w-full sm:w-auto"
                        >
                            <ListRestart size={16} />
                            Reset
                        </button>
                    </div>

                    {/* FILTER GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                        {/* SEARCH */}
                        <div className="relative">
                            <label className="text-xs text-gray-500 mb-1 block">
                                Search
                            </label>
                            <Search className="absolute left-3 top-[38px] text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Order / Customer"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({ ...filters, search: e.target.value, page: 1 })
                                }
                                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* DATE RANGE */}
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">
                                Date Range
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) =>
                                        setFilters({ ...filters, startDate: e.target.value, page: 1 })
                                    }
                                    className="w-full border rounded-lg px-2 py-2"
                                />
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) =>
                                        setFilters({ ...filters, endDate: e.target.value, page: 1 })
                                    }
                                    className="w-full border rounded-lg px-2 py-2"
                                />
                            </div>
                        </div>

                        {/* SORT */}
                        {/* <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                                Sort
                            </label>
                            <select
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value as any);
                                    setPage(1);
                                }}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="recent">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div> */}

                    </div>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="flex justify-center h-40 items-center">
                        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-700">

                            {/* HEADER */}
                            <thead className="bg-gray-100 border-b border-gray-300 text-xs uppercase tracking-wider text-gray-600">
                                <tr>
                                    <th className="px-6 py-3">S.No</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Balance Amount</th>
                                    <th className="px-6 py-3">Paid Amount</th>
                                    <th className="px-6 py-3">Total Amount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody className="divide-y divide-gray-200">

                                {orders && orders?.length > 0 ? (
                                    orders?.map((order: any, index: number) => (
                                        <tr
                                            key={order?.id}
                                            className="hover:bg-gray-50 transition-all duration-150 capitalize"
                                        >

                                            {/* S.NO */}
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {index + 1}
                                            </td>

                                            {/* CUSTOMER */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {order?.customer_name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order?.customer_number}
                                                </div>
                                            </td>

                                            {/* DATE */}
                                            <td className="px-6 py-4">
                                                <div className="text-gray-800 font-medium">
                                                    {new Date(order?.created_at || "").toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(order?.created_at || "").toLocaleTimeString()}
                                                </div>
                                            </td>

                                            {/* 🔴 BALANCE */}
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold shadow-sm">
                                                    ₹{order?.amount_to_be_paid}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Balance</p>
                                            </td>

                                            {/* 🟢 PAID */}
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-semibold shadow-sm">
                                                    ₹{order?.total_paid}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Paid</p>
                                            </td>

                                            {/* ⚫ TOTAL */}
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold shadow-md">
                                                    ₹{order?.total_price}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Total</p>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-3">

                                                    {/* VIEW */}
                                                    <button
                                                        onClick={() => handleViewOrder(order)}
                                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-600" />
                                                    </button>

                                                    {/* PRINT */}
                                                    {/* <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer size={16} />
                                                    </button> */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrintInvoice(order);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                    {/* ADD PAYMENT */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (Number(order?.amount_to_be_paid) === 0) return; // extra safety
                                                            setAddPaymentOrder(order);
                                                        }}
                                                        disabled={Number(order?.amount_to_be_paid) === 0}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-xs font-medium
    ${Number(order?.amount_to_be_paid) === 0
                                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                : "bg-orange-600 text-white hover:bg-orange-700"
                                                            }`}
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        Add Payment
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">

                                                <p className="text-lg font-medium text-gray-500">
                                                    No Orders Found
                                                </p>

                                                <p className="text-sm text-gray-400 mt-1">
                                                    Try adjusting your search or filter criteria
                                                </p>

                                            </div>
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>

                )}
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                />


            </div>

            {addPaymentOrder && (
                <AddPaymentModal
                    order={addPaymentOrder}
                    onClose={() => setAddPaymentOrder(null)}
                    onSuccess={() => {
                        setAddPaymentOrder(null);
                        fetchOrders();
                    }}
                />
            )}

            {/* MODALS */}
            {selectedOrder && (
                <OrderDetailsTabsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

        </>
    )
}

export default Sales;
