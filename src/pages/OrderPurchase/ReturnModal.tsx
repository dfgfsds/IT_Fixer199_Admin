import React, { useState } from "react";
import axios from "axios";

const ReturnModal = ({ show, onClose, grn, selectedInvoice }: any) => {
  const [reason, setReason] = useState("");

  const [items, setItems] = useState(
    grn?.items?.map((i: any) => ({
      ...i,
      quantity: 0,
    })) || []
  );

  if (!show || !grn) return null;

  const handleChange = (index: number, value: number, max: number) => {
    if (value > max) return;

    const updated = [...items];
    updated[index].quantity = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      purchase_order_id: selectedInvoice?.id,
      grn_id: grn?.id,
      return_date: new Date().toISOString(),
      reason,
      items: items
        .filter((i:any) => i.quantity > 0)
        .map((i:any) => ({
          product: i.product_name,
          quantity: i.quantity,
          rate: i.rate,
          serial_numbers: i.serial_numbers || [],
          notes: i.notes || "",
        })),
    };

    try {
      await axios.post("/api/purchase/return/", payload);
      alert("Return Success");
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] p-4 rounded">

        <h3 className="font-bold mb-3">Return Items</h3>

        <input
          placeholder="Reason"
          className="border p-2 w-full mb-3"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between mb-2">
            <span>{item.product_name}</span>

            <input
              type="number"
              className="border w-20"
              onChange={(e) =>
                handleChange(
                  i,
                  Number(e.target.value),
                  item.received_quantity
                )
              }
            />
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-red-600 text-white px-3 py-1"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;