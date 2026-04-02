import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Search, Trash2, Plus, Loader2 } from "lucide-react";
import InventoryModal from "./InventoryModal";
import Api from '../../api-endpoints/ApiUrls';
import Pagination from "../../components/Pagination";
import ProductAllocateModal from "./ProductAllocateModal";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const ProductsInventory: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInventory, setDeleteInventory] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const [stockModal, setStockModal] = useState(false);
    const [stockType, setStockType] = useState<"add" | "remove" | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [quantity, setQuantity] = useState<any>();
    const [stockLoading, setStockLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [productModal, setProductModal] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    // ADD STATE
    const [serialNumbers, setSerialNumbers] = useState<string[]>([""]);

    // SYNC SERIALS WITH QUANTITY (🔥 important)
    useEffect(() => {
        setSerialNumbers((prev) =>
            Array.from({ length: quantity || 1 }, (_, i) => prev[i] || "")
        );
    }, [quantity]);

    const handleSerialChange = (index: number, value: string) => {
        setSerialNumbers((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleAddSerial = () => {
        setSerialNumbers((prev) => [...prev, ""]);
        setQuantity((prev: any) => prev + 1);
    };

    const handleRemoveSerial = (index: number) => {
        setSerialNumbers((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            setQuantity(updated.length || 1);
            return updated.length ? updated : [""];
        });
    };
    const fetchInventory = async (pageNumber = page, size = pageSize) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `${Api.productInventory}?page=${pageNumber}&size=${size}`
            );

            setData(res?.data?.inventories || []);

            const p = res?.data?.pagination;

            setPagination(p);
            setPage(p?.page);
            setTotalPages(p?.total_pages);

        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchInventory(newPage);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
        fetchInventory(1, size);
    };


    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch =
                item.product?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.hub_name?.toLowerCase().includes(search.toLowerCase());

            const matchesStock =
                stockFilter === "all"
                    ? true
                    : stockFilter === "in"
                        ? item.stock_in_hub > 0
                        : item.stock_in_hub === 0;

            return matchesSearch && matchesStock;
        });
    }, [data, search, stockFilter]);

    const handleDeleteInventory = async () => {
        if (!deleteInventory) return;

        try {
            setDeleteLoading(true);

            await axiosInstance.delete(
                `${Api.productInventory}/${deleteInventory.id}/`
            );

            fetchInventory();

            setShowDeleteModal(false);
            setDeleteInventory(null);

        } catch (error) {
            toast.error(extractErrorMessage(error));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleStockSubmit = async () => {
        if (!selectedItem || quantity <= 0) return;
        setApiErrors("");
        const trimmed = serialNumbers?.map((sn) => sn?.trim());

        if (trimmed.some((sn) => !sn)) {
            setApiErrors("All serial numbers are required");
            return;
        }

        try {
            setStockLoading(true);
            let res = ""
            if (stockType === "add") {
                const res = await axiosInstance.post(`${Api.productInventory}/`, {
                    product_id: selectedItem.product.id,
                    hub_id: selectedItem.hub_id,
                    stock_in_hub: quantity,
                    serial_numbers: trimmed
                });
                if (res) {
                    setApiErrors("");
                    fetchInventory();
                    setStockModal(false);
                    setQuantity(0);
                    setSelectedItem(null);
                    setSerialNumbers([""]);
                }

            }

            if (stockType === "remove") {
                const res = await axiosInstance.post(
                    `${Api.productInventory}/remove/`,
                    {
                        product_id: selectedItem.product.id,
                        hub_id: selectedItem.hub_id,
                        quantity: quantity,
                        serial_numbers: trimmed
                    }
                );
                if (res) {
                    setApiErrors("");
                    fetchInventory();
                    setStockModal(false);
                    setQuantity(0);
                    setSelectedItem(null);
                    setSerialNumbers([""]);
                }

            }

        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setStockLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">
                    Product Inventory
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg"
                >
                    <Plus size={16} /> Add Inventory
                </button>
            </div>

            {/* FILTERS */}
            <div className="bg-white p-4 rounded-lg border flex gap-4">

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search product or hub..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg"
                    />
                </div>

                <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="all">All Stock</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                </select>

            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-lg overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-orange-600" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">S.No</th>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Hub</th>
                                <th className="px-4 py-3 text-left">Stock in Hub</th>
                                <th className="px-4 py-3 text-left">Total Stock</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (

                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">

                                        <div className="flex flex-col items-center gap-3 text-gray-500">

                                            <div className="bg-gray-100 rounded-full p-4">
                                                <Search className="w-8 h-8 text-gray-400" />
                                            </div>

                                            <p className="text-lg font-medium text-gray-700">
                                                No Inventory Found
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                Try adjusting your search or filters
                                            </p>

                                        </div>

                                    </td>
                                </tr>

                            ) : (
                                <>
                                    {filteredData.map((item: any, index: number) => (
                                        <tr key={item?.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                {item?.product?.name}
                                                {/* {item.product?.name} */}
                                            </td>
                                            <td className="px-4 py-3">{item?.hub_name || "-"}</td>
                                            <td className="px-4 py-3">{item?.stock_in_hub}</td>
                                            <td className="px-4 py-3">{item?.total_stock}</td>


                                            <td className="px-4 py-3 text-right">

                                                <div className="flex justify-end items-center gap-2">

                                                    {/* ADD STOCK */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setStockType("add");
                                                            setStockModal(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                                                    >
                                                        + Add
                                                    </button>

                                                    {/* REMOVE STOCK */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setStockType("remove");
                                                            setStockModal(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                                                    >
                                                        − Remove
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setProductModal(true);
                                                        }}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs"
                                                    >
                                                        📦 Allocate
                                                    </button>
                                                    {/* DIVIDER */}
                                                    {/* <div className="h-6 w-px bg-gray-300 mx-1" /> */}

                                                    {/* DELETE */}
                                                    {/* <button
                                                        onClick={() => {
                                                            setDeleteInventory(item);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                                                        title="Delete Inventory"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button> */}

                                                </div>

                                            </td>

                                        </tr>
                                    ))}
                                </>)}

                        </tbody>
                    </table>
                )}

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

            <InventoryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchInventory}
            />

            {showDeleteModal && deleteInventory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg p-6 w-full max-w-md">

                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Confirm Delete
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete inventory for
                            <span className="font-semibold">
                                {" "}{deleteInventory.product?.name}
                            </span>
                            {" "}in
                            <span className="font-semibold">
                                {" "}{deleteInventory.hub_name || "Selected Hub"}
                            </span>
                            ?
                        </p>

                        <div className="flex justify-end space-x-3">

                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteInventory(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteInventory}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {stockModal && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">

                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-screen overflow-y-auto no-scrollbar">

                        {/* HEADER */}
                        <div
                            className={`px-6 py-4 text-white ${stockType === "add"
                                ? "bg-gradient-to-r from-emerald-600 to-green-500"
                                : "bg-gradient-to-r from-red-600 to-rose-500"
                                }`}
                        >
                            <h2 className="text-lg font-semibold">
                                {stockType === "add" ? "Add Stock" : "Remove Stock"}
                            </h2>
                            <p className="text-xs opacity-90">
                                Enter serial numbers
                            </p>
                        </div>

                        <div className="p-6 space-y-5">

                            {/* INFO */}
                            <div className="bg-gray-50 border rounded-xl p-4 text-sm space-y-2">
                                <p><b>Product:</b> {selectedItem.product?.name}</p>
                                <p><b>Hub:</b> {selectedItem.hub_name}</p>
                                <p>
                                    <b>Current:</b>{" "}
                                    <span className={selectedItem.stock_in_hub > 0 ? "text-green-600" : "text-red-600"}>
                                        {selectedItem.stock_in_hub}
                                    </span>
                                </p>
                            </div>

                            {/* QUANTITY */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full border px-3 py-2 rounded-lg text-sm"
                                />
                            </div>

                            {/* SERIAL HEADER */}
                            {/* <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold">Serial Numbers</span>

                                <button
                                    onClick={handleAddSerial}
                                    className="text-indigo-600 text-xs flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div> */}

                            {/* SERIAL TABLE */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="grid grid-cols-[40px_1fr_40px] bg-gray-100 text-xs px-2 py-2 font-medium">
                                    <span>#</span>
                                    <span>Serial</span>
                                    <span></span>
                                </div>

                                <div className="max-h-52 overflow-y-auto">
                                    {serialNumbers.map((sn, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-[40px_1fr_40px] items-center border-t px-2 py-2"
                                        >
                                            <span className="text-xs">{index + 1}</span>

                                            <input
                                                type="text"
                                                value={sn}
                                                onChange={(e) =>
                                                    handleSerialChange(index, e.target.value)
                                                }
                                                className="border px-2 py-1 rounded text-xs"
                                                placeholder="Enter serial"
                                            />

                                            {serialNumbers.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveSerial(index)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* ERROR */}
                            {apiErrors && (
                                <p className="text-red-500 text-xs text-end">{apiErrors}</p>
                            )}

                            {/* ACTION */}
                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    onClick={() => {
                                        setStockModal(false);
                                        setSelectedItem(null);
                                        setSerialNumbers([""]);
                                    }}
                                    className="px-3 py-1 border rounded-md text-xs"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleStockSubmit}
                                    disabled={stockLoading}
                                    className={`px-4 py-1 rounded-md text-xs text-white ${stockType === "add"
                                        ? "bg-emerald-600"
                                        : "bg-red-600"
                                        }`}
                                >
                                    {stockLoading
                                        ? "Processing..."
                                        : stockType === "add"
                                            ? "Add Stock"
                                            : "Remove Stock"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            <ProductAllocateModal
                show={productModal}
                onClose={() => setProductModal(false)}
                selectedItem={selectedItem}
                onSuccess={fetchInventory}
            />
        </div>
    );
};

export default ProductsInventory;