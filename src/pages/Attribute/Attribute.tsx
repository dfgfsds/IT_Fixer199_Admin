import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2 } from "lucide-react";
import AttributeModal from "./AttributeModal";
import Api from '../../api-endpoints/ApiUrls';


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

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            const res = await axiosInstance.get(Api?.attribute);
            console.log(res)
            setAttributes(res?.data?.data);
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

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Attribute Management</h1>

                <button
                    onClick={() => {
                        setEditAttribute(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attribute
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[700px] w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">S.No</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Value</th>
                                <th className="p-4 text-left">Created</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {attributes.map((attr: any, index: number) => (
                                <tr key={attr.attribute_id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 font-medium">{index + 1}</td>
                                    <td className="p-4 font-medium">{attr.name}</td>
                                    <td className="p-4">{attr.value}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(attr.created_at).toLocaleDateString()}
                                    </td>

                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditAttribute(attr);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 text-orange-600" />
                                        </button>

                                        <button
                                            onClick={() => setDeleteItem(attr)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AttributeModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchAttributes}
                editAttribute={editAttribute}
            />

            {/* Delete Confirm Modal */}
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