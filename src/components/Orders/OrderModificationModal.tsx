// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";
// import { Loader, Plus, Trash2 } from "lucide-react";

// const OrderModificationModal = ({ order, onClose, onSuccess }: any) => {
//     const [loading, setLoading] = useState(false);
//     const [services, setServices] = useState<any[]>([]);
//     const [products, setProducts] = useState<any[]>([]);
//     const [reason, setReason] = useState("");


//     const [items, setItems] = useState<any[]>([
//         {
//             modification_type: "REPLACE",
//             order_item_id: "",
//             new_entity_id: "",
//             item_type: "SERVICE",
//             quantity: 1,
//         },
//     ]);

//     const selectedIds = items
//         .map((i) => i.order_item_id)
//         .filter(Boolean);

//     // 🔥 FETCH
//     useEffect(() => {
//         fetchServices();
//         fetchProducts();
//     }, []);

//     const fetchServices = async () => {
//         try {
//             const res = await axiosInstance.get(Api.services, {
//                 params: {
//                     size: 10000,
//                     lat: order?.latitude,
//                     lng: order?.longitude,
//                 },
//             });
//             setServices(res?.data?.services || []);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const fetchProducts = async () => {
//         try {
//             const res = await axiosInstance.get(Api.products, {
//                 params: {
//                     size: 10000,
//                     lat: order?.latitude,
//                     lng: order?.longitude,
//                 },
//             });
//             setProducts(res?.data?.products || []);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     // 🔥 HANDLE CHANGE
//     const handleItemChange = (index: number, field: string, value: any) => {
//         const updated = [...items];
//         updated[index][field] = value;

//         // RESET WHEN TYPE CHANGE
//         if (field === "modification_type") {
//             updated[index] = {
//                 modification_type: value,
//                 order_item_id: "",
//                 new_entity_id: "",
//                 item_type: "SERVICE",
//                 quantity: 1,
//             };
//         }

//         // 🔥 REPLACE → AUTO DETECT TYPE
//         if (field === "order_item_id") {
//             const selected = order?.items?.find(
//                 (i: any) =>
//                     i.service_id === value || i.product_id === value
//             );

//             if (selected) {
//                 updated[index].item_type = selected.type; // SERVICE / PRODUCT
//             }
//         }

//         setItems(updated);
//     };

//     // ➕ ADD ROW
//     const addItem = () => {
//         setItems([
//             ...items,
//             {
//                 modification_type: "REPLACE",
//                 order_item_id: "",
//                 new_entity_id: "",
//                 item_type: "SERVICE",
//                 quantity: 1,
//             },
//         ]);
//     };

//     // ❌ REMOVE ROW
//     const removeItem = (index: number) => {
//         const updated = [...items];
//         updated.splice(index, 1);
//         setItems(updated);
//     };

//     // 🚀 SUBMIT
//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const payloadItems = items.map((item) => {
//                 let obj: any = {
//                     modification_type: item.modification_type,
//                     quantity: item.quantity,
//                 };

//                 if (item.modification_type === "REPLACE") {
//                     obj = {
//                         ...obj,
//                         order_item_id: item.order_item_id,
//                         item_type: item.item_type,
//                         new_entity_id: item.new_entity_id,
//                     };
//                 }

//                 if (item.modification_type === "ADD") {
//                     obj = {
//                         ...obj,
//                         item_type: item.item_type,
//                         new_entity_id: item.new_entity_id,
//                     };
//                 }

//                 if (item.modification_type === "REMOVE") {
//                     obj = {
//                         ...obj,
//                         order_item_id: item.order_item_id,
//                     };
//                 }

//                 return obj;
//             });

//             await axiosInstance.post(Api?.orderModification, {
//                 order_id: order.id,
//                 reason,
//                 items: payloadItems,
//             });

//             onSuccess();
//         } catch (err) {
//             console.log(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

//             <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col">

//                 {/* HEADER */}
//                 <div className="flex justify-between items-center px-6 py-4 border-b">
//                     <h2 className="text-lg font-semibold">Order Modification</h2>
//                     <button onClick={onClose}>✕</button>
//                 </div>

//                 {/* BODY */}
//                 <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">

//                     {items.map((item, index) => (
//                         <div key={index} className="border rounded-xl p-4 space-y-4">

//                             {/* TYPE */}
//                             <select
//                                 value={item.modification_type}
//                                 onChange={(e) =>
//                                     handleItemChange(index, "modification_type", e.target.value)
//                                 }
//                                 className="w-full border px-3 py-2 rounded-lg"
//                             >
//                                 <option value="REPLACE">Replace</option>
//                                 <option value="ADD">Add</option>
//                                 <option value="REMOVE">Remove</option>
//                             </select>

//                             {/* ORDER ITEM */}
//                             {(item.modification_type === "REPLACE" ||
//                                 item.modification_type === "REMOVE") && (
//                                     <select
//                                         value={item.order_item_id}
//                                         onChange={(e) =>
//                                             handleItemChange(index, "order_item_id", e.target.value)
//                                         }
//                                         className="w-full border px-3 py-2 rounded-lg"
//                                     >
//                                         <option value="">Select Order Item</option>

//                                         {/* {order?.items?.map((o: any) => (
//                     <option
//                       key={o.service_id || o.product_id}
//                       value={o.service_id || o.product_id}
//                     >
//                       {o?.item_details?.name} ({o.type})
//                     </option>
//                   ))} */}
//                                         {order?.items
//                                             ?.filter(
//                                                 (o: any) =>
//                                                     !selectedIds.includes(o.service_id || o.product_id) ||
//                                                     (o.service_id || o.product_id) === item.order_item_id
//                                             )
//                                             .map((o: any) => (
//                                                 <option
//                                                     key={o.service_id || o.product_id}
//                                                     value={o.service_id || o.product_id}
//                                                 >
//                                                     {o?.item_details?.name} ({o.type})
//                                                 </option>
//                                             ))}
//                                     </select>
//                                 )}

//                             {/* ADD TYPE SELECT */}
//                             {item.modification_type === "ADD" && (
//                                 <select
//                                     value={item.item_type}
//                                     onChange={(e) =>
//                                         handleItemChange(index, "item_type", e.target.value)
//                                     }
//                                     className="w-full border px-3 py-2 rounded-lg"
//                                 >
//                                     <option value="SERVICE">Service</option>
//                                     <option value="PRODUCT">Product</option>
//                                 </select>
//                             )}

//                             {/* NEW ENTITY */}
//                             {(item.modification_type === "REPLACE" ||
//                                 item.modification_type === "ADD") && (
//                                     <select
//                                         value={item.new_entity_id}
//                                         onChange={(e) =>
//                                             handleItemChange(index, "new_entity_id", e.target.value)
//                                         }
//                                         className="w-full border px-3 py-2 rounded-lg"
//                                     >
//                                         <option value="">Select {item.item_type}</option>

//                                         {(item.item_type === "SERVICE"
//                                             ? services
//                                             : products
//                                         ).map((d: any) => (
//                                             <option key={d.id} value={d.id}>
//                                                 {d.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 )}

//                             {/* QUANTITY */}
//                             <input
//                                 type="number"
//                                 value={item.quantity}
//                                 onChange={(e) =>
//                                     handleItemChange(index, "quantity", Number(e.target.value))
//                                 }
//                                 className="w-full border px-3 py-2 rounded-lg"
//                             />

//                             {/* REMOVE */}
//                             {items.length > 1 && (
//                                 <button
//                                     type="button"
//                                     onClick={() => removeItem(index)}
//                                     className="text-red-500 text-sm flex items-center gap-1"
//                                 >
//                                     <Trash2 size={14} /> Remove
//                                 </button>
//                             )}

//                         </div>
//                     ))}

//                     {/* ADD BUTTON */}
//                     <button
//                         type="button"
//                         onClick={addItem}
//                         className="flex items-center gap-2 text-orange-600"
//                     >
//                         <Plus size={16} /> Add Item
//                     </button>

//                     {/* REASON */}
//                     <textarea
//                         placeholder="Reason"
//                         value={reason}
//                         onChange={(e) => setReason(e.target.value)}
//                         className="w-full border px-3 py-2 rounded-lg"
//                     />

//                     {/* FOOTER */}
//                     <div className="flex justify-end gap-3 pt-4 border-t">
//                         <button onClick={onClose} type="button" className="px-4 py-2 border rounded-lg">
//                             Cancel
//                         </button>

//                         <button type="submit" className="px-5 py-2 bg-orange-600 text-white rounded-lg">
//                             {loading ? <Loader className="animate-spin" size={16} /> : "Submit"}
//                         </button>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// };

// export default OrderModificationModal;

