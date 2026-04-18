// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";
// import { extractErrorMessage } from "../../utils/extractErrorMessage ";
// import { X, Save, ClipboardList, Package, Calendar, AlertCircle } from "lucide-react";

// const SerialNumberModal = ({
//     show,
//     onClose,
//     grnData,
// }: any) => {
//     const [selectedGrn, setSelectedGrn] = useState<any>(null);
//     const [serialData, setSerialData] = useState<any>({});
//     const [apiErrors, setApiErrors] = useState<string>("");

//     // 🔥 INIT SERIAL INPUTS BASED ON SELECTED GRN
//     useEffect(() => {
//         if (selectedGrn) {
//             const init: any = {};

//             selectedGrn.items.forEach((item: any) => {
//                 const qty = Math.floor(Number(item.received_quantity || 0));
//                 init[item.id] = Array(qty).fill("");
//             });

//             setSerialData(init);
//         }
//     }, [selectedGrn]);

//     // 🔥 INIT SERIAL INPUTS BASED ON SELECTED GRN
//     useEffect(() => {
//         if (selectedGrn) {
//             const init: any = {};

//             selectedGrn.items.forEach((item: any) => {
//                 const qty = Math.floor(Number(item.received_quantity || 0));
//                 const existingSerials = item.assigned_serial_numbers || [];
//                 init[item.id] = Array.from({ length: qty }, (_, index) => {
//                     return existingSerials[index] || "";
//                 });
//             });
//             setSerialData(init);
//         }
//     }, [selectedGrn]);

//     const handleChange = (itemId: string, index: number, value: string) => {
//         const updated = { ...serialData };
//         updated[itemId][index] = value;
//         setSerialData(updated);
//     };

//     // 🔥 FINAL SUBMIT (SINGLE GRN ONLY)
//     // const handleSubmit = async () => {
//     //     try {
//     //         setApiErrors("");
//     //         if (!selectedGrn) {
//     //             alert("Select GRN first");
//     //             return;
//     //         }

//     //         const products = selectedGrn.items.map((item: any) => ({
//     //             product_id: item.product_id,
//     //             grn_id: selectedGrn.id,
//     //             serial_numbers: serialData[item.id]?.filter((s: any) => s),
//     //         }));

//     //         const payload = {
//     //             purchase_order_id: selectedGrn.purchase_order,
//     //             products,
//     //         };

//     //         console.log("FINAL PAYLOAD", payload);

//     //         await axiosInstance.post(Api.purchaseOrderAddSerial, payload);

//     //         alert("Serial numbers added successfully");
//     //         onClose();

//     //     } catch (error) {
//     //         setApiErrors(extractErrorMessage(error));
//     //     }
//     // };
//     const handleSubmit = async () => {
//         try {
//             setApiErrors("");
//             if (!selectedGrn) return;

//             const products = selectedGrn.items.map((item: any) => {
//                 const existingSerials = item.assigned_serial_numbers || [];

//                 // Pudusa input panna values mattum filter panrom
//                 const newSerials = serialData[item.id]?.filter(
//                     (s: string) => s && !existingSerials.includes(s)
//                 );

//                 return {
//                     product_id: item.product_id,
//                     grn_id: selectedGrn.id,
//                     serial_numbers: newSerials,
//                 };
//             }).filter((p: any) => p.serial_numbers.length > 0); // Only send products with new serials

//             if (products.length === 0) {
//                 alert("No new serial numbers to add");
//                 return;
//             }

//             const payload = {
//                 purchase_order_id: selectedGrn.purchase_order,
//                 products,
//             };

//             await axiosInstance.post(Api.purchaseOrderAddSerial, payload);
//             alert("New serial numbers added successfully");
//             onClose();
//         } catch (error) {
//             setApiErrors(extractErrorMessage(error));
//         }
//     };

//     const handleClose = () => {
//         setSelectedGrn(null);
//         setSerialData({});
//         setApiErrors("");
//         onClose();
//     };

//     if (!show) return null;

//     return (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
//             <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

//                 {/* HEADER */}
//                 <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
//                             <ClipboardList size={22} />
//                         </div>
//                         <div>
//                             <h2 className="font-bold text-slate-800 text-xl tracking-tight">Serial Number Entry</h2>
//                             <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Inventory Assignment</p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600"
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 <div className="p-8 overflow-y-auto custom-scrollbar">
//                     {/* GRN SELECTOR */}
//                     <div className="mb-8">
//                         <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest px-1">Select Goods Receipt Note (GRN)</label>
//                         <div className="relative group">
//                             <select
//                                 value={selectedGrn?.id || ""}
//                                 onChange={(e) => {
//                                     const g = grnData.find((x: any) => x.id === e.target.value);
//                                     setSelectedGrn(g);
//                                 }}
//                                 className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
//                             >
//                                 <option value="">Choose a GRN from list...</option>
//                                 {grnData?.map((g: any) => (
//                                     <option key={g.id} value={g.id}>
//                                         {g.grn_number} — Received {new Date(g.received_date).toLocaleDateString()}
//                                     </option>
//                                 ))}
//                             </select>
//                             <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
//                                 <Package size={18} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* BODY SECTION */}
//                     {selectedGrn ? (
//                         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
//                             {/* SELECTED GRN INFO CARD */}
//                             <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 flex justify-between items-center">
//                                 <div className="flex gap-6">
//                                     <div>
//                                         <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Active GRN</p>
//                                         <p className="font-black text-lg">{selectedGrn.grn_number}</p>
//                                     </div>
//                                     <div className="border-l border-indigo-500/50 pl-6">
//                                         <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Received Date</p>
//                                         <p className="font-bold flex items-center gap-2 italic">
//                                             <Calendar size={14} /> {new Date(selectedGrn.received_date).toLocaleDateString()}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="hidden md:block opacity-20">
//                                     <Package size={60} />
//                                 </div>
//                             </div>

//                             {/* ITEMS LIST */}
//                             <div className="space-y-6">
//                                 {selectedGrn.items.map((item: any) => (
//                                     <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
//                                         <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-50">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
//                                                     <Package size={20} />
//                                                 </div>
//                                                 <h3 className="font-bold text-slate-800 tracking-tight">{item.product_name}</h3>
//                                             </div>
//                                             <span className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-full uppercase">
//                                                 Qty: {Math.floor(item.received_quantity)}
//                                             </span>
//                                         </div>

//                                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                                             {/* {serialData[item.id]?.map((val: any, i: number) => (
//                                                 <div key={i} className="relative group">
//                                                     <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter z-10">
//                                                         SN #{String(i + 1).padStart(2, '0')}
//                                                     </span>
//                                                     <input
//                                                         value={val}
//                                                         placeholder="Enter serial..."
//                                                         onChange={(e) => handleChange(item.id, i, e.target.value)}
//                                                         className="w-full bg-white border border-slate-200 p-3.5 pt-4 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium text-slate-700"
//                                                     />
//                                                 </div>
//                                             ))} */}
//                                             {serialData[item.id]?.map((val: any, i: number) => {
//                                                 // Check if this index was already filled by the API
//                                                 const isExisting = item.assigned_serial_numbers && !!item.assigned_serial_numbers[i];

//                                                 return (
//                                                     <div key={i} className="relative group">
//                                                         <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter z-10">
//                                                             SN #{String(i + 1).padStart(2, '0')} {isExisting && "(SAVED)"}
//                                                         </span>
//                                                         <input
//                                                             value={val}
//                                                             placeholder="Enter serial..."
//                                                             disabled={isExisting} // Read-only logic
//                                                             onChange={(e) => handleChange(item.id, i, e.target.value)}
//                                                             className={`w-full border p-3.5 pt-4 rounded-xl text-sm transition-all outline-none font-medium 
//                     ${isExisting
//                                                                     ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed italic"
//                                                                     : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
//                                                                 }`}
//                                                         />
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="h-64 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400">
//                             <Package size={48} strokeWidth={1} className="mb-3 opacity-20" />
//                             <p className="text-sm font-medium">Please select a GRN to start entering serial numbers</p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Error Banner */}
//                 {apiErrors && (
//                     <div className="mx-8 mt-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold animate-pulse">
//                         <AlertCircle size={18} />
//                         {apiErrors}
//                     </div>
//                 )}

//                 {/* FOOTER */}
//                 <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
//                     <button
//                         onClick={() => {
//                             // onClose();
//                             // setApiErrors("");
//                             handleClose();
//                         }}
//                         className="px-6 py-3 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-2xl transition-all uppercase tracking-widest"
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         onClick={handleSubmit}
//                         disabled={!selectedGrn}
//                         className={`flex items-center gap-2 px-10 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${selectedGrn
//                             ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 active:scale-95"
//                             : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
//                             }`}
//                     >
//                         <Save size={18} />
//                         Save Serials
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default SerialNumberModal;

import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { X, Save, ClipboardList, Package, Calendar, AlertCircle, ScanLine } from "lucide-react";

const SerialNumberModal = ({
    show,
    onClose,
    grnData,
}: any) => {
    const [selectedGrn, setSelectedGrn] = useState<any>(null);
    const [serialData, setSerialData] = useState<any>({});
    const [apiErrors, setApiErrors] = useState<string>("");
    const [scannerValue, setScannerValue] = useState("");
    const scanInputRef = useRef<HTMLInputElement>(null);

    // INIT SERIAL INPUTS
    useEffect(() => {
        if (selectedGrn) {
            const init: any = {};
            selectedGrn.items.forEach((item: any) => {
                const qty = Math.floor(Number(item.received_quantity || 0));
                const existingSerials = item.assigned_serial_numbers || [];
                init[item.id] = Array.from({ length: qty }, (_, index) => {
                    return existingSerials[index] || "";
                });
            });
            setSerialData(init);
            // Scan input-ku focus kudukrom
            setTimeout(() => scanInputRef.current?.focus(), 100);
        }
    }, [selectedGrn]);

    const handleChange = (itemId: string, index: number, value: string) => {
        const updated = { ...serialData };
        updated[itemId][index] = value;
        setSerialData(updated);
    };

    // 🔥 SCANNER LOGIC: Find first empty field and fill it
    const handleMasterScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && scannerValue.trim() !== "") {
            e.preventDefault();
            const updated = { ...serialData };
            let filled = false;

            // Iterate through items and find the first empty string
            for (const itemId of Object.keys(updated)) {
                const itemIndex = updated[itemId].findIndex((val: string, idx: number) => {
                    // Check if empty AND not a previously saved/disabled field
                    const itemInGrn = selectedGrn.items.find((i: any) => i.id === itemId);
                    const isExisting = itemInGrn?.assigned_serial_numbers?.[idx];
                    return val === "" && !isExisting;
                });

                if (itemIndex !== -1) {
                    updated[itemId][itemIndex] = scannerValue.trim();
                    filled = true;
                    break;
                }
            }

            if (filled) {
                setSerialData(updated);
                setScannerValue(""); // Clear scanner for next scan
            } else {
                alert("All serial fields are already filled!");
            }
        }
    };

    const handleSubmit = async () => {
        try {
            setApiErrors("");
            if (!selectedGrn) return;

            const products = selectedGrn.items.map((item: any) => {
                const existingSerials = item.assigned_serial_numbers || [];
                const newSerials = serialData[item.id]?.filter(
                    (s: string) => s && !existingSerials.includes(s)
                );

                return {
                    product_id: item.product_id,
                    grn_id: selectedGrn.id,
                    serial_numbers: newSerials,
                };
            }).filter((p: any) => p.serial_numbers.length > 0);

            if (products.length === 0) {
                alert("No new serial numbers to add");
                return;
            }

            const payload = {
                purchase_order_id: selectedGrn.purchase_order,
                products,
            };

            await axiosInstance.post(Api.purchaseOrderAddSerial, payload);
            alert("New serial numbers added successfully");
            onClose();
        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        }
    };

    const handleClose = () => {
        setSelectedGrn(null);
        setSerialData({});
        setApiErrors("");
        setScannerValue("");
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* HEADER */}
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <ClipboardList size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-xl tracking-tight">Serial Number Entry</h2>
                            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Inventory Assignment</p>
                        </div>
                    </div>

                    {/* 🔥 MASTER SCAN FIELD */}
                    {selectedGrn && (
                        <div className="flex-1 max-w-sm mx-8">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-indigo-500">
                                    <ScanLine size={18} />
                                </div>
                                <input
                                    ref={scanInputRef}
                                    type="text"
                                    value={scannerValue}
                                    onChange={(e) => setScannerValue(e.target.value)}
                                    onKeyDown={handleMasterScan}
                                    placeholder="Quick Scan Serial..."
                                    className="w-full bg-white border-2 border-indigo-100 pl-11 pr-4 py-2.5 rounded-2xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                />
                            </div>
                        </div>
                    )}

                    <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {/* GRN SELECTOR */}
                    <div className="mb-8">
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest px-1">Select Goods Receipt Note (GRN)</label>
                        <div className="relative group">
                            <select
                                value={selectedGrn?.id || ""}
                                onChange={(e) => {
                                    const g = grnData.find((x: any) => x.id === e.target.value);
                                    setSelectedGrn(g);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Choose a GRN from list...</option>
                                {grnData?.map((g: any) => (
                                    <option key={g.id} value={g.id}>{g.grn_number} — {new Date(g.received_date).toLocaleDateString()}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                <Package size={18} />
                            </div>
                        </div>
                    </div>

                    {selectedGrn ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* ITEMS LIST */}
                            <div className="space-y-6">
                                {selectedGrn.items.map((item: any) => (
                                    <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                                    <Package size={20} />
                                                </div>
                                                <h3 className="font-bold text-slate-800 tracking-tight">{item.product_name}</h3>
                                            </div>
                                            <span className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-full uppercase">
                                                Qty: {Math.floor(item.received_quantity)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {serialData[item.id]?.map((val: any, i: number) => {
                                                const isExisting = item.assigned_serial_numbers && !!item.assigned_serial_numbers[i];
                                                return (
                                                    <div key={i} className="relative group">
                                                        <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter z-10">
                                                            SN #{String(i + 1).padStart(2, '0')} {isExisting && "(SAVED)"}
                                                        </span>
                                                        <input
                                                            value={val}
                                                            placeholder="Enter serial..."
                                                            disabled={isExisting}
                                                            onChange={(e) => handleChange(item.id, i, e.target.value)}
                                                            className={`w-full border p-3.5 pt-4 rounded-xl text-sm transition-all outline-none font-medium 
                                                                ${isExisting ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed italic" : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"}`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                            <Package size={48} strokeWidth={1} className="mb-3 opacity-20" />
                            <p className="text-sm font-medium">Please select a GRN to start entering serial numbers</p>
                        </div>
                    )}
                </div>

                {apiErrors && (
                    <div className="mx-8 mt-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold">
                        <AlertCircle size={18} />
                        {apiErrors}
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                    <button onClick={handleClose} className="px-6 py-3 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-2xl transition-all uppercase tracking-widest">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedGrn}
                        className={`flex items-center gap-2 px-10 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${selectedGrn ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                    >
                        <Save size={18} />
                        Save Serials
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SerialNumberModal;