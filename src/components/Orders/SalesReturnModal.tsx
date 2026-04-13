// import React, { useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";
// import toast from "react-hot-toast";

// const SalesReturnModal = ({ order, onClose, onSuccess }: any) => {
//     if (!order) return null;

//     const [reason, setReason] = useState("");
//     const [loading, setLoading] = useState(false);
//     console.log(order)
//     const [items, setItems] = useState<any[]>(
//         order?.items?.map((item: any) => ({
//             product: item?.item_details?.id,
//             product_name: item?.item_details?.name,
//             selected: false,
//             quantity: item?.quantity,
//             rate: item.price,
//             notes: "",
//             serial_numbers: item?.serial_number,
//         })) || []
//     );

//     // toggle item
//     const toggleItem = (index: number) => {
//         const updated = [...items];
//         updated[index].selected = !updated[index].selected;
//         setItems(updated);
//     };

//     const updateField = (index: number, field: string, value: any) => {
//         const updated = [...items];
//         updated[index][field] = value;
//         setItems(updated);
//     };

//     // 🔥 SUBMIT
//     const handleSubmit = async () => {
//         try {
//             const selectedItems = items.filter((i) => i.selected);

//             if (selectedItems.length === 0) {
//                 return toast.error("Select at least one item");
//             }

//             const payload = {
//                 sale_order_id: order.id,
//                 return_date: new Date().toISOString(),
//                 reason,
//                 items: selectedItems.map((i) => ({
//                     product: i.product,
//                     quantity: Number(i.quantity),
//                     rate: i.rate,
//                     serial_numbers: i.serial_numbers || [],
//                     notes: i.notes,
//                 })),
//             };

//             setLoading(true);

//             await axiosInstance.post(Api.salesReturn, payload);

//             toast.success("Return created successfully");
//             onSuccess();
//             onClose();
//         } catch (err: any) {
//             toast.error("Failed to create return");
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//             <div className="bg-white w-full max-w-4xl rounded-xl p-6 max-h-[90vh] overflow-auto">

//                 <h2 className="text-lg font-semibold mb-4">
//                     Sales Return - {order.id}
//                 </h2>

//                 {/* 🔥 REASON */}
//                 <div className="mb-4">
//                     <label className="text-sm font-medium">Reason</label>
//                     <textarea
//                         value={reason}
//                         onChange={(e) => setReason(e.target.value)}
//                         className="w-full border p-2 rounded mt-1"
//                     />
//                 </div>

//                 {/* 📦 ITEMS */}
//                 <table className="w-full border text-sm">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="p-2 border">Select</th>
//                             <th className="p-2 border">Product</th>
//                             <th className="p-2 border">Qty</th>
//                             <th className="p-2 border">Rate</th>
//                             <th className="p-2 border">Notes</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {items.map((item, index) => (
//                             <tr key={index}>
//                                 <td className="p-2 border text-center">
//                                     <input
//                                         type="checkbox"
//                                         checked={item.selected}
//                                         onChange={() => toggleItem(index)}
//                                     />
//                                 </td>

//                                 <td className="p-2 border">{item.product_name}</td>

//                                 <td className="p-2 border">
//                                     <input
//                                         type="number"
//                                         min={1}
//                                         value={item.quantity}
//                                         disabled={!item.selected}
//                                         onChange={(e) =>
//                                             updateField(index, "quantity", e.target.value)
//                                         }
//                                         className="border p-1 w-20"
//                                     />
//                                 </td>

//                                 <td className="p-2 border">{item.rate}</td>

