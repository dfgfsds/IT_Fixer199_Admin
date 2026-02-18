import React, { useState, useEffect } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editZone: any;
}

const ZoneModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editZone,
}) => {
    const isEdit = !!editZone;

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        coordinates: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        if (editZone) {
            setForm({
                name: editZone.name || "",
                description: editZone.description || "",
                coordinates: editZone.coordinates || "",
                status: editZone.status || "ACTIVE",
            });
        } else {
            setForm({
                name: "",
                description: "",
                coordinates: "",
                status: "ACTIVE",
            });
        }
    }, [editZone]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await axiosInstance.put(`${Api.zone}/${editZone.id}`, form);
            } else {
                await axiosInstance.post(Api.createZone, form);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Zone save failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEdit ? "Edit Zone" : "Create New Zone"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isEdit
                                ? "Update zone information"
                                : "Add a new operational zone"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name + Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Zone Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter zone name"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                    </div>

                    {/* Coordinates */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Coordinates
                        </label>
                        <input
                            type="text"
                            required
                            value={form.coordinates}
                            onChange={(e) =>
                                setForm({ ...form, coordinates: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Lat, Long"
                        />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Optional notes about this zone"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
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
                            {loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Creating..."
                                : isEdit
                                    ? "Update Zone"
                                    : "Create Zone"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ZoneModal;
