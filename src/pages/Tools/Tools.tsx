import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import Api from "../../api-endpoints/ApiUrls";
import ToolModal from "./ToolModal";
import Pagination from "../../components/Pagination";

interface ToolType {
    id: string;
    name: string;
    description: string;
    price: number;
    model: string;
    created_at?: string;
}

const Tools: React.FC = () => {
    const [tools, setTools] = useState<ToolType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTool, setEditTool] = useState<any>('');
    const [deleteItem, setDeleteItem] = useState<ToolType | null>(null);
    const [search, setSearch] = useState("");


    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async (pageNumber = page, size = pageSize) => {
        try {
            setLoading(true);

            const res = await axiosInstance.get(
                `${Api?.tools}?page=${pageNumber}&size=${size}`
            );
            console.log("Tools Response:", res?.data);
            setTools(res?.data?.data?.tools || []);

            const p = res?.data?.data?.pagination;

            if (p) {
                setPagination(p);
                setPage(p.page);
                setTotalPages(p.total_pages);
            }

        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchTools(newPage);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
        fetchTools(1, size);
    };

    const handleDelete = async () => {
        if (!deleteItem) return;

        try {
            await axiosInstance.delete(`${Api?.tools}/${deleteItem.id}/`);
            setDeleteItem(null);
            fetchTools();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // 🔥 Search Filter
    const filteredTools = tools.filter(
        (tool) =>
            tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.model.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 w-full">

            {/* Header */}
            <div className="flex justify-between flex-wrap gap-3 items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Tools Management
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage tools inventory
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditTool(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                </button>
            </div>

            {/* 🔥 Search Box */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or model..."
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
                    <p className="text-gray-500 text-sm">Loading tools...</p>
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
                                        Brand
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Model
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTools.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-6 text-center text-gray-500"
                                        >
                                            {tools.length === 0
                                                ? "No tools created yet"
                                                : "No matching tools found"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTools.map((tool: any, index: number) => (
                                        <tr key={tool?.id} className="hover:bg-gray-50">

                                            <td className="px-6 py-4 text-sm font-medium">
                                                {index + 1}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {tool?.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {tool?.brand_details?.name ? tool?.brand_details?.name : '--'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {tool?.category_details?.name ? tool?.category_details?.name : '--'}
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                {tool?.model}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                                                ₹{tool?.price}
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditTool(tool);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-orange-600 hover:text-orange-800 p-1"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteItem(tool)}
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

                    {!loading && pagination && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={pagination.total_elements}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </div>
            )}

            {/* Modal */}
            <ToolModal
                show={showModal}
                onClose={() => { setShowModal(false), setEditTool('') }}
                onSuccess={fetchTools}
                editTool={editTool}
            />

            {/* Delete Confirm */}
            {deleteItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            Delete Tool
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

export default Tools;