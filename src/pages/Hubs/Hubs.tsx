import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
// import HubModal from "./HubModal";
// import HubMappingModal from "./HubMappingModal";
import Api from '../../api-endpoints/ApiUrls';
import HubMappingModal from "./HubMappingModal";
import HubModal from "./HubModal";

interface HubType {
    id: string;
    name: string;
    primary_address: string;
    latitude: string;
    longitude: string;
    contact_info: string;
    status: string;
    head?: {
        name: string;
    };
}

const Hubs: React.FC = () => {
    const [hubs, setHubs] = useState<HubType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editHub, setEditHub] = useState<HubType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedHub, setSelectedHub] = useState<HubType | null>(null);
    const [deleteHubId, setDeleteHubId] = useState<string | null>(null);

    useEffect(() => {
        fetchHubs();
    }, []);

    const fetchHubs = async () => {
        try {
            const response = await axiosInstance.get(Api?.allHubs);
            setHubs(response?.data?.hubs);
        } catch (error) {
            console.error("Failed to fetch hubs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteHubId) return;

        await axiosInstance.delete(`/api/hub/${deleteHubId}`);
        setDeleteHubId(null);
        fetchHubs();
    };


    // const handleDelete = async (id: string) => {
    //     if (!window.confirm("Delete this hub?")) return;

    //     try {
    //         await axiosInstance.delete(`/api/hub/${id}`);
    //         fetchHubs();
    //     } catch (error) {
    //         console.error("Delete failed:", error);
    //     }
    // };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Hub Management</h1>
                    <p className="text-gray-500">Create and manage hubs</p>
                </div>

                <button
                    onClick={() => {
                        setEditHub(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hub
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">S.No</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Head</th>
                                <th className="p-4 text-left">Address</th>
                                <th className="p-4 text-left">Contact</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-center">Mapping</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hubs.map((hub: any, index: number) => (
                                <tr key={hub.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 font-medium">{index + 1}</td>

                                    <td className="p-4 font-medium">{hub.name}</td>
                                    <td className="p-4">{hub.head?.name || "-"}</td>
                                    <td className="p-4">{hub.primary_address}</td>
                                    <td className="p-4">{hub.contact_info}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${hub.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {hub.status}
                                        </span>
                                    </td>

                                    {/* Mapping Button */}
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedHub(hub);
                                                setShowMappingModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Mapping
                                        </button>
                                    </td>

                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditHub(hub);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 text-orange-600" />
                                        </button>

                                        {/* <button onClick={() => handleDelete(hub.id)}>
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button> */}
                                        <button onClick={() => setDeleteHubId(hub.id)}>
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hub Create/Edit Modal */}
            <HubModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchHubs}
                editHub={editHub}
            />

            {/* Mapping Modal */}
            <HubMappingModal
                show={showMappingModal}
                onClose={() => setShowMappingModal(false)}
                hub={selectedHub}
            />

            {deleteHubId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">

                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Confirm Delete
                        </h2>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this hub?
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteHubId(null)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Hubs;
