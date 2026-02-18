import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2 } from "lucide-react";
import ServiceModal from "./ServiceModal";

const Services: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editService, setEditService] = useState<any>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axiosInstance.get("/api/services/");
            setServices(res?.data?.services || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        await axiosInstance.delete(`/api/services/${deleteId}/`);
        setDeleteId(null);
        fetchServices();
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Service Management
                    </h1>
                    <p className="text-gray-600">
                        Manage services, pricing & zone mapping
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditService(null);
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Services" value={services.length} />
                <StatCard
                    title="Active"
                    value={services.filter(s => s.status === "ACTIVE").length}
                    color="text-green-600"
                />
                <StatCard
                    title="Inactive"
                    value={services.filter(s => s.status !== "ACTIVE").length}
                    color="text-red-600"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Service
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Parent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        ETA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        OTP Required
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {service.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {service.description}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {service.parent_name || "-"}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {service.eta} mins
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {service.is_otp_required ? "Yes" : "No"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${service.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {service.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">

                                                <button
                                                    onClick={() => {
                                                        setEditService(service);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-orange-600 hover:text-orange-900 p-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setDeleteId(service.id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
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
            )}

            {/* Service Modal */}
            <ServiceModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchServices}
                editService={editService}
            />

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this service?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
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

export default Services;

const StatCard = ({ title, value, color = "text-gray-900" }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>
            {value}
        </p>
    </div>
);
