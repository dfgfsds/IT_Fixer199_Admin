import React, { useEffect, useRef, useState } from "react";
import { Edit3, Eye, Loader2, Plus, Printer, Search } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import Pagination from "../../components/Pagination";
import PurchaseOrderModal from "./PurchaseOrderModal";
// import PurchaseOrderModal from "./PurchaseOrderModal";
import Api from "../../api-endpoints/ApiUrls";
import PurchaseInvoicePrint from "./PurchaseInvoicePrint";
import { useReactToPrint } from "react-to-print";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const OrderPurchase: React.FC = () => {

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [apiErrors, setApiErrors] = useState<string>("");

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    const [search, setSearch] = useState("");

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
    });

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
                payment_date: new Date(form.payment_date).toISOString(),
                payment_method: form.payment_method,
                amount_paid: Number(form.amount_paid),
                payment_reference: form.payment_reference || "",
            };

            const updatedApi = await axiosInstance.post(
                `${Api.orderPurchase}${selectedPO.id}/payment/`,
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
                amount_paid: "",
                payment_reference: "",
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
                size: "10000",
                ...(filters.vendor_id && { vendor_id: filters.vendor_id }),
                ...(filters.hub_id && { hub_id: filters.hub_id }),
                ...(search && { search: search }), // 🔥 ADD THIS
            }).toString();

            const res = await axiosInstance.get(`${Api.orderPurchase}?${query}`);
            // const res = await axiosInstance.get(
            //     `${Api.orderPurchase}?page=${p}&size=${size}`
            // );
            console.log("API Response:", res);
            const response = res.data;

            // handle both formats
            const list = response?.data?.items || response || [];

            setData(list);

            if (response?.pagination) {
                setPagination(response?.page);
                setPage(response?.page);
                setTotalPages(response?.total);
            }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pageSize);
    }, [filters, search]);

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

    const triggerPrint = (order: any) => {
        setSelectedOrder(order);

        setTimeout(() => {
            handlePrint();
        }, 200);
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">Purchase Orders</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and track your inventory procurements</p>
                </div>

                <button
                    onClick={() => {
                        setEditData(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-700 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200 active:scale-95"
                >
                    <Plus size={18} strokeWidth={3} /> Create Order
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
                    className="px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl text-sm font-bold outline-none cursor-pointer transition-all"
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
                    className="px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-xl text-sm font-bold outline-none cursor-pointer transition-all"
                    value={filters.hub_id}
                    onChange={(e) => setFilters({ ...filters, hub_id: e.target.value })}
                >
                    <option value="">All Hubs</option>
                    {hubs.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>

                <button
                    onClick={() => {
                        setFilters({
                            vendor_id: "",
                            hub_id: "",
                        });
                        setSearch("");
                        fetchData(1, pageSize);
                    }}
                    className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-200"
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
                                <th className="px-6 py-4 text-right">Grand Total</th>
                                <th className="px-6 py-4 text-right">Paid</th>
                                <th className="px-6 py-4 text-right">Balance</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 text-gray-400 font-bold italic">
                                        No Purchase Orders Found
                                    </td>
                                </tr>
                            ) : (
                                data.map((item: any, index: number) => {
                                    const balance = Number(item.grand_total) - Number(item.total_paid);
                                    const isFullyPaid = balance <= 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-400">
                                                {(page - 1) * pageSize + index + 1}
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-black text-gray-900">{item.po_number}</p>
                                                <p className="text-[11px] text-gray-500 font-bold uppercase">{item.vendor_name}</p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-600 uppercase">
                                                    {item.hub_name}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right font-black text-gray-900">
                                                ₹{Number(item.grand_total).toLocaleString('en-IN')}
                                            </td>

                                            <td className="px-6 py-4 text-right font-bold text-green-600">
                                                ₹{Number(item.total_paid).toLocaleString('en-IN')}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-black ${isFullyPaid ? 'text-gray-300' : 'text-red-500'}`}>
                                                    ₹{balance.toLocaleString('en-IN')}
                                                </span>
                                                {!isFullyPaid && (
                                                    <div className="w-1 h-1 bg-red-500 rounded-full inline-block ml-1 animate-pulse" />
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        disabled={isFullyPaid}
                                                        onClick={() => handlePay(item)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${!isFullyPaid
                                                            ? "bg-green-100 text-green-700 hover:bg-green-600 hover:text-white"
                                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        Pay
                                                    </button>

                                                    <button
                                                        onClick={() => triggerPrint(item)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer size={16} />
                                                    </button>

                                                    {/* <button
                                            onClick={() => {
                                                setEditData(item);
                                                setShowModal(true);
                                            }}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Edit Order"
                                        >
                                            <Edit3 size={16} />
                                        </button> */}
                                                    <button
                                                        onClick={() => handleView(item)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
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

            {/* MODAL */}
            <PurchaseOrderModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => fetchData(page, pageSize)}
                editData={editData}
            />

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
                                        Purchase Order Details
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-black text-orange-400 uppercase tracking-widest">
                                            {viewData.po_number}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                            Created on: {new Date(viewData.created_at).toLocaleString()}
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
                                    <DetailItem label="Vendor Name" value={viewData.vendor_name} />
                                    <DetailItem label="Vendor ID" value={`#${viewData.vendor_id}`} isCode />
                                    <DetailItem label="Hub Name" value={viewData.hub_name} />
                                    <DetailItem label="Hub ID" value={`#${viewData.hub_id}`} isCode />
                                    <DetailItem label="Reference No" value={viewData.reference_number || "N/A"} />
                                    <DetailItem label="Order Date" value={new Date(viewData.order_date).toLocaleDateString()} />
                                    <DetailItem
                                        label="Status"
                                        value={Number(viewData.grand_total) <= Number(viewData.total_paid) ? "Completed" : "Pending"}
                                        isStatus
                                        statusType={Number(viewData.grand_total) <= Number(viewData.total_paid) ? "success" : "warning"}
                                    />
                                    <DetailItem label="Last Updated" value={new Date(viewData.updated_at).toLocaleDateString()} />
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
                                                        <p className="font-black text-gray-900">{item.item_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">SKU: {item.item_id || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-gray-600">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-right font-medium">₹{Number(item.rate).toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{item.tax_percentage || '0'}%</td>
                                                    <td className="px-6 py-4 text-right font-black text-gray-900">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* PAYMENT & FINANCIALS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Transaction Log */}
                                <div>
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
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Calculation</h3>
                                    <div className="space-y-4">
                                        <SummaryRow label="Sub Total" value={viewData.sub_total || viewData.grand_total} />
                                        <SummaryRow label="Tax Amount" value={viewData.tax_amount || 0} />
                                        <SummaryRow label="Discount" value={viewData.discount_amount || 0} isDiscount />
                                        <div className="h-[1px] bg-gray-200 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-gray-900 uppercase">Grand Total</span>
                                            <span className="text-2xl font-black text-orange-600">₹{Number(viewData.grand_total).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-green-600 pt-2">
                                            <span className="text-[10px] font-black uppercase">Total Paid</span>
                                            <span className="text-sm font-black">₹{Number(viewData.total_paid).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-red-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Balance Due</span>
                                            <span className="text-sm font-black underline underline-offset-4">₹{(Number(viewData.grand_total) - Number(viewData.total_paid)).toLocaleString('en-IN')}</span>
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
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">

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
                                        className="w-full border-2 border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm font-black text-green-600 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                        value={form.amount_paid}
                                        onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
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

            <div style={{ display: "none" }}>
                <PurchaseInvoicePrint ref={componentRef} data={selectedOrder} />
            </div>
        </div>
    );
};

export default OrderPurchase;

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