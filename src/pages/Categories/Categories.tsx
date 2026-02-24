import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import CategoryModal from "./CategoryModal";
import Api from "../../api-endpoints/ApiUrls";

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
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get(Api?.categories);
            setCategories(res?.data?.data || []);
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

    // 🔥 Search Filter
    const filteredCategories = categories.filter(
        (cat) =>
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 w-full">

            {/* Header */}
            <div className="flex justify-between flex-wrap gap-3 items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Categories Management
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage service categories
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditCategory(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Categorie
                </button>
            </div>

            {/* 🔥 Search Box */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by category name or type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
            </div>

            {/* Table */}
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
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
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
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-6 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat, index) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4 text-sm font-medium">
                                            {index + 1}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold">
                                            {cat.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {cat.type}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${cat.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {cat.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(cat.created_at).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4 text-right text-sm">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditCategory(cat);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-orange-600 hover:text-orange-800 p-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setDeleteId(cat.id)}
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

            {/* Modal */}
            <CategoryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchCategories}
                editCategory={editCategory}
            />

            {/* Delete Confirm */}
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
