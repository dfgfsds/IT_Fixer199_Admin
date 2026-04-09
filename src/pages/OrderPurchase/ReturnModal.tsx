import React, { useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { X, Package, Undo2, Hash, DollarSign, ClipboardEdit, Percent, Layers, Info, AlertCircle, ChevronDown } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import Api from "../../api-endpoints/ApiUrls";

const ReturnModal = ({ show, onClose, grnData }: any) => {
  const [selectedGrn, setSelectedGrn] = useState<any>(null);
  const [apiErrors, setApiErrors] = useState<string>("");
  console.log(selectedGrn, "selectedGrn in return modal")
  const [showActionModal, setShowActionModal] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  // Form State Initial Object
  const initialFormState = {
    reason: "",
    notes: "",
    quantity: 1,
    serial_numbers: [] as string[]
  };

  const [refundForm, setRefundForm] = useState(initialFormState);

  const openActionModal = (item: any) => {
    setActiveItem(item);
    setRefundForm({
      reason: "",
      notes: "",
      quantity: 1,
      // Default-ah 1 entry select panna ready-ah vechurkom
      serial_numbers: Array(1).fill("")
    });
    setShowActionModal(true);
  };

  const handleQtyChange = (val: number | string) => {
    const maxAvailable = Math.floor(activeItem?.received_quantity || 0);

    if (val === "" || isNaN(Number(val))) {
      setRefundForm({
        ...refundForm,
        quantity: 0,
        serial_numbers: []
      });
      return;
    }

    let newQty = Number(val);
    if (newQty > maxAvailable) newQty = maxAvailable;

    setRefundForm({
      ...refundForm,
      quantity: newQty,
      // Qty change aagum pothu arrays update pannuvom, already select panna data retain aagum
      serial_numbers: Array(newQty).fill("").map((_, i) => refundForm.serial_numbers[i] || "")
    });
  };

  const handleSerialChange = (index: number, value: string) => {
    const updatedSerials = [...refundForm.serial_numbers];
    updatedSerials[index] = value;
    setRefundForm({ ...refundForm, serial_numbers: updatedSerials });
  };

  const handleFinalSubmit = async () => {
    try {
      setApiErrors("");

      // Validation: Ellaa serial numbers-um select panni iruntha thaan submit panna viduvom
      const filledSerials = refundForm.serial_numbers.filter(s => s.trim() !== "");
      if (filledSerials.length !== refundForm.quantity) {
        setApiErrors(`Please select all ${refundForm.quantity} serial numbers.`);
        return;
      }

      const payload = {
        purchase_order_id: selectedGrn.purchase_order,
        grn_id: selectedGrn.id,
        return_date: new Date().toISOString(),
        reason: refundForm.reason,
        items: [
          {
            product: activeItem?.product_id,
            quantity: Number(refundForm.quantity),
            rate: activeItem.rate || 0,
            // batch_number: activeItem.batch_number,
            serial_numbers: filledSerials,
            notes: refundForm.notes
          }
        ]
      };

      await axiosInstance.post(Api.purchaseReturn, payload);
      alert("Refund processed successfully");
      setShowActionModal(false);
      onClose();
    } catch (error) {
      setApiErrors(extractErrorMessage(error));
    }
  };

  // Modal-a close pannum pothu ellathaum clear panna indha function
  const handleCloseAll = () => {
    setSelectedGrn(null);
    setApiErrors("");
    setShowActionModal(false);
    setActiveItem(null);
    setRefundForm(initialFormState);
    onClose(); // Parent function-a call panrom
  };


  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Undo2 className="text-red-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Purchase Return</h2>
              <p className="text-xs text-slate-400 mt-1">Select items for batch return</p>
            </div>
          </div>
          <button onClick={handleCloseAll} className="hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="p-8 overflow-y-auto bg-slate-50/50">
          <div className="max-w-md mx-auto mb-8">
            <select
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none text-slate-700 font-medium"
              onChange={(e) => setSelectedGrn(grnData.find((x: any) => x.id === e.target.value))}
            >
              <option value="">Select GRN Reference...</option>
              {grnData?.map((g: any) => (
                <option key={g.id} value={g.id}>{g.grn_number}</option>
              ))}
            </select>
          </div>

          {selectedGrn && (
            <div className="grid gap-4 mt-6">
              {selectedGrn.items.map((item: any) => (
                <div key={item.id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50">
                        <Package className="text-slate-400 group-hover:text-blue-500 w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-base tracking-tight leading-none uppercase">{item.product_name}</h4>
                        <div className="flex flex-wrap items-center gap-y-2 text-[12px] font-medium">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100/50">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Batch: {item.batch_number || "N/A"}</span>
                          </div>
                          <span className="mx-2 text-slate-300">|</span>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Hash className="w-3.5 h-3.5" />
                            <span>Qty: <b className="text-slate-800">{Math.floor(item?.received_quantity)}</b></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openActionModal(item)}
                      className="bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-orange-500 active:scale-95 transition-all shadow-sm"
                    >
                      Select Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Sub-Modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center z-[1000] p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Refund Summary</h3>
                <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Product Being Returned</p>
                  <p className="text-sm font-bold text-slate-700">{activeItem?.product_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Return Quantity</label>
                    <input
                      type="number"
                      className="w-full border-slate-200 border p-3 rounded-xl text-sm outline-none font-bold"
                      value={refundForm.quantity === 0 ? "" : refundForm.quantity}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      onBlur={() => { if (refundForm.quantity < 1) handleQtyChange(1); }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Reason</label>
                    <input
                      type="text"
                      className="w-full border-slate-200 border p-3 rounded-xl text-sm outline-none"
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                    />
                  </div>
                </div>

                {/* Updated Serial Numbers Selection Logic */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">
                    Select Serial Numbers ({refundForm.quantity})
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                    {refundForm.serial_numbers.map((sn, idx) => (
                      <div key={idx} className="relative">
                        <select
                          className="w-full border-slate-200 bg-white border p-3 pr-10 rounded-xl text-xs outline-none focus:ring-1 focus:ring-red-500 appearance-none transition-all"
                          value={sn}
                          onChange={(e) => handleSerialChange(idx, e.target.value)}
                        >
                          <option value="">-- Choose Serial #{idx + 1} --</option>
                          {activeItem?.assigned_serial_numbers?.map((serial: string) => (
                            <option
                              key={serial}
                              value={serial}
                              // Disable if already chosen in another box
                              disabled={refundForm.serial_numbers.includes(serial) && sn !== serial}
                            >
                              {serial}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full border-slate-200 border p-3 rounded-xl text-sm outline-none focus:border-slate-400"
                    onChange={(e) => setRefundForm({ ...refundForm, notes: e.target.value })}
                  />
                </div>
              </div>

              {apiErrors && (
                <div className="mx-8 mt-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold">
                  <AlertCircle size={16} /> {apiErrors}
                </div>
              )}

              <div className="p-6 bg-slate-50 flex gap-3">
                <button onClick={() => setShowActionModal(false)} className="flex-1 px-4 py-3 text-slate-400 font-bold text-sm">Cancel</button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!refundForm.reason || refundForm.quantity < 1}
                  className="flex-[2] bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-red-700 disabled:bg-slate-300"
                >
                  Submit Refund
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnModal;