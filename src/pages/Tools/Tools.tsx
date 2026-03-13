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
    const [statusFilter, setStatusFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        fetchTools(1);
        fetchBrands();
        fetchCategories();
    }, [search, statusFilter, brandFilter, categoryFilter]);

    const fetchTools = async (pageNumber = page, size = pageSize) => {
        try {
            setLoading(true);

            const params: any = {
                page: pageNumber,
                size: size
            };

            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (brandFilter) params.brand_id = brandFilter;
            if (categoryFilter) params.category_id = categoryFilter;

            const res = await axiosInstance.get(Api.tools, { params });

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


    const fetchBrands = async () => {
        try {
            const res = await axiosInstance.get(Api?.allBrands);
            setBrands(res?.data?.brands || []);
        } catch (err) {
            console.error("Brand fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

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

    const toggleStatus = async (tool: any) => {
        try {

            const newStatus = tool.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

            await axiosInstance.put(`${Api.tools}/${tool.id}/`, {
                status: newStatus
            });

            fetchTools();

        } catch (error) {
            console.error("Status update failed", error);
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
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 grid md:grid-cols-5 gap-4">

                <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search tool..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Brand</label>
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="">All Brands</option>
                        {brands?.filter((brand) => brand?.type === "TOOLS")?.map((brand) => (
                            <option key={brand?.id} value={brand?.id}>
                                {brand?.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Category</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="">All Categories</option>
                        {categories?.filter((category) => category?.type === "TOOLS")?.map((category) => (
                            <option key={category?.id} value={category?.id}>
                                {category?.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Button */}
                <div className="flex flex-col justify-end">
                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setBrandFilter("");
                            setCategoryFilter("");
                            fetchTools(1);
                        }}
                        className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                    >
                        Clear All
                    </button>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTools.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16">
                                            <div className="flex flex-col items-center justify-center text-center">

                                                <div className="bg-gray-100 rounded-full p-4 mb-4">
                                                    <Search className="w-8 h-8 text-gray-400" />
                                                </div>

                                                {tools.length === 0 ? (
                                                    <>
                                                        <p className="text-lg font-semibold text-gray-700">
                                                            No Tools Added Yet
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Click <span className="font-medium text-orange-600">"Add Tool"</span> to create your first tool.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-lg font-semibold text-gray-700">
                                                            No Matching Tools Found
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Try adjusting your search or filters.
                                                        </p>
                                                    </>
                                                )}

                                            </div>
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
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(tool)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition 
        ${tool.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition 
            ${tool.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"}`}
                                                    />
                                                </button>
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