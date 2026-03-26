import React, { useEffect, useState } from "react";
import {
    Search,
    Download,
    Plus,
    Eye,
    Edit,
    Mail,
    Phone,
    Shield,
    Trash,
} from "lucide-react";
import api from "../../api-endpoints/ApiUrls";
import AddUserModal from "./AddUserModal";
import axiosInstance from "../../configs/axios-middleware";
import toast from "react-hot-toast";
import Pagination from "../../components/Pagination";

interface UserType {
    id: string;
    name: string;
    email: string;
    mobile_number: string;
    role: string;
    is_mobile_verified: boolean;
    is_email_verified: boolean;
    status: string;
    comments: string;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    date_joined: string;
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editUser, setEditUser] = useState<UserType | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserType | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [role, setRole] = useState("");

    const roles = [
        // "SUPER_ADMIN",
        "ADMIN",
        "HUB_MANAGER",
        "MANAGER",
        // "AGENT",
        // "CUSTOMER"
    ];

    useEffect(() => {
        fetchUsers(page, pageSize);
    }, [search, role]);

    const fetchUsers = async (pageNumber = page, size = pageSize) => {
        try {
            setLoading(true);
            const roleQuery = role
                ? role
                : "SUPER_ADMIN,ADMIN,HUB_MANAGER,MANAGER";

            const response = await axiosInstance.get(
                `${api.allUsers}?page=${pageNumber}&size=${size}&role=${roleQuery}&search=${search}`
            );


            setUsers(response.data?.users || []);

            const p = response.data?.pagination;

            if (p) {
                setPagination(p);
                setPage(p.page);
                setTotalPages(p.total_pages);
            }

        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchUsers(newPage, pageSize);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
        fetchUsers(1, size);
    };


    const handleDeleteUser = async () => {
        if (!deleteUser) return;

        try {
            await axiosInstance.delete(`${api.createUser}/${deleteUser.id}`);
            fetchUsers();
            setShowDeleteModal(false);
            setDeleteUser(null);

        } catch (error: any) {
            console.error("Failed to delete user:", error);
            const data = error?.response?.data;
            let message = "Something went wrong";
            toast.error(data?.message || message);
        }
    };


    const filteredUsers = users?.filter((user) => {
        if (!search) return true;

        return (
            user?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
            user?.email?.toLowerCase()?.includes(search.toLowerCase())
        );
    });

    const handleStatusToggle = async (user: UserType) => {
        try {

            const dataStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

            await axiosInstance.put(
                `${api.createUser}/${user.id}`,
                {
                    status: dataStatus
                }
            );

            toast.success("User status updated");

            fetchUsers(page, pageSize);

        } catch (error) {
            console.error("Status update failed:", error);
            toast.error("Failed to update status");
        }
    };

    const handleExport = () => {
        if (!filteredUsers || filteredUsers.length === 0) {
            toast.error("No users to export");
            return;
        }

        const headers = [
            "Name",
            "Email",
            "Mobile",
            "Role",
            "Status",
            // "Joined Date"
        ];

        const rows = filteredUsers.map((u: any) => [
            u.name || "",
            u.email || "",
            u.mobile_number || "",
            u.role || "",
            u.status || "",
            u.date_joined
                ? new Date(u.date_joined).toLocaleDateString()
                : ""
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers, ...rows]
                .map((row) => row.join(","))
                .join("\n");

        const encodedUri = encodeURI(csvContent);

        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users.csv");
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    };

    return (
        // <div className="space-y-6">
        <div className="space-y-6 w-full max-w-full">
            {/* Header */}
            <div className="flex  justify-between flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        User Management
                    </h1>
                    <p className="text-gray-600">
                        Manage admin and staff users
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button> */}

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>

                    <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Search */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div> */}

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex gap-4">

                    {/* SEARCH */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* ROLE FILTER */}
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">All Roles</option>

                        {roles.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            setSearch("")
                            setRole("")
                        }}
                        className="mt-3 text-sm text-orange-600 hover:underline my-auto"
                    >
                        Clear Filters
                    </button>

                </div>
            </div>


            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Role
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
                                {filteredUsers.length === 0 ? (

                                    <tr>
                                        <td colSpan={6} className="py-16">

                                            <div className="flex flex-col items-center justify-center text-center">

                                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                    <Search className="w-6 h-6 text-gray-400" />
                                                </div>

                                                <h3 className="text-sm font-semibold text-gray-800">
                                                    No Users Found
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Try adjusting your search or filter to find what you're looking for.
                                                </p>

                                            </div>

                                        </td>
                                    </tr>

                                ) : (
                                    <>
                                        {filteredUsers?.map((user: any, index: number) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-orange-100  rounded-full flex items-center justify-center">
                                                            <span className="text-orange-600 font-medium ">
                                                                {user?.name?.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user?.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Joined:{" "}
                                                                {new Date(user?.date_joined).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center">
                                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                        {user?.email}
                                                    </div>
                                                    <div className="flex items-center mt-1">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                        {user?.mobile_number}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center">
                                                        <Shield className="w-4 h-4 mr-2 text-gray-400" />
                                                        {user?.role}
                                                    </div>
                                                </td>

                                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {user?.status}
                                            </span>
                                        </td> */}

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">

                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleStatusToggle(user)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${user.status === "ACTIVE"
                                                                ? "bg-green-500"
                                                                : "bg-gray-300"
                                                                }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${user.status === "ACTIVE"
                                                                    ? "translate-x-6"
                                                                    : "translate-x-1"
                                                                    }`}
                                                            />
                                                        </button>

                                                    </div>

                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowModal(true);
                                                            }}
                                                            className="text-gray-600 hover:text-gray-900 p-1"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setEditUser(user);
                                                                setShowCreateModal(true);
                                                            }}
                                                            // disabled={user?.role === "MANAGER"}
                                                            className="text-orange-600 hover:text-orange-900 p-1"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setDeleteUser(user);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            // disabled={user?.role === "MANAGER"}

                                                            className="text-red-600 hover:text-red-900 p-1"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>


                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
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
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-xl font-semibold text-gray-800">
                                User Details
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-red-500 text-2xl font-light transition"
                            >
                                ×
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">

                            {/* Profile Section */}
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl font-bold">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {selectedUser.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>

                                    <span
                                        className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${selectedUser.status === "ACTIVE"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {selectedUser.status}
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                                <div className="space-y-1">
                                    <p className="text-gray-500">Mobile Number</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedUser.mobile_number}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-gray-500">Role</p>
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                        {selectedUser.role}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-gray-500">Joined On</p>
                                    <p className="font-medium text-gray-800">
                                        {new Date(selectedUser.date_joined).toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-gray-500">Account Type</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedUser.is_superuser
                                            ? "Super User"
                                            : selectedUser.is_staff
                                                ? "Staff"
                                                : "Normal User"}
                                    </p>
                                </div>

                            </div>

                            {/* Comments */}
                            {selectedUser.comments && (
                                <div className="pt-4 border-t">
                                    <p className="text-gray-500 text-sm mb-1">Comments</p>
                                    <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg">
                                        {selectedUser.comments}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {showDeleteModal && deleteUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">

                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Confirm Delete
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete
                            <span className="font-semibold"> {deleteUser.name}</span> ?
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteUser(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}



            <AddUserModal
                show={showCreateModal}
                editUser={editUser}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditUser(null);
                }}
                onSuccess={fetchUsers}
            />

        </div>
    );
};

export default Users;
