import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import BrandModal from "./BrandModal";
import Api from "../../api-endpoints/ApiUrls";

interface Brand {
    id: string;
    name: string;
    logo_url: string;
    status: string;
    is_featured: boolean;
    type: string;
}

const Brands: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBrand, setEditBrand] = useState<any>('');
    const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    useEffect(() => {
        fetchBrands();
    }, [typeFilter]);

    const fetchBrands = async () => {
        try {

            const params = new URLSearchParams();

            if (typeFilter !== "") {
                params.append("type", typeFilter);
            }

            const res = await axiosInstance.get(
                `${Api?.allBrands}?${params.toString()}`
            );

            setBrands(res?.data?.brands || []);

        } catch (err) {
            console.error("Brand fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setTypeFilter("");
    };


    const handleDelete = async () => {
        if (!deleteBrand) return;

        try {
            await axiosInstance.delete(`${Api?.Brands}/${deleteBrand.id}`);
            setDeleteBrand(null);
            fetchBrands();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    // 🔥 Search Filter
    const filteredBrands = brands.filter(
        (brand) =>
            brand?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
            brand?.type?.toLowerCase()?.includes(search?.toLowerCase())
    );

    const handleStatusToggle = async (brand: Brand) => {
        try {

            const formData = new FormData();

            formData.append(
                "status",
                brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
            );

            await axiosInstance.put(
                `${Api?.Brands}/${brand.id}`,
                formData
            );

            fetchBrands();

        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    return (
        <div className="space-y-6 w-full">

            {/* Header */}
            <div className="flex justify-between flex-wrap gap-3 items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Brand Management
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage product brands
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditBrand(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Brand
                </button>
            </div>

            {/* 🔥 Search Box */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">

                <div className="flex flex-col sm:flex-row gap-4">

                    {/* SEARCH */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by brand name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* TYPE FILTER */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">All Types</option>
                        <option value="SERVICE">Service</option>
                        <option value="PRODUCT">Product</option>
                        <option value="TOOLS">Tools</option>
                    </select>

                    {/* CLEAR */}
                    {(search || typeFilter) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        >
                            Clear
                        </button>
                    )}

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
                                    Logo
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
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                                        No brands found
                                    </td>
                                </tr>
                            ) : (
                                filteredBrands.map((brand, index) => (
                                    <tr key={brand.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4 text-sm font-medium">
                                            {index + 1}
                                        </td>

                                        <td className="px-6 py-4">
                                            {brand.logo_url ? (
                                                <img
                                                    src={brand.logo_url}
                                                    alt="logo"
                                                    className="w-12 h-12 object-contain rounded-md border"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                                                    No Logo
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold">
                                            {brand.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {brand.type}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={brand.status === "ACTIVE"}
                                                    onChange={() => handleStatusToggle(brand)}
                                                    className="sr-only peer"
                                                />

                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer 
        peer-checked:bg-green-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border after:rounded-full after:h-5 after:w-5
        after:transition-all peer-checked:after:translate-x-full">
                                                </div>
                                            </label>
                                        </td>

                                        <td className="px-6 py-4 text-right text-sm">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditBrand(brand);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-orange-600 hover:text-orange-800 p-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setDeleteBrand(brand)}
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
            <BrandModal
                show={showModal}
                onClose={() => { setShowModal(false), setEditBrand('') }}
                onSuccess={fetchBrands}
                editBrand={editBrand}
            />

            {/* Delete Confirm */}
            {deleteBrand && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            Delete Brand
                        </h2>

                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <b>{deleteBrand.name}</b> ?
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setDeleteBrand(null)}
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

export default Brands;
