import React, { useEffect, useState } from "react";
import axiosInstance from "../../../configs/axios-middleware";
import Api from "../../../api-endpoints/ApiUrls";
import { Loader2, MapPin, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    show: boolean;
    onClose: () => void;
    order: any;
}

const AgentAssign: React.FC<Props> = ({ show, onClose, order }) => {
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [zoneName, setZoneName] = useState("");
    const [noSlots, setNoSlots] = useState(false);

    useEffect(() => {
        if (!show || !order) return;
        fetchSlots();
    }, [show]);

    const fetchSlots = async () => {
        try {
            setLoading(true);

            const res = await axiosInstance.get(Api.zoneByLocation, {
                params: {
                      lat: order?.lat,
                    // lat: 5646546,
                    lng: order?.lng,
                },
            });

            const slotData = res?.data?.zone_slot?.slots || [];

            setSlots(slotData);
            setZoneName(res?.data?.zone_slot?.zone?.name || "");

            if (slotData.length === 0) {
                setNoSlots(true);
                toast("⚠ No slots available for this location", {
                    icon: "⚠️",
                });
            } else {

            }
        } catch (err) {
            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedSlot) {
            toast.error("Please select a slot");
            return;
        }

        try {
            setLoading(true);

            await axiosInstance.post(Api.directSlotChange, {
                order_id: order?.id,
                slot_id: selectedSlot,
                requested_date: new Date().toISOString().split("T")[0],
            });

            toast.success("Slot assigned successfully 🎉");

            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to assign slot");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setLoading(true);

            await axiosInstance.post(
                `${Api.adminCancelOrder}/${order?.id}/admin-cancel/`
            );

            toast.success("Order cancelled successfully");

            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to cancel order");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">

            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Clock size={18} />
                        Assign Slot
                    </h2>

                    <button
                        onClick={() => {
                            setSlots([]);
                            onClose();
                        }}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* ZONE */}
                {zoneName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin size={14} />
                        Zone: <span className="font-medium">{zoneName}</span>
                    </div>
                )}

                {/* LOADER */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-orange-600" />
                    </div>
                )}
                {!slots?.filter((slot: any) => slot?.status === "ACTIVE")?.length ? (
                    /* NO SLOT UI */
                    <div className="text-center py-10 space-y-4">

                        <AlertTriangle className="mx-auto text-red-500" size={40} />

                        <p className="text-gray-700 font-medium">
                            No slots available for this location
                        </p>

                        <p className="text-sm text-gray-500">
                            You can cancel this order if required
                        </p>

                        <button
                            onClick={handleCancelOrder}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Cancel Order
                        </button>

                    </div>
                ) : (
                    /* SLOT LIST */
                    <div className="space-y-3 max-h-72 overflow-y-auto">

                        {slots
                            ?.filter((slot: any) => slot?.status === "ACTIVE")
                            ?.map((slot: any) => (
                                <label
                                    key={slot?.id}
                                    className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition
                  ${selectedSlot === slot.id
                                            ? "border-orange-500 bg-orange-50"
                                            : "hover:bg-gray-50"
                                        }`}
                                >

                                    <div>
                                        <p className="font-medium capitalize">
                                            {slot?.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {slot?.start_time} - {slot?.end_time}
                                        </p>
                                    </div>

                                    <input
                                        type="radio"
                                        name="slot"
                                        value={slot.id}
                                        checked={selectedSlot === slot.id}
                                        onChange={() => {
                                            setSelectedSlot(slot.id);
                                            toast(`Selected slot: ${slot.name}`);
                                        }}
                                    />
                                </label>
                            ))}

                    </div>
                )}

                {/* ACTIONS */}
                {!noSlots && (
                    <div className="flex justify-end gap-3 mt-6">

                        <button
                            onClick={() => {
                                setSlots([]);
                                onClose();
                            }}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Close
                        </button>

                        <button
                            onClick={handleAssign}
                            disabled={!selectedSlot}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:bg-gray-300"
                        >
                            Assign Slot
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
};

export default AgentAssign;