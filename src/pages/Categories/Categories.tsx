import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import CategoryModal from "./CategoryModal";
import Api from '../../api-endpoints/ApiUrls';

interface Category {
    id: string;
    name: string;
    description: string;
    parent: string | null;
    status: string;
    type: string;
    created_at: string;
    updated_at: string;
}

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get(Api?.categories);
            console.log(res)
            setCategories(res?.data?.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await axiosInstance.delete(`${Api?.categories}/${deleteId}`);
            setDeleteId(null);
            fetchCategories();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Category Management</h1>
                    <p className="text-gray-500 text-sm">
                        Manage service categories
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditCategory(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">S.No</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Type</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat: any, index: number) => (
                                    <tr key={cat.id} className="border-t hover:bg-gray-50">
                                        <td className="p-4 font-medium">{index + 1}</td>

                                        <td className="p-4 font-medium">{cat.name}</td>
                                        <td className="p-4">{cat.type}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${cat.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(cat.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditCategory(cat);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <Edit className="w-4 h-4 text-orange-600" />
                                            </button>

                                            <button onClick={() => setDeleteId(cat.id)}>
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            <CategoryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchCategories}
                editCategory={editCategory}
            />

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            Delete Category
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this category?
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

export default Categories;
