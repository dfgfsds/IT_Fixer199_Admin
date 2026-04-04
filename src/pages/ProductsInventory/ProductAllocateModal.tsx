// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";
// import { Loader2, Package } from "lucide-react";
// import { extractErrorMessage } from "../../utils/extractErrorMessage ";

// interface Props {
//     show: boolean;
//     onClose: () => void;
//     selectedItem: any;
//     onSuccess?: () => void;
// }

// const ProductAllocateModal: React.FC<Props> = ({
//     show,
//     onClose,
//     selectedItem,
//     onSuccess,
// }) => {
//     const [agents, setAgents] = useState<any[]>([]);
//     const [selectedAgent, setSelectedAgent] = useState("");
//     const [quantity, setQuantity] = useState(1);
//     const [type, setType] = useState<"GIVE" | "GET">("GIVE");
//     const [loading, setLoading] = useState(false);
//     const [apiErrors, setApiErrors] = useState<string>("");

//     useEffect(() => {
//         if (!show) return;

//         const fetchAgents = async () => {
//             try {
//                 const res = await axiosInstance.get(Api.agents);
//                 setAgents(res?.data?.agents || []);
//             } catch (err) {
//                 console.error(err);
//             }
//         };

//         fetchAgents();
//     }, [show]);

//     const handleSubmit = async () => {
//         if (!selectedAgent || quantity <= 0) return;
//         setApiErrors("");
//         try {
//             setLoading(true);

//             const updatedApi = await axiosInstance.post(`${Api.productMovementDirect}`, {
//                 agent_id: selectedAgent,
//                 product_id: selectedItem?.product?.id,
//                 hub_id: selectedItem?.hub_id,
//                 stock: quantity,
//                 type: type,
//             });
//             if (updatedApi) {
//                 setApiErrors("");

//                 onSuccess?.();
//                 onClose();

//                 setSelectedAgent("");
//                 setQuantity(1);
//                 setType("GIVE");
//             }


//         } catch (err) {
//             setApiErrors(extractErrorMessage(err));
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetState = () => {
//         setSelectedAgent("");
//         setQuantity(1);
//         setType("GIVE");
//         setApiErrors("");
//     };

//     const handleClose = () => {
//         resetState();
//         onClose();
//     };



//     if (!show || !selectedItem) return null;

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

//             <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

//                 {/* HEADER */}
//                 <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white flex items-center gap-2">
//                     <Package size={20} />
//                     <div>
//                         <h2 className="text-xl font-bold">Product Allocation</h2>
//                         <p className="text-sm opacity-80">Assign product to agent</p>
//                     </div>
//                 </div>

//                 <div className="p-8 space-y-6">

//                     {/* INFO */}
//                     <div className="bg-gray-50 border rounded-2xl p-5 text-sm space-y-2">
//                         <p><b>Product:</b> {selectedItem?.product?.name}</p>
//                         <p><b>Hub:</b> {selectedItem?.hub_name}</p>
//                         <p>
//                             <b>Available:</b>{" "}
//                             <span className={selectedItem?.stock_in_hub > 0 ? "text-green-600" : "text-red-600"}>
//                                 {selectedItem?.stock_in_hub}
//                             </span>
//                         </p>
//                     </div>

//                     {/* AGENT */}
//                     <div>
//                         <label className="text-sm font-medium text-gray-600">Select Agent</label>
//                         <select
//                             value={selectedAgent}
//                             onChange={(e) => setSelectedAgent(e.target.value)}
//                             className="w-full border px-3 py-2 rounded-lg mt-1"
//                         >
//                             <option value="">Select Agent</option>
//                             {agents?.filter((i: any) => i?.hub === selectedItem?.hub_id)?.map((a: any) => (
//                                 <option key={a.id} value={a.id}>
//                                     {a.user_details?.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* TYPE */}
//                     <div>
//                         <label className="text-sm font-medium text-gray-600">Type</label>
//                         <div className="flex gap-3 mt-2">

//                             <button
//                                 onClick={() => setType("GIVE")}
//                                 className={`flex-1 py-2 rounded-lg border ${type === "GIVE" ? "bg-green-600 text-white" : ""
//                                     }`}
//                             >
//                                 GET
//                             </button>

//                             <button
//                                 onClick={() => setType("GET")}
//                                 className={`flex-1 py-2 rounded-lg border ${type === "GET" ? "bg-blue-600 text-white" : ""
//                                     }`}
//                             >
//                                 GIVE
//                             </button>

//                         </div>
//                     </div>

//                     {/* QUANTITY */}
//                     <div>
//                         <label className="text-sm font-medium text-gray-600">Quantity</label>
//                         <input
//                             type="number"
//                             min={1}
//                             value={quantity}
//                             onChange={(e) => setQuantity(Number(e.target.value))}
//                             className="w-full border px-3 py-2 rounded-lg mt-1"
//                         />
//                     </div>

//                     {/* Error */}
//                     {apiErrors && (
//                         <p className="text-red-500 mt-2 text-end px-6">
//                             {apiErrors}
//                         </p>
//                     )}

//                     {/* ACTION */}
//                     <div className="flex justify-end gap-3 pt-4 border-t">
//                         <button
//                             onClick={handleClose}
//                             className="px-4 py-2 border rounded-lg">
//                             Cancel
//                         </button>

//                         <button
//                             onClick={handleSubmit}
//                             className="px-5 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
//                         >
//                             {loading && <Loader2 className="animate-spin" size={16} />}
//                             Submit
//                         </button>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProductAllocateModal;


import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader2, Package, Plus, Trash2 } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import Select from 'react-select';

interface Props {
    show: boolean;
    onClose: () => void;
    selectedItem: any;
    onSuccess?: () => void;
}

const ProductAllocateModal: React.FC<Props> = ({
    show,
    onClose,
    selectedItem,
    onSuccess,
}) => {
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [quantity, setQuantity] = useState<any>();
    const [type, setType] = useState<"GIVE" | "GET">("GIVE");
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState("");
    const [serialNumberData, setSerialNumberData] = useState<any>();
    const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

    useEffect(() => {
        if (!show) return;

        const fetchAgents = async () => {
            try {
                const res = await axiosInstance.get(Api.agents);
                setAgents(res?.data?.agents || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAgents();
    }, [show]);

    // ✅ FIXED SERIAL SYNC (NO RESET BUG)
    // useEffect(() => {
    //     setSerialNumbers((prev) =>
    //         Array.from({ length: quantity }, (_, i) => prev[i] || "")
    //     );
    // }, [quantity]);

    // SERIAL CHANGE
    const handleSerialChange = (index: number, value: string) => {
        setSerialNumbers((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    // SERIAL NUMBER 
    const fetchSerialNumber = async () => {
        setSerialNumberData("")
        try {
            if (type === "GIVE") {
                if (selectedAgent) {
                    const updatedApi = await axiosInstance.get(`${Api?.productSerialAgentPossession}?hub_id=${selectedItem?.hub_id}&product_id=${selectedItem?.product?.id}&size=1000&agent_id=${selectedAgent}`)
                    if (updatedApi) {
                        setSerialNumberData(updatedApi?.data?.agent_availability);
                    }
                }
            } else {
                const updatedApi = await axiosInstance.get(`${Api?.productSerialAvailability}?hub_id=${selectedItem?.hub_id}&product_id=${selectedItem?.product?.id}&size=1000`)
                if (updatedApi) {
                    setSerialNumberData(updatedApi?.data?.availability);
                }
            }
        } catch (error) {
            // toast.error(extractErrorMessage(error));
        }
    }

    useEffect(() => {
        fetchSerialNumber();
    }, [selectedItem?.hub_id, selectedItem?.product?.id, type,selectedAgent])

    // const serialOptions = serialNumberData?.[0]?.available_serial_numbers?.map((item: any) => ({
    //     value: item,
    //     label: item,
    //     isDisabled:
    //         serialNumbers.includes(item) ||
    //         (serialNumbers.length >= (quantity || 0) && !serialNumbers.includes(item))
    // })) || [];

    // const serialOptions = useMemo(() => {
    //     return serialNumberData?.[0]?.available_serial_numbers?.map((item: any) => ({
    //         value: item,
    //         label: item,
    //         isDisabled:
    //             serialNumbers.includes(item) ||
    //             (serialNumbers.length >= (quantity || 0) && !serialNumbers.includes(item))
    //     })) || [];
    // }, [quantity]);

    const serialOptions = useMemo(() => {
        return serialNumberData?.[0]?.available_serial_numbers?.map((item: any) => {
            const isSelected = serialNumbers.includes(item);

            return {
                value: item,
                label: item,
                isDisabled:
                    !isSelected && serialNumbers.length >= (quantity || 0)
            };
        }) || [];
    }, [serialNumberData, serialNumbers, quantity]);

    // useEffect(() => {
    //     if (!quantity) return;

    //     setSerialNumbers((prev) => prev?.slice(0, quantity));
    // }, [quantity]);

    useEffect(() => {
        setSerialNumbers([]);
        setQuantity(1);
    }, [type]);

    // ADD SERIAL
    const handleAddSerial = () => {
        setSerialNumbers((prev) => [...prev, ""]);
        setQuantity((prev: any) => prev + 1);
    };

    // REMOVE SERIAL
    const handleRemoveSerial = (index: number) => {
        setSerialNumbers((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            setQuantity(updated.length || 1);
            return updated.length ? updated : [""];
        });
    };

    const handleSubmit = async () => {
        if (!selectedAgent || quantity <= 0) return;

        if (serialNumbers.some((sn) => !sn.trim())) {
            setApiErrors("All serial numbers are required");
            return;
        }

        try {
            setLoading(true);
            setApiErrors("");

            await axiosInstance.post(`${Api.productMovementDirect}`, {
                agent_id: selectedAgent,
                product_id: selectedItem?.product?.id,
                hub_id: selectedItem?.hub_id,
                stock: quantity,
                serial_numbers: serialNumbers,
                type: type,
            });

            onSuccess?.();
            handleClose();
        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setSelectedAgent("");
        setQuantity(1);
        setType("GIVE");
        setSerialNumbers([""]);
        setApiErrors("");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    if (!show || !selectedItem) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-screen overflow-y-auto no-scrollbar">

                {/* HEADER */}
                <div className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white flex items-center gap-2">
                    <Package size={18} />
                    <h2 className="text-sm font-semibold">Product Allocation</h2>
                </div>

                <div className="p-5 space-y-4 text-sm">

                    {/* INFO */}
                    <div className="bg-gray-50 border rounded-xl p-3 text-xs space-y-1">
                        <p><b>{selectedItem?.product?.name}</b></p>
                        <p>Hub: {selectedItem?.hub_name}</p>
                        <p>
                            Available:{" "}
                            <span className={selectedItem?.stock_in_hub > 0 ? "text-green-600" : "text-red-600"}>
                                {selectedItem?.stock_in_hub}
                            </span>
                        </p>
                    </div>

                    {/* AGENT + TYPE */}
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="border px-2 py-1.5 rounded-md text-xs"
                        >
                            <option value="">Select Agent</option>
                            {agents
                                ?.filter((i: any) => i?.hub === selectedItem?.hub_id)
                                ?.map((a: any) => (
                                    <option key={a.id} value={a.id}>
                                        {a.user_details?.name}
                                    </option>
                                ))}
                        </select>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="border px-2 py-1.5 rounded-md text-xs"
                        >
                            <option value="GIVE">GET</option>
                            <option value="GET">GIVE</option>
                        </select>
                    </div>

                    {/* QUANTITY */}
                    <input
                        type="number"
                        min={1}
                        max={selectedItem?.stock_in_hub}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full border px-2 py-1.5 rounded-md text-xs"
                        placeholder="Quantity"
                    />

                    {/* SERIAL HEADER */}
                    {/* <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold">Serial Numbers</span>
                        <button
                            onClick={handleAddSerial}
                            className="text-indigo-600 text-xs flex items-center gap-1"
                        >
                            <Plus size={14} /> Add
                        </button>
                    </div> */}

                    {/* SERIAL TABLE STYLE */}
                    {/* {serialNumbers?.length ? (
                        <>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="grid grid-cols-[40px_1fr_40px] bg-gray-100 text-xs px-2 py-1 font-medium">
                                    <span>#</span>
                                    <span>Serial</span>
                                    <span></span>
                                </div>

                                <div className="max-h-40 overflow-y-auto no-scrollbar">
                                    {serialNumbers.map((sn, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-[40px_1fr_40px] items-center border-t px-2 py-1"
                                        >
                                            <span className="text-xs text-gray-500">{index + 1}</span>

                                            <input
                                                type="text"
                                                value={sn || ""}
                                                onChange={(e) =>
                                                    handleSerialChange(index, e.target.value)
                                                }
                                                className="border px-2 py-1 rounded text-xs"
                                                placeholder="Enter serial"
                                            />

                                            {serialNumbers.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveSerial(index)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : ""} */}

                    <div className="pb-20">
                        {/* <label className="block text-sm font-medium mb-1">
                                        Serial Numbers *
                                    </label> */}

                        <Select
                            options={serialOptions || []}
                            value={serialOptions?.filter((opt: any) =>
                                serialNumbers?.includes(opt?.value)
                            )}
                            onChange={(selected: any) => {
                                let values = selected ? selected.map((s: any) => s.value) : [];

                                if (values.length > quantity) {
                                    values = values.slice(0, quantity);
                                }

                                setSerialNumbers(values);
                                // ❌ REMOVE THIS LINE
                                // setQuantity(values.length);
                            }}
                            isMulti
                            placeholder="Select Serial Numbers"
                            className="text-sm"
                        />

                    </div>


                    {/* ERROR */}
                    {apiErrors && (
                        <p className="text-red-500 text-xs text-end">{apiErrors}</p>
                    )}

                    {/* ACTION */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={handleClose}
                            className="px-3 py-1 border rounded-md text-xs"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs flex items-center gap-1"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Submit
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductAllocateModal;