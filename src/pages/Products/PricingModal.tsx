// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import { Loader, Plus, Trash2 } from "lucide-react";
// import Api from '../../api-endpoints/ApiUrls';
// import { extractErrorMessage } from "../../utils/extractErrorMessage ";

// interface Props {
//     show: boolean;
//     onClose: () => void;
//     product: any;
// }

// const PricingModal: React.FC<Props> = ({ show, onClose, product }) => {
//     const [priceTypes, setPriceTypes] = useState<any[]>([]);
//     const [hubs, setHubs] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [apiErrors, setApiErrors] = useState<string>("");
//     const [pricingList, setPricingList] = useState<any[]>([
//         {
//             id: '',
//             pricing_type: "",
//             hub: "",
//             start_time: "",
//             end_time: "",
//             max_quantity: 1,
//             price: "",
//         },
//     ]);
//     const [editData, setEditData] = useState<any[]>([]);

//     useEffect(() => {
//         if (editData && editData.length > 0) {
//             setPricingList(
//                 editData.map((item: any) => ({
//                     pricing_type: item?.pricing_type || "",
//                     hub: item?.hub || "",
//                     start_time: item?.start_time
//                         ? item.start_time.slice(0, 5) // 👈 HH:mm only
//                         : "",
//                     end_time: item?.end_time
//                         ? item.end_time.slice(0, 5) // 👈 HH:mm only
//                         : "",
//                     max_quantity: item?.max_quantity || 1,
//                     price: item?.price || "",
//                     id: item?.id,
//                 }))
//             );
//         } else {
//             setPricingList([
//                 {
//                     pricing_type: "",
//                     hub: "",
//                     start_time: "",
//                     end_time: "",
//                     max_quantity: 1,
//                     price: "",
//                 },
//             ]);
//         }
//     }, [editData]);

//     useEffect(() => {
//         if (show) {
//             fetchHubs();
//             fetchPriceTypes();
//             getproductPricing();
//         } else {
//             // Reset when modal close
//             setPricingList([
//                 {
//                     pricing_type: "",
//                     hub: "",
//                     start_time: "",
//                     end_time: "",
//                     max_quantity: 1,
//                     price: "",
//                 },
//             ]);
//             setEditData([]);
//         }
//     }, [show]);


//     // useEffect(() => {
//     //     if (show) {
//     //         fetchHubs();
//     //         fetchPriceTypes();
//     //         getproductPricing();
//     //     }
//     // }, [show]);

//     const getproductPricing = async () => {
//         const res = await axiosInstance.get(`${Api?.products}/${product?.id}/pricing`);
//         setEditData(res?.data?.data?.pricing)
//     };

//     const fetchHubs = async () => {
//         const res = await axiosInstance.get(Api?.allHubs);
//         setHubs(res?.data?.hubs || []);
//     };

//     // ---------------- Handle Change ----------------
//     const handleChange = (index: number, field: string, value: any) => {
//         const updated = [...pricingList];
//         updated[index][field] = value;
//         setPricingList(updated);
//     };


//     const fetchPriceTypes = async () => {
//         const res = await axiosInstance.get(Api?.pricingType);
//         setPriceTypes(res?.data?.data || []);
//     };

//     // ---------------- Add Pricing Row ----------------
//     const addPricingRow = () => {
//         setPricingList([
//             ...pricingList,
//             {
//                 pricing_type: "",
//                 hub: "",
//                 start_time: "",
//                 end_time: "",
//                 max_quantity: 1,
//                 price: "",
//             },
//         ]);
//     };

//     // ---------------- Remove Pricing Row ----------------
//     const removePricingRow = (index: number) => {
//         const updated = [...pricingList];
//         updated.splice(index, 1);
//         setPricingList(updated);
//     };
//     console.log(product)
//     // ---------------- Submit ----------------
//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         setApiErrors("");
//         setLoading(true);
//         const payload = pricingList.map((item) => ({
//             // product: product.id,
//             pricing_type: item?.pricing_type,
//             hub: item?.hub,
//             start_time: item?.start_time,
//             end_time: item?.end_time,
//             max_quantity: item?.max_quantity,
//             price: item?.price,
//             ...(editData && item?.id ? { id: item.id } : {}),
//         }));
//         const pricingPayload = {
//             product: product.id,
//             pricing: payload
//         }
//         try {
//             const updateApi = await axiosInstance.post(Api?.pricingBulk, pricingPayload);
//             if (updateApi) {
//                 onClose();
//                 setLoading(false);
//             }
//         } catch (error) {
//             setLoading(false);
//             setApiErrors(extractErrorMessage(error));

//         }

//     };

//     if (!show || !product) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] no-scrollbar overflow-y-auto">

//                 <h2 className="text-xl font-semibold mb-6">
//                     Add Pricing - {product.name}
//                 </h2>

//                 <form onSubmit={handleSubmit} className="space-y-6">

//                     {pricingList.map((item, index) => (
//                         <div key={index} className="border rounded-lg p-4 space-y-4 relative">
//                             {index === 0 ? (
//                             <h1 className="text-base font-bold">Default Pricing</h1>
//                             ) : (
//                             <h1 className="text-base font-bold">Pricing {index + 1}</h1>
//                             )}
//                             {/* Remove Button */}
//                             {pricingList.length > 1 && (
//                                 <button
//                                     type="button"
//                                     onClick={() => removePricingRow(index)}
//                                     className="absolute top-2 right-2 text-red-600"
//                                 >
//                                     <Trash2 size={16} />
//                                 </button>
//                             )}

//                             {/* Type */}
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                     Product Type *
//                                 </label>
//                                 <select
//                                     value={item.pricing_type}
//                                     onChange={(e) =>
//                                         handleChange(index, "pricing_type", e.target.value)
//                                     }
//                                     className="w-full border rounded-lg px-3 py-2"
//                                     required
//                                 >
//                                     <option value="">Select Pricing type</option>
//                                     {priceTypes?.map((p) => (
//                                         <option key={p.id} value={p.id}>
//                                             {p.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Hub Select */}
//                             {index !== 0 && (
//                                 <div>
//                                     <label className="block text-sm font-medium mb-1">
//                                         Hub *
//                                     </label>
//                                     <select
//                                         value={item.hub}
//                                         onChange={(e) =>
//                                             handleChange(index, "hub", e.target.value)
//                                         }
//                                         className="w-full border rounded-lg px-3 py-2"
//                                         required
//                                     >
//                                         <option value="">Select Hub</option>
//                                         {hubs.map((hub) => (
//                                             <option key={hub.id} value={hub.id}>
//                                                 {hub.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             )}



//                             {/* Time */}
//                             {index !== 0 && (
//                                 <div className="grid grid-cols-2 gap-4">

//                                     <div>
//                                         <label className="block text-sm font-medium mb-1">
//                                             Start Time
//                                         </label>
//                                         <input
//                                             type="time"
//                                             value={item.start_time}
//                                             onChange={(e) =>
//                                                 handleChange(index, "start_time", e.target.value)
//                                             }
//                                             className="w-full border rounded-lg px-3 py-2"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium mb-1">
//                                             End Time
//                                         </label>
//                                         <input
//                                             type="time"
//                                             value={item.end_time}
//                                             onChange={(e) =>
//                                                 handleChange(index, "end_time", e.target.value)
//                                             }
//                                             className="w-full border rounded-lg px-3 py-2"
//                                         />
//                                     </div>

//                                 </div>
//                             )}

//                             {/* Quantity + Price */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 {index !== 0 && (
//                                     <div>
//                                         <label className="block text-sm font-medium mb-1">
//                                             Max Quantity
//                                         </label>
//                                         <input
//                                             type="number"
//                                             value={item.max_quantity}
//                                             onChange={(e) =>
//                                                 handleChange(index, "max_quantity", e.target.value)
//                                             }
//                                             className="w-full border rounded-lg px-3 py-2"
//                                         />
//                                     </div>
//                                 )}

//                                 <div>
//                                     <label className="block text-sm font-medium mb-1">
//                                         Price *
//                                     </label>
//                                     <input
//                                         type="number"
//                                         value={item.price}
//                                         onChange={(e) =>
//                                             handleChange(index, "price", e.target.value)
//                                         }
//                                         className="w-full border rounded-lg px-3 py-2"
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                         </div>
//                     ))}