import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader, Plus, Trash2 } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const OrderModificationModal = ({ order, onClose, onSuccess }: any) => {
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [reason, setReason] = useState("");
    const [apiErrors, setApiErrors] = useState<string>("");

    const [items, setItems] = useState<any[]>([
        {
            modification_type: "REPLACE",
            order_item_id: "",
            new_entity_id: "",
            item_type: "SERVICE",
            quantity: 1,
        },
    ]);

    // 🔥 styles
    const labelClass = "text-xs font-semibold text-gray-500";
    const inputClass =
        "w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white";

    const selectedIds = items.map((i) => i.order_item_id).filter(Boolean);

    useEffect(() => {
        fetchServices();
        fetchProducts();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axiosInstance.get(Api.services, {
                params: {
                    size: 10000,
                    lat: order?.latitude,
                    lng: order?.longitude,
                },
            });
            setServices(res?.data?.services || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axiosInstance.get(Api.products, {
                params: {
                    size: 10000,
                    lat: order?.latitude,
                    lng: order?.longitude,
                },
            });
            setProducts(res?.data?.products || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const updated = [...items];
        updated[index][field] = value;

        if (field === "modification_type") {
            updated[index] = {
                modification_type: value,
                order_item_id: "",
                new_entity_id: "",
                item_type: "SERVICE",
                quantity: 1,
            };
        }

        if (field === "order_item_id") {
            const selected = order?.items?.find(
                (i: any) =>
                    i.service_id === value || i.product_id === value
            );

            if (selected) {
                updated[index].item_type = selected.type;
            }
        }

        setItems(updated);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                modification_type: "REPLACE",
                order_item_id: "",
                new_entity_id: "",
                item_type: "SERVICE",
                quantity: 1,
            },
        ]);
    };

    const removeItem = (index: number) => {
        const updated = [...items];
        updated.splice(index, 1);
        setItems(updated);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setApiErrors('')
        try {
            const payloadItems = items.map((item) => {
                let obj: any = {
                    modification_type: item.modification_type,
                    quantity: item.quantity,
                };

                if (item.modification_type === "REPLACE") {
                    obj = {
                        ...obj,
                        order_item_id: item.order_item_id,
                        item_type: item.item_type,
                        new_entity_id: item.new_entity_id,
                    };
                }

                if (item.modification_type === "ADD") {
                    obj = {
                        ...obj,
                        item_type: item.item_type,
                        new_entity_id: item.new_entity_id,
                    };
                }

                if (item.modification_type === "REMOVE") {
                    obj = {
                        ...obj,
                        order_item_id: item.order_item_id,
                    };
                }

                return obj;
            });

            await axiosInstance.post(Api?.orderModification, {
                order_id: order.id,
                reason,
                items: payloadItems,
            });

            onSuccess();
        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] flex flex-col">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Order Modification</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">

                    {items.map((item, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-5 shadow-sm">

                            {/* TYPE */}
                            <div className="space-y-1">
                                <label className={labelClass}>Modification Type</label>
                                <select
                                    value={item.modification_type}
                                    onChange={(e) =>
                                        handleItemChange(index, "modification_type", e.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="REPLACE">Replace</option>
                                    <option value="ADD">Add</option>
                                    <option value="REMOVE">Remove</option>
                                </select>
                            </div>

                            {/* ORDER ITEM */}
                            {(item.modification_type === "REPLACE" ||
                                item.modification_type === "REMOVE") && (
                                    <div className="space-y-1">
                                        <label className={labelClass}>Order Item</label>
                                        <select
                                            value={item.order_item_id}
                                            onChange={(e) =>
                                                handleItemChange(index, "order_item_id", e.target.value)
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">Select Order Item</option>

                                            {order?.items
                                                ?.filter(
                                                    (o: any) =>
                                                        !selectedIds.includes(o.service_id || o.product_id) ||
                                                        (o.service_id || o.product_id) === item.order_item_id
                                                )
                                                .map((o: any) => (
                                                    <option
                                                        key={o.id}
                                                        value={o.id}
                                                    >
                                                        {o?.item_details?.name} ({o.type})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                            {/* ADD TYPE */}
                            {item.modification_type === "ADD" && (
                                <div className="space-y-1">
                                    <label className={labelClass}>Item Type</label>
                                    <select
                                        value={item.item_type}
                                        onChange={(e) =>
                                            handleItemChange(index, "item_type", e.target.value)
                                        }
                                        className={inputClass}
                                    >
                                        <option value="SERVICE">Service</option>
                                        <option value="PRODUCT">Product</option>
                                    </select>
                                </div>
                            )}

                            {/* NEW ENTITY */}
                            {(item.modification_type === "REPLACE" ||
                                item.modification_type === "ADD") && (
                                    <div className="space-y-1">
                                        <label className={labelClass}>
                                            {item.modification_type === "REPLACE"
                                                ? "Replace With"
                                                : "Select Item"}
                                        </label>
                                        <select
                                            value={item.new_entity_id}
                                            onChange={(e) =>
                                                handleItemChange(index, "new_entity_id", e.target.value)
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">Select {item.item_type}</option>

                                            {(item.item_type === "SERVICE"
                                                ? services
                                                : products
                                            ).map((d: any) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                            {/* QUANTITY */}
                            <div className="space-y-1">
                                <label className={labelClass}>Quantity</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(index, "quantity", Number(e.target.value))
                                    }
                                    className={inputClass}
                                />
                            </div>

                            {/* REMOVE BTN */}
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 text-xs flex items-center gap-1 hover:underline"
                                >
                                    <Trash2 size={14} /> Remove Item
                                </button>
                            )}
                        </div>
                    ))}

                    {/* ADD BUTTON */}
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 text-orange-600 font-medium"
                    >
                        <Plus size={16} /> Add Item
                    </button>

                    {/* REASON */}
                    <div className="space-y-1">
                        <label className={labelClass}>Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className={inputClass}
                            rows={3}
                            placeholder="Enter reason..."
                        />
                    </div>
                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            type="button"
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-5 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
                        >
                            {loading && <Loader className="animate-spin" size={16} />}
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModificationModal;