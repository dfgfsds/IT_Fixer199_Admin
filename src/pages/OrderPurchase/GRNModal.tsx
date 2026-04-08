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

    const handleItemChange = (i: number, field: string, value: any) => {
  const newItems = [...items];

  // ✅ SET VALUE FIRST
  newItems[i][field] = value;

  // 🔥 PRODUCT LOGIC
  if (field === "product") {
    if (newItems[i].isFromPO && poData) {
      const selected = poData.items?.find(
        (p: any) => p.product_id === value
      );

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

  // 🔥 QUANTITY CALC (SEPARATE)
  if (field === "received_quantity" || field === "accepted_quantity") {
    const r = Number(newItems[i].received_quantity || 0);
    const a = Number(newItems[i].accepted_quantity || 0);

    const rej = r - a;

    newItems[i].rejected_quantity = String(rej >= 0 ? rej : 0);
    newItems[i].is_damaged = rej > 0;
  }

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

    const handleSubmit = async () => {
        setApiErrors("");
        const validItems = items.filter((i) => i.product !== "");
        if (!validItems.length) return toast.error("Select product");

        try {
            setLoading(true);
            const cleanedItems = validItems.map((i) => cleanObject(i));
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
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-semibold">Product Details</th>
                                    {/* <th className="p-4 font-semibold text-center">Quantity (R/A/J)</th> */}
                                    <th className="p-4 font-semibold text-center">Quantity</th>
                                    <th className="p-4 font-semibold">Pricing (Rate/Tax)</th>
                                    <th className="p-4 font-semibold">Discount</th>
                                    <th className="p-4 font-semibold">Batch & Expiry</th>
                                    {/* <th className="p-4 font-semibold">Status / Type</th> */}
                                    <th className="p-4 font-semibold">Type</th>
                                    {/* <th className="p-4 font-semibold">Serials</th> */}
                                    <th className="p-4 font-semibold"></th>
                                </tr>
                            </thead>

                            {/* <tbody className="divide-y divide-slate-100 text-sm">
                                {items.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3 w-64">
                                            <select
                                                onChange={(e) => handleItemChange(i, "product", e.target.value)}
                                                className="w-full border border-slate-200 p-2 rounded-lg bg-white text-xs"
                                            >
                                                <option>Select Product</option>
                                                {poData?.items?.map((p: any) => (
                                                    <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 align-top">
                                            <select value={item.product} onChange={(e) => handleItemChange(i, "product", e.target.value)} className="w-full border p-2 rounded-lg text-sm bg-white mb-2">
                                                <option value="">-- Choose Product --</option>
                                                {poData?.items?.map((p: any) => (
                                                    <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                                ))}
                                            </select>
                                            {!isPoItem && (
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => fetchProducts(e.target.value, i)}
                                                    className="w-full border p-2 rounded mb-2"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map((c: any) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <select
                                                value={item.product}
                                                onChange={(e) => handleItemChange(i, "product", e.target.value)}
                                                disabled={isPoItem}
                                                className={`w-full border p-2 rounded-lg text-sm bg-white mb-2 ${isPoItem ? "bg-gray-100 cursor-not-allowed" : ""
                                                    }`}
                                            >
                                                <option value="">-- Choose Product --</option>

                                                {poData?.items?.map((p: any) => (
                                                    <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                                ))}

                                            
                                                {!isPoItem &&
                                                    products?.map((p: any) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            <textarea placeholder="Item Remarks" value={item.remarks} onChange={(e) => handleItemChange(i, "remarks", e.target.value)} className="w-full border p-1 text-[11px] rounded" rows={1} />
                                        </td>

                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <input placeholder="Rec" onChange={(e) => handleItemChange(i, "received_quantity", e.target.value)} className="w-24 border p-1.5 rounded text-center text-xs" />
                                             
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <input value={item.rate} onChange={(e) => handleItemChange(i, "rate", e.target.value)} placeholder="Rate" className="w-20 border p-1 rounded text-xs" />
                                                <input value={item.tax_percentage} onChange={(e) => handleItemChange(i, "tax_percentage", e.target.value)} placeholder="Tax %" className="w-20 border p-1 rounded text-xs" />
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <select onChange={(e) => handleItemChange(i, "discount_type", e.target.value)} className="w-20 border p-1 rounded text-[10px]">
                                                    <option value="FIXED">FIXED</option>
                                                    <option value="PERCENT">PERCENT</option>
                                                </select>
                                                <input placeholder="Value" onChange={(e) => handleItemChange(i, "discount_value", e.target.value)} className="w-20 border p-1 rounded text-xs" />
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <input placeholder="Batch No" onChange={(e) => handleItemChange(i, "batch_number", e.target.value)} className="w-24 border p-1 rounded text-xs" />
                                                <input type="date" onChange={(e) => handleItemChange(i, "expiry_date", e.target.value)} className="w-24 border p-1 rounded text-[10px]" />
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                               
                                                <select onChange={(e) => handleItemChange(i, "grn_type", e.target.value)} className="w-20 border p-1 rounded text-[10px]">
                                                    <option value="PURCHASE">PURCHASE</option>
                                                    <option value="RETURN">RETURN</option>
                                                </select>
                                            </div>
                                        </td>

                                        <td className="p-3">
                                            <textarea
                                                placeholder="Serials (S1, S2...)"
                                                onChange={(e) => handleItemChange(i, "serial_numbers", e.target.value.split(","))}
                                                className="w-28 border p-1 rounded text-[10px] h-10 resize-none"
                                            />
                                        </td>

                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleRemoveItem(i)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody> */}

                            <tbody className="divide-y divide-slate-100 text-sm">
                                {items.map((item, i) => {
                                    const isPoItem = item?.isFromPO;

                                    return (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">

                                            {/* PRODUCT + CATEGORY */}
                                            <td className="p-4 align-top">

                                                {/* CATEGORY (ONLY NON-PO) */}
                                                {!item?.product && (
                                                    <select
                                                        value={item.category || ""}
                                                        onChange={(e) => fetchProducts(e.target.value, i)}
                                                        className="w-full border p-2 rounded mb-2"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((c: any) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {/* PRODUCT */}
                                                <select
                                                    value={item?.product || ""}
                                                    onChange={(e) =>
                                                        handleItemChange(i, "product", e.target.value)
                                                    }
                                                    // disabled={isPoItem}
                                                    className={`w-full border p-2 rounded-lg text-sm mb-2 ${isPoItem ? "bg-gray-100 cursor-not-allowed" : ""
                                                        }`}
                                                >
                                                    <option value="">-- Choose Product --</option>

                                                    {poData?.items?.map((p: any) => (
                                                        <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
                                                    ))}

                                                    {/* PO PRODUCTS */}
                                                    {/* {isPoItem &&
                                                        poData?.items?.map((p: any) => (
                                                            <option key={p.product_id} value={p.product_id}>
                                                                {p.product_name}
                                                            </option>
                                                        ))
                                                        } */}

                                                    {/* NORMAL PRODUCTS */}
                                                    {!isPoItem &&
                                                        (item?.productsList || [])?.map((p: any) => (
                                                            <option key={p?.id} value={p?.id}>
                                                                {p?.name}
                                                            </option>
                                                        ))}
                                                </select>

                                                {/* REMARKS */}
                                                <textarea
                                                    placeholder="Item Remarks"
                                                    value={item.remarks || ""}
                                                    onChange={(e) =>
                                                        handleItemChange(i, "remarks", e.target.value)
                                                    }
                                                    className="w-full border p-1 text-[11px] rounded"
                                                    rows={1}
                                                />

                                                {/* PO TAG */}
                                                {isPoItem && (
                                                    <span className="text-[10px] text-indigo-600 font-bold">
                                                        From PO
                                                    </span>
                                                )}
                                            </td>

                                            {/* QUANTITY */}
                                            <td className="p-3">
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        placeholder="Received"
                                                        value={item?.received_quantity || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "received_quantity", e.target.value)
                                                        }
                                                        className="w-24 border p-1.5 rounded text-center text-xs"
                                                    />

                                                    {/* <input
                                                        placeholder="Accepted"
                                                        value={item.accepted_quantity || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "accepted_quantity", e.target.value)
                                                        }
                                                        className="w-24 border p-1.5 rounded text-center text-xs bg-indigo-50"
                                                    /> */}

                                                    {/* <div className="text-xs text-red-500 font-bold text-center">
                                                        Rej: {item.rejected_quantity}
                                                    </div> */}
                                                </div>
                                            </td>

                                            {/* RATE + TAX */}
                                            <td className="p-3">
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        value={item.rate || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "rate", e.target.value)
                                                        }
                                                        placeholder="Rate"
                                                        className="w-20 border p-1 rounded text-xs"
                                                    />

                                                    <input
                                                        value={item.tax_percentage || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "tax_percentage", e.target.value)
                                                        }
                                                        placeholder="Tax %"
                                                        className="w-20 border p-1 rounded text-xs"
                                                    />
                                                </div>
                                            </td>

                                            {/* DISCOUNT */}
                                            <td className="p-3">
                                                <div className="flex flex-col gap-1">
                                                    <select
                                                        value={item.discount_type}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "discount_type", e.target.value)
                                                        }
                                                        className="w-20 border p-1 rounded text-[10px]"
                                                    >
                                                        <option value="FIXED">FIXED</option>
                                                        <option value="PERCENT">PERCENT</option>
                                                    </select>

                                                    <input
                                                        value={item.discount_value || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "discount_value", e.target.value)
                                                        }
                                                        placeholder="Value"
                                                        className="w-20 border p-1 rounded text-xs"
                                                    />
                                                </div>
                                            </td>

                                            {/* BATCH + EXPIRY */}
                                            <td className="p-3">
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        placeholder="Batch No"
                                                        value={item.batch_number || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "batch_number", e.target.value)
                                                        }
                                                        className="w-24 border p-1 rounded text-xs"
                                                    />

                                                    <input
                                                        type="date"
                                                        value={item.expiry_date || ""}
                                                        onChange={(e) =>
                                                            handleItemChange(i, "expiry_date", e.target.value)
                                                        }
                                                        className="w-24 border p-1 rounded text-[10px]"
                                                    />
                                                </div>
                                            </td>

                                            {/* TYPE */}
                                            <td className="p-3">
                                                <select
                                                    value={item.grn_type}
                                                    onChange={(e) =>
                                                        handleItemChange(i, "grn_type", e.target.value)
                                                    }
                                                    className="w-24 border p-1 rounded text-[10px]"
                                                >
                                                    <option value="PURCHASE">PURCHASE</option>
                                                    <option value="RETURN">RETURN</option>
                                                </select>
                                            </td>

                                            {/* DELETE */}
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(i)}
                                                    className="p-2 text-slate-300 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition-colors"
                            >
                                <Plus size={16} className="bg-indigo-100 rounded-full p-0.5" /> Add Another Row
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Attach Files</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                    className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
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