//                     {/* Add Row Button */}
//                     <button
//                         type="button"
//                         onClick={addPricingRow}
//                         className="flex items-center text-sm text-orange-600 font-medium"
//                     >
//                         <Plus size={16} className="mr-1" />
//                         Add Another Pricing
//                     </button>

//                     {/* Error */}
//                     {apiErrors && (
//                         <p className="text-red-500 mt-2 text-end px-6">
//                             {apiErrors}
//                         </p>
//                     )}

//                     {/* Footer */}
//                     <div className="flex justify-end gap-3 pt-4 border-t">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-4 py-2 border rounded-lg"
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-4 py-2 bg-green-600 text-white rounded-lg"
//                         >

//                             {loading ? (
//                                 <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Save Pricing"}

//                         </button>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// };

// export default PricingModal;



import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Loader, Plus, Trash2, X } from "lucide-react";
import Select from "react-select";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

interface Props {
    show: boolean;
    onClose: () => void;
    product: any;
}

const PricingModal: React.FC<Props> = ({ show, onClose, product }) => {

    const [priceTypes, setPriceTypes] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    const [pricingList, setPricingList] = useState<any[]>([
        {
            id: '',
            pricing_type: "",
            hubs: [], // ✅ CHANGED TO ARRAY
            start_time: "",
            end_time: "",
            max_quantity: 1,
            price: "",
            is_default: true,
        },
    ]);

    const [editData, setEditData] = useState<any[]>([]);

    // ---------------- EDIT DATA ----------------
    useEffect(() => {
        if (editData && editData.length > 0) {

            const formatted = editData
                .map((item: any) => {
                    const isDefault =
                        !item.hub && !item.start_time && !item.end_time;

                    return {
                        pricing_type: item?.pricing_type || "",
                        hubs: item?.hub ? [item.hub] : [],
                        start_time: item?.start_time
                            ? item.start_time.slice(0, 5)
                            : "",
                        end_time: item?.end_time
                            ? item.end_time.slice(0, 5)
                            : "",
                        max_quantity: item?.max_quantity || 1,
                        price: item?.price || "",
                        id: item?.id,
                        is_default: isDefault,
                    };
                })
                .sort((a: any, b: any) => Number(b.is_default) - Number(a.is_default));

            setPricingList(formatted);

        } else {
            setPricingList([
                {
                    pricing_type: "",
                    hubs: [],
                    start_time: "",
                    end_time: "",
                    max_quantity: 1,
                    price: "",
                    is_default: true,
                },
            ]);
        }
    }, [editData]);

    // ---------------- MODAL ----------------
    useEffect(() => {
        if (show) {
            fetchHubs();
            fetchPriceTypes();
            getproductPricing();
        } else {
            setPricingList([
                {
                    pricing_type: "",
                    hubs: [],
                    start_time: "",
                    end_time: "",
                    max_quantity: 1,
                    price: "",
                    is_default: true,
                },
            ]);
            setEditData([]);
        }
    }, [show]);

    // ---------------- API ----------------
    const getproductPricing = async () => {
        const res = await axiosInstance.get(`${Api?.products}/${product?.id}/pricing`);
        setEditData(res?.data?.data?.pricing || []);
    };

    const fetchHubs = async () => {
        const res = await axiosInstance.get(Api?.allHubs);
        setHubs(res?.data?.hubs || []);
    };

    const fetchPriceTypes = async () => {
        const res = await axiosInstance.get(Api?.pricingType);
        setPriceTypes(res?.data?.data || []);
    };

    // ---------------- HANDLE CHANGE ----------------
    const handleChange = (index: number, field: string, value: any) => {
        const updated = [...pricingList];
        updated[index][field] = value;
        setPricingList(updated);
    };

    // ---------------- ADD ROW ----------------
    const addPricingRow = () => {
        setPricingList([
            ...pricingList,
            {
                pricing_type: "",
                hubs: [],
                start_time: "",
                end_time: "",
                max_quantity: 1,
                price: "",
                is_default: false,
            },
        ]);
    };

    // ---------------- REMOVE ROW ----------------
    const removePricingRow = (index: number) => {
        const updated = [...pricingList];
        updated.splice(index, 1);
        setPricingList(updated);
    };

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setApiErrors("");
        setLoading(true);

        // ✅ only one default validation
        const defaultCount = pricingList.filter((i) => i.is_default).length;

        if (defaultCount !== 1) {
            setApiErrors("One default pricing is required");
            setLoading(false);
            return;
        }

        const payload: any[] = [];

        pricingList.forEach((item) => {
            // If it's default or no hubs are selected, we treat it as one entry
            if (item.is_default || !item.hubs || item.hubs.length === 0) {
                payload.push({
                    pricing_type: item?.pricing_type,
                    hub: item?.is_default ? "" : null,
                    start_time: item?.start_time || null,
                    end_time: item?.end_time || null,
                    max_quantity: item?.max_quantity,
                    price: item?.price,
                    ...(item?.id ? { id: item.id } : {}),
                });
            } else {
                // If multiple hubs selected, create one record per hub
                item.hubs.forEach((hubId: string) => {
                    payload.push({
                        pricing_type: item?.pricing_type,
                        hub: hubId,
                        start_time: item?.start_time || null,
                        end_time: item?.end_time || null,
                        max_quantity: item?.max_quantity,
                        price: item?.price,
                        // id: is tricky here if we split; typically new records are created
                    });
                });
            }
        });

        const pricingPayload = {
            product: product.id,
            pricing: payload,
        };

        try {
            await axiosInstance.post(Api?.pricingBulk, pricingPayload);
            onClose();
        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!show || !product) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        Add Pricing - {product.name}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {pricingList.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 relative">

                            <h1 className="text-base font-bold">
                                {item.is_default
                                    ? "Default Pricing"
                                    : `Pricing ${index + 1}`}
                            </h1>

                            {pricingList.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePricingRow(index)}
                                    className="absolute top-2 right-2 text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-800 mb-1 block">
                                    Product Type *
                                </label>
                                <select
                                    value={item.pricing_type}
                                    onChange={(e) =>
                                        handleChange(index, "pricing_type", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    required
                                    disabled={item.is_default}
                                >
                                    <option value="">Select Pricing type</option>
                                    {priceTypes?.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hub Multi Select */}
                            {!item.is_default && (
                                <div>
                                    <label className="text-sm font-medium text-gray-800 mb-1 block">
                                        Hubs *
                                    </label>
                                    <Select
                                        isMulti
                                        options={hubs.map(hub => ({ value: hub.id, label: hub.name }))}
                                        value={hubs.filter(h => item.hubs?.includes(h.id)).map(h => ({ value: h.id, label: h.name }))}
                                        onChange={(selected) => {
                                            const ids = selected ? selected.map((s: any) => s.value) : [];
                                            handleChange(index, "hubs", ids);
                                        }}
                                        className="text-sm"
                                        placeholder="Select Hubs"
                                    />
                                </div>
                            )}

                            {/* Time */}
                            {!item.is_default && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm">Start Time</label>
                                        <input
                                            type="time"
                                            value={item.start_time}
                                            onChange={(e) =>
                                                handleChange(index, "start_time", e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm">End Time</label>
                                        <input
                                            type="time"
                                            value={item.end_time}
                                            onChange={(e) =>
                                                handleChange(index, "end_time", e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Price */}
                            <div className="grid grid-cols-2 gap-4">

                                {!item.is_default && (
                                    <div>
                                        <label className="text-sm">Max Quantity</label>
                                        <input
                                            type="number"
                                            value={item.max_quantity}
                                            onChange={(e) =>
                                                handleChange(index, "max_quantity", e.target.value)
                                            }
                                            className="border rounded-lg px-3 py-2 w-full"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-800 mb-1 block">Price *</label>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) =>
                                            handleChange(index, "price", e.target.value)
                                        }
                                        className="border rounded-lg px-3 py-2 w-full text-sm"
                                        required
                                        placeholder="0.00"
                                        disabled={item.is_default}
                                    />
                                </div>

                            </div>

                        </div>
                    ))}

                    {/* Add Row */}
                    <button
                        type="button"
                        onClick={addPricingRow}
                        className="flex items-center text-orange-600"
                    >
                        <Plus size={16} /> Add Pricing
                    </button>

                    {apiErrors && (
                        <p className="text-red-500 text-end">{apiErrors}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={onClose} type="button" className="border px-4 py-2 rounded">
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            {loading ? (
                                <Loader size={16} className="animate-spin" />
                            ) : "Save Pricing"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PricingModal;