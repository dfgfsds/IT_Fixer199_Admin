// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import { Loader2 } from "lucide-react";
// import Api from "../../api-endpoints/ApiUrls";

// interface Props {
//     show: boolean;
//     onClose: () => void;
//     onSuccess: () => void;
// }

// const InventoryModal: React.FC<Props> = ({
//     show,
//     onClose,
//     onSuccess,
// }) => {
//     const [products, setProducts] = useState<any[]>([]);
//     const [hubs, setHubs] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [apiErrors, setApiErrors] = useState<string>("");

//     const initialForm = {
//         product_id: "",
//         hub_id: "",
//         stock_in_hub: 0,
//     };

//     const [form, setForm] = useState(initialForm);

//     const resetForm = () => {
//         setForm(initialForm);
//         setApiErrors("");
//     };

//     const handleClose = () => {
//         resetForm();
//         onClose();
//     };


//     const fetchData = async () => {
//         const prod = await axiosInstance.get(`${Api?.products}?size=1000`);
//         const hubRes = await axiosInstance.get(Api?.allHubs);
//         setProducts(prod?.data?.products);
//         setHubs(hubRes.data?.hubs || []);
//     };


//     useEffect(() => {
//         if (!show) return;



//         fetchData();
//     }, [show]);

//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         try {
//             setLoading(true);

//             const updatedApi = await axiosInstance.post(
//               `${Api?.productInventory}/`,
//                 form
//             );

//             if (updatedApi) {
//                 onSuccess();
//                 handleClose();
//             }

//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!show) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">

//             <div className="bg-white rounded-2xl w-full max-w-xl p-4">

//                 <h2 className="text-xl font-semibold mb-6">
//                     Create Inventory
//                 </h2>

//                 <form onSubmit={handleSubmit} className="space-y-5">

//                     {/* Product */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             Product *
//                         </label>
//                         <select
//                             required
//                             value={form.product_id}
//                             onChange={(e) =>
//                                 setForm({ ...form, product_id: e.target.value })
//                             }
//                             className="w-full border px-3 py-2 rounded-lg"
//                         >
//                             <option value="">Select Product</option>
//                             {products?.map((p) => (
//                                 <option key={p.id} value={p.id}>
//                                     {p.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Hub */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             Hub *
//                         </label>
//                         <select
//                             required
//                             value={form.hub_id}
//                             onChange={(e) =>
//                                 setForm({ ...form, hub_id: e.target.value })
//                             }
//                             className="w-full border px-3 py-2 rounded-lg"
//                         >
//                             <option value="">Select Hub</option>
//                             {hubs.map((h) => (
//                                 <option key={h.id} value={h.id}>
//                                     {h.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Stock */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             Stock *
//                         </label>
//                         <input
//                             type="number"
//                             min="0"
//                             required
//                             value={form.stock_in_hub}
//                             onChange={(e) =>
//                                 setForm({
//                                     ...form,
//                                     stock_in_hub: Number(e.target.value),
//                                 })
//                             }
//                             className="w-full border px-3 py-2 rounded-lg"
//                         />
//                     </div>
//                     {apiErrors && (
//                         <p className="text-red-500 mt-2 text-end">
//                             {apiErrors}
//                         </p>
//                     )}

//                     {/* Buttons */}
//                     <div className="flex justify-end gap-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             className="px-4 py-2 border rounded-lg"
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
//                         >
//                             {loading && <Loader2 size={16} className="animate-spin" />}
//                             {loading ? "Creating..." : "Create"}
//                         </button>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// };

// export default InventoryModal;


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

    const [form, setForm] = useState({
        product_id: "",
        hub_id: "",
        stock_in_hub: 1,
    });

    const [serialNumbers, setSerialNumbers] = useState<string[]>([""]);

    const resetForm = () => {
        setForm({
            product_id: "",
            hub_id: "",
            stock_in_hub: 1,
        });
        setSerialNumbers([""]);
        setApiErrors("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
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