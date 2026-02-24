import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2 } from "lucide-react";
import ServiceModal from "./ServiceModal";
import Api from '../../api-endpoints/ApiUrls';
const Services: React.FC = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editService, setEditService] = useState<any>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState<any[]>([]);
    console.log(selectedCategory)
    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get(Api?.categories);
            setCategories(res?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredServices = services.filter((service) => {

        const matchesSearch =
            service?.name?.toLowerCase().includes(search.toLowerCase()) ||
            service?.description?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            selectedCategory === "" ||
            service?.categories?.some(
                (cat: any) => cat?.category === selectedCategory
            );
        console.log(matchesCategory)
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axiosInstance.get(`${Api?.services}/?include_categories=true&include_media=true&include_pricing=true&include_zones=true`);
            setServices(res?.data?.services || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        await axiosInstance.delete(`${Api?.services}/${deleteId}/`);
        setDeleteId(null);
        fetchServices();
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Service Management
                    </h1>
                    <p className="text-gray-600">
                        Manage services, pricing & zone mapping
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditService(null);
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Services" value={services.length} />
                <StatCard
                    title="Active"
                    value={services.filter(s => s.status === "ACTIVE").length}
                    color="text-green-600"
                />
                <StatCard
                    title="Inactive"
                    value={services.filter(s => s.status !== "ACTIVE").length}
                    color="text-red-600"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search service..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3 border rounded-lg px-3 py-2 text-sm"
                />

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-1/4 border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                        <option key={cat?.id} value={cat?.id}>
                            {cat?.category_name || cat?.name}
                        </option>
                    ))}
                </select>

                {/* Clear Button */}
                <button
                    onClick={() => {
                        setSearch("");
                        setSelectedCategory("");
                    }}
                    className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                >
                    Clear
                </button>

            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64 gap-5 text-lg font-bold text-orange-600">
                    Loading <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        S.No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Service
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Categories
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Pricing
                                    </th> */}
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Zone & Hub
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        ETA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        OTP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {filteredServices?.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center text-gray-500">

                                                <div className="bg-gray-100 rounded-full p-4 mb-4">
                                                    <Trash2 className="w-8 h-8 text-gray-400" />
                                                </div>

                                                {services.length === 0 ? (
                                                    <>
                                                        <p className="text-lg font-medium text-gray-700">
                                                            No Services Added Yet
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Click "Add Service" to create one.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-lg font-medium text-gray-700">
                                                            No Matching Services Found
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Try adjusting your search or filter.
                                                        </p>
                                                    </>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {filteredServices?.map((service: any, index: number) => (
                                            <tr key={service.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    {index + 1}
                                                </td>
                                                {/* SERVICE INFO */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">

                                                        {/* Avatar */}
                                                        {/* <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-orange-600 font-semibold">
                                                        {service.name?.charAt(0)}
                                                    </span>
                                                </div> */}

                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {service.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                                {service.description?.slice(0, 30)}
                                                            </div>

                                                            {/* Media Preview */}
                                                            {/* {service.media_files?.length > 0 && (
                                                        <img
                                                            src={service.media_files[0].image_url}
                                                            alt=""
                                                            className="w-16 h-10 object-cover rounded mt-2 border"
                                                        />
                                                    )} */}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* CATEGORIES */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {service.categories?.length > 0 ? (
                                                            service.categories.map((cat: any) => (
                                                                <span
                                                                    key={cat.id}
                                                                    className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                                                                >
                                                                    {cat.category_name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                No Categories
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* PRICING */}
                                                {/* <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                                {service.pricing_models?.length || 0} Pricing
                                            </span>
                                        </td> */}

                                                {/* ZONE HUB */}
                                                {/* <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                                {service.zone_hub_mappings?.length || 0} Mappings
                                            </span>
                                        </td> */}

                                                {/* ETA */}
                                                <td className="px-6 py-4 text-sm">
                                                    {service.eta} mins
                                                </td>

                                                {/* OTP */}
                                                <td className="px-6 py-4">
                                                    {service.is_otp_required ? (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                                            Required
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                                                            No
                                                        </span>
                                                    )}
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${service.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {service.status}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">

                                                        <button
                                                            onClick={() => {
                                                                setEditService(service);
                                                                setShowModal(true);
                                                            }}
                                                            className="text-orange-600 hover:text-orange-900"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteId(service.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                    </>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Service Modal */}
            <ServiceModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchServices}
                editService={editService}
            />

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this service?
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

export default Services;

const StatCard = ({ title, value, color = "text-gray-900" }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>
            {value}
        </p>
    </div>
);
