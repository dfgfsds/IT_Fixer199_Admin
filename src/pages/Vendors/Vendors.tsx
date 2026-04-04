import React, { useEffect, useState } from "react";
import {
    Search,
    Download,
    Plus,
    Edit,
    Trash,
    Mail,
    Phone,
} from "lucide-react";
import api from "../../api-endpoints/ApiUrls";
import axiosInstance from "../../configs/axios-middleware";
import toast from "react-hot-toast";
import Pagination from "../../components/Pagination";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import AddVendorModal from "./VendorFormModal";




interface VendorType {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    gst: string;
    address: string;
    created_at: string;
}

const Vendors: React.FC = () => {
    const [vendors, setVendors] = useState<VendorType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [editVendor, setEditVendor] = useState<VendorType | null>(null);
    const [deleteVendor, setDeleteVendor] = useState<VendorType | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        fetchVendors(page, pageSize);
    }, [search]);

    const fetchVendors = async (pageNumber = page, size = pageSize) => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(
                `${api.vendor}?page=${pageNumber}&size=${size}&search=${search}`
            );
            setVendors(response.data?.vendors || []);

            const p = response.data?.pagination;
            if (p) {
                setPagination(p);
                setPage(p.page);
                setTotalPages(p.total_pages);
            }
        } catch (error) {
            console.error("Failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVendor = async () => {
        if (!deleteVendor) return;

        try {
            await axiosInstance.delete(
                `${api.vendor}${deleteVendor.id}/`
            );

            toast.success("Vendor deleted");
            fetchVendors();
            setShowDeleteModal(false);
            setDeleteVendor(null);
        } catch (error: any) {
            toast.error(extractErrorMessage(error));
        }
    };
    // const filteredVendors:any=[]
    const filteredVendors = vendors?.filter((v) => {
        if (!search) return true;

        return (
            v?.name?.toLowerCase().includes(search.toLowerCase()) ||
            v?.email?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const handleExport = () => {
        if (!filteredVendors.length) {
            toast.error("No data");
            return;
        }

        const headers = ["Name", "Email", "Phone", "GST"];

        const rows = filteredVendors?.map((v) => [
            v.name,
            v.email,
            v.phone_number,
            v.gst,
        ]);

        const csv =
            "data:text/csv;charset=utf-8," +
            [headers, ...rows].map((r) => r.join(",")).join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = "vendors.csv";
        link.click();
    };

    return (
        <div className="space-y-6 w-full">

            {/* HEADER */}
            <div className="flex justify-between flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Vendor Management</h1>
                    <p className="text-gray-600">Manage vendors</p>
                </div>

                <div className="flex space-x-3">
                    {/* <button
                        onClick={handleExport}
                        className="px-4 py-2 border rounded-lg flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button> */}

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-6 rounded-lg border">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg"
                    />
                </div>
            </div>

            {/* TABLE */}
            {loading ? (
                <div className="h-64 flex justify-center items-center">
                    Loading...
                </div>
            ) : (
                <div className="bg-white rounded-lg border overflow-x-auto">

                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">S.No</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>GST</th>
                                <th className="text-right pr-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredVendors.map((v, i) => (
                                <tr key={v.id} className="border-t hover:bg-gray-50">

                                    <td className="p-3">{i + 1}</td>

                                    <td>
                                        <div className="font-medium">{v.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {v.address}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {v.email}
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <Phone className="w-4 h-4 mr-2" />
                                            {v.phone_number}
                                        </div>
                                    </td>

                                    <td>{v.gst}</td>

                                    <td className="text-right pr-4 space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditVendor(v);
                                                setShowCreateModal(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 text-orange-600" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setDeleteVendor(v);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <Trash className="w-4 h-4 text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && pagination && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={pagination.total_elements}
                            onPageChange={(p) => fetchVendors(p, pageSize)}
                            onPageSizeChange={(s) => fetchVendors(1, s)}
                        />
                    )}
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && deleteVendor && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-lg w-full max-w-md">

                        <h2 className="font-bold mb-3">Confirm Delete</h2>

                        <p>
                            Delete <b>{deleteVendor.name}</b> ?
                        </p>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="border px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteVendor}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* CREATE / EDIT */}
            <AddVendorModal
        show={showCreateModal}
        editVendor={editVendor}
        onClose={() => {
          setShowCreateModal(false);
          setEditVendor(null);
        }}
        onSuccess={fetchVendors}
      />
        </div>
    );
};

export default Vendors;