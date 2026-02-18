import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2 } from "lucide-react";
import BrandModal from "./BrandModal";
import Api from '../../api-endpoints/ApiUrls';


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
    const [editBrand, setEditBrand] = useState<Brand | null>(null);
    const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await axiosInstance.get(Api?.allBrands);
            console.log(res)
            setBrands(res?.data?.brands);
        } catch (err) {
            console.error("Brand fetch failed:", err);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Brand Management</h1>

                <button
                    onClick={() => {
                        setEditBrand(null);
                        setShowModal(true);
                    }}
                    className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Brand
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">S.No</th>
                                <th className="p-4 text-left">Logo</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Type</th>
                                <th className="p-4 text-left">Status</th>
                                {/* <th className="p-4 text-left">Featured</th> */}
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {brands.map((brand: any, index: number) => (
                                <tr key={brand.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 font-medium">{index + 1}</td>

                                    <td className="p-4">
                                        {brand.logo_url && (
                                            <img
                                                src={brand.logo_url}
                                                alt="logo"
                                                className="w-12 h-12 object-contain"
                                            />
                                        )}
                                    </td>

                                    <td className="p-4 font-medium">{brand.name}</td>

                                    <td className="p-4">{brand.type}</td>

                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${brand.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {brand.status}
                                        </span>
                                    </td>

                                    {/* <td className="p-4">
                    {brand.is_featured ? "Yes" : "No"}
                  </td> */}

                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditBrand(brand);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 text-orange-600" />
                                        </button>

                                        <button
                                            onClick={() => setDeleteBrand(brand)}
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
            <BrandModal
                show={showModal}
                onClose={() => setShowModal(false)}
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