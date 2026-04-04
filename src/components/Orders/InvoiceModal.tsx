import React, { useEffect, useRef, useState } from "react";
import { X, Printer, Download } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import Logo from "../../../public/images/logo.webp";

const InvoiceModal = ({ order, onClose }: any) => {
    const printRef = useRef<any>(null);
    const [data, setData] = useState<any>();

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open("", "", "width=900,height=900");

        if (!win) {
            toast.error("Popup blocked! Please allow popups for this site.");
            return;
        }

        win.document.write(`
      <html>
        <head>
          <title>Invoice_${order?.id}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            body { 
                font-family: 'Inter', sans-serif; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                margin: 0;
                padding: 40px;
            }

            @page {
                size: A4;
                margin: 0;
            }

            /* Tables require explicit borders for print */
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; }
            th { background-color: #f8fafc !important; }
            
            .text-orange-600 { color: #ea580c !important; }
            .bg-orange-50 { background-color: #fff7ed !important; }
          </style>
        </head>
        <body>
            <div class="max-w-[800px] mx-auto">
                ${content}
            </div>
            <script>
                // Wait for styles and images to load before printing
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500);
                };
            </script>
        </body>
      </html>
    `);
        win.document.close();
    };

    const subtotal = order?.items?.reduce(
        (acc: number, item: any) => acc + Number(item.price * (item.quantity || 1)),
        0
    );

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axiosInstance.get(Api?.appSettings);
            if (res?.data?.data) setData(res.data.data);
        } catch (error) {
            toast.error("Settings load panna mudiyala");
        }
    };

    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* MODAL HEADER */}
                <div className="flex justify-between items-center p-5 border-b bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID: {order?.id}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
                        >
                            <Printer size={18} /> Print / Save PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* INVOICE BODY */}
                <div className="p-8 overflow-y-auto flex-1 bg-gray-50">
                    <div ref={printRef} className="bg-white p-10 shadow-sm border border-gray-100 min-h-[1000px] mx-auto w-full max-w-[800px]">

                        {/* INVOICE TOP BAR */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="capitalize">
                                <img src={Logo} alt="Logo" className="h-14 mb-4 object-contain" />
                                <h1 className="text-xl font-bold text-gray-900">{data?.company_name || "IT FIXER @199"}</h1>
                                <div className="text-sm text-gray-500 space-y-1 mt-2">
                                    <p>{data?.company_address}</p>
                                    {data?.company_gst && (
                                        <p>GST: <span className="text-gray-800 font-medium">{data?.company_gst || "N/A"}</span></p>
                                    )}
                                    <p>Contact: {data?.support_phone}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-light text-gray-400 uppercase tracking-tighter mb-4">Invoice</h2>
                                <div className="text-sm space-y-1">
                                    <p className="text-gray-500">Date</p>
                                    <p className="font-semibold">{new Date(order?.created_at).toLocaleDateString('en-IN')}</p>
                                    <p className="text-gray-500 mt-2">Order ID</p>
                                    <p className="font-mono text-xs text-gray-800">{order?.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* BILLING INFO */}
                        <div className="grid grid-cols-2 gap-12 border-y py-8 mb-8 border-gray-100">
                            <div className="capitalize">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Bill To</p>
                                <p className="font-bold text-lg text-gray-900">{order?.customer_name}</p>
                                <p className="text-gray-600">{order?.customer_number}</p>
                                <p className="text-gray-600">{order?.user_details?.email}</p>
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed">{order?.address}</p>
                            </div>

                            {order?.order_status && order?.slot_time && order?.zone_details?.name && (
                                <div className="capitalize">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Service Details</p>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        {order?.order_status && (
                                            <>
                                                <span className="text-gray-500">Status:</span>
                                                <span className="font-medium text-blue-600">{order?.order_status}</span>
                                            </>
                                        )}
                                        {order?.slot_time && (
                                            <>
                                                <span className="text-gray-500">Slot:</span>
                                                <span className="text-gray-800">{order?.slot_time}</span>
                                            </>
                                        )}
                                        {order?.zone_details?.name && (
                                            <>
                                                <span className="text-gray-500">Zone:</span>
                                                <span className="text-gray-800">{order?.zone_details?.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}


                        </div>

                        {/* TABLE */}
                        <table className="w-full mb-10">
                            <thead>
                                <tr className="text-left">
                                    <th className="py-4 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="py-4 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="py-4 px-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="py-4 px-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
                                    <th className="py-4 px-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order?.items?.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="py-5 px-2">
                                            <p className="font-semibold text-gray-900">{item?.item_details?.name}</p>
                                        </td>
                                        <td className="py-5 px-2 text-gray-600 capitalize text-sm">{item?.type?.toLowerCase()}</td>
                                        <td className="py-5 px-2 text-center text-gray-900">{item?.quantity}</td>
                                        <td className="py-5 px-2 text-right text-gray-600">₹{Number(item?.price).toFixed(2)}</td>
                                        <td className="py-5 px-2 text-right font-semibold text-gray-900">
                                            ₹{(item?.quantity * item?.price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* SUMMARY */}
                        <div className="flex justify-end pt-6 border-t-2 border-gray-900">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>GST (18%)</span>
                                    <span>₹{gst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                            <p className="text-gray-400 text-xs">This is a computer-generated invoice. No signature required.</p>
                            <p className="text-orange-600 font-bold mt-2 text-sm">Thank you for choosing {data?.company_name || "IT FIXER @199"}!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;