import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { X, Save, ClipboardList, Package, AlertCircle } from "lucide-react";

const SerialNumberModal = ({ show, onClose, grnData }: any) => {
    const [serialData, setSerialData] = useState<any>({});
    const [apiErrors, setApiErrors] = useState<string>("");

    // INIT SERIAL INPUTS
    useEffect(() => {
        if (!grnData?.items || !Array.isArray(grnData.items)) return;

        const init: any = {};
        grnData.items.forEach((item: any) => {
            const qty = Math.floor(Number(item?.received_quantity || 0));
            const existingSerials = item?.assigned_serial_numbers || [];

            init[item.id] = Array.from({ length: qty }, (_, index) => {
                return existingSerials[index] || "";
            });
        });

        setSerialData(init);
    }, [grnData, show]);

    const handleChange = (itemId: string, index: number, value: string) => {
        setSerialData((prev: any) => ({
            ...prev,
            [itemId]: prev[itemId].map((v: string, i: number) => (i === index ? value : v)),
        }));
    };

    /**
     * 🔥 INDEX BASED SCAN LOGIC
     * Intha handler particular input field-oda onKeyDown-la work aagum.
     * Nee focus panni irukura field-la mattum thaan data fill aagum.
     */
    const handleIndividualScan = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string, index: number) => {
        // Scanner usually sends "Enter" key at the end of scan
        if (e.key === "Enter") {
            e.preventDefault();
            const scannedValue = (e.target as HTMLInputElement).value.trim();

            if (scannedValue) {
                // Update specific index
                handleChange(itemId, index, scannedValue);

                // Optional: Automatic focus to next empty field in the same item (Good for UX)
                const nextInput = (e.target as HTMLInputElement)
                    .closest('.grid-container') // Finding current grid
                    ?.querySelectorAll('input')[index + 1] as HTMLInputElement;

                if (nextInput && !nextInput.disabled) {
                    nextInput.focus();
                }
            }
        }
    };

    const handleSubmit = async () => {
        try {
            setApiErrors("");
            if (!grnData) return;

            const products = grnData.items.map((item: any) => {
                const existingSerials = item.assigned_serial_numbers || [];
                const newSerials = serialData[item.id]?.filter(
                    (s: string) => s && !existingSerials.includes(s)
                );

                return {
                    product_id: item.product_id,
                    grn_id: grnData?.id,
                    serial_numbers: newSerials,
                };
            }).filter((p: any) => p.serial_numbers.length > 0);

            if (products.length === 0) {
                alert("No new serial numbers to add");
                return;
            }

            const payload = {
                purchase_order_id: grnData.purchase_order,
                products,
            };

            await axiosInstance.post(Api.purchaseOrderAddSerial, payload);
            alert("Serial numbers saved successfully!");
            onClose();
        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* HEADER */}
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                            <ClipboardList size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-xl tracking-tight">Serial Number Entry</h2>
                            <p className="text-[11px] text-slate-500 font-medium uppercase">GRN: {grnData?.grn_number}</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {grnData?.items?.map((item: any) => (
                        <div key={item.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <Package size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">{item.product_name}</h3>
                                </div>
                                <span className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-full uppercase">
                                    Qty: {Math.floor(item.received_quantity)}
                                </span>
                            </div>

                            {/* 🔥 grid-container class helps for next-field focus logic */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 grid-container">
                                {serialData[item.id]?.map((val: any, i: number) => {
                                    const isExisting = item.assigned_serial_numbers?.[i];
                                    return (
                                        <div key={i} className="relative group">
                                            <span className="absolute -top-2 left-3 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase z-10">
                                                Slot #{String(i + 1).padStart(2, '0')} {isExisting && "✔"}
                                            </span>
                                            <input
                                                value={val}
                                                disabled={!!isExisting}
                                                // Manual entry handle
                                                onChange={(e) => handleChange(item.id, i, e.target.value)}
                                                // 🔥 Specific index scan handle
                                                onKeyDown={(e) => handleIndividualScan(e, item.id, i)}
                                                autoFocus={i === 0 && !isExisting}
                                                className={`w-full border p-3.5 pt-4 rounded-xl text-sm transition-all outline-none font-bold 
                                                    ${isExisting ? "bg-slate-50 border-slate-200 text-green-600 cursor-not-allowed" : "bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"}`}
                                                placeholder="Click & Scan..."
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {apiErrors && (
                    <div className="mx-8 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold mb-4">
                        <AlertCircle size={18} />
                        {apiErrors}
                    </div>
                )}

                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
                    <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-sm uppercase">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-10 py-3 rounded-2xl text-sm font-black uppercase bg-slate-900 text-white hover:bg-slate-800 shadow-xl active:scale-95 transition-all"
                    >
                        <Save size={18} /> Save Serials
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SerialNumberModal;