//                                 <td className="p-2 border">
//                                     <input
//                                         type="text"
//                                         value={item.notes}
//                                         disabled={!item.selected}
//                                         onChange={(e) =>
//                                             updateField(index, "notes", e.target.value)
//                                         }
//                                         className="border p-1 w-full"
//                                     />
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 {/* ACTIONS */}
//                 <div className="flex justify-end gap-3 mt-4">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 border rounded"
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         onClick={handleSubmit}
//                         disabled={loading}
//                         className="px-4 py-2 bg-orange-600 text-white rounded"
//                     >
//                         {loading ? "Submitting..." : "Submit Return"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };
import React, { useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { X, Check } from "lucide-react";

const SalesReturnModal = ({ order, onClose, onSuccess }: any) => {
    if (!order) return null;

    console.log("Order in SalesReturnModal:", order); // Debug log
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const [items, setItems] = useState<any[]>(
        order?.items?.map((item: any) => {
            const serialArray = item?.serial_number 
                ? item.serial_number.split(/[\s,]+/).filter((s: string) => s.trim() !== "") 
                : [];

            return {
               product: item?.item_details?.id,
                product_name: item?.item_details?.name,
                selected: false,
                maxQuantity: item?.quantity || 0,
                quantity: 1,
                rate: item.price,
                notes: "",
                all_serials: serialArray,
                selected_serials: [],
            };
        }) || []
    );

    const toggleItem = (index: number) => {
        const updated = [...items];
        updated[index].selected = !updated[index].selected;
        if (!updated[index].selected) updated[index].selected_serials = [];
        setItems(updated);
    };

    const toggleSerialNumber = (itemIndex: number, serial: string) => {
        const updated = [...items];
        const item = updated[itemIndex];
        
        if (item.selected_serials.includes(serial)) {
            item.selected_serials = item.selected_serials.filter((s:any) => s !== serial);
        } else {
            if (item.selected_serials.length < item.quantity) {
                item.selected_serials.push(serial);
            } else {
                toast.error(`You can only select ${item.quantity} serial(s)`, { id: "limit" });
            }
        }
        setItems(updated);
    };

    const updateField = (index: number, field: string, value: any) => {
        const updated = [...items];
        if (field === "quantity") {
            const val = Math.max(1, Math.min(Number(value), updated[index].maxQuantity));
            updated[index].quantity = val;
            if (updated[index].selected_serials.length > val) {
                updated[index].selected_serials = updated[index].selected_serials.slice(0, val);
            }
        } else {
            updated[index][field] = value;
        }
        setItems(updated);
    };

    const handleSubmit = async () => {
        const selectedItems = items.filter(i => i.selected);
        if (selectedItems.length === 0) return toast.error("Select at least one item");
        if (!reason.trim()) return toast.error("Return reason is required");

        for (const item of selectedItems) {
            if (item.all_serials.length > 0 && item.selected_serials.length !== Number(item.quantity)) {
                return toast.error(`Please select ${item.quantity} serial(s) for ${item.product_name}`);
            }
        }

        const payload = {
            sale_order_id: order.id,
            return_date: new Date().toISOString(),
            reason,
            items: selectedItems.map(i => ({
                product: i.product,
                quantity: Number(i.quantity),
                rate: i.rate,
                serial_numbers: i.selected_serials,
                notes: i.notes,
            })),
        };

        try {
            setLoading(true);
            await axiosInstance.post(Api.salesReturns, payload);
            toast.success("Return created successfully");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error("Failed to process return");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Sales Return</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-widest">
                                Order ID: #{order.id.split('-')[0]}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 flex-1 text-left">
                    {/* Main Reason */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">General Return Reason *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-4 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none min-h-[80px]"
                            placeholder="Type here..."
                        />
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-1 text-center">Select</div>
                            <div className="col-span-3">Product</div>
                            <div className="col-span-2">Quantity</div>
                            <div className="col-span-3">Serial Selection</div>
                            <div className="col-span-3">Notes</div>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className={`border rounded-2xl transition-all duration-300 ${
                                item.selected ? "border-orange-500 bg-white ring-4 ring-orange-500/5 shadow-md" : "border-slate-100 bg-slate-50/50"
                            }`}>
                                <div className="grid grid-cols-12 p-5 items-start gap-4">
                                    {/* Checkbox */}
                                    <div className="col-span-1 flex justify-center pt-3">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => toggleItem(index)}
                                            className="w-5 h-5 accent-orange-500 cursor-pointer"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="col-span-3 pt-1">
                                        <p className="font-bold text-slate-800 text-sm leading-tight">{item.product_name}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{item.product}</p>
                                        <p className="text-xs font-black text-slate-600 mt-2">₹{item.rate}</p>
                                    </div>

                                    {/* Quantity Input - Level 1 */}
                                    <div className="col-span-2">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                disabled={!item.selected}
                                                onChange={(e) => updateField(index, "quantity", e.target.value)}
                                                className="w-full border border-slate-200 p-3 rounded-xl font-black text-slate-800 outline-none focus:border-orange-500 disabled:opacity-40 transition-all"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-md font-bold">
                                                MAX {item.maxQuantity}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Serial Selection - Level 2 (Appears after Qty) */}
                                    <div className="col-span-3">
                                        {item.selected && item.all_serials.length > 0 ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Choose {item.quantity} units</span>
                                                    <span className={`text-[9px] font-bold px-1.5 rounded ${item.selected_serials.length === item.quantity ? "bg-green-500 text-white" : "bg-orange-100 text-orange-600"}`}>
                                                        {item.selected_serials.length}/{item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto p-1 border border-slate-100 rounded-lg bg-white">
                                                    {item.all_serials.map((sn: string) => (
                                                        <button
                                                            key={sn}
                                                            onClick={() => toggleSerialNumber(index, sn)}
                                                            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all border ${
                                                                item.selected_serials.includes(sn)
                                                                    ? "bg-orange-500 border-orange-500 text-white"
                                                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-orange-300"
                                                            }`}
                                                        >
                                                            {item.selected_serials.includes(sn) && <Check size={8} className="inline mr-1" />}
                                                            {sn}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl p-4">
                                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">No Serials</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes TextArea */}
                                    <div className="col-span-3">
                                        <textarea
                                            value={item.notes}
                                            disabled={!item.selected}
                                            onChange={(e) => updateField(index, "notes", e.target.value)}
                                            placeholder="Item specific notes..."
                                            className="w-full bg-transparent border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-orange-500 transition-all disabled:opacity-0 min-h-[60px] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-slate-50/50 flex justify-end items-center gap-4">
                    <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-12 py-4 bg-orange-600 text-white rounded-2xl font-black text-sm hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Complete Return"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesReturnModal;