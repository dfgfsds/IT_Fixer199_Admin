import React from "react";
import { Receipt, Truck, CreditCard, User, Hash, Calendar, Info, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
/* ... existing imports ... */

const PurchaseInvoicePrint = React.forwardRef(({ data }: { data: any }, ref: any) => {
  if (!data) return null;

  const formatCurrency = (val: any) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(parseFloat(val || 0));

  return (
    <div ref={ref} className="p-10 bg-white text-gray-800 font-sans relative min-h-[1000px] print:p-6 shadow-none border-none">
      
      <div className="relative z-10">
        {/* HEADER - Sharp Bottom Border */}
        <div className="flex justify-between items-start border-b-[1px] border-gray-200 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
                <Receipt size={32} strokeWidth={2.5} />
                <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Purchase Order</h1>
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice No:</span>
                    <span className="text-xs font-bold text-gray-900">{data.invoice_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Date:</span>
                    <span className="text-xs font-bold text-gray-900">{new Date(data.order_date).toLocaleDateString()}</span>
                </div>
            </div>
          </div>
          
          <div className="text-right space-y-1 text-sm font-medium">
            <h2 className="text-xl font-black text-gray-900 uppercase leading-none">{data.hub_name}</h2>
            <p className="text-[11px] text-gray-500 font-bold tracking-tight">Issued By: {data.created_by_details?.name}</p>
            <p className="text-[11px] text-gray-500 tracking-tight">{data.created_by_details?.email}</p>
            <p className="text-[11px] text-gray-500 tracking-tight">Mob: {data.created_by_details?.mobile_number}</p>
          </div>
        </div>

        {/* INFO CARDS - Subtle Borders */}
        <div className="grid grid-cols-2 gap-8 my-10">
          <div className="bg-[#fcfcfc] p-5 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <User size={14} className="text-gray-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vendor Information</h3>
            </div>
            <div className="space-y-3">
                <p className="text-lg font-black text-gray-900 leading-none">{data.vendor_name}</p>
                <div className="flex gap-2 items-start text-sm text-gray-600 font-medium leading-relaxed">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 shrink-0">Address:</span>
                    <span>{data.bill_to}</span>
                </div>
            </div>
          </div>

          <div className="bg-[#fcfcfc] p-5 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <Truck size={14} className="text-gray-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping & Delivery</h3>
            </div>
            <div className="space-y-3">
                <div className="flex gap-2 text-sm text-gray-800 font-bold leading-relaxed">
                    <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Ship To:</span>
                    <span>{data.ship_to}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Due Date</span>
                        <span className="text-xs font-black text-red-500">{new Date(data.due_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Terms</span>
                        <span className="text-xs font-black text-gray-900">{data.payment_terms}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE - Sharp Lines */}
        <div className="rounded-lg border border-gray-200 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-white font-bold">
                <th className="p-4 text-left uppercase text-[10px] tracking-widest">Item Description</th>
                <th className="p-4 text-center uppercase text-[10px] tracking-widest border-l border-gray-800">Qty / Unit</th>
                <th className="p-4 text-right uppercase text-[10px] tracking-widest border-l border-gray-800">Rate</th>
                <th className="p-4 text-right uppercase text-[10px] tracking-widest border-l border-gray-800">Tax & Disc</th>
                <th className="p-4 text-right uppercase text-[10px] tracking-widest border-l border-gray-800">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {data.items?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-black text-gray-900 text-base">{item.item_name}</p>
                    <p className="text-xs text-gray-400 italic mt-0.5 font-normal">{item.description}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="px-1.5 py-0.5 border border-gray-100 text-[9px] font-bold text-gray-400 uppercase rounded">Brand: {item.product}</span>
                        <span className="px-1.5 py-0.5 border border-gray-100 text-[9px] font-bold text-gray-400 uppercase rounded">ID: {item.id.split('-')[0]}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center border-l border-gray-50">
                    <span className="text-lg font-black text-gray-900 block leading-none">{item.quantity}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unit || 'Units'}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-gray-600 border-l border-gray-50">{formatCurrency(item.rate)}</td>
                  <td className="p-4 text-right border-l border-gray-50">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-red-500 font-bold">Disc: -{formatCurrency(item.discount_amount)}</span>
                        <span className="text-[10px] text-blue-600 font-bold">Tax ({item.tax_percentage}%): +{formatCurrency(item.tax_amount)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right border-l border-gray-50">
                    <span className="text-base font-black text-gray-900">{formatCurrency(item.total_amount)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAYMENT TABLE - Subtle Border */}
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
                  <th className="pb-2 text-right tracking-widest font-black">Paid Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {data.payments.map((pay: any) => (
                  <tr key={pay.id} className="text-green-900">
                    <td className="py-2.5 font-bold">{new Date(pay.payment_date).toLocaleDateString()}</td>
                    <td className="py-2.5"><span className="px-1.5 py-0.5 bg-green-100 rounded text-[9px] font-black uppercase tracking-tighter">{pay.payment_method.replace('_', ' ')}</span></td>
                    <td className="py-2.5 font-mono text-gray-400">{pay.payment_reference || 'N/A'}</td>
                    <td className="py-2.5 text-right font-black">{formatCurrency(pay.amount_paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUMMARY SECTION - Minimalist Borders */}
        <div className="flex justify-between items-start gap-12 mt-10">
          <div className="flex-1 space-y-6">
             <div className="border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes & Remarks</h4>
                <p className="text-xs text-gray-600 leading-relaxed italic">{data.notes || "No notes provided."}</p>
             </div>
             {data.internal_notes && (
                <div className="p-4 bg-orange-50/50 rounded border border-orange-100 text-[10px] text-orange-800 leading-normal font-bold uppercase tracking-tight">
                    <span className="text-orange-300 block mb-1">Internal Reference:</span>
                    {data.internal_notes}
                </div>
             )}
          </div>

          <div className="w-80 bg-gray-900 p-6 rounded-xl text-white">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal:</span>
                <span className="text-white">{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-widest">
                <span>Discount:</span>
                <span>-{formatCurrency(data.total_discount)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                <span>Total Tax:</span>
                <span>+{formatCurrency(data.total_tax)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-800 mt-2">
                <span className="text-xs font-black uppercase tracking-widest text-orange-500">Grand Total</span>
                <span className="text-2xl font-black text-white leading-none tracking-tighter">{formatCurrency(data.grand_total)}</span>
              </div>
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-green-400 uppercase tracking-widest">
                    <span>Total Paid:</span>
                    <span>{formatCurrency(data.total_paid)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Balance Due</span>
                  <span className="text-lg font-black text-red-500 tracking-tighter">{formatCurrency(data.pending_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PurchaseInvoicePrint;