import React, { useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { X, Check, Plus, Trash2, PackageOpen, ArrowLeftRight, Search, Package } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const CONDITION_OPTIONS = ["GOOD", "DAMAGED", "USED", "DEFECTIVE"];
const RETURN_SETTLEMENT = ["REFUND", "NONE"];
const REPLACEMENT_SETTLEMENT = ["NONE", "REFUND", "ADDITIONAL_PAYMENT"];
const PAYMENT_METHODS = ["CARD", "UPI", "NET_BANKING", "WALLET", "CASH", "COD", "CREDIT"];

interface ReturnItem {
    order_item_id: string;
    product_id: string;
    product_name: string;
    selected: boolean;
    maxQuantity: number;
    quantity: number;
    unitPrice: number;
    all_serials: string[];
    selected_serials: string[];
    condition_status: string;
    condition_note: string;
    return_note: string;
    returned_item_price: string;
    deduction_amount: string;
    final_refund_amount: string;
    settlement_type: string;
    status: string;
}

interface ReplacementItem {
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: string;
    serial_numbers: string[];
    available_serials: string[];
    replacement_note: string;
    replaced_item_price: string;
    final_additional_amount: string;
    final_refund_amount: string;
    settlement_type: string;
}

const SalesReturnModal = ({ order, onClose, onSuccess }: any) => {
    if (!order) return null;

    const [loading, setLoading] = useState(false);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
    const [refundAmount, setRefundAmount] = useState("0");
    const [refundPaymentMethod, setRefundPaymentMethod] = useState("CASH");
    const [extraPaymentAmount, setExtraPaymentAmount] = useState("0");
    const [extraPaymentMethod, setExtraPaymentMethod] = useState("CASH");

    console.log(order)

    // Return items
    const [returnItems, setReturnItems] = useState<ReturnItem[]>(
        (order?.items || []).map((item: any) => {
            const serialArray: string[] = item?.serial_number
                ? item.serial_number.split(/[\s,]+/).filter((s: string) => s.trim() !== "")
                : [];
            const unitPrice = item?.price || 0;
            return {
                order_item_id: item?.id || "",
                product_id: item?.item_details?.id || "",
                product_name: item?.item_details?.name || "Unknown Product",
                selected: false,
                maxQuantity: item?.quantity || 1,
                quantity: 1,
                unitPrice: unitPrice,
                all_serials: serialArray,
                selected_serials: [],
                condition_status: "GOOD",
                condition_note: "",
                return_note: "",
                returned_item_price: String(unitPrice),
                deduction_amount: "0",
                final_refund_amount: String(unitPrice),
                settlement_type: "REFUND",
                status: item?.status || "",
            };
        })
    );

    const [replacementItems, setReplacementItems] = useState<ReplacementItem[]>([]);

    const toggleReturnItem = (index: number) => {
        const updated = [...returnItems];
        updated[index].selected = !updated[index].selected;
        if (!updated[index].selected) updated[index].selected_serials = [];
        setReturnItems(updated);
    };

    const toggleReturnSerial = (itemIndex: number, sn: string) => {
        const updated = [...returnItems];
        const item = updated[itemIndex];
        if (item.selected_serials.includes(sn)) {
            item.selected_serials = item.selected_serials.filter((s) => s !== sn);
        } else {
            if (item.selected_serials.length < item.quantity) {
                item.selected_serials.push(sn);
            } else {
                toast.error(`Select only ${item.quantity} serial(s)`, { id: "sn-limit" });
            }
        }
        setReturnItems(updated);
    };

    const updateReturnItem = (index: number, field: string, value: any) => {
        const updated = [...returnItems];
        const item = updated[index];

        if (field === "quantity") {
            const newQty = Math.max(1, Math.min(Number(value), item.maxQuantity));
            item.quantity = newQty;

            // Auto-calculate prices
            const newPrice = Number(item.unitPrice) * newQty;
            item.returned_item_price = String(newPrice);
            item.final_refund_amount = String(newPrice - Number(item.deduction_amount));

            if (item.selected_serials.length > newQty)
                item.selected_serials = item.selected_serials.slice(0, newQty);

        } else if (field === "returned_item_price") {
            item.returned_item_price = value;
            item.final_refund_amount = String(Number(value) - Number(item.deduction_amount));

        } else if (field === "deduction_amount") {
            item.deduction_amount = value;
            item.final_refund_amount = String(Number(item.returned_item_price) - Number(value));

        } else {
            (item as any)[field] = value;
        }
        setReturnItems(updated);
    };

    const addReplacementItem = () => {
        setReplacementItems(prev => [...prev, {
            product_id: "",
            quantity: 1,
            unit_price: "0",
            serial_numbers: [],
            available_serials: [],
            replacement_note: "",
            replaced_item_price: "0",
            final_additional_amount: "0",
            final_refund_amount: "0",
            settlement_type: "NONE",
        }]);
    };

    const fetchAvailableSerials = async (productId: string, index: number) => {
        if (!productId || !order.hub_id) return;
        try {
            const res = await axiosInstance.get(Api.productSerialAvailability, {
                params: {
                    product_id: productId,
                    hub_id: order.hub_id,
                    size: 100
                }
            });

            // Extract serials numbers
            let serials: string[] = [];
            const raw = res.data;
            const items = raw?.availability || raw;

            if (Array.isArray(items) && items.length > 0) {
                const rawSerials = items[0].available_serial_numbers;
                if (typeof rawSerials === "string") {
                    serials = rawSerials.split(/[\s,]+/).filter(s => s.trim() !== "");
                } else if (Array.isArray(rawSerials)) {
                    serials = rawSerials;
                }
            }

            updateReplacementItem(index, "available_serials", serials);
        } catch (err) {
            console.error("Failed to fetch serials", err);
        }
    };

    const [barcodeSearch, setBarcodeSearch] = useState("");
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Fetch all products on mount
    const fetchAllProducts = async (searchStr = "", barcodeStr = "") => {
        try {
            setSearching(true);
            const params = new URLSearchParams();
            params.append("status", "ACTIVE");
            params.append("include_pricing", "true");

            if (order.latitude) params.append("lat", String(order.latitude));
            if (order.longitude) params.append("lng", String(order.longitude));

            if (searchStr) params.append("search", searchStr);
            if (barcodeStr) params.append("barcode", barcodeStr);

            const res = await axiosInstance.get(`${Api.products}?${params.toString()}`);

            // Deep robust data extraction
            let data = [];
            const raw = res.data;
            if (Array.isArray(raw)) {
                data = raw;
            } else if (Array.isArray(raw?.data)) {
                data = raw.data;
            } else if (Array.isArray(raw?.products)) {
                data = raw.products;
            } else if (Array.isArray(raw?.data?.products)) {
                data = raw.data.products;
            } else if (Array.isArray(raw?.data?.data)) {
                data = raw.data.data;
            }

            if (barcodeStr && data.length > 0) {
                // If searched by barcode and found, add as replacement automatically
                handleSelectReplacementProduct(data[0]);
                setBarcodeSearch("");
            } else if (!barcodeStr) {
                setAllProducts(data);
            }
        } catch (err) {
            console.error("Product fetch error", err);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectReplacementProduct = (product: any) => {
        // Take the price from the first object in the pricing array
        let price = "0";
        if (product.pricing && Array.isArray(product.pricing) && product.pricing.length > 0) {
            price = String(product.pricing[0].price);
        }

        const newItem: ReplacementItem = {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            unit_price: price,
            serial_numbers: [],
            available_serials: [],
            replacement_note: "",
            replaced_item_price: price,
            final_additional_amount: "0",
            final_refund_amount: "0",
            settlement_type: "NONE",
        };
        const newIndex = replacementItems.length;
        setReplacementItems(prev => [...prev, newItem]);
        fetchAvailableSerials(product.id, newIndex);
        toast.success(`Added: ${product.name}`);
    };

    const handleReplacementBarcode = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && barcodeSearch.trim()) {
            fetchAllProducts("", barcodeSearch);
        }
    };

    React.useEffect(() => {
        fetchAllProducts();
    }, []);

    const removeReplacementItem = (index: number) => {
        setReplacementItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateReplacementItem = (index: number, field: string, value: any) => {
        setReplacementItems(prev => {
            const updated = [...prev];
            const item = { ...updated[index], [field]: value };

            // Auto-calculate total price when quantity or unit price changes
            if (field === "quantity" || field === "unit_price") {
                const qty = Number(item.quantity) || 1;
                const unit = Number(item.unit_price) || 0;
                item.replaced_item_price = String(unit * qty);
            }

            updated[index] = item;
            return updated;
        });
    };

    const updateReplacementItemBatch = (index: number, changes: Partial<ReplacementItem>) => {
        setReplacementItems(prev => {
            const updated = [...prev];
            const item = { ...updated[index], ...changes };

            // Auto-calculate total price
            if ("quantity" in changes || "unit_price" in changes) {
                const qty = Number(item.quantity) || 1;
                const unit = Number(item.unit_price) || 0;
                item.replaced_item_price = String(unit * qty);
            }

            updated[index] = item;
            return updated;
        });
    };

    const updateReplacementSerials = (index: number, raw: string) => {
        const serials = raw.split(/[\s,]+/).filter(s => s.trim() !== "");
        updateReplacementItem(index, "serial_numbers", serials);
    };

    React.useEffect(() => {
        const grossReturnItems = returnItems
            .filter(i => i.selected)
            .map(i => ({
                index: returnItems.indexOf(i),
                gross: (Number(i.returned_item_price) || 0) - (Number(i.deduction_amount) || 0)
            }));

        let totalCredit = grossReturnItems.reduce((sum, i) => sum + i.gross, 0);

        // Distribute credit to replacements sequentially
        // The first replacements consume the credit first.
        const updatedReplacements = replacementItems.map(item => {
            const itemPrice = Number(item.replaced_item_price || 0);
            let additional = 0;

            if (totalCredit >= itemPrice) {
                // Fully covered by remaining credit
                additional = 0;
                totalCredit -= itemPrice;
            } else {
                // Partially covered or not covered at all
                additional = itemPrice - totalCredit;
                totalCredit = 0;
            }

            return {
                ...item,
                final_additional_amount: String(additional),
                final_refund_amount: "0",
            };
        });

        // Update Return Item Fields
        let totalCostToCover = replacementItems.reduce((sum, i) => sum + Number(i.replaced_item_price || 0), 0);
        const updatedReturns = returnItems.map(r => {
            if (!r.selected) return r;
            const gross = (Number(r.returned_item_price) || 0) - (Number(r.deduction_amount) || 0);
            let finalRefund = 0;

            if (gross > totalCostToCover) {
                finalRefund = gross - totalCostToCover;
                totalCostToCover = 0;
            } else {
                totalCostToCover -= gross;
                finalRefund = 0;
            }

            return { ...r, final_refund_amount: String(finalRefund) };
        });

        // Update states if changed
        if (JSON.stringify(updatedReturns) !== JSON.stringify(returnItems)) {
            setReturnItems(updatedReturns);
        }
        if (JSON.stringify(updatedReplacements) !== JSON.stringify(replacementItems)) {
            setReplacementItems(updatedReplacements);
        }

        // Summary Totals
        const finalTotalRefund = updatedReturns
            .filter(i => i.selected)
            .reduce((sum, i) => sum + Number(i.final_refund_amount), 0);

        const finalTotalExtra = updatedReplacements
            .reduce((sum, i) => sum + Number(i.final_additional_amount), 0);

        setRefundAmount(String(finalTotalRefund));
        setExtraPaymentAmount(String(finalTotalExtra));

    }, [returnItems, replacementItems]);

    const handleSubmit = async () => {
        const selected = returnItems.filter(i => i.selected);
        if (selected.length === 0) return toast.error("Select at least one item to return");

        for (const item of selected) {
            if (item.all_serials.length > 0 && item.selected_serials.length !== item.quantity) {
                return toast.error(`Select exactly ${item.quantity} serial(s) for "${item.product_name}"`);
            }
        }

        const payload: any = {
            sale_order_id: order.id,
            return_date: returnDate,
            return_items: selected.map(i => ({
                order_item_id: i.order_item_id,
                product_id: i.product_id,
                quantity: i.quantity,
                serial_numbers: i.selected_serials,
                condition_status: i.condition_status,
                condition_note: i.condition_note,
                return_note: i.return_note,
                returned_item_price: i.returned_item_price,
                deduction_amount: i.deduction_amount,
                final_refund_amount: i.final_refund_amount,
                settlement_type: i.settlement_type,
            })),
            replacement_items: replacementItems.map(r => ({
                product_id: r.product_id,
                quantity: r.quantity,
                serial_numbers: r.serial_numbers,
                replacement_note: r.replacement_note,
                replaced_item_price: r.replaced_item_price,
                final_additional_amount: r.final_additional_amount,
                // final_refund_amount: r.final_refund_amount,
                settlement_type: r.settlement_type,
            })),
        };

        // Only add refund/payment fields if values > 0
        if (Number(refundAmount) > 0) {
            payload.refund_amount = refundAmount;
            payload.refund_payment_method = refundPaymentMethod;
        }
        if (Number(extraPaymentAmount) > 0) {
            payload.extra_payment_amount = extraPaymentAmount;
            payload.extra_payment_method = extraPaymentMethod;
        }

        try {
            setLoading(true);
            await axiosInstance.post(Api.salesReturns, payload);
            toast.success("Sales return created successfully");
            onSuccess?.();
            onClose();
        } catch (err: any) {
            toast.error(extractErrorMessage(err) || "Failed to process return");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Sales Return</h2>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-widest">
                                Order #{order.id?.split("-")[0]}
                            </span>
                            <span className="text-xs text-slate-500">Customer: <b>{order.customer_name || "—"}</b></span>
                            <span className="text-xs text-slate-500">Total: <b>₹{order.total_price || "0"}</b></span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-8 space-y-8">

                    {/* Return Date */}
                    <div className="max-w-xs">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Return Date *</label>
                        <input
                            type="date"
                            value={returnDate}
                            onChange={e => setReturnDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                    </div>

                    {/* Return Items */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <PackageOpen size={16} className="text-orange-500" />
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Return Items</h3>
                        </div>

                        {returnItems.length === 0 ? (
                            <div className="text-center py-10 text-slate-300 text-sm">No items found on this order.</div>
                        ) : (
                            <div className="space-y-3">
                                {returnItems.map((item, index) => {
                                    const isDisabled = item.status === "RETURNED" || item.status === "CANCELLED";
                                    return (
                                        <div
                                            key={index}
                                            className={`border rounded-2xl transition-all duration-200 ${isDisabled ? "opacity-50 blur-[0.5px] bg-slate-100 grayscale pointer-events-none" : item.selected ? "border-orange-400 ring-4 ring-orange-500/5 bg-white shadow-sm" : "border-slate-100 bg-slate-50/60"}`}
                                        >
                                            {/* Item Row */}
                                            <div className="flex items-start gap-4 p-5">
                                                <input
                                                    type="checkbox"
                                                    checked={item.selected}
                                                    disabled={isDisabled}
                                                    onChange={() => toggleReturnItem(index)}
                                                    className={`mt-1 w-5 h-5 accent-blue-500 shrink-0 ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800">{item.product_name}</p>
                                                        {isDisabled && (
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.status === "RETURNED" ? "bg-red-500 text-white" : "bg-gray-500 text-white"}`}>
                                                                {item.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.product_id}</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Price: <b>₹{item.returned_item_price}</b>
                                                        &nbsp;·&nbsp;Max Qty: <b>{item.maxQuantity}</b>
                                                        {item.all_serials.length > 0 && <>&nbsp;·&nbsp;{item.all_serials.length} serials</>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Expanded Fields */}
                                            {item.selected && (
                                                <div className="border-t border-slate-100 px-5 pb-5 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">

                                                    {/* Quantity */}
                                                    <div>
                                                        <label className="srl-label">Quantity *</label>
                                                        <input type="number" min={1} max={item.maxQuantity}
                                                            value={item.quantity}
                                                            onChange={e => updateReturnItem(index, "quantity", e.target.value)}
                                                            className="srl-input"
                                                        />
                                                        <p className="text-[10px] text-slate-400 mt-1">Max: {item.maxQuantity}</p>
                                                    </div>

                                                    {/* Condition */}
                                                    <div>
                                                        <label className="srl-label">Condition Status *</label>
                                                        <select value={item.condition_status}
                                                            onChange={e => updateReturnItem(index, "condition_status", e.target.value)}
                                                            className="srl-input">
                                                            {CONDITION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Settlement */}
                                                    <div>
                                                        <label className="srl-label">Settlement Type*</label>
                                                        <select value={item.settlement_type}
                                                            onChange={e => updateReturnItem(index, "settlement_type", e.target.value)}
                                                            className="srl-input">
                                                            {RETURN_SETTLEMENT.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Item Price */}
                                                    <div>
                                                        <label className="srl-label">Item Price (₹)</label>
                                                        <input type="number" min={0} value={item.returned_item_price}
                                                            readOnly
                                                            className="srl-input bg-slate-100 cursor-not-allowed border-transparent font-semibold" />
                                                    </div>

                                                    {/* Deduction */}
                                                    <div>
                                                        <label className="srl-label">Deduction Amount(₹)</label>
                                                        <input type="number" min={0} value={item.deduction_amount}
                                                            onChange={e => updateReturnItem(index, "deduction_amount", e.target.value)}
                                                            className="srl-input ring-1 ring-orange-200" />
                                                    </div>

                                                    {/* Final Refund */}
                                                    <div>
                                                        <label className="srl-label">Final Refund Amount(₹)</label>
                                                        <input type="number" min={0} value={item.final_refund_amount}
                                                            readOnly
                                                            className="srl-input bg-emerald-50 text-emerald-700 border-emerald-100 font-bold" />
                                                    </div>

                                                    {/* Condition Note */}
                                                    <div className="col-span-2 sm:col-span-3">
                                                        <label className="srl-label">Condition Note</label>
                                                        <input type="text" value={item.condition_note} placeholder="e.g. Screen cracked"
                                                            onChange={e => updateReturnItem(index, "condition_note", e.target.value)}
                                                            className="srl-input" />
                                                    </div>

                                                    {/* Return Note */}
                                                    <div className="col-span-2 sm:col-span-3">
                                                        <label className="srl-label">Return Note</label>
                                                        <input type="text" value={item.return_note} placeholder="Reason for return"
                                                            onChange={e => updateReturnItem(index, "return_note", e.target.value)}
                                                            className="srl-input" />
                                                    </div>

                                                    {/* Serial Number */}
                                                    {item.all_serials.length > 0 && (
                                                        <div className="col-span-2 sm:col-span-3">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <label className="srl-label mb-0">Select Serials</label>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.selected_serials.length === item.quantity ? "bg-green-500 text-white" : "bg-orange-100 text-orange-600"}`}>
                                                                    {item.selected_serials.length}/{item.quantity} selected
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50">
                                                                {item.all_serials.map(sn => (
                                                                    <button key={sn} onClick={() => toggleReturnSerial(index, sn)}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${item.selected_serials.includes(sn) ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"}`}>
                                                                        {item.selected_serials.includes(sn) && <Check size={9} className="inline mr-1" />}
                                                                        {sn}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* Replacement Items */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <ArrowLeftRight size={16} className="text-blue-500" />
                                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Replacement Items</h3>
                                    <span className="text-[10px] text-slate-400 font-medium">(optional)</span>
                                </div>

                                {/* Barcode Search Box */}
                                <div className="w-56 relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Scan Barcode..."
                                        value={barcodeSearch}
                                        onChange={e => setBarcodeSearch(e.target.value)}
                                        onKeyDown={handleReplacementBarcode}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-blue-400 focus:bg-white transition-all font-semibold"
                                    />
                                    {searching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={addReplacementItem}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all shrink-0">
                                <Plus size={13} /> Add Item
                            </button>
                        </div>

                        {replacementItems.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-100 rounded-2xl py-8 text-center text-slate-300 text-xs font-semibold">
                                No replacement items added
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {replacementItems.map((rep, index) => (
                                    <div key={index} className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-black text-blue-600">Replacement #{index + 1}</span>
                                            <button onClick={() => removeReplacementItem(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                            <div className="col-span-1">
                                                <label className="srl-label">Product *</label>
                                                <select
                                                    value={rep.product_id}
                                                    onChange={e => {
                                                        const p = allProducts.find(x => x.id === e.target.value);
                                                        if (p) {
                                                            let price = "0";
                                                            if (p.pricing && Array.isArray(p.pricing) && p.pricing.length > 0) {
                                                                price = p.pricing[0].price;
                                                            }

                                                            updateReplacementItemBatch(index, {
                                                                product_id: p.id,
                                                                unit_price: String(price),
                                                                quantity: 1,
                                                                replaced_item_price: String(price),
                                                                final_additional_amount: "0",
                                                                final_refund_amount: "0",
                                                                settlement_type: "NONE",
                                                                serial_numbers: [], // Reset serial numbers
                                                                available_serials: []
                                                            });
                                                            fetchAvailableSerials(p.id, index);
                                                        }
                                                    }}
                                                    className="srl-input"
                                                >
                                                    <option value="">Select product</option>
                                                    {allProducts.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                    {rep.product_id && !allProducts.find(x => x.id === rep.product_id) && (
                                                        <option value={rep.product_id}>{rep.product_id}</option>
                                                    )}
                                                </select>
                                            </div>

                                            {/* <div className="col-span-1">
                                                <label className="srl-label">Product ID</label>
                                                <input type="text" value={rep.product_id} readOnly
                                                    className="srl-input bg-slate-50 cursor-not-allowed font-mono text-[10px] text-slate-500" />
                                            </div> */}

                                            <div className="col-span-1">
                                                <label className="srl-label">Quantity</label>
                                                <input type="number" min={1} value={rep.quantity}
                                                    onChange={e => updateReplacementItem(index, "quantity", Number(e.target.value))}
                                                    className="srl-input" />
                                            </div>

                                            <div>
                                                <label className="srl-label">Settlement Type*</label>
                                                <select value={rep.settlement_type}
                                                    onChange={e => updateReplacementItem(index, "settlement_type", e.target.value)}
                                                    className="srl-input">
                                                    {REPLACEMENT_SETTLEMENT.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="srl-label">Replaced Item Price (₹)</label>
                                                <input type="number" min={0} value={rep.replaced_item_price}
                                                    onChange={e => updateReplacementItem(index, "replaced_item_price", e.target.value)}
                                                    className="srl-input" />
                                            </div>

                                            <div>
                                                <label className="srl-label">Final Additional Amount (₹)</label>
                                                <input type="number" min={0} value={rep.final_additional_amount}
                                                    onChange={e => updateReplacementItem(index, "final_additional_amount", e.target.value)}
                                                    className="srl-input" />
                                            </div>

                                            {/* <div>
                                                <label className="srl-label">Final Refund Amount (₹)</label>
                                                <input type="number" min={0} value={rep.final_refund_amount}
                                                    onChange={e => updateReplacementItem(index, "final_refund_amount", e.target.value)}
                                                    className="srl-input" />
                                            </div> */}

                                            <div className="col-span-2 sm:col-span-3">
                                                <label className="srl-label flex justify-between">
                                                    <span>Serial Numbers *</span>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rep.serial_numbers.length === rep.quantity ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {rep.serial_numbers.length} / {rep.quantity} Selected
                                                    </span>
                                                </label>

                                                {rep.available_serials.length === 0 ? (
                                                    <div className="text-[10px] text-slate-400 italic py-2 border border-dashed border-slate-200 rounded-lg text-center">
                                                        No available serials found for this product in current hub.
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50/30 max-h-32 overflow-y-auto">
                                                        {rep.available_serials.map(sn => {
                                                            const isSelected = rep.serial_numbers.includes(sn);
                                                            return (
                                                                <label key={sn}
                                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => {
                                                                            let updated = [...rep.serial_numbers];
                                                                            if (isSelected) {
                                                                                updated = updated.filter(x => x !== sn);
                                                                            } else {
                                                                                if (updated.length < rep.quantity) {
                                                                                    updated.push(sn);
                                                                                } else {
                                                                                    toast.error(`Only ${rep.quantity} serial(s) allowed`);
                                                                                    return;
                                                                                }
                                                                            }
                                                                            updateReplacementItem(index, "serial_numbers", updated);
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                    <span className="text-[11px] font-mono font-medium">{sn}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-2 sm:col-span-3">
                                                <label className="srl-label">Replacement Note</label>
                                                <input type="text" value={rep.replacement_note}
                                                    onChange={e => updateReplacementItem(index, "replacement_note", e.target.value)}
                                                    className="srl-input" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Settlement Summary */}
                    <section className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Settlement Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="srl-label">Refund Amount (₹)</label>
                                <input type="number" min={0} value={refundAmount}
                                    readOnly
                                    className="srl-input bg-emerald-50 text-emerald-700 font-bold border-emerald-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="srl-label">Refund Method</label>
                                <select value={refundPaymentMethod}
                                    onChange={e => setRefundPaymentMethod(e.target.value)}
                                    className="srl-input">
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="srl-label">Extra Payment (₹)</label>
                                <input type="number" min={0} value={extraPaymentAmount}
                                    readOnly
                                    className="srl-input bg-blue-50 text-blue-700 font-bold border-blue-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="srl-label">Extra Payment Method</label>
                                <select value={extraPaymentMethod}
                                    onChange={e => setExtraPaymentMethod(e.target.value)}
                                    className="srl-input">
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="text-sm text-slate-500">
                        <span className="font-black text-slate-800 text-lg">
                            {returnItems.filter(i => i.selected).length}
                        </span> item(s) selected for return
                        {replacementItems.length > 0 && (
                            <span className="ml-2 text-blue-500 font-semibold">+ {replacementItems.length} replacement(s)</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-10 py-3 bg-orange-500 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Submit Return"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .srl-label { display: block; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
                .srl-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; font-size: 13px; background: white; outline: none; transition: all 0.15s; }
                .srl-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.08); }
            `}</style>
        </div>
    );
};

export default SalesReturnModal;