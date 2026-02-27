import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface AddUserModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editUser: any;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
    show,
    onClose,
    onSuccess,
    editUser,
}) => {
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [hubs, setHubs] = useState<any[]>([]);

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        mobile_number: "",
        role: "SUPER_ADMIN",
        password: "",
        comments: "",
        hub_id: "",
    });

    // ---------------- FETCH MASTER DATA ----------------
    useEffect(() => {
        fetchHubsByZone();
    }, []);

    const fetchHubsByZone = async () => {
        const res = await axiosInstance.get(Api?.allHubs);
        console.log(res?.data)
        setHubs(res?.data?.hubs || []);
    };


    useEffect(() => {
        if (editUser) {
            setNewUser({
                name: editUser.name || "",
                email: editUser.email || "",
                mobile_number: editUser.mobile_number || "",
                role: editUser.role || "ADMIN",
                password: "",
                comments: editUser.comments || "",
                hub_id: editUser?.hub_id,
            });
        }
    }, [editUser]);


    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiErrors("");

        try {
            setLoading(true);

            let response;

            if (editUser) {
                // EDIT MODE
                response = await axiosInstance.put(
                    `${Api.createUser}/${editUser.id}`,
                    {
                        ...newUser,
                        ...(newUser.password ? {} : { password: undefined }),
                    }
                );
            } else {
                // CREATE MODE
                response = await axiosInstance.post(Api.createUser, newUser);
            }

            if (response?.data?.success !== false) {
                onSuccess();
                onClose();
                setNewUser({
                    name: "",
                    email: "",
                    mobile_number: "",
                    role: "ADMIN",
                    password: "",
                    comments: "",
                    hub_id: "",
                });
            }

        } catch (error: any) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };


    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] no-scrollbar overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editUser ? "Edit User" : "Add New User"}
                    </h2>

                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ×
                    </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                value={newUser.name}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, email: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="user@example.com"
                            />
                        </div>
                    </div>

                    {/* Mobile + Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                required
                                value={newUser.mobile_number}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, mobile_number: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="9876543210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={newUser.role}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, role: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="HUB_MANAGER">HUB MANAGER</option>
                                <option value="AGENT">AGENT</option>
                                <option value="CUSTOMER">CUSTOMER</option>

                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newUser.role === "MANAGER" && (
                            <div>
                                <label className="text-sm text-gray-600">Hub</label>
                                <select
                                    value={newUser.hub_id}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, hub_id: e.target.value })
                                    }
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">Select Hub</option>
                                    {hubs?.map((h: any) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}


                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newUser.password}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, password: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter password"
                            />
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comments
                        </label>
                        <textarea
                            value={newUser.comments}
                            onChange={(e) =>
                                setNewUser({ ...newUser, comments: e.target.value })
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Optional notes..."
                        />
                    </div>

                    {/* Error */}
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
                            {editUser ? "Edit User" :

                                (<>
                                    {loading ? (
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Add User"}
                                </>)}

                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
