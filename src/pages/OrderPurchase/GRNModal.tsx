import React, { useState, useEffect } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader2, Plus, Trash2, X, FileText, Calendar, ShieldCheck, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const GRNModal = ({ show, onClose, onSuccess, poData }: any) => {
    console.log("PO Data in GRN Modal:", poData);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        vendor: "",
        hub: "",
        purchase_order: "",
        invoice_number: "",
        gate_pass_number: "",
        delivery_challan_number: "",
        received_date: "",
        notes: "",
        currency: "INR",
        received_by: "",
        approved_by: "",
        is_quality_checked: true,
        is_invoice_matched: true,
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [serialInput, setSerialInput] = useState("");
    const [activeRowIndex, setActiveRowIndex] = useState(0);

    // useEffect(() => {
    //     if (show && poData) {
    //         setForm((prev) => ({
    //             ...prev,
    //             invoice_number: poData?.invoice_number || "",
    //         }));
    //     }
    // }, [show, poData]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get(
                `${Api?.categories}`
            );
            setCategories(res?.data?.data || []);
        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const [items, setItems] = useState<any[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [apiErrors, setApiErrors] = useState<string>("");
    console.log("Form State:", items);
    // PREFILL FROM PO
    useEffect(() => {
        if (show && poData) {
            setForm({
                vendor: poData.vendor || "",
                hub: poData.hub || "",
                purchase_order: poData.id || "",
                invoice_number: poData?.invoice_number || "",
                gate_pass_number: "",
                delivery_challan_number: "",
                received_date: new Date().toISOString().split("T")[0],
                notes: "",
                currency: poData.currency || "INR",
                received_by: poData.created_by_details?.id || "",
                approved_by: poData.created_by_details?.id || "",
                is_quality_checked: true,
                is_invoice_matched: true,
            });

            // setItems([createItem()]);
            setItems(
                poData?.items?.map((p: any) => ({
                    product: p?.product_id,
                    purchase_order_item: p?.id,
                    received_quantity: Number(p?.quantity || ""),
                    accepted_quantity: "",
                    rejected_quantity: "0",
                    rate: String(p?.rate || ""),
                    tax_percentage: String(p?.tax_percentage || ""),
                    discount_value: String(p?.discount_value || ""),
                    discount_type: p?.discount_type || "FIXED",
                    batch_number: "",
                    expiry_date: "",
                    qc_status: "PENDING",
                    serial_numbers: [],
                    is_damaged: false,
                    grn_type: "PURCHASE",
                    remarks: "",
                }))
            );
        }
    }, [show, poData]);

    const isPoItem = !!poData;

    const createItem = () => ({
        product: "",
        purchase_order_item: "",
        received_quantity: "",
        accepted_quantity: "",
        rejected_quantity: "0",
        rate: "",
        tax_percentage: "",
        discount_value: "",
        discount_type: "FIXED",
        batch_number: "",
        expiry_date: "",
        qc_status: "PENDING",
        serial_numbers: [],
        is_damaged: false,
        grn_type: "PURCHASE",
    });

    const fetchProducts = async (categoryId: string, index: number) => {
        const res = await axiosInstance.get(`${Api.products}?category_id=${categoryId}&size=10000`);
        const updated = [...items];
        updated[index].productsList = res.data.products;
        updated[index].category = categoryId;
        setItems(updated);
    };

    const handleAddItem = () => setItems([...items, createItem()]);
    const handleRemoveItem = (i: number) =>
        setItems(items.filter((_, index) => index !== i));

    // const handleItemChange = (i: number, field: string, value: any) => {
    //     const newItems = [...items];

    //     // if (field === "product") {
    //     //     const selected = poData.items?.find((p: any) => p.product_id === value);
    //     //     if (selected) {
    //     //         newItems[i] = {
    //     //             ...newItems[i],
    //     //             product: selected.product_id,
    //     //             purchase_order_item: selected.id,
    //     //             rate: String(selected.rate || ""),
    //     //             tax_percentage: String(selected.tax_percentage || ""),
    //     //         };
    //     //     }
    //     // } else {
    //     //     newItems[i][field] = value;

    //     //     if (field === "received_quantity" || field === "accepted_quantity") {
    //     //         const r = Number(newItems[i].received_quantity || 0);
    //     //         const a = Number(newItems[i].accepted_quantity || 0);
    //     //         const rej = r - a;
    //     //         newItems[i].rejected_quantity = String(rej >= 0 ? rej : 0);
    //     //         newItems[i].is_damaged = rej > 0;
    //     //     }
    //     // }

    //     if (field === "product") {

    //         if (value.isFromPO && poData) {
    //             // ✅ PO FLOW
    //             const selected = poData.items?.find(
    //                 (p: any) => p.product_id === value
    //             );

    //             if (selected) {
    //                 newItems[i] = {
    //                     ...newItems[i],
    //                     product: selected.product_id,
    //                     purchase_order_item: selected.id,
    //                     rate: String(selected.rate || ""),
    //                     tax_percentage: String(selected.tax_percentage || ""),
    //                 };
    //             }

    //         } else {
    //             // ✅ NORMAL FLOW (THIS WAS MISSING ❌)
    //             newItems[i] = {
    //                 ...newItems[i],
    //                 product: value,
    //             };
    //             if (field === "received_quantity" || field === "accepted_quantity") {
    //                 const r = Number(newItems[i].received_quantity || 0);
    //                 const a = Number(newItems[i].accepted_quantity || 0);
    //                 const rej = r - a;
    //                 newItems[i].rejected_quantity = String(rej >= 0 ? rej : 0);
    //                 newItems[i].is_damaged = rej > 0;
    //             }
    //         }
    //     }

    //     setItems(newItems);
    // };

    //     const handleItemChange = (i: number, field: string, value: any) => {
    //   const newItems = [...items];

    //   // ✅ SET VALUE FIRST
    //   newItems[i][field] = value;

    //   // 🔥 PRODUCT LOGIC
    //   if (field === "product") {
    //     if (newItems[i].isFromPO && poData) {
    //       const selected = poData.items?.find(
    //         (p: any) => p.product_id === value
    //       );

    //       if (selected) {
    //         newItems[i] = {
    //           ...newItems[i],
    //           product: selected.product_id,
    //           purchase_order_item: selected.id,
    //           rate: String(selected.rate || ""),
    //           tax_percentage: String(selected.tax_percentage || ""),
    //         };
    //       }
    //     }
    //   }

    //   // 🔥 QUANTITY CALC (SEPARATE)
    //   if (field === "received_quantity" || field === "accepted_quantity") {
    //     const r = Number(newItems[i].received_quantity || 0);
    //     const a = Number(newItems[i].accepted_quantity || 0);

    //     const rej = r - a;

    //     newItems[i].rejected_quantity = String(rej >= 0 ? rej : 0);
    //     newItems[i].is_damaged = rej > 0;
    //   }

    //   setItems(newItems);
    // };


    const handleItemChange = (i: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[i][field] = value;

        if (field === "product") {
            if (newItems[i].isFromPO && poData) {
                const selected = poData.items?.find((p: any) => p.product_id === value);
                if (selected) {
                    newItems[i] = {
                        ...newItems[i],
                        product: selected.product_id,
                        purchase_order_item: selected.id,
                        rate: String(selected.rate || ""),
                        tax_percentage: String(selected.tax_percentage || ""),
                    };
                }
            }
        }

        if (field === "received_quantity" || field === "accepted_quantity") {
            const r = Number(newItems[i].received_quantity || 0);
            const a = Number(newItems[i].accepted_quantity || 0);
            const rej = r - a;
            newItems[i].rejected_quantity = String(rej >= 0 ? rej : 0);
            newItems[i].is_damaged = rej > 0;

            // 🔥 Qty base panni serial numbers array create pandren
            if (field === "received_quantity") {
                const qty = Math.max(0, parseInt(value) || 0);
                // Inga length set pandrom, so input boxes auto-ah generate agum
                newItems[i].serial_numbers = Array(qty).fill("");
            }
        }

        setItems(newItems);
    };

    // Serial number input handle panna oru puthu function
    const handleSerialChange = (itemIdx: number, serialIdx: number, val: string) => {
        const newItems = [...items];
        newItems[itemIdx].serial_numbers[serialIdx] = val;
        setItems(newItems);
    };

    const cleanObject = (obj: any) => {
        const newObj: any = {};
        Object.keys(obj).forEach((key) => {
            const val = obj[key];
            if (
                val !== "" &&
                val !== null &&
                val !== undefined &&
                !(Array.isArray(val) && val.length === 0)
            ) {
                newObj[key] = val;
            }
        });
        return newObj;
    };

    useEffect(() => {
        setItems((prevItems) =>
            prevItems.map((item) => {
                const qty = Number(item.received_quantity || 0);

                if (
                    qty > 0 &&
                    (!item.serial_numbers || item.serial_numbers.length !== qty)
                ) {
                    return {
                        ...item,
                        serial_numbers: Array(qty).fill(""),
                    };
                }

                return item;
            })
        );
    }, []);


    const handleSubmit = async () => {
        setApiErrors("");
        const validItems = items.filter((i) => i.product !== "");
        if (!validItems?.length) return toast.error("Select product");

        try {
            setLoading(true);
            const cleanedItems = validItems?.map((i) => cleanObject(i));
            const payload = cleanObject({
                ...form,
                received_date: new Date(form.received_date).toISOString(),
                items: cleanedItems,
            });

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            files.forEach((f) => formData.append("attachments", f));

            await axiosInstance.post(`${Api.purchaseGRN}`, formData);
            toast.success("GRN Created Successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // const handleSerialScan = (serial: string) => {
    //     if (!serial) return;

    //     if (activeRowIndex === null) {
    //         toast.error("Select a row first ⚠️");
    //         return;
    //     }

    //     let updatedItems = [...items];

    //     const row = updatedItems[activeRowIndex];

    //     if (!row || !row.product) {
    //         toast.error("Invalid row ❌");
    //         return;
    //     }

    //     const existingSerials = row.serial_numbers || [];

    //     if (existingSerials.includes(serial)) {
    //         toast.error("Serial already added ⚠️");
    //         return;
    //     }

    //     // ✅ ADD SERIAL TO SPECIFIC INDEX
    //     updatedItems[activeRowIndex].serial_numbers = [
    //         ...existingSerials,
    //         serial,
    //     ];

    //     // 🔥 AUTO QTY
    //     updatedItems[activeRowIndex].quantity =
    //         updatedItems[activeRowIndex].serial_numbers.length;

    //     setItems(updatedItems);
    // };

    // 1. Function-la index parameter add panniko machan
    const handleSerialScan = (serial: string, rowIndex: number) => {
        if (!serial) return;

        let updatedItems = [...items];
        const row = updatedItems[rowIndex];

        if (!row || !row.product) {
            toast.error("Invalid row ❌");
            return;
        }

        const existingSerials = row.serial_numbers || [];

        if (existingSerials.includes(serial)) {
            toast.error("Serial already added ⚠️");
            return;
        }

        // Row index direct-a irukuradhala zero index issue varaadhu
        updatedItems[rowIndex].serial_numbers = [...existingSerials, serial];
        updatedItems[rowIndex].received_quantity = updatedItems[rowIndex].serial_numbers.length;

        setItems(updatedItems);
    };


    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Create GRN</h2>
                            <p className="text-xs text-slate-500 font-medium">Drafting Goods Receipt Note</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-hide">

                    {/* HEADER FIELDS CARD */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <FileText size={12} /> Invoice Number
                            </label>
                            <input
                                placeholder="INV-000"
                                value={form?.invoice_number}
                                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                                className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Gate Pass</label>
                            <input
                                placeholder="GP-000"
                                value={form.gate_pass_number}
                                onChange={(e) => setForm({ ...form, gate_pass_number: e.target.value })}
                                className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Challan No</label>
                            <input
                                placeholder="DC-000"
                                value={form.delivery_challan_number}
                                onChange={(e) => setForm({ ...form, delivery_challan_number: e.target.value })}
                                className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Calendar size={12} /> Date
                            </label>
                            <input
                                type="date"
                                value={form.received_date}
                                onChange={(e) => setForm({ ...form, received_date: e.target.value })}
                                className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <ShieldCheck size={12} /> Quality Checked
                            </label>
                            <select
                                value={String(form.is_quality_checked)}
                                onChange={(e) => setForm({ ...form, is_quality_checked: e.target.value === "true" })}
                                className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="true">Yes (Checked)</option>
                                <option value="false">No (Pending)</option>
                            </select>
                        </div>

                        <div className="md:col-span-5 space-y-1 mt-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Additional Notes</label>
                            <textarea
                                placeholder="Write any specific observations here..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-16 resize-none"
                            />
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white">
                        <table className="w-full text-left border-collapse min-w-[1100px]">
                            <thead className="bg-slate-900 text-slate-200 text-[11px] uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-4 w-[25%]">Product Details</th>
                                    <th className="p-4 w-[20%] text-center">Inventory & Serials</th>
                                    <th className="p-4 w-[15%]">Pricing (Rate/Tax)</th>
                                    <th className="p-4 w-[15%]">Discount</th>
                                    <th className="p-4 w-[15%]">Expiry</th>
                                    <th className="p-4 w-[10%] text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-sm">
                                {items?.map((item, i) => {
                                    const isPoItem = item?.isFromPO;
                                    const isActive = activeRowIndex === i;

                                    return (
                                        <tr
                                            key={i}
                                            onClick={() => setActiveRowIndex(i)}
                                            className={`transition-all duration-200 ${isActive ? "bg-indigo-50/40 ring-1 ring-inset ring-indigo-100" : "hover:bg-slate-50/50"}`}
                                        >
                                            {/* PRODUCT + CATEGORY */}
                                            <td className="p-4 align-top space-y-2">
                                                {!item?.product && (
                                                    <select
                                                        value={item.category || ""}
                                                        onChange={(e) => fetchProducts(e.target.value, i)}
                                                        className="w-full border border-slate-200 p-2 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((c) => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                <div className="relative">
                                                    <select
                                                        value={item?.product || ""}
                                                        onChange={(e) => handleItemChange(i, "product", e.target.value)}
                                                        className={`w-full border p-2 rounded-md font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none ${isPoItem ? "bg-slate-50 text-slate-500 cursor-not-allowed border-dashed" : "border-slate-200"}`}
                                                    >
                                                        <option value="">-- Choose Product --</option>
                                                        {poData?.items?.map((p: any) => (
                                                            <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                                        ))}
                                                        {!isPoItem && (item?.productsList || [])?.map((p: any) => (
                                                            <option key={p?.id} value={p?.id}>{p?.name}</option>
                                                        ))}
                                                    </select>
                                                    {isPoItem && <span className="absolute -top-2 -right-1 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">PO</span>}
                                                </div>

                                                <textarea
                                                    placeholder="Item Remarks..."
                                                    value={item.remarks || ""}
                                                    onChange={(e) => handleItemChange(i, "remarks", e.target.value)}
                                                    className="w-full border border-slate-100 p-2 text-[11px] rounded-md bg-slate-50/50 italic focus:bg-white focus:border-indigo-300 transition-all resize-none"
                                                    rows={1}
                                                />
                                            </td>

                                            {/* QUANTITY & SERIALS */}
                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-2 items-center">
                                                    <div className="flex items-center gap-2 w-full">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] text-slate-400 font-bold block mb-1">RECEIVED</label>
                                                            <input
                                                                type="number"
                                                                value={item?.received_quantity || ""}
                                                                onChange={(e) => handleItemChange(i, "received_quantity", e.target.value)}
                                                                className="w-full border border-slate-200 p-2 rounded-md text-center font-bold text-indigo-600 focus:border-indigo-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex-[2]">
                                                            <label className="text-[10px] text-slate-400 font-bold block mb-1">SCAN SERIAL</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter/Scan..."
                                                                className="w-full border border-slate-200 p-2 rounded-md bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        handleSerialScan(e.currentTarget.value, i);
                                                                        e.currentTarget.value = "";
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {item.serial_numbers?.length > 0 && (
                                                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 max-h-32 overflow-y-auto grid grid-cols-1 gap-1 shadow-inner">
                                                            {item.serial_numbers?.slice(0)?.map((sn: any, snIndex: number) => (
                                                                <div key={snIndex} className="flex items-center bg-white border border-slate-100 rounded px-2 py-1">
                                                                    <span className="text-[9px] text-slate-400 mr-2">{snIndex + 1}</span>
                                                                    <input
                                                                        value={sn || ""}
                                                                        onChange={(e) => handleSerialChange(i, snIndex, e.target.value)}
                                                                        className="w-full text-xs focus:outline-none font-mono text-slate-600"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* PRICING */}
                                            <td className="p-4 align-top space-y-3">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Rate</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-2 text-slate-400 text-xs">₹</span>
                                                        <input
                                                            value={item.rate || ""}
                                                            onChange={(e) => handleItemChange(i, "rate", e.target.value)}
                                                            className="w-full border border-slate-200 pl-5 p-2 rounded-md text-sm outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Tax %</label>
                                                    <input
                                                        value={item.tax_percentage || ""}
                                                        onChange={(e) => handleItemChange(i, "tax_percentage", e.target.value)}
                                                        className="w-full border border-slate-200 p-2 rounded-md text-sm outline-none focus:border-indigo-500"
                                                    />
                                                </div>
                                            </td>

                                            {/* DISCOUNT */}
                                            <td className="p-4 align-top space-y-3">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Type</label>
                                                    <select
                                                        value={item.discount_type}
                                                        onChange={(e) => handleItemChange(i, "discount_type", e.target.value)}
                                                        className="w-full border border-slate-200 p-2 rounded-md text-xs bg-white outline-none"
                                                    >
                                                        <option value="FIXED">Flat (₹)</option>
                                                        <option value="PERCENT">Percent (%)</option>
                                                    </select>
                                                </div>
                                                <input
                                                    placeholder="Value"
                                                    value={item.discount_value || ""}
                                                    onChange={(e) => handleItemChange(i, "discount_value", e.target.value)}
                                                    className="w-full border border-slate-200 p-2 rounded-md text-sm outline-none focus:border-indigo-500"
                                                />
                                            </td>

                                            {/* EXPIRY */}
                                            <td className="p-4 align-top">
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    value={item.expiry_date || ""}
                                                    onChange={(e) => handleItemChange(i, "expiry_date", e.target.value)}
                                                    className="w-full border border-slate-200 p-2 rounded-md text-xs bg-white outline-none focus:border-indigo-500"
                                                />
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="p-4 text-center align-middle">
                                                <button
                                                    onClick={() => handleRemoveItem(i)}
                                                    className="group p-2.5 rounded-full hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* FOOTER ACTIONS */}
                        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={18} /> Add New Row
                            </button>

                            <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attachments</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                    className="text-[11px] file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end px-6">
                        {apiErrors}
                    </p>
                )}

                {/* FOOTER */}
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 disabled:bg-indigo-300 flex items-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalize & Create GRN"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default GRNModal;