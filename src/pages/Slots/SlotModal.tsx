import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editSlot: any;
}

const SlotModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editSlot,
}) => {
    const isEdit = !!editSlot;

    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [form, setForm] = useState({
        name: "",
        description: "",
        start_time: "",
        end_time: "",
        max_orders: 0,
        status: "ACTIVE",
        zone: "",
    });
    const [zones, setZones] = useState<any[]>([]);

    const fetchZones = async () => {
        try {
            const response = await axiosInstance.get(Api?.allZone);
            setZones(response?.data?.zones || response?.data || []);
        } catch (error) {
            console.error("Failed to fetch zones:", error);
        }
    };

    useEffect(() => {
        fetchZones();
    }, []);

    useEffect(() => {
        if (editSlot) {
            setForm({
                name: editSlot.name || "",
                description: editSlot.description || "",
                start_time: editSlot.start_time || "",
                end_time: editSlot.end_time || "",
                max_orders: editSlot.max_orders || 0,
                status: editSlot.status || "ACTIVE",
                zone: editSlot.zone || "",
            });
        }
    }, [editSlot]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiErrors("");
        try {
            setLoading(true);

            if (isEdit) {
                await axiosInstance.put(`${Api?.slot}/${editSlot.id}`, form);
            } else {
                await axiosInstance.post(Api?.createSlot, form);
            }

            onSuccess();
            onClose();

            setForm({
                name: "",
                description: "",
                start_time: "",
                end_time: "",
                max_orders: 0,
                status: "ACTIVE",
                zone: "",
            });

        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? "Edit Slot" : "Add New Slot"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Zone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slot Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Morning Slot"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Zone ID
                            </label>
                            <select
                                value={form.zone}
                                onChange={(e) =>
                                    setForm({ ...form, zone: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Select Zone</option>
                                {zones?.map((zone) => (
                                    <option key={zone?.id} value={zone?.id}>
                                        {zone?.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Optional description..."
                        />
                    </div>

                    {/* Time Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time
                            </label>
                            <input
                                type="time"
                                required
                                value={form.start_time}
                                onChange={(e) =>
                                    setForm({ ...form, start_time: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time
                            </label>
                            <input
                                type="time"
                                required
                                value={form.end_time}
                                onChange={(e) =>
                                    setForm({ ...form, end_time: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Max Orders + Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Orders
                            </label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={form.max_orders}
                                onChange={(e) =>
                                    setForm({ ...form, max_orders: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm({ ...form, status: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}
                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                        >
                            {isEdit ? "Updating" :

                                (<>
                                    {loading ? (
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Add Slot"}
                                </>)}

                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default SlotModal;
