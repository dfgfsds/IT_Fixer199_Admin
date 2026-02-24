import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editHub: any;
}

const HubModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editHub,
}) => {
    const isEdit = !!editHub;
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await axiosInstance.get(Api.allUsers);
            setUsers(response?.data?.users || response?.data || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };



    const [form, setForm] = useState({
        name: "",
        primary_address: "",
        head: "",
        latitude: "",
        longitude: "",
        contact_info: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        if (editHub) {
            setForm({
                name: editHub.name || "",
                primary_address: editHub.primary_address || "",
                head: editHub.head?.id || "",
                latitude: editHub.latitude || "",
                longitude: editHub.longitude || "",
                contact_info: editHub.contact_info || "",
                status: editHub.status || "ACTIVE",
            });
        }
    }, [editHub]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                const response = await axiosInstance.put(`${Api?.hub}/${editHub.id}`, form);
                if (response) {
                    onSuccess();
                    onClose();
                }
            } else {
                const response = await axiosInstance.post(Api?.createHub, form);
                if (response) {
                    onSuccess();
                    onClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setApiErrors(extractErrorMessage(error));
            setLoading(false);
        }



    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] no-scrollbar overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Hub" : "Create Hub"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 text-xl">
                        ×
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="text-sm text-gray-600">Hub Name</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Head User</label>

                            <select
                                required
                                value={form.head}
                                onChange={(e) => setForm({ ...form, head: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 capitalize "
                            >
                                <option value="">Select Head User</option>

                                {users.map((user) => (
                                    <option key={user.id} value={user.id} className="capitalize">
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>

                            {loadingUsers && (
                                <p className="text-xs text-gray-400 mt-1">Loading users...</p>
                            )}
                        </div>


                        <div>
                            <label className="text-sm text-gray-600">Latitude</label>
                            <input
                                type="text"
                                value={form.latitude}
                                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Longitude</label>
                            <input
                                type="text"
                                value={form.longitude}
                                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Primary Address</label>
                        <textarea
                            required
                            value={form.primary_address}
                            onChange={(e) =>
                                setForm({ ...form, primary_address: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Contact Info</label>
                        <input
                            type="text"
                            value={form.contact_info}
                            onChange={(e) =>
                                setForm({ ...form, contact_info: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>

                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                            {/* {isEdit ? "Update Hub" : "Create Hub"} */}
                            {isEdit ? "Edit User" :

                                (<>
                                    {loading ? (
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Create Hub"}
                                </>)}

                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default HubModal;
