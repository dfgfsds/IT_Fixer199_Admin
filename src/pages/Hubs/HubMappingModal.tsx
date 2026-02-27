import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader, Trash2 } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    hub: any;
}

const HubMappingModal: React.FC<Props> = ({ show, onClose, hub }) => {
    const [mappings, setMappings] = useState<any[]>([]);
    const [zoneId, setZoneId] = useState("");
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    console.log(hub)
    /* -------------------- FETCH ZONES -------------------- */
    const fetchZones = async () => {
        try {
            const response = await axiosInstance.get(Api?.allZone);
            setZones(response?.data?.zones || response?.data || []);
        } catch (error) {
            console.error("Failed to fetch zones:", error);
        }
    };

    /* -------------------- FETCH MAPPING -------------------- */
    const fetchMapping = async () => {
        try {
            const response = await axiosInstance.get(`${Api?.hubMapping}?hub=${hub?.id}`);
            console.log(response)
            const allMappings = response?.data?.mappings || [];

            const filtered = allMappings.filter(
                (m: any) => m.hub === hub?.id
            );

            setMappings(filtered);
        } catch (error) {
            console.error("Failed to fetch mapping:", error);
        }
    };

    /* -------------------- ADD MAPPING -------------------- */
    const handleAddMapping = async () => {
        if (!zoneId) return;

        try {
            setLoading(true);

            await axiosInstance.post(Api?.hubMapping, {
                hub: hub.id,
                zone: zoneId,
            });

            setZoneId("");
            fetchMapping();
        } catch (error) {
            console.error("Add mapping failed:", error);
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- DELETE MAPPING -------------------- */
    const handleDeleteMapping = async (id: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to remove this mapping?"
        );
        if (!confirmDelete) return;

        try {
            await axiosInstance.delete(`${Api?.hubMapping}?hub=${hub?.id}&zone=${id}`);

            fetchMapping();
        } catch (error) {
            console.error("Delete mapping failed:", error);
        }
    };

    /* -------------------- EFFECTS -------------------- */
    useEffect(() => {
        if (show) {
            fetchZones();
        }
    }, [show]);

    useEffect(() => {
        if (hub?.id) {
            fetchMapping();
        }
    }, [hub?.id]);

    if (!show || !hub) return null;

    return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] no-scrollbar overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Hub Mapping
                        </h2>
                        <p className="text-sm text-gray-500">
                            {hub?.name}
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
                <div className="p-6 space-y-6">

                    {/* Existing Mappings */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Mapped Zones
                        </h3>

                        {mappings?.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                No zones mapped yet.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {mappings?.map((map) => (
                                    <div
                                        key={map?.id}
                                        className="flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50"
                                    >
                                        <span className="text-sm font-medium">
                                            {map?.zone_name}
                                        </span>

                                        <button
                                            onClick={() => handleDeleteMapping(map?.zone)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Mapping */}
                    <div className="space-y-3 border-t pt-4">

                        <label className="text-sm text-gray-600 block">
                            Select Zone
                        </label>

                        <select
                            value={zoneId}
                            onChange={(e) => setZoneId(e?.target?.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Select Zone</option>
                            {zones
                                ?.filter(
                                    (zone) =>
                                        !mappings?.some((m) => m?.zone === zone?.id)
                                )
                                ?.map((zone) => (
                                    <option key={zone?.id} value={zone?.id}>
                                        {zone?.name}
                                    </option>
                                ))}
                        </select>


                        <button
                            onClick={handleAddMapping}
                            disabled={!zoneId || loading}
                            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300"
                        >
                            {/* {loading ? "Adding..." : "Add Mapping"} */}
                            {loading ? (
                                <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Adding... </div>) : "Add Mapping"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HubMappingModal;
