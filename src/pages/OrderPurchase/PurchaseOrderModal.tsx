import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Loader2, X, Plus, Trash2, IndianRupee } from "lucide-react";
import Api from "../../api-endpoints/ApiUrls";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const PurchaseOrderModal = ({ show, onClose, onSuccess, editData }: any) => {
    // ... (States and Logic remain exactly same)
    const [vendors, setVendors] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [products, setProducts] = useState([]);
    const [apiErrors, setApiErrors] = useState<string>("");

    const initialState = {
        vendor: "",
        hub: "",
        po_number: "",
        order_date: "",
        due_date: "",
        bill_to: "",
        ship_to: "",
        payment_terms: "",
        shipping_charges: 0,
        other_charges: 0,
        currency: "INR",
        notes: "",
        internal_notes: "",
        items: [{ product: "", item_name: "", description: "", quantity: 1, rate: 0, discount_type: "PERCENT", discount_value: 0, tax_percentage: 0, amount: 0 }],
        initial_payment: { payment_date: "", payment_method: "CASH", payment_reference: "", amount_paid: 0, notes: "" },
    };

    const [form, setForm] = useState<any>(initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const v = await axiosInstance.get(Api.vendor);
            const h = await axiosInstance.get(Api.allHubs);
            const p = await axiosInstance.get(Api.products);
            setVendors(v?.data?.vendors || []);
            setHubs(h?.data?.hubs || []);
            setProducts(p?.data?.products || []);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (editData) {
            setForm({ ...initialState, ...editData, items: editData.items || initialState.items });
        } else {
            setForm(initialState);
        }
    }, [editData]);

    const handleItemChange = (i: number, field: string, value: any) => {
        const updated = [...form.items];
        updated[i][field] = value;
        if (field === "product") {
            const product: any = products.find((p: any) => p.id === value);
            updated[i].item_name = product?.name || "";
        }
        const qty = Number(updated[i].quantity || 0);
        const rate = Number(updated[i].rate || 0);
        const discount = Number(updated[i].discount_value || 0);
        const tax = Number(updated[i].tax_percentage || 0);
        let amount = qty * rate;
        if (updated[i].discount_type === "PERCENT") amount -= (amount * discount) / 100;
        else amount -= discount;
        amount += (amount * tax) / 100;
        updated[i].amount = amount;
        setForm({ ...form, items: updated });
    };

    const addItem = () => setForm({ ...form, items: [...form.items, { product: "", quantity: 1, rate: 0 }] });
    const removeItem = (index: number) => {
        const updated = [...form.items];
        updated.splice(index, 1);
        setForm({ ...form, items: updated });
    };

    const total = form.items.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // const payload = {
            //     ...form,
            //     items: form.items.map((i: any) => ({ ...i, quantity: Number(i.quantity), rate: Number(i.rate) })),
            //     initial_payments: [form.initial_payment],
            // };
            const formatDateTime = (date: string) => {
                if (!date) return null;
                return new Date(date).toISOString(); // 🔥 correct format
            };

            const payload = {
                ...form,
                items: form.items.map((i: any) => ({
                    ...i,
                    quantity: Number(i.quantity),
                    rate: Number(i.rate),
                })),
                initial_payments: [
                    {
                        ...form.initial_payment,
                        payment_date: formatDateTime(form.initial_payment.payment_date), // 🔥 FIX
                        amount_paid: Number(form.initial_payment.amount_paid),
                    },
                ],
            };
            delete payload.initial_payment;
            if (editData) await axiosInstance.put(`${Api.orderPurchase}/${editData.id}/`, payload);
            else await axiosInstance.post(`${Api.orderPurchase}`, payload);
            onSuccess();
            onClose();
        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm(initialState);   // 🔥 full reset
        setApiErrors("");        // 🔥 clear errors
        onClose();               // 🔥 close modal
    };

    if (!show) return null;

    // Shared Styles
    const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white";
    const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {editData ? "Edit Purchase Order" : "Create Purchase Order"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Fill in the details to generate a PO</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* PRIMARY DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label className={labelClass}>Vendor</label>
                            <select className={inputClass} value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
                                <option value="">Select Vendor</option>
                                {vendors.map((v: any) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Dispatch Hub</label>
                            <select className={inputClass} value={form.hub} onChange={(e) => setForm({ ...form, hub: e.target.value })}>
                                <option value="">Select Hub</option>
                                {hubs.map((h: any) => (<option key={h.id} value={h.id}>{h.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>PO Number</label>
                            <input type="text" className={inputClass} placeholder="Enter PO#" value={form.po_number} onChange={(e) => setForm({ ...form, po_number: e.target.value })} />
                        </div>
                    </div>

                    {/* DATES & TERMS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            ["Order Date", "order_date", "date"],
                            ["Due Date", "due_date", "date"],
                            ["Payment Terms", "payment_terms", "text"],
                            // ["Currency", "currency", "text"],
                        ].map(([label, key, type]: any) => (
                            <div key={key}>
                                <label className={labelClass}>{label}</label>
                                <input type={type} className={inputClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                            </div>
                        ))}
                    </div>

                    {/* ADDRESSES */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Bill To</label>
                            <textarea rows={2} className={inputClass} placeholder="Billing Address..." value={form.bill_to} onChange={(e) => setForm({ ...form, bill_to: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Ship To</label>
                            <textarea rows={2} className={inputClass} placeholder="Shipping Address..." value={form.ship_to} onChange={(e) => setForm({ ...form, ship_to: e.target.value })} />
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">Order Items</h3>
                            <button onClick={addItem} className="text-orange-600 hover:text-orange-700 text-sm font-bold flex items-center gap-1">
                                <Plus size={16} /> Add Item
                            </button>
                        </div>
                        <div className="border rounded-xl overflow-hidden border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-800 text-white text-[11px] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3 py-3 font-medium">Product</th>
                                        <th className="px-3 py-3 font-medium w-20">Qty</th>
                                        <th className="px-3 py-3 font-medium w-32">Rate</th>
                                        <th className="px-3 py-3 font-medium w-24">Disc</th>
                                        <th className="px-3 py-3 font-medium w-20">Type</th>
                                        <th className="px-3 py-3 font-medium w-20">Tax %</th>
                                        <th className="px-3 py-3 font-medium text-right">Amount</th>
                                        <th className="px-3 py-3 font-medium text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {form.items.map((it: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-2">
                                                <select className={inputClass} value={it.product} onChange={(e) => handleItemChange(i, "product", e.target.value)}>
                                                    <option>Select Product</option>
                                                    {products.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                                </select>
                                            </td>
                                            <td className="p-2"><input type="number" className={inputClass} value={it.quantity} onChange={(e) => handleItemChange(i, "quantity", e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className={inputClass} value={it.rate} onChange={(e) => handleItemChange(i, "rate", e.target.value)} /></td>
                                            <td className="p-2"><input type="number" className={inputClass} value={it.discount_value} onChange={(e) => handleItemChange(i, "discount_value", e.target.value)} /></td>
                                            <td className="p-2">
                                                <select className={inputClass} value={it.discount_type} onChange={(e) => handleItemChange(i, "discount_type", e.target.value)}>
                                                    <option value="PERCENT">PERCENT</option>
                                                    <option value="FIXED">FIXED</option>
                                                </select>
                                            </td>
                                            <td className="p-2"><input type="number" className={inputClass} value={it.tax_percentage} onChange={(e) => handleItemChange(i, "tax_percentage", e.target.value)} /></td>
                                            <td className="p-2 text-right font-bold text-gray-800">₹{it?.amount?.toFixed(2)}</td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAYMENT & NOTES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700">Initial Payment</h3>

                            <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">

                                {/* DATE */}
                                <div>
                                    <label className={labelClass}>Date</label>
                                    <input
                                        type="datetime-local"
                                        className={inputClass}
                                        value={form.initial_payment.payment_date}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form.initial_payment,
                                                    payment_date: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>

                                {/* METHOD */}
                                <div>
                                    <label className={labelClass}>Method</label>
                                    <select
                                        className={inputClass}
                                        value={form.initial_payment.payment_method}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form.initial_payment,
                                                    payment_method: e.target.value,
                                                },
                                            })
                                        }
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                                    </select>
                                </div>

                                {/* REFERENCE */}
                                <div className="col-span-2">
                                    <label className={labelClass}>Reference / Notes</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="Transaction ID or notes"
                                        value={form.initial_payment.payment_reference}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form.initial_payment,
                                                    payment_reference: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>

                                {/* AMOUNT */}
                                <div className="col-span-2">
                                    <label className={labelClass}>Amount</label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={form.initial_payment.amount_paid}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form.initial_payment,
                                                    amount_paid: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="flex flex-col justify-between">
                            <div className="space-y-4">
                                <label className={labelClass}>Internal Notes</label>
                                <textarea rows={3} className={inputClass} placeholder="Notes for internal use..." value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} />
                            </div>

                            <div className="bg-gray-900 text-white p-5 rounded-2xl mt-6 flex justify-between items-center shadow-lg">
                                <span className="text-gray-400 font-medium">Grand Total</span>
                                <div className="text-2xl font-bold flex items-center gap-1 text-orange-400">
                                    <IndianRupee size={24} /> {total.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center rounded-b-2xl">
                    <p className="text-red-500 text-sm font-medium">{apiErrors}</p>
                    <div className="flex gap-3">
                        <button onClick={handleClose} className="px-6 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className="px-8 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-lg shadow-orange-200 flex items-center gap-2 transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;