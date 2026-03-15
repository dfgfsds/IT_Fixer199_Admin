import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader2 } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const SlotChangeModal = ({ order, onClose, onSuccess }: any) => {

    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [apiErrors, setApiErrors] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const res = await axiosInstance.get(
            `${Api?.zoneByLocation}?lat=${order?.latitude}&lng=${order?.longitude}`
        );

        setSlots(res.data?.zone_slot?.slots || []);
    };

    const handleSubmit = async () => {

        if (!selectedSlot) return;

        const slot = slots.find((s) => s.id === selectedSlot);

        try {

            setLoading(true);
            setApiErrors("");

            const updatedAPi = await axiosInstance.post(`${Api?.requestSlotChange}/`, {
                order_id: order.id,
                order_item_id: order.order_item_id,
                current_slot_id: order.slot_id,
                requested_slot_id: selectedSlot,
                requested_date: order.date,
                requested_start_time: slot.start_time,
                requested_end_time: slot.end_time,
                slot_change_reason_type: reason,
                slot_change_reason_description: description,
            });

            if (updatedAPi) {
                onSuccess();
                onClose();
            }

        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-full max-w-lg">

                <h2 className="text-lg font-semibold mb-4">
                    Change Order Slot
                </h2>

                {/* CURRENT SLOT */}
                <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="font-medium text-gray-700">
                        Current Slot
                    </div>
                    <div className="text-gray-600">
                        {order?.slot_time}
                    </div>
                </div>

                {/* SLOT */}
                <div className="mb-4">
                    <label className="text-sm font-medium">Select New Slot</label>
                    <select
                        className="w-full border rounded-lg p-2 mt-1"
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                        <option value="">Select Slot</option>
                        {slots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                                {slot.name} ({slot.start_time} - {slot.end_time})
                            </option>
                        ))}
                    </select>
                </div>

                {/* REASON */}
                <div className="mb-4">
                    <label className="text-sm font-medium">Reason</label>
                    <select
                        className="w-full border rounded-lg p-2 mt-1"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    >
                        <option value="">Select Reason</option>
                        <option value="AGENT_UNAVAILABLE">Agent Unavailable</option>
                        <option value="CUSTOMER_REQUEST">Customer Request</option>
                    </select>
                </div>

                {/* DESCRIPTION */}
                <div className="mb-4">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="w-full border rounded-lg p-2 mt-1"
                        placeholder="Enter reason description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {apiErrors && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                        {apiErrors}
                    </div>
                )}

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="border px-4 py-2 rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? "Changing..." : "Change Slot"}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default SlotChangeModal;