import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, MapPin, Search, ZapIcon, Map } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
// import HubModal from "./HubModal";
// import HubMappingModal from "./HubMappingModal";
import Api from '../../api-endpoints/ApiUrls';
import HubMappingModal from "./HubMappingModal";
import HubModal from "./HubModal";
import HubZoneViewModal from "./HubZoneViewModal";


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
    const [search, setSearch] = useState("");
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [zonesData, setZonesData] = useState<any[]>([]);

    const fetchZonesForHub = async (hubId: string) => {
        try {
            const response = await axiosInstance.get(
                `${Api?.hubMapping}?hub=${hubId}`
            );
            const mappings = response?.data?.mappings || [];

            setZonesData(mappings);
            setShowZoneModal(true);

        } catch (error) {
            console.error("Failed to fetch zones:", error);
        }
    };


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

        await axiosInstance.delete(`${Api?.hub}/${deleteHubId}`);
        setDeleteHubId(null);
        fetchHubs();
    };

    const filteredHubs = hubs?.filter(
        (hub) =>
            hub.name.toLowerCase().includes(search.toLowerCase()) ||
            hub.primary_address.toLowerCase().includes(search.toLowerCase()) ||
            hub.contact_info.toLowerCase().includes(search.toLowerCase())
    );



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
            <div className="flex justify-between flex-wrap gap-2 items-center">
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
            {/* Search */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search hubs by name, address or contact..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="w-full overflow-x-auto">

                    <table className="min-w-full divide-y divide-gray-200">

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mapping</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Zones</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredHubs?.map((hub, index) => (
                                <tr key={hub.id} className="hover:bg-gray-50">

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {index + 1}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                        {hub.name}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {hub.head?.name || "-"}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {hub.primary_address}
                                    </td>

                                    <td className="px-6 py-4 text-sm">
                                        {hub.contact_info}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${hub.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {hub.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedHub(hub);
                                                setShowMappingModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Mapping
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                fetchZonesForHub(hub.id);
                                                // setShowZoneModal(!showZoneModal);
                                            }}

                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            <Map className="w-4 h-4 inline mr-1" />
                                            Zones
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 text-right text-sm">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditHub(hub);
                                                    setShowModal(true);
                                                }}
                                                className="text-orange-600 hover:text-orange-800 p-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => setDeleteHubId(hub.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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

            <HubZoneViewModal
                show={showZoneModal}
                onClose={() => setShowZoneModal(false)}
                hub={selectedHub}
                zones={zonesData}
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
