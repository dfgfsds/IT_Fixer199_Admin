import React from "react";
import { Receipt, Truck, CreditCard, User, Calendar, MapPin, ClipboardList } from "lucide-react";

const GrnInvoicePrint = React.forwardRef(({ data }: { data: any }, ref: any) => {
  if (!data) return null;

  const formatCurrency = (val: any) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(val || 0));

  return (
    <div ref={ref} className="p-10 bg-white text-gray-800 font-sans relative min-h-[1000px] print:p-6 shadow-none border-none">
      
      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-[1px] border-gray-200 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
                <ClipboardList size={32} strokeWidth={2.5} />
                <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Goods Received Note</h1>
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GRN No:</span>
                    <span className="text-xs font-black text-gray-900">{data.grn_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice No:</span>
                    <span className="text-xs font-bold text-gray-900">{data.invoice_number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Received Date:</span>
                    <span className="text-xs font-bold text-gray-900">{new Date(data.created_at || new Date()).toLocaleDateString()}</span>
                </div>
            </div>
          </div>
          
          <div className="text-right space-y-1 text-sm font-medium">
            <h2 className="text-xl font-black text-gray-900 uppercase leading-none">{data.hub_name}</h2>
            <div className="flex items-center gap-1 justify-end text-gray-400">
                <MapPin size={10} />
                <p className="text-[10px] font-bold uppercase tracking-tight">Hub Location</p>
            </div>
            {data.received_by_details && (
                <>
                    <p className="text-[11px] text-gray-500 font-bold tracking-tight mt-2">Received By: {data.received_by_details.name}</p>
                    <p className="text-[11px] text-gray-500 tracking-tight">{data.received_by_details.email}</p>
                </>
            )}
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-2 gap-8 my-10">
          <div className="bg-[#fcfcfc] p-5 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <User size={14} className="text-gray-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vendor Details</h3>
            </div>
            <div className="space-y-3">
                <p className="text-lg font-black text-gray-900 leading-none">{data.vendor_name}</p>
                <div className="flex gap-2 items-start text-sm text-gray-600 font-medium leading-relaxed">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 shrink-0">ID:</span>
                    <span className="font-mono text-xs">#{data.vendor_id}</span>
                </div>
            </div>
          </div>

          <div className="bg-[#fcfcfc] p-5 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <Truck size={14} className="text-gray-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipment Details</h3>
            </div>
            <div className="space-y-3">
                <div className="flex gap-2 text-sm text-gray-800 font-bold leading-relaxed">
                    <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Gate Pass:</span>
                    <span>{data.gate_pass_number || 'N/A'}</span>
                </div>
                <div className="flex gap-2 text-sm text-gray-800 font-bold leading-relaxed">
                    <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Challan:</span>
                    <span>{data.delivery_challan_number || 'N/A'}</span>
                </div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="rounded-lg border border-gray-200 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-white font-bold">
                <th className="p-4 text-left uppercase text-[10px] tracking-widest">Product Details</th>
                <th className="p-4 text-center uppercase text-[10px] tracking-widest border-l border-gray-800">Rec. Qty</th>
                <th className="p-4 text-right uppercase text-[10px] tracking-widest border-l border-gray-800">Rate</th>
                <th className="p-4 text-right uppercase text-[10px] tracking-widest border-l border-gray-800">Tax & Disc</th>
                <th className="p-4 text-right uppercase text-[10px] tracking-widest border-l border-gray-800">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {data.items?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-black text-gray-900 text-base">{item.product_name || item.item_name}</p>
                    {item.serial_numbers && item.serial_numbers.length > 0 && (
                      <div className="mt-2 text-[8px] text-gray-400 font-mono grid grid-cols-4 gap-1 uppercase">
                         {item.serial_numbers.slice(0, 8).map((sn: string, i: number) => (
                             <span key={i} className="bg-gray-50 px-1 py-0.5 rounded">SN: {sn}</span>
                         ))}
                         {item.serial_numbers.length > 8 && <span>+ {item.serial_numbers.length - 8} more</span>}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center border-l border-gray-50">
                    <span className="text-lg font-black text-gray-900 block leading-none">{item.received_quantity || item.quantity}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Units</span>
                  </td>
                  <td className="p-4 text-right font-bold text-gray-600 border-l border-gray-50">{formatCurrency(item.rate)}</td>
                  <td className="p-4 text-right border-l border-gray-50">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-red-500 font-bold">Disc: -{formatCurrency(item.discount_amount || 0)}</span>
                        <span className="text-[10px] text-blue-600 font-bold">Tax ({item.tax_percentage}%): +{formatCurrency(item.tax_amount || 0)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right border-l border-gray-50">
                    <span className="text-base font-black text-gray-900">{formatCurrency(item.net_amount || (item.quantity * item.rate))}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAYMENT LOG */}
        {data.payments && data.payments.length > 0 && (
          <div className="mb-10 rounded-lg border border-green-100 bg-[#fafffa] p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-3 flex items-center gap-2">
                <CreditCard size={14} /> Payment Transaction Log
            </h3>
            <table className="w-full text-xs">
              <thead className="border-b border-green-100">
                <tr className="text-green-800/60 uppercase text-[9px] font-black">
                  <th className="pb-2 text-left">Date</th>
                  <th className="pb-2 text-left">Method</th>
                  <th className="pb-2 text-left">Reference ID</th>
                  <th className="pb-2 text-right tracking-widest font-black">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {data.payments.map((pay: any, i: number) => (
                  <tr key={i} className="text-green-900">
                    <td className="py-2.5 font-bold">{new Date(pay.payment_date).toLocaleDateString()}</td>
                    <td className="py-2.5"><span className="px-1.5 py-0.5 bg-green-100 rounded text-[9px] font-black uppercase tracking-tighter">{pay.payment_method?.replace('_', ' ')}</span></td>
                    <td className="py-2.5 font-mono text-gray-400">{pay.payment_reference || 'N/A'}</td>
                    <td className="py-2.5 text-right font-black">{formatCurrency(pay.amount_paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUMMARY SECTION */}
        <div className="flex justify-between items-start gap-12 mt-10">
          <div className="flex-1 space-y-6">
             <div className="border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes & Remarks</h4>
                <p className="text-xs text-gray-600 leading-relaxed italic">{data.notes || "No notes provided."}</p>
             </div>
             <div className="mt-10 pt-10 border-t border-gray-100 grid grid-cols-2 gap-20">
                <div>
                   <div className="h-[1px] bg-gray-200 mb-2"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase text-center">Received By Signature</p>
                </div>
                <div>
                   <div className="h-[1px] bg-gray-200 mb-2"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase text-center">Authorized Signature</p>
                </div>
             </div>
          </div>

          <div className="w-80 bg-gray-900 p-6 rounded-xl text-white">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal:</span>
                <span className="text-white">{formatCurrency(data.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-widest">
                <span>Total Discount:</span>
                <span>-{formatCurrency(data.total_discount_amount)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                <span>Total Tax:</span>
                <span>+{formatCurrency(data.total_tax_amount)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-800 mt-2">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Grand Total</span>
                <span className="text-2xl font-black text-white leading-none tracking-tighter">{formatCurrency(data.grand_total_amount)}</span>
              </div>
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-green-400 uppercase tracking-widest">
                    <span>Total Paid:</span>
                    <span>{formatCurrency(data.total_paid_amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Pending Balance</span>
                  <span className="text-lg font-black text-red-500 tracking-tighter">{formatCurrency(data.grand_total_amount - (data.total_paid_amount || 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GrnInvoicePrint;
