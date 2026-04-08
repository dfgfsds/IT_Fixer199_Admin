import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { X, Printer, MapPin, Hash, Calendar, FileText } from "lucide-react";

const GRNInvoiceModal = ({ show, onClose, data, selectedInvoice }: any) => {
    const componentRef = useRef<any>();

    // Data array-va illati array-va maathikurom to avoid map errors
    const grnList = Array.isArray(data) ? data : [data];

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    console.log(selectedInvoice)
    console.log(data)

    if (!show || !selectedInvoice) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white w-full max-w-5xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* MODAL ACTION HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 leading-none">Purchase Order & GRN Report</h2>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">PO: {selectedInvoice.po_number}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Invoice: {selectedInvoice.invoice_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                        >
                            <Printer size={16} /> Print Full Report
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* PRINTABLE CONTENT */}
                <div className="flex-1 overflow-auto p-8 bg-slate-100">
                    <div ref={componentRef} className="bg-white p-12 shadow-sm border border-slate-200 mx-auto w-full max-w-[900px] text-slate-800 min-h-screen">

                        {/* 1. MASTER HEADER (Selected Invoice Details) */}
                        <div className="border-b-4 border-indigo-600 pb-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 uppercase mb-1">Purchase Order Summary</h1>
                                    <p className="text-sm font-bold text-indigo-600">{selectedInvoice?.vendor_name}</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-md uppercase border border-slate-200">
                                        PO Status: {selectedInvoice?.order_status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mt-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Billing Address</p>
                                    <p className="text-[11px] font-bold leading-relaxed">{selectedInvoice?.bill_to}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Shipping Address</p>
                                    <p className="text-[11px] font-bold leading-relaxed">{selectedInvoice?.ship_to}</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                    <div className="flex justify-between text-[11px] mb-1">
                                        <span className="font-bold text-indigo-400 uppercase">PO Amount:</span>
                                        <span className="font-black text-indigo-700">{selectedInvoice?.currency} {Number(selectedInvoice?.grand_total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-bold text-indigo-400 uppercase">Total Paid:</span>
                                        <span className="font-black text-emerald-600">{selectedInvoice?.currency} {Number(selectedInvoice?.total_paid).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. GRN ITERATION (Looping through all 4 or more GRNs) */}
                        <div className="space-y-10">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Hash size={14} className="text-indigo-600" /> Received Goods (GRN Logs: {grnList?.length})
                            </h3>

                            {grnList?.map((grn: any, index: number) => (
                                <div key={grn.id || index} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm page-break-inside-avoid">
                                    {/* GRN Small Header */}
                                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{grn?.grn_number}</p>
                                                <p className="text-[9px] text-slate-500 font-bold mt-1">Received on: {new Date(grn?.received_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                                            <p className="text-[11px] font-black text-indigo-600 uppercase">{grn?.status}</p>
                                        </div>
                                    </div>

                                    {/* GRN Items Table */}
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                                            <tr>
                                                <th className="px-5 py-3">Product Description</th>
                                                <th className="px-5 py-3">GRN Type</th>
                                                <th className="px-5 py-3 text-center">Received Qty</th>
                                                <th className="px-5 py-3 text-right">Rate</th>
                                                <th className="px-5 py-3 text-right">Tax</th>
                                                <th className="px-5 py-3 text-right">Discount</th>
                                                <th className="px-5 py-3 text-right">Net Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {grn.items?.map((item: any, i: number) => (
                                                <tr key={i} className="text-[11px]">
                                                    <td className="px-5 py-3 font-bold text-slate-700">
                                                        {item?.product_name}
                                                        <span className="block text-[9px] text-slate-400 font-medium uppercase mt-0.5">Batch: {item?.batch_number || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-5 py-3 font-bold text-slate-700">
                                                        {item?.grn_type}
                                                    </td>
                                                    <td className="px-5 py-3 text-center font-black text-slate-900">
                                                        {item?.received_quantity} <span className="text-[9px] text-slate-400 uppercase">{item?.uom}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-slate-500">{Number(item?.rate).toLocaleString()}</td>
                                                    <td className="px-5 py-3 text-right text-slate-500">{Number(item?.tax).toLocaleString()}</td>
                                                    <td className="px-5 py-3 text-right text-slate-500">{Number(item?.discount).toLocaleString()}</td>
                                                    <td className="px-5 py-3 text-right font-black text-slate-900">
                                                        {grn?.currency} {Number(item?.net_amount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* GRN Sub-Footer */}
                                    <div className="bg-slate-50/50 p-4 border-t border-slate-100 grid grid-cols-2">
                                        <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
                                            <p>Note: {grn.notes || "Standard delivery checked."}</p>
                                        </div>
                                        <div className="flex justify-end gap-6 items-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">GRN Total:</p>
                                            <p className="text-sm font-black text-slate-900">{grn.currency} {Number(grn.grand_total_amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. FINAL TOTAL AREA */}
                        <div className="mt-12 pt-8 border-t-2 border-slate-900 flex justify-end">
                            <div className="w-[300px] space-y-3">
                                <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[11px]">
                                    <span>Combined GRN Value</span>
                                    <span className="text-slate-900">{selectedInvoice.currency} {grnList.reduce((acc, curr) => acc + Number(curr.grand_total_amount), 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                                    <span className="text-xs font-black uppercase tracking-widest mr-2">Grand Total (Incl Tax)</span>
                                    <span className="text-xl font-black">{selectedInvoice.currency} {grnList.reduce((acc, curr) => acc + Number(curr.grand_total_amount), 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-20 flex justify-between px-4 opacity-50 grayscale">
                            <div className="text-center border-t border-slate-300 pt-2 w-[150px]">
                                <p className="text-[9px] font-black uppercase tracking-tighter">Verified By</p>
                            </div>
                            <div className="text-center border-t border-slate-300 pt-2 w-[150px]">
                                <p className="text-[9px] font-black uppercase tracking-tighter">Accountant Seal</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GRNInvoiceModal;




// import React, { useState, useRef } from "react";
// import { X } from "lucide-react";
// import ReturnModal from "./ReturnModal";


// const GRNInvoiceModal = ({ show, onClose, data, selectedInvoice }: any) => {
//   const grnList = Array.isArray(data) ? data : [data];

//   const [returnModal, setReturnModal] = useState(false);
//   const [selectedGRN, setSelectedGRN] = useState<any>(null);

//   const printRef = useRef<any>();

//   if (!show || !selectedInvoice) return null;

//   // ✅ EXPORT JSON
//   const handleExport = () => {
//     const blob = new Blob([JSON.stringify(grnList, null, 2)], {
//       type: "application/json",
//     });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "GRN_Report.json";
//     link.click();
//   };

//   // ✅ BILLING DOWNLOAD
//   const handleDownload = () => {
//     const content = printRef.current.innerHTML;
//     const win = window.open("", "", "width=900,height=700");
//     win.document.write(`<html><body>${content}</body></html>`);
//     win.document.close();
//     win.print();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
//       <div className="bg-white w-[95%] max-w-6xl h-[90vh] rounded-xl flex flex-col overflow-hidden">

//         {/* HEADER */}
//         <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
//           <div>
//             <h2 className="font-bold text-lg">Purchase Order & GRN Report</h2>
//             <p className="text-xs">PO: {selectedInvoice?.po_number}</p>
//             <p className="text-xs">Invoice: {selectedInvoice?.invoice_number}</p>
//           </div>

//           <div className="flex gap-2">
//             <button onClick={handleDownload} className="bg-black text-white px-4 py-2 rounded text-xs">
//               Download
//             </button>

//             <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded text-xs">
//               Export
//             </button>

//             <button onClick={onClose}>
//               <X />
//             </button>
//           </div>
//         </div>

//         {/* BODY */}
//         <div className="flex-1 overflow-auto p-6 bg-gray-100">
//           <div ref={printRef} className="bg-white p-8 rounded shadow">

//             {/* TITLE */}
//             <div className="border-b-2 border-indigo-500 pb-5 mb-6">
//               <h1 className="text-xl font-bold uppercase">Purchase Order Summary</h1>
//               <p className="text-indigo-600 font-semibold">
//                 {selectedInvoice?.vendor_name}
//               </p>

//               <div className="grid grid-cols-3 gap-6 mt-4 text-sm">
//                 <div>
//                   <p className="text-gray-400 text-xs">Billing Address</p>
//                   <p>{selectedInvoice?.bill_to}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400 text-xs">Shipping Address</p>
//                   <p>{selectedInvoice?.ship_to}</p>
//                 </div>

//                 <div className="bg-indigo-50 p-3 rounded">
//                   <p>PO Amount: {selectedInvoice?.currency} {selectedInvoice?.grand_total}</p>
//                   <p className="text-green-600">Paid: {selectedInvoice?.currency} {selectedInvoice?.total_paid}</p>
//                 </div>
//               </div>
//             </div>

//             {/* GRN LIST */}
//             <div className="space-y-6">

//               <h3 className="font-bold text-sm">
//                 RECEIVED GOODS (GRN LOGS: {grnList.length})
//               </h3>

//               {grnList.map((grn: any, index: number) => (
//                 <div key={index} className="border rounded-xl overflow-hidden">

//                   {/* GRN HEADER */}
//                   <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
//                     <div>
//                       <p className="font-semibold">{grn.grn_number}</p>
//                       <p className="text-xs text-gray-500">
//                         {new Date(grn.received_date).toLocaleDateString()}
//                       </p>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <span className="text-xs font-bold text-indigo-600">
//                         {grn.status}
//                       </span>

//                       {/* ✅ RETURN BUTTON */}
//                       <button
//                         onClick={() => {
//                           setSelectedGRN(grn);
//                           setReturnModal(true);
//                         }}
//                         className="bg-red-500 text-white px-3 py-1 rounded text-xs"
//                       >
//                         Return
//                       </button>
//                     </div>
//                   </div>

//                   {/* TABLE */}
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-50 text-xs">
//                       <tr>
//                         <th className="text-left px-4 py-2">Product</th>
//                         <th className="text-center px-4 py-2">Qty</th>
//                         <th className="text-center px-4 py-2">Rate</th>
//                         <th className="text-center px-4 py-2">Tax</th>
//                         <th className="text-center px-4 py-2">Discount</th>
//                         <th className="text-right px-4 py-2">Amount</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {grn.items?.map((item: any, i: number) => (
//                         <tr key={i} className="border-t">
//                           <td className="px-4 py-2">
//                             {item.product_name}
//                           </td>
//                           <td className="text-center">{item.received_quantity}</td>
//                           <td className="text-center">{item.rate}</td>
//                           <td className="text-center">{item.tax}</td>
//                           <td className="text-center">{item.discount}</td>
//                           <td className="text-right px-4 py-2 font-bold">
//                             {grn.currency} {item.net_amount}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   {/* FOOTER */}
//                   <div className="flex justify-between px-4 py-2 bg-gray-50 text-xs">
//                     <span>Note: {grn.notes || "-"}</span>
//                     <span className="font-bold">
//                       GRN Total: {grn.currency} {grn.grand_total_amount}
//                     </span>
//                   </div>
//                 </div>
//               ))}

//             </div>

//             {/* TOTAL */}
//             <div className="mt-8 flex justify-end">
//               <div className="bg-indigo-600 text-white px-6 py-3 rounded">
//                 Grand Total: {selectedInvoice?.currency}{" "}
//                 {grnList.reduce(
//                   (acc, g) => acc + Number(g.grand_total_amount),
//                   0
//                 )}
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* RETURN MODAL */}
//         <ReturnModal
//           show={returnModal}
//           onClose={() => setReturnModal(false)}
//           grn={selectedGRN}
//           selectedInvoice={selectedInvoice}
//         />
//       </div>
//     </div>
//   );
// };

// export default GRNInvoiceModal;