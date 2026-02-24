import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import AttributeModal from "./AttributeModal";
import Api from "../../api-endpoints/ApiUrls";

interface AttributeType {
    attribute_id: string;
    value_id: string;
    name: string;
    value: string;
    created_at: string;
}

const Attribute: React.FC = () => {
    const [attributes, setAttributes] = useState<AttributeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAttribute, setEditAttribute] = useState<AttributeType | null>(null);
    const [deleteItem, setDeleteItem] = useState<AttributeType | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(Api?.attribute);
            setAttributes(res?.data?.data || []);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;

        try {
            await axiosInstance.delete(
                `${Api?.attribute}/${deleteItem.attribute_id}`
            );
            setDeleteItem(null);
            fetchAttributes();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // 🔥 Search Filter
    const filteredAttributes = attributes.filter(
        (attr) =>
            attr.name.toLowerCase().includes(search.toLowerCase()) ||
            attr.value.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 w-full">

            {/* Header */}
            <div className="flex justify-between flex-wrap gap-3 items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Attribute Management
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage product attributes
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditAttribute(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attribute
                </button>
            </div>

            {/* 🔥 Search Box */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or value..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
            </div>

            {/* 🔥 Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm">Loading attributes...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="w-full overflow-x-auto">

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        S.No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAttributes.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-6 text-center text-gray-500"
                                        >
                                            No attributes found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttributes.map((attr, index) => (
                                        <tr key={attr.attribute_id} className="hover:bg-gray-50">

                                            <td className="px-6 py-4 text-sm font-medium">
                                                {index + 1}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {attr.name}
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                {attr.value}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(attr.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditAttribute(attr);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-orange-600 hover:text-orange-800 p-1"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteItem(attr)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AttributeModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchAttributes}
                editAttribute={editAttribute}
            />

            {/* Delete Confirm */}
            {deleteItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            Delete Attribute
                        </h2>

                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <b>{deleteItem.name}</b> ?
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setDeleteItem(null)}
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

export default Attribute;