import React from "react";

const SalesInvoicePrint = React.forwardRef(({ order }: { order: any }, ref: any) => {
  if (!order) return null;

  const formatCurrency = (val: any) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0 }).format(Math.round(parseFloat(val || 0)));

  const calculateInclusiveTax = (totalWithGst: number) => {
    const baseValue = totalWithGst / 1.18;
    const totalTax = totalWithGst - baseValue;
    return {
      baseValue,
      gstPerSide: totalTax / 2
    };
  };

  const totalItemsQty = order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);

  return (
    <div ref={ref} className="p-0 bg-white text-gray-900 font-sans print:p-0 w-[210mm] min-h-[297mm]">
      <div className="border-[1.5px] border-black flex flex-col m-2 h-fit">
        
        {/* Header Section */}
        <div className="flex border-b-[1.5px] border-black">
          <div className="w-[60%] p-4 border-r-[1.5px] border-black">
            <h1 className="text-3xl font-black tracking-tighter text-blue-800">SIGMAH</h1>
            <h2 className="text-xl font-bold tracking-[0.2em] -mt-1">ENTERPRISES</h2>
            <p className="text-[10px] mt-2 font-semibold leading-tight">
              New No.29/Old No.31 & 32, Jafferkanpet, Opp to Kasi Theatre,<br />
              Ashok Nagar, Chennai - 600083<br />
              GST No: 33BCSPA3815J2ZM | PHN: 8939399958
            </p>
          </div>
          <div className="w-[40%] flex items-center justify-center bg-gray-50">
             <h2 className="text-2xl font-black uppercase underline">Sales Invoice</h2>
          </div>
        </div>

        {/* Customer & Bill Info */}
        <div className="flex border-b-[1.5px] border-black text-[11px]">
          <div className="w-[60%] border-r-[1.5px] border-black p-3">
            <p className="font-bold underline mb-1">To:</p>
            <p className="font-black text-sm uppercase">{order.customer_name || 'TEST CUSTOMER'}</p>
            <p className="leading-snug whitespace-pre-line">{order.address || '123 Main St'}</p>
            <p className="mt-1 font-bold text-xs">GST No: {order.customer_gst || 'N/A'}</p>
            <p className="font-bold text-xs">PHN: {order.customer_number || '8056185629'}</p>
          </div>
          <div className="w-[40%] font-bold">
            <div className="grid grid-cols-2 border-b border-black p-1 px-2">
              <span>Bill No</span> <span>: {order.invoice_number}</span>
            </div>
            <div className="grid grid-cols-2 border-b border-black p-1 px-2">
              <span>Date</span> <span>: {new Date(order.created_at).toLocaleDateString('en-GB')}</span>
            </div>
            <div className="grid grid-cols-2 border-b border-black p-1 px-2">
              <span>So No</span> <span>: -</span>
            </div>
            <div className="grid grid-cols-2 p-1 px-2">
              <span>So Date</span> <span>: -</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-grow min-h-[450px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-[1.5px] border-black text-[10px] font-black uppercase text-center bg-gray-50">
                <th className="p-1 border-r-[1.5px] border-black w-10">S.NO</th>
                <th className="p-1 border-r-[1.5px] border-black text-left pl-2">DESCRIPTION</th>
                <th className="p-1 border-r-[1.5px] border-black w-20">HSN CODE</th>
                <th className="p-1 border-r-[1.5px] border-black w-12">QTY</th>
                <th className="p-1 border-r-[1.5px] border-black w-24">RATE</th>
                <th className="p-1 border-r-[1.5px] border-black w-20">CGST @9%</th>
                <th className="p-1 border-r-[1.5px] border-black w-20">SGST @9%</th>
                <th className="p-1 w-28 text-right pr-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {order.items?.map((item: any, idx: number) => {
                const { baseValue, gstPerSide } = calculateInclusiveTax(parseFloat(item.price));
                return (
                  <tr key={idx} className="border-b-[0.5px] border-black/20 align-top">
                    <td className="p-2 border-r-[1.5px] border-black text-center">{idx + 1}</td>
                    <td className="p-2 border-r-[1.5px] border-black font-bold uppercase">
                      {item.item_details.name}
                      {item.serial_number && <div className="text-[9px] font-normal mt-1 italic">S/N: {item.serial_number}</div>}
                    </td>
                    <td className="p-2 border-r-[1.5px] border-black text-center">{item.hsn_code || '8473'}</td>
                    <td className="p-2 border-r-[1.5px] border-black text-center font-bold">{item.quantity}</td>
                    <td className="p-2 border-r-[1.5px] border-black text-right">{formatCurrency(item.price / item.quantity)}</td>
                    <td className="p-2 border-r-[1.5px] border-black text-right">{formatCurrency(gstPerSide)}</td>
                    <td className="p-2 border-r-[1.5px] border-black text-right">{formatCurrency(gstPerSide)}</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(baseValue)}</td>
                  </tr>
                );
              })}
              {[...Array(Math.max(0, 10 - (order.items?.length || 0)))].map((_, i) => (
                <tr key={`empty-${i}`} className="h-10 border-b-[0.5px] border-black/5">
                  <td className="border-r-[1.5px] border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-[1.5px] border-black font-bold text-[11px] bg-gray-50">
              <tr>
                <td colSpan={2} className="border-r-[1.5px] border-black text-center p-1">Tot.Qty</td>
                <td className="border-r-[1.5px] border-black"></td>
                <td className="border-r-[1.5px] border-black text-center p-1">{totalItemsQty}</td>
                <td className="border-r-[1.5px] border-black text-right p-1">Gross Amt</td>
                <td className="border-r-[1.5px] border-black text-right p-1">{formatCurrency((parseFloat(order.total_price) - parseFloat(order.total_without_gst)) / 2)}</td>
                <td className="border-r-[1.5px] border-black text-right p-1">{formatCurrency((parseFloat(order.total_price) - parseFloat(order.total_without_gst)) / 2)}</td>
                <td className="text-right p-1 pr-2">{formatCurrency(order.total_without_gst)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Summary (Bank Details Removed) */}
        <div className="border-t-[1.5px] border-black">
          <div className="flex border-b-[1.5px] border-black">
            <div className="w-[65%] border-r-[1.5px] border-black p-4 flex items-center">
              <p className="font-black text-sm italic">Amount in words: <span className="uppercase">[Rupees Only]</span></p>
            </div>
            <div className="w-[35%] p-3 text-[12px] font-black space-y-1 bg-gray-50">
              <div className="flex justify-between"><span>GST Amount</span> <span>₹ {formatCurrency(parseFloat(order.total_price) - parseFloat(order.total_without_gst))}</span></div>
              <div className="flex justify-between border-t-[1.5px] border-black pt-2 text-lg">
                <span>NET AMOUNT</span> 
                <span>₹ {formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Signatures */}
        <div className="flex border-b-[1.5px] border-black">
          <div className="w-[65%] p-3 text-[9px] font-bold border-r-[1.5px] border-black">
            <p className="underline uppercase mb-1">Terms & Conditions:</p>
            <p>1. Payments Should be made via Bank Transfer/Cheque with credit period of 60 days.</p>
            <p>2. Warranty must be claimed from the authorized service centre only.</p>
            <p>3. Goods once sold, will not be taken back.</p>
          </div>
          <div className="w-[35%] flex flex-col justify-between p-3 min-h-[120px]">
             <p className="text-[10px] font-black text-center uppercase">For SIGMAH ENTERPRISES</p>
             <p className="border-t border-black pt-1 text-center text-[10px] font-bold uppercase">Authorised Signatory</p>
          </div>
        </div>
        
        <div className="p-3 text-center italic text-[10px] font-bold bg-gray-50/50">
            Customer Signature and Seal
        </div>
      </div>
    </div>
  );
});

export default SalesInvoicePrint;