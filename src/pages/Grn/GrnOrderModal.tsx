import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Loader2, X, Plus, Trash2, IndianRupee } from "lucide-react";
import Api from "../../api-endpoints/ApiUrls";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { removeEmptyFields } from "../../utils/removeEmptyFields ";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const GrnOrderModal = ({ show, onClose, onSuccess, editData }: any) => {
    // ... (States and Logic remain exactly same)
    const [vendors, setVendors] = useState([]);
    const [hubs, setHubs] = useState([]);
    const [products, setProducts] = useState([]);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [search, setSearch] = useState("");
    const [grnList, setGrnList] = useState<any[]>([]);
    const [amountType, setAmountType] = useState<"full" | "custom">("custom");
    const [selectedGRN, setSelectedGRN] = useState<any>("");
    const [paymentAmount, setPaymentAmount] = useState(0); // Initial Payment
    const walletUsed = Number(amountType === "full" ? selectedGRN?.excess_amount : selectedGRN?.used_amount);
    const [grandTotal, setGrandTotal] = useState(0); // API இருந்து

    const initialState = {
        vendor: "",
        hub: "",
        // po_number: "",
        invoice_date: "",
        received_date: "",
        bill_to: "",
        ship_to: "",
        gate_pass_number: "",
        shipping_charges: 0,
        other_charges: 0,
        currency: "INR",
        notes: "",
        internal_notes: "",
        invoice_number: "",
        items: [
            {
                category: "",
                product: "",
                products: [], // 🔥 IMPORTANT
                item_name: "",
                received_quantity: 1,
                serial_numbers: [""],
                rate: 0,
                discount_type: "PERCENT",
                discount_value: 0,
                tax_percentage: 0,
                amount: 0,
                expiry_date: "",
                batch_number: ""
            },
        ],
        initial_payment: { payment_date: "", payment_method: "", payment_reference: "", amount_paid: 0, notes: "" },
    };

    const [form, setForm] = useState<any>(initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (form?.vendor) {
            fetchPurchaseExcessCreditEntities();
        }
    }, [form?.vendor])

    const fetchPurchaseExcessCreditEntities = async () => {
        try {
            const updatedAPi = await axiosInstance.get(`${Api?.purchaseExcessCreditEntities}?vendor_id=${form?.vendor}`)
            if (updatedAPi) {
                const list = updatedAPi?.data?.grns?.items || [];

                const formatted = list.map((g: any) => ({
                    id: g?.id,
                    grn_number: g?.grn_number,
                    excess_amount: Number(g?.excess_amount || 0),
                    used_amount: 0
                }));

                setGrnList(formatted);
                // setBalanceAmount(updatedAPi?.data?.grns?.items)
            }
        } catch (error) {

        }
    };

    const total = form.items.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);
    const afterWalletTotal = Math.max(total - walletUsed, 0);
    const balanceAmount = Math.max(afterWalletTotal - paymentAmount, 0);

    useEffect(() => {
        const fetchData = async () => {
            const v = await axiosInstance.get(Api.vendor);
            const h = await axiosInstance.get(Api.allHubs);
            // const p = await axiosInstance.get(`${Api.products}?size=10000`);
            setVendors(v?.data?.vendors || []);
            setHubs(h?.data?.hubs || []);
            // setProducts(p?.data?.products || []);
        };
        fetchData();
    }, []);

    // useEffect(() => {
    //     if (search) {
    //         fetchProducts();
    //     }
    // }, [search]);

    const handleBarcodeScan = async (barcode: string) => {
        if (!barcode) return;

        try {
            const res = await axiosInstance.get(
                `${Api.products}?barcode=${barcode}`
            );

            const product = res?.data?.products?.[0];

            if (!product) {
                toast.error("Product not found ❌");
                return;
            }

            let updatedItems = [...form.items];

            // 🔥 CHECK FIRST ROW EMPTY
            const isFirstRowEmpty =
                updatedItems.length === 1 &&
                !updatedItems[0].product;

            if (isFirstRowEmpty) {
                // ✅ REPLACE FIRST ROW
                updatedItems[0] = {
                    product: product.id,
                    products: [product],
                    item_name: product.name,
                    received_quantity: 1,
                    rate: Number(product.price || 0),
                    discount_type: "PERCENT",
                    discount_value: 0,
                    tax_percentage: Number(product.tax || 0),
                    serial_numbers: [],
                    amount: 0,
                    expiry_date: "",
                    batch_number: ""
                };
            } else {
                // 🔍 CHECK EXISTING
                const existingIndex = updatedItems.findIndex(
                    (i: any) => i.product === product.id
                );

                if (existingIndex !== -1) {
                    // ✅ INCREASE QTY
                    updatedItems[existingIndex].received_quantity += 1;
                } else {
                    // ✅ ADD NEW ROW
                    updatedItems.push({
                        product: product.id,
                        products: [product],
                        item_name: product.name,
                        received_quantity: 1,
                        rate: Number(product.price || 0),
                        discount_type: "PERCENT",
                        discount_value: 0,
                        tax_percentage: Number(product.tax || 0),
                        serial_numbers: [],
                        amount: 0,
                        expiry_date: "",
                        batch_number: ""
                    });
                }
            }

            // 🔥 RECALCULATE
            updatedItems = updatedItems.map((item) => {
                const qty = Number(item.received_quantity || 0);
                const rate = Number(item.rate || 0);
                const discount = Number(item.discount_value || 0);
                const tax = Number(item.tax_percentage || 0);

                let amount = qty * rate;

                if (item.discount_type === "PERCENT")
                    amount -= (amount * discount) / 100;
                else amount -= discount;

                amount += (amount * tax) / 100;

                return { ...item, amount };
            });

            setForm({ ...form, items: updatedItems });

        } catch (err) {
            toast.error("Something went wrong 🚨");
        }
    };

    const handleExcelUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        const items = await Promise.all(
            jsonData.map(async (row) => {
                try {
                    // ✅ normalize keys (important)
                    const barcode = row.Barcode || row.barcode;
                    const qty = Number(row.Qty || row.qty || 1);
                    const price = Number(row.Price || row.price || 0);
                    const tax = Number(row.Tax || row.tax || 0);

                    if (!barcode) return null;

                    // 🔥 fetch product using barcode
                    const res = await axiosInstance.get(
                        `${Api.products}?barcode=${barcode}`
                    );

                    const product = res?.data?.products?.[0];
                    if (!product) return null;

                    return {
                        product: product.id,
                        products: [product],
                        item_name: product.name,

                        // ✅ FROM EXCEL (NOT API)
                        received_quantity: qty,
                        rate: price,
                        tax_percentage: tax,

                        discount_type: "PERCENT",
                        discount_value: 0,

                        serial_numbers: [],
                        amount: qty * price,
                    };
                } catch (err) {
                    console.error("Row failed:", row);
                    return null;
                }
            })
        );

        const filtered = items.filter(Boolean);

        setForm({
            ...form,
            items: filtered,
        });
    };

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

        if (field === "received_quantity") {
            const qty = Number(value);
            let serials = updated[i].serial_numbers || [];

            if (qty > serials.length) {
                serials = [...serials, ...Array(qty - serials.length).fill("")];
            } else if (qty < serials.length && !updated[i].manuallyUpdatingSerials) {
                // Only trim if NOT coming from a serial scan increase
                serials = serials.slice(0, qty);
            }
            updated[i].serial_numbers = serials;
        }

        // 🔥 FIX: use row products
        if (field === "product") {
            const product = (updated[i].products || []).find(
                (p: any) => p.id === value
            );
            updated[i].item_name = product?.name || "";
        }

        const qty = Number(updated[i].received_quantity || 0);
        const rate = Number(updated[i].rate || 0);
        const discount = Number(updated[i].discount_value || 0);
        const tax = Number(updated[i].tax_percentage || 0);

        let amount = qty * rate;

        if (updated[i].discount_type === "PERCENT")
            amount -= (amount * discount) / 100;
        else amount -= discount;

        amount += (amount * tax) / 100;

        updated[i].amount = amount;

        setForm({ ...form, items: updated });
    };

    // const handleSerialChange = (i: number, index: number, value: string) => {
    //     const updatedItems = [...form.items];
    //     updatedItems[i].serial_numbers[index] = value;
    //     setForm({ ...form, items: updatedItems });
    // };

    // const handleSerialScan = (serial: string, rowIndex: number) => {
    //     if (!serial) return;

    //     const updatedItems = [...form.items];
    //     const row = updatedItems[rowIndex];

    //     if (!row || !row.product) {
    //         toast.error("Please select a product first ❌");
    //         return;
    //     }

    //     const existingSerials = row.serial_numbers || [];
    //     if (existingSerials.includes(serial)) {
    //         toast.error("Serial already added ⚠️");
    //         return;
    //     }

    //     // Add the new serial
    //     const newSerials = [...existingSerials, serial];

    //     // Update the item and trigger the amount calculation via handleItemChange
    //     handleItemChange(rowIndex, "serial_numbers", newSerials);
    //     handleItemChange(rowIndex, "quantity", newSerials.length);
    // };

    const addItem = () => {
        setForm({
            ...form,
            items: [
                ...form.items,
                {
                    category: "",
                    product: "",
                    products: [], // 🔥 MUST
                    item_name: "",
                    received_quantity: 1,
                    serial_numbers: [""],
                    rate: 0,
                    discount_type: "PERCENT",
                    discount_value: 0,
                    tax_percentage: 0,
                    amount: 0,
                    expiry_date: "",
                    batch_number: ""
                },
            ],
        });
    };

    const removeItem = (index: number) => {
        const updated = [...form.items];
        updated.splice(index, 1);
        setForm({ ...form, items: updated });
    };

    // const total = form.items.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const formatDateTime = (date: string) => {
                if (!date) return null;
                return new Date(date).toISOString();
            };

            const amount =
                amountType === "full"
                    ? selectedGRN?.excess_amount
                    : selectedGRN?.used_amount;

            // 1. Build initial payload
            const payload: any = {
                ...form,
                previous_grn_id: selectedGRN?.id,
                ...(Number.isFinite(amount)
                    ? {
                        payment_amount: Number(amount.toFixed(4)),
                    }
                    : {}),
                items: form?.items?.map((i: any) => ({
                    product: i.product,
                    item_name: i.item_name,
                    received_quantity: Number(i.received_quantity),
                    rate: Number(i.rate),
                    unit: "Units",
                    description: i.description || "",
                    discount_type: i.discount_type,
                    discount_value: Number(i.discount_value),
                    tax_percentage: Number(i.tax_percentage),
                    serial_numbers: (i.serial_numbers || []).filter((sn: string) => sn),
                    expiry_date: i?.expiry_date,
                    batch_number: 1,
                })),
            };

            // 2. CHECK: Amount 0-va illama irundha mattum payment key-ah add pannu
            const paidAmount = Number(form.initial_payment.amount_paid);

            if (paidAmount > 0) {
                payload.initial_payments = [
                    {
                        ...form.initial_payment,
                        payment_date: formatDateTime(form.initial_payment.payment_date),
                        amount_paid: paidAmount,
                    },
                ];
            } else {
                // Amount 0-na indha key-ayum delete pannidu, empty array-um anupadha
                delete payload.initial_payments;
            }

            // initial_payment (singular) key-a clean panna marandhuradha
            delete payload.initial_payment;

            // 3. Clean other empty strings/nulls
            const cleanedUser = removeEmptyFields(payload);

            console.log("Payload being sent:", cleanedUser);

            const endpoint = editData ? `${Api.purchaseGRN}/${editData.id}/` : Api.purchaseGRN;
            const method = editData ? axiosInstance.put : axiosInstance.post;

            const response = await method(endpoint, cleanedUser);
            if (response) {
                setForm(initialState);
                setApiErrors("");
                onSuccess();
                onClose();
            }

        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSerialScan = (value: string, i: number) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        const newItems = [...form.items];
        const item = newItems[i];
        if (!item) return;

        let serials = [...(item.serial_numbers || [])];

        // ✅ Duplicate check
        const isDuplicate = serials.some(
            (sn) => sn.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (isDuplicate) {
            toast.error(`Serial Number "${trimmedValue}" already added! ⚠️`);
            return;
        }

        // ✅ Add serial
        const emptyIndex = serials.findIndex((sn) => !sn || sn.trim() === "");

        if (emptyIndex !== -1) {
            serials[emptyIndex] = trimmedValue;
        } else if (serials.length < Number(item.received_quantity)) { // ✅ FIXED
            serials.push(trimmedValue);
        } else {
            toast.error("Quantity limit reached! 🛑");
            return;
        }

        newItems[i] = {
            ...item,
            serial_numbers: serials,
        };

        setForm((prev: any) => ({
            ...prev,
            items: newItems,
        }));
    };

    const handleSerialChange = (
        itemIndex: number,
        serialIndex: number,
        value: string
    ) => {
        const newItems = [...form.items];

        if (newItems[itemIndex]?.serial_numbers) {
            newItems[itemIndex].serial_numbers[serialIndex] = value;

            setForm((prev: any) => ({
                ...prev,
                items: newItems,
            }));
        }
    };

    const handleClose = () => {
        setForm(initialState);
        setApiErrors("");
        onClose();
        setSelectedGRN("");
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
                            {editData ? "Edit Purchase Order" : "Create Grn Order"}
                        </h2>
                        {/* <p className="text-xs text-gray-500 mt-0.5">Fill in the details to generate a PO</p> */}
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
                            <label className={labelClass}>Invoice number</label>
                            <input type="text" className={inputClass} placeholder="Enter Invoice #" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
                        </div>
                    </div>

                    {/* DATES & TERMS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            ["Invoice Date", "invoice_date", "date"],
                            ["Received Date", "received_date", "date"],
                            ["Gate Pass Number", "gate_pass_number", "text"],
                            // ["Currency", "currency", "text"],
                        ].map(([label, key, type]: any) => (
                            <div key={key}>
                                <label className={labelClass}>{label}</label>
                                <input type={type} className={inputClass} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                            </div>
                        ))}
                    </div>

                    {/* ADDRESSES */}
                    {/* <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Bill To</label>
                            <textarea rows={2} className={inputClass} placeholder="Billing Address..." value={form.bill_to} onChange={(e) => setForm({ ...form, bill_to: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Ship To</label>
                            <textarea rows={2} className={inputClass} placeholder="Shipping Address..." value={form.ship_to} onChange={(e) => setForm({ ...form, ship_to: e.target.value })} />
                        </div>
                    </div> */}

                    {/* ITEMS TABLE */}
                    <div>
                        <div className="flex gap-5 justify-between items-center mb-3">
                            <div className="flex gap-5 items-center mb-3">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">Order Items</h3>
                                <input
                                    type="text"
                                    placeholder="Scan barcode..."
                                    className="border px-3 py-2 rounded-lg w-80"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleBarcodeScan(search);
                                            setSearch(""); // 🔥 clear after scan
                                        }
                                    }}
                                />
                                {/* <button onClick={addItem} className="text-orange-600 hover:text-orange-700 text-sm font-bold flex items-center gap-1">
                                <Plus size={16} /> Add Item
                            </button> */}
                            </div>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                id="excelUpload"
                                className="hidden"
                                onChange={handleExcelUpload}
                            />

                            <button
                                onClick={() => document.getElementById("excelUpload")?.click()}
                                className="px-8 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-lg shadow-orange-200 flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Upload Excel"}
                            </button>
                        </div>
                        {/* TABLE WRAPPER - Idhu dhaan cut aaguradha prevent pannum */}
                        <div className="w-full overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1100px]">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-200">
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">Product Info</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest w-80">Inventory & Serials</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest w-40">Pricing & Tax</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest w-48">Discounts</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest w-48">Expiry</th>
                                        <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">Final Amount</th>
                                        <th className="px-4 py-4 text-center w-14"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {form.items.map((it: any, i: number) => (
                                        <tr key={i} className="hover:bg-blue-50/20 transition-all group">

                                            {/* 1. PRODUCT INFO */}
                                            <td className="px-4 py-5 align-top space-y-2">
                                                <div className="group/select relative">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 ml-1">Product</p>
                                                    <select
                                                        className="w-full bg-white border-2 border-gray-100 focus:border-orange-500 focus:ring-0 text-xs font-bold rounded-xl p-2.5 transition-all outline-none disabled:bg-gray-50"
                                                        value={it.product}
                                                        disabled
                                                        onChange={(e) => handleItemChange(i, "product", e.target.value)}
                                                    >
                                                        <option value="">Select Product</option>
                                                        {(it?.products || [])?.map((p: any) => <option key={p?.id} value={p?.id}>{p?.name}</option>)}
                                                    </select>
                                                </div>
                                            </td>

                                            {/* 2. INVENTORY & SERIALS */}
                                            <td className="px-4 py-5 align-top">
                                                <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center justify-between mb-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase ml-1">Received Quantity</span>
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-transparent border-none focus:ring-0 text-sm font-black text-right"
                                                            value={it.received_quantity}
                                                            onChange={(e) => handleItemChange(i, "received_quantity", e.target.value)}
                                                        />
                                                    </div>
                                                    {/* Serial List Display */}
                                                    {it.serial_numbers?.length > 0 && (
                                                        <div className="bg-white border border-gray-100 rounded-xl p-2 max-h-32 overflow-y-auto space-y-1 shadow-inner">
                                                            {it.serial_numbers.map((sn: string, snIdx: number) => (
                                                                <div key={snIdx} className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                                                    <span className="text-[9px] font-black text-gray-400 w-4">{snIdx + 1}</span>
                                                                    <input
                                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-mono font-bold text-gray-600 p-0"
                                                                        value={sn}
                                                                        onChange={(e) => handleSerialChange(i, snIdx, e.target.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
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
                                                {form.items[i]?.serial_numbers?.length > 0 && (
                                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 max-h-32 overflow-y-auto grid grid-cols-1 gap-1 shadow-inner">
                                                        {form.items[i]?.serial_numbers?.map((sn: string, sIndex: number) => (
                                                            <input
                                                                key={sIndex}
                                                                value={sn}
                                                                onChange={(e) =>
                                                                    handleSerialChange(i, sIndex, e.target.value)
                                                                }
                                                                className="border px-2 py-1"
                                                                placeholder={`Serial ${sIndex + 1}`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                            </td>

                                            {/* 3. PRICING & TAX - Combined for better feel */}
                                            <td className="px-4 py-5 align-top space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase ml-1">Unit Rate (₹)</p>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border-2 border-gray-100 focus:border-orange-500 text-sm font-black rounded-xl p-2.5 transition-all outline-none"
                                                        value={it.rate}
                                                        onChange={(e) => handleItemChange(i, "rate", e.target.value)}
                                                    />
                                                </div>
                                                {/* 🔥 TAX INPUT - Now feels like a proper input */}
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-blue-500 uppercase ml-1">Tax Percentage (%)</p>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-blue-50/30 border-2 border-blue-100 focus:border-blue-500 text-sm font-black rounded-xl p-2.5 transition-all outline-none text-blue-700"
                                                            value={it.tax_percentage}
                                                            onChange={(e) => handleItemChange(i, "tax_percentage", e.target.value)}
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-blue-300 font-bold text-xs">%</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 4. DISCOUNTS */}
                                            <td className="px-4 py-5 align-top space-y-2">
                                                <p className="text-[9px] font-black text-gray-400 uppercase ml-1">Discount Config</p>
                                                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                                                    {['PERCENT', 'FIXED'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => handleItemChange(i, "discount_type", type)}
                                                            className={`flex-1 text-[9px] font-black py-1.5 rounded-lg transition-all ${it.discount_type === type ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                                                        >
                                                            {type === 'PERCENT' ? 'Percentage (%)' : 'Fixed (₹)'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="number"
                                                    className="w-full bg-white border-2 border-gray-100 focus:border-orange-500 text-sm font-black rounded-xl p-2.5 text-red-600 transition-all outline-none"
                                                    value={it.discount_value}
                                                    onChange={(e) => handleItemChange(i, "discount_value", e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4 align-top">
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    value={it.expiry_date || ""}
                                                    onChange={(e) => handleItemChange(i, "expiry_date", e.target.value)}
                                                    className="w-full border border-slate-200 p-2 rounded-md text-xs bg-white outline-none focus:border-indigo-500"
                                                />
                                            </td>

                                            {/* 5. FINAL AMOUNT */}
                                            <td className="px-4 py-5 align-top text-right">
                                                <div className="pt-2">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Row Total</p>
                                                    <p className="text-xl font-black text-gray-900 tracking-tighter">
                                                        ₹{Number(it?.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-green-500 mt-1 uppercase">Tax Incl.</p>
                                                </div>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-4 py-5 align-top text-center">
                                                <button
                                                    onClick={() => removeItem(i)}
                                                    className="mt-8 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={20} strokeWidth={2.5} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                    <div className="space-y-3">

                        {/* WALLET SELECT */}
                        {grnList?.length ? (
                            <>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500">
                                        Apply Wallet
                                    </label>

                                    <select
                                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                                        value={selectedGRN?.id || ""}
                                        onChange={(e) => {
                                            const grn = grnList.find(i => i.id === e.target.value);

                                            setSelectedGRN({
                                                ...grn,
                                                used_amount: 0
                                            });
                                            setAmountType("custom");
                                        }}
                                    >
                                        <option value="">Select Wallet</option>
                                        {grnList.map(grn => (
                                            <option key={grn.id} value={grn.id}>
                                                {grn.grn_number} (₹{grn.excess_amount})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedGRN && (
                                    <>

                                        {/* BALANCE */}
                                        {selectedGRN && (
                                            <div className="text-xs text-gray-500">
                                                Wallet Balance:
                                                <span className="ml-1 font-semibold text-gray-800">
                                                    ₹{selectedGRN.excess_amount}
                                                </span>
                                            </div>
                                        )}

                                        {/* RADIO OPTIONS */}
                                        {selectedGRN && (
                                            <div className="flex gap-4 text-sm">
                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="radio"
                                                        name="amountType"
                                                        value="full"
                                                        checked={amountType === "full"}
                                                        onChange={() => {
                                                            setAmountType("full");

                                                            setSelectedGRN((prev: any) => ({
                                                                ...prev,
                                                                used_amount: Math.min(
                                                                    prev.excess_amount,
                                                                    grandTotal
                                                                )
                                                            }));
                                                        }}
                                                    />
                                                    Full Amount
                                                </label>

                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="radio"
                                                        name="amountType"
                                                        value="custom"
                                                        checked={amountType === "custom"}
                                                        onChange={() => {
                                                            setAmountType("custom");

                                                            setSelectedGRN((prev: any) => ({
                                                                ...prev,
                                                                used_amount: 0
                                                            }));
                                                        }}
                                                    />
                                                    Custom
                                                </label>
                                            </div>
                                        )}

                                        {/* INPUT */}
                                        {selectedGRN && (
                                            <input
                                                type="number"
                                                disabled={amountType === "full"}
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                placeholder="Enter amount"
                                                value={selectedGRN.used_amount || ""}
                                                max={selectedGRN.excess_amount}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);

                                                    if (val > selectedGRN.excess_amount) return;

                                                    setSelectedGRN((prev: any) => ({
                                                        ...prev,
                                                        used_amount: val
                                                    }));
                                                }}
                                            />
                                        )}
                                    </>
                                )}

                            </>
                        ) : ''}




                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700">Initial Payment</h3>

                            <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">


                                <div>
                                    <label className={labelClass}>Date</label>
                                    <input
                                        type="datetime-local"
                                        className={inputClass}
                                        value={form?.initial_payment?.payment_date}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form?.initial_payment,
                                                    payment_date: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>


                                <div>
                                    <label className={labelClass}>Method</label>
                                    <select
                                        className={inputClass}
                                        value={form?.initial_payment?.payment_method}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form?.initial_payment,
                                                    payment_method: e.target.value,
                                                },
                                            })
                                        }
                                    >
                                        <option value="">Select Method</option>
                                        <option value="CASH">CASH</option>
                                        <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                                        <option value="UPI">UPI</option>
                                        <option value="CHEQUE">CHEQUE</option>

                                    </select>
                                </div>


                                <div className="col-span-2">
                                    <label className={labelClass}>Reference / Notes</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="Transaction ID or notes"
                                        value={form?.initial_payment?.payment_reference}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form?.initial_payment,
                                                    payment_reference: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>


                                <div className="col-span-2">
                                    <label className={labelClass}>
                                        Amount (Max: ₹{afterWalletTotal ? afterWalletTotal : ""})
                                    </label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        value={form?.initial_payment?.amount_paid}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                initial_payment: {
                                                    ...form?.initial_payment,
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

                            {/* <div className="bg-gray-900 text-white p-5 rounded-2xl mt-6 flex justify-between items-center shadow-lg">
                                <span className="text-gray-400 font-medium">Grand Total</span>
                                <div className="text-2xl font-bold flex items-center gap-1 text-orange-400">
                                    <IndianRupee size={24} /> {total.toLocaleString('en-IN')}
                                </div>
                            </div> */}

                            <div className="bg-gray-900 text-white px-6 py-4 rounded-lg">

                                {/* ORIGINAL */}
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Grand Total</span>
                                    <span>₹ {total.toLocaleString('en-IN')}</span>
                                </div>

                                {/* WALLET */}
                                {walletUsed > 0 && (
                                    <div className="flex justify-between text-xs text-green-400">
                                        <span>Wallet Applied</span>
                                        <span>- ₹ {walletUsed}</span>
                                    </div>
                                )}

                                {/* PAYABLE */}
                                <div className="flex justify-between text-sm font-bold mt-1">
                                    <span>Payable</span>
                                    <span>₹ {afterWalletTotal ? afterWalletTotal : total.toLocaleString('en-IN')}</span>
                                </div>

                                {/* BALANCE */}
                                {paymentAmount > 0 && (
                                    <div className="flex justify-between text-xs text-red-400 mt-1">
                                        <span>Balance</span>
                                        <span>₹ {balanceAmount}</span>
                                    </div>
                                )}

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
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Purchase Order"}
                        </button>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default GrnOrderModal;