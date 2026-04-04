import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Api from "../../api-endpoints/ApiUrls";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const InventoryModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
}) => {
    const [products, setProducts] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [vendors, setVendors] = useState<any[]>([]);

    const [form, setForm] = useState({
        product_id: "",
        hub_id: "",
        stock_in_hub: 1,
        vendor_id: "",
        purchase: {
            mrp: "",
            amount: "",
            gst_amount: "",
            gst_percent: "",
            gst_included: false,
        },
    });

    const [serialNumbers, setSerialNumbers] = useState<string[]>([""]);

    const resetForm = () => {
        setForm({
            product_id: "",
            hub_id: "",
            stock_in_hub: 1,
            vendor_id: "",
            purchase: {
                mrp: "",
                amount: "",
                gst_amount: "",
                gst_percent: "",
                gst_included: false,
            },
        });
        setSerialNumbers([""]);
        setApiErrors("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(
                `${Api.vendor}?size=10000`
            );
            setVendors(response.data?.vendors || []);
        } catch (error) {
            console.error("Failed:", error);
        } finally {
            setLoading(false);
        }
    };
    // FETCH
    useEffect(() => {
        if (!show) return;

        const fetchData = async () => {
            const prod = await axiosInstance.get(`${Api?.products}?size=1000`);
            const hubRes = await axiosInstance.get(Api?.allHubs);
            setProducts(prod?.data?.products);
            setHubs(hubRes.data?.hubs || []);
        };

        fetchData();
    }, [show]);

    // 🔥 SYNC SERIAL WITH STOCK
    useEffect(() => {
        setSerialNumbers((prev) =>
            Array.from({ length: form.stock_in_hub }, (_, i) => prev[i] || "")
        );
    }, [form.stock_in_hub]);

    // SERIAL CHANGE
    const handleSerialChange = (index: number, value: string) => {
        setSerialNumbers((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    // ADD SERIAL
    const handleAddSerial = () => {
        setSerialNumbers((prev) => [...prev, ""]);
        setForm((prev) => ({
            ...prev,
            stock_in_hub: prev.stock_in_hub + 1,
        }));
    };

    // REMOVE SERIAL
    const handleRemoveSerial = (index: number) => {
        setSerialNumbers((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated.length ? updated : [""];
        });

        setForm((prev) => ({
            ...prev,
            stock_in_hub: Math.max(1, prev.stock_in_hub - 1),
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const trimmed = serialNumbers.map((sn) => sn.trim());

        if (trimmed.some((sn) => !sn)) {
            setApiErrors("All serial numbers are required");
            return;
        }

        try {
            setLoading(true);

            await axiosInstance.post(`${Api.productInventory}/`, {
                ...form,
                serial_numbers: trimmed, // ✅ added
            });

            onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
            setApiErrors("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-screen overflow-y-auto no-scrollbar">

                {/* HEADER */}
                <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <h2 className="text-lg font-semibold">Create Inventory</h2>
                    <p className="text-xs opacity-80">Add stock with serial numbers</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">

                    {/* GRID FIELDS */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* PRODUCT */}
                        <div>
                            <label className="text-xs text-gray-500">Product</label>
                            <select
                                required
                                value={form.product_id}
                                onChange={(e) =>
                                    setForm({ ...form, product_id: e.target.value })
                                }
                                className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                            >
                                <option value="">Select</option>
                                {products?.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* HUB */}
                        <div>
                            <label className="text-xs text-gray-500">Hub</label>
                            <select
                                required
                                value={form.hub_id}
                                onChange={(e) =>
                                    setForm({ ...form, hub_id: e.target.value })
                                }
                                className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                            >
                                <option value="">Select</option>
                                {hubs.map((h) => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* STOCK */}
                    <div>
                        <label className="text-xs text-gray-500">Stock</label>
                        <input
                            type="number"
                            min="1"
                            value={form.stock_in_hub}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    stock_in_hub: Number(e.target.value),
                                })
                            }
                            className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    {/* VENDOR */}
                    <div>
                        <label className="text-xs text-gray-500">Vendor</label>
                        <select
                            required
                            value={form.vendor_id}
                            onChange={(e) =>
                                setForm({ ...form, vendor_id: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded-lg mt-1"
                        >
                            <option value="">Select Vendor</option>
                            {vendors?.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Purchase Details</h3>

                        <div className="grid grid-cols-2 gap-4">

                            <input
                                placeholder="MRP"
                                value={form.purchase.mrp}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        purchase: { ...form.purchase, mrp: e.target.value },
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />

                            <input
                                placeholder="Amount"
                                value={form.purchase.amount}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        purchase: { ...form.purchase, amount: e.target.value },
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />

                            <input
                                placeholder="GST %"
                                value={form.purchase.gst_percent}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        purchase: { ...form.purchase, gst_percent: e.target.value },
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />

                            <input
                                placeholder="GST Amount"
                                value={form.purchase.gst_amount}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        purchase: { ...form.purchase, gst_amount: e.target.value },
                                    })
                                }
                                className="border px-3 py-2 rounded-lg"
                            />

                        </div>

                        {/* GST INCLUDED */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.purchase.gst_included}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        purchase: {
                                            ...form.purchase,
                                            gst_included: e.target.checked,
                                        },
                                    })
                                }
                            />
                            <label className="text-xs text-gray-600">GST Included</label>
                        </div>
                    </div>


                    {/* SERIAL HEADER */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-semibold">Serial Numbers</h3>
                            <p className="text-xs text-gray-400">
                                Enter one serial per item
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddSerial}
                            className="bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-orange-200"
                        >
                            <Plus size={14} /> Add
                        </button>
                    </div>

                    {/* SERIAL TABLE */}
                    <div className="border rounded-xl overflow-hidden">
                        {/* HEADER */}
                        <div className="grid grid-cols-[50px_1fr_50px] bg-gray-100 text-xs px-3 py-2 font-medium sticky top-0 z-10">
                            <span>#</span>
                            <span>Serial Number</span>
                            <span></span>
                        </div>

                        {/* BODY */}
                        <div className="max-h-56 overflow-y-auto">
                            {serialNumbers.map((sn, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[50px_1fr_50px] items-center border-t px-3 py-2 hover:bg-gray-50"
                                >
                                    <span className="text-xs text-gray-500">{index + 1}</span>

                                    <input
                                        type="text"
                                        value={sn}
                                        onChange={(e) =>
                                            handleSerialChange(index, e.target.value)
                                        }
                                        className="border px-2 py-1.5 rounded-md text-xs focus:ring-2 focus:ring-orange-400"
                                        placeholder="Enter serial number"
                                    />

                                    {serialNumbers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSerial(index)}
                                            className="text-red-500 hover:bg-red-100 rounded-md p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ERROR */}
                    {apiErrors && (
                        <p className="text-red-500 text-xs text-right">{apiErrors}</p>
                    )}

                    {/* ACTION */}
                    <div className="flex justify-end gap-3 pt-3 border-t">

                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border rounded-lg text-xs hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs flex items-center gap-2 hover:bg-orange-700"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Create Inventory
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryModal;