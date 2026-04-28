import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { X, Wallet, CreditCard, Calendar, Info } from "lucide-react";

interface PaymentModalProps {
    open: boolean;
    setOpen: (val: boolean) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, setOpen }) => {
    if (!open) return null;

    /* ================= STATE ================= */
    const [vendor, setVendor] = useState("");
    const [vendors, setVendors] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
    const [topAmount, setTopAmount] = useState<number>(0);
    const [notes, setNotes] = useState("");

    const [links, setLinks] = useState<any[]>([]);
    const [vendorData, setVendorData] = useState<any[]>([]);
    const [grnList, setGrnList] = useState<any[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<any>(null);
    const [usedWalletAmount, setUsedWalletAmount] = useState(0);

    /* ================= DATA FETCHING ================= */
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const v = await axiosInstance.get(Api.vendor);
                setVendors(v?.data?.vendors || []);
            } catch (err) { console.error("Vendor fetch error", err); }
        };
        fetchVendors();
    }, []);

    const fetchVendorDetails = useCallback(async () => {
        if (!vendor) return;
        try {
            const res = await axiosInstance.get(`${Api.purchasePendingPayment}?size=50000&vendor_id=${vendor}`);
            const poList = res?.data?.purchase_orders?.items || [];
            const grnItems = res?.data?.grns?.items || [];

            const formatted = [
                ...poList.map((po: any) => ({ id: `PO-${po.id}`, realId: po.id, type: "PO", label: po.po_number, pending: po.amount_to_be_paid })),
                ...grnItems.map((grn: any) => ({ id: `GRN-${grn.id}`, realId: grn.id, type: "GRN", label: grn.grn_number, pending: grn.amount_to_be_paid })),
            ];
            setVendorData(formatted);

            const walletRes = await axiosInstance.get(`${Api?.purchaseExcessCreditEntities}?vendor_id=${vendor}`);
            const wpoList = walletRes?.data?.purchase_orders?.items || [];
            const wgrnList = walletRes?.data?.grns?.items || [];

            const formatteds = [
                ...wpoList?.map((po: any) => ({ id: po.id, type: "PO", label: po.po_number, purchase_order: po.id, grn: null, excess_amount: po.excess_amount })),
                ...wgrnList?.map((grn: any) => ({ id: grn.id, type: "GRN", label: grn.grn_number, purchase_order: null, grn: grn.id, excess_amount: grn.excess_amount })),
            ];
            setGrnList(formatteds || []);
        } catch (error) { console.error("Detail fetch error", error); }
    }, [vendor]);

    useEffect(() => {
        fetchVendorDetails();
        setLinks([]);
        setSelectedWallet(null);
        setUsedWalletAmount(0);
        setTopAmount(0);
    }, [vendor, fetchVendorDetails]);

    /* ================= LOGIC HANDLERS ================= */
    const handleSelect = (item: any) => {
        const exists = links.find((l) => l.id === item.id);
        if (exists) {
            const updatedLinks = links.filter((l) => l.id !== item.id);
            setLinks(updatedLinks);
            setTopAmount(updatedLinks.reduce((sum, i) => sum + i.amount, 0));
        } else {
            setLinks([...links, { ...item, amount: 0 }]);
        }
    };

    const handleTopAmountDistribute = (val: number) => {
        setTopAmount(val);
        if (links.length === 0) return;

        let remaining = val;
        const updated = links.map((l) => {
            const allocate = Math.min(remaining, l.pending);
            remaining -= allocate;
            return { ...l, amount: allocate };
        });
        setLinks(updated);
    };

    const handleManualAmountChange = (index: number, value: number) => {
        const updated = [...links];
        let val = Math.min(value, updated[index].pending);
        updated[index].amount = val < 0 ? 0 : val;
        setLinks(updated);
        setTopAmount(updated.reduce((sum, item) => sum + item.amount, 0));
    };

    /* ================= CALCULATIONS FOR SUMMARY ================= */
    const totalPendingInSelected = links.reduce((sum, i) => sum + i.pending, 0);
    const totalPayingNow = topAmount; // Same as totalCalculated
    const remainingBalance = totalPendingInSelected - totalPayingNow;
    const finalSettlement = totalPayingNow + usedWalletAmount;

    const handleSubmit = async () => {
        const payload = {
            links: links.filter(l => l.amount > 0).map((l) => ({
                purchase_order: l.type === "PO" ? l.realId : null,
                grn: l.type === "GRN" ? l.realId : null,
                amount: l.amount.toString(),
            })),
            wallet_details: selectedWallet ? {
                grn_id: selectedWallet.grn,
                purchase_order_id: selectedWallet.purchase_order,
                amount: usedWalletAmount.toString()
            } : null,
            payment_amount: totalPayingNow.toString(),
            payment_date: new Date(paymentDate).toISOString(),
            payment_method: paymentMethod,
            notes,
        };
        try {
            const updatedApi = await axiosInstance.post(Api?.purchasePayment, payload)
            if (updatedApi) {
                setOpen(false);
            }
        } catch (error) {

        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">New Payment</h2>
                        <p className="text-xs text-slate-500">Select invoices and record payment details</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Step 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Select Vendor</label>
                            <select
                                className="w-full h-11 px-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setVendor(e.target.value)}
                                value={vendor}
                            >
                                <option value="">Select a vendor</option>
                                {vendors.map((v: any) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Payment Date</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full h-11 px-4 border rounded-xl bg-slate-50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Method</label>
                                <select
                                    className="w-full h-11 px-4 border rounded-xl bg-slate-50 outline-none"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="BANK">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Pending Selection */}
                    {vendor && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-700">1. Select Pending Invoices</h3>
                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">Available: {vendorData.length}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {vendorData.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${links.find(l => l.id === item.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-blue-600 tracking-tight">{item.type}</span>
                                            <span className="font-semibold text-slate-800 text-sm">{item.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900">₹{item.pending}</div>
                                            <input type="checkbox" checked={!!links.find(l => l.id === item.id)} readOnly className="rounded text-blue-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Distribution */}
                    {links.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Enter Total Payment Amount</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-bold text-slate-400">₹</span>
                                        <input
                                            type="number"
                                            value={topAmount || ""}
                                            onChange={(e) => handleTopAmountDistribute(Number(e.target.value))}
                                            className="w-40 h-10 text-2xl font-black bg-transparent outline-none text-blue-600"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Selection Balance</p>
                                    <p className="text-lg font-bold text-slate-700">₹{totalPendingInSelected.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {links.map((l, idx) => (
                                    <div key={l.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{l.label}</span>
                                            <span className="text-[10px] text-slate-400">Balance: ₹{l.pending}</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="w-28 text-right border-b-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 px-1"
                                            value={l.amount || ""}
                                            onChange={(e) => handleManualAmountChange(idx, Number(e.target.value))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Wallet */}
                    {grnList.length > 0 && (
                        <div className="p-4 border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold text-sm">
                                <Wallet size={16} className="text-blue-500" />
                                <span>Apply Wallet / Excess Credit</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    className="h-10 px-3 border rounded-lg bg-white text-sm outline-none"
                                    onChange={(e) => {
                                        const g = grnList.find(x => x.id === e.target.value);
                                        setSelectedWallet(g);
                                        setUsedWalletAmount(0);
                                    }}
                                >
                                    <option value="">No Wallet Applied</option>
                                    {grnList.map(g => (
                                        <option key={g.id} value={g.id}>{g.label} (₹{g.excess_amount})</option>
                                    ))}
                                </select>
                                {selectedWallet && (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                className="h-10 px-3 border rounded-lg w-full text-sm font-bold pr-12"
                                                value={usedWalletAmount || ""}
                                                onChange={(e) => setUsedWalletAmount(Math.min(Number(e.target.value), selectedWallet.excess_amount))}
                                            />
                                            <button
                                                onClick={() => setUsedWalletAmount(selectedWallet.excess_amount)}
                                                className="absolute right-2 top-2 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded hover:bg-blue-200"
                                            >MAX</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <textarea
                        rows={2}
                        placeholder="Internal notes or reference details..."
                        className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-1 focus:ring-slate-300 text-sm"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Data Summary & Final Footer */}
                <div className="border-t">
                    {links.length > 0 && (
                        <div className="px-8 py-3 bg-slate-100 grid grid-cols-3 gap-4 border-b">
                            <div>
                                <p className="text-[9px] uppercase font-bold text-slate-400">Items Selected</p>
                                <p className="text-sm font-bold text-slate-700 tracking-tight">{links.length} Invoices</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase font-bold text-slate-400">Balance Pending</p>
                                <p className="text-sm font-bold text-slate-700">₹{remainingBalance.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] uppercase font-bold text-slate-400">Total Settlement</p>
                                <p className="text-sm font-bold text-green-600">₹{finalSettlement.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl">
                        <div className="flex items-center gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] uppercase font-black text-slate-400">Total Payable</p>
                                <p className="text-2xl font-black text-slate-900">₹{totalPayingNow.toLocaleString('en-IN')}</p>
                            </div>
                            {usedWalletAmount > 0 && (
                                <div className="text-center sm:text-left border-l pl-6">
                                    <p className="text-[10px] uppercase font-black text-blue-500">Wallet Used</p>
                                    <p className="text-2xl font-black text-blue-600">₹{usedWalletAmount.toLocaleString('en-IN')}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 sm:flex-none px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                            >Discard</button>
                            <button
                                onClick={handleSubmit}
                                disabled={totalPayingNow <= 0 && usedWalletAmount <= 0}
                                className="flex-1 sm:flex-none px-10 py-3 font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                            >Confirm Payment</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;