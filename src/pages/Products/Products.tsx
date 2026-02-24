import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, CheckCircle, XCircle, DollarSign, Trash2 } from "lucide-react";
import ProductModal from "./ProductModal";
import PricingModal from "./PricingModal";
import Api from '../../api-endpoints/ApiUrls';

const Products: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);

    const [showPricing, setShowPricing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);


    const [search, setSearch] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);


    useEffect(() => {
        fetchProducts();
        fetchBrands();
        fetchCategories();
    }, []);

    const fetchBrands = async () => {
        const res = await axiosInstance.get(Api?.allBrands);
        setBrands(res?.data?.brands || []);
    };

    const fetchCategories = async () => {
        const res = await axiosInstance.get(Api?.categories);
        setCategories(res?.data?.data || []);
    };


    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.sku?.toLowerCase().includes(search.toLowerCase());

        const matchesBrand =
            selectedBrand === "" || product?.brand === selectedBrand;

        const matchesCategory =
            selectedCategory === "" ||
            product.categories?.some(
                (cat: any) => cat?.id === selectedCategory
            );

        return matchesSearch && matchesBrand && matchesCategory;
    });

    const openDeleteModal = (id: string) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        await axiosInstance.delete(`${Api?.products}/${deleteId}`);
        setShowDeleteModal(false);
        setDeleteId(null);
        fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axiosInstance.get(`${Api?.products}?include_attribute=true&include_category=true&include_media=true`);
            setProducts(res?.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this product?")) return;
        await axiosInstance.delete(`${Api?.products}/${id}`);
        fetchProducts();
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Product Management
                    </h1>
                    <p className="text-gray-600">
                        Manage products, categories and pricing
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setEditProduct(null);
                            setShowCreateModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <StatCard title="Total Products" value={products.length} />

                <StatCard
                    title="Active Products"
                    value={products?.filter(p => p.status === "ACTIVE").length}
                    color="text-green-600"
                />

                <StatCard
                    title="Inactive Products"
                    value={products?.filter(p => p.status === "INACTIVE").length}
                    color="text-red-600"
                />

                <StatCard
                    title="Variants"
                    value={products?.filter(p => p.type === "VARIANT").length}
                    color="text-orange-600"
                />

            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3 border rounded-lg px-3 py-2 text-sm"
                />

                {/* Brand Filter */}
                <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full md:w-1/4 border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Brands</option>
                    {brands?.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-1/4 border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Categories</option>
                    {categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                {/* Clear Button */}
                <button
                    onClick={() => {
                        setSearch("");
                        setSelectedBrand("");
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing</th> */}
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">

                                                {/* Icon */}
                                                <div className="bg-gray-100 rounded-full p-4 mb-4">
                                                    <XCircle className="w-8 h-8 text-gray-400" />
                                                </div>

                                                {/* Message */}
                                                <p className="text-lg font-medium text-gray-700">
                                                    No Products Found
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Try adjusting your search or filter criteria.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {filteredProducts?.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">

                                                {/* Product */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-orange-600 font-medium">
                                                                {product.name?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {product.model_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {product.brand_name}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {product.sku}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.categories?.map((cat: any) => (
                                                            <span
                                                                key={cat.id}
                                                                className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                                                            >
                                                                {cat.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {product.status === "ACTIVE" ? (
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                        )}
                                                        {product.status}
                                                    </span>
                                                </td>

                                                {/* <button
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setShowPricing(true);
                                            }}
                                            className="inline-flex items-center mt-6 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100"
                                        >

                                            <DollarSign className="w-3 h-3 mr-1" />
                                            Pricing
                                        </button> */}

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">

                                                        {/* Pricing Button */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setShowPricing(true);
                                                            }}
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100"
                                                        >
                                                            <DollarSign className="w-3 h-3 mr-1" />
                                                            Pricing
                                                        </button>

                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => {
                                                                setEditProduct(product);
                                                                setShowCreateModal(true);
                                                            }}
                                                            className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-lg hover:bg-orange-100"
                                                        >
                                                            <Edit className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => openDeleteModal(product.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Delete
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

            {/* Product Modal */}
            <ProductModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchProducts}
                editProduct={editProduct}
            />

            {/* Pricing Modal */}
            <PricingModal
                show={showPricing}
                onClose={() => setShowPricing(false)}
                product={selectedProduct}
            // onSuccess={fetchProducts}
            />

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">

                        <h2 className="text-lg font-semibold mb-4">
                            Confirm Delete
                        </h2>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this product?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
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

export default Products;

/* Reusable Stat Card */
const StatCard = ({ title, value, color = "text-gray-900" }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>
            {value}
        </p>
    </div>
);
