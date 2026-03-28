import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const HubManagersModal = ({ show, onClose, hub }: any) => {
    const [managers, setManagers] = useState<any[]>([]);
    const [allManagers, setAllManagers] = useState<any[]>([]);
    const [selectedManager, setSelectedManager] = useState("");

    useEffect(() => {
        if (!hub) return;
        fetchHubManagers();
        fetchManagers();
    }, [hub]);

    const fetchHubManagers = async () => {
        const res = await axiosInstance.get(
            `${Api.hubManagerMapping}?hub_id=${hub.id}`
        );
        setManagers(res?.data?.data || []);
    };

    const fetchManagers = async () => {
        const res = await axiosInstance.get(
            `${Api.allUsers}?size=1000&role=HUB_MANAGER`
        );
        setAllManagers(res?.data?.users || []);
    };

    /* 🚀 Remove already assigned managers */
    const availableManagers = allManagers.filter(
        (user: any) =>
            !managers.some(
                (m: any) => m.manager_details?.id === user.id
            )
    );

    const handleAddManager = async () => {
        if (!selectedManager) return;
        try {
            const updatedApi = await axiosInstance.post(Api.hubManagerMapping, {
                hub: hub.id,
                manager: selectedManager,
            });
            if (updatedApi) {
                setSelectedManager("");
                fetchHubManagers();
            }

        } catch (error) {
            toast.error(extractErrorMessage(error));
        }

    };

    const handleRemoveManager = async (mappingId: string) => {
        if (!window.confirm("Remove this manager from hub?")) return;
        try {
            await axiosInstance.delete(
                `${Api.hubManagerMapping}/${mappingId}`
            );
            fetchHubManagers();
        } catch (error) {
            toast.error(extractErrorMessage(error));
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Hub Managers
                        </h2>
                        <p className="text-xs text-gray-500">
                            {hub?.name}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ADD MANAGER */}
                <div className="px-6 py-4 border-b">

                    <div className="flex gap-2">

                        <select
                            value={selectedManager}
                            onChange={(e) => setSelectedManager(e.target.value)}
                            className="border rounded-lg px-3 py-2 flex-1 text-sm capitalize"
                        >
                            <option value="">Select Manager</option>

                            {availableManagers?.filter((i) => i?.status === "ACTIVE")?.map((m: any) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.email})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleAddManager}
                            disabled={!selectedManager}
                            className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-4 rounded-lg text-sm"
                        >
                            <UserPlus size={16} />
                            Add
                        </button>

                    </div>

                </div>

                {/* MANAGER LIST */}
                <div className="px-6 py-4 max-h-[300px] overflow-y-auto space-y-3">

                    {managers?.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No managers assigned
                        </p>
                    )}

                    {managers?.map((m: any) => (
                        <div
                            key={m.id}
                            className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50"
                        >

                            <div className="flex items-center gap-3">

                                {/* avatar */}
                                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">
                                    {m.manager_details?.name?.charAt(0)}
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        {m.manager_details?.name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {m.manager_details?.mobile_number}
                                    </p>
                                </div>

                            </div>

                            {/* REMOVE BUTTON */}
                            <button
                                onClick={() => handleRemoveManager(m.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                                Remove
                            </button>

                        </div>
                    ))}

                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center px-6 py-3 border-t">

                    <p className="text-xs text-gray-400">
                        Total Managers: {managers.length}
                    </p>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-sm"
                    >
                        Close
                    </button>


                </div>

            </div>

        </div>
    );
};

export default HubManagersModal;