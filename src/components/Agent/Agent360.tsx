import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Api from '../../api-endpoints/ApiUrls';
import axiosInstance from '../../configs/axios-middleware';
import { ArrowLeft, ArrowLeftIcon, Bike, Calendar, CheckCircle, CreditCard, Mail, MapPin, Palette, Phone, ServerCog, Star, User, XCircle } from 'lucide-react';
import Pagination from '../Pagination';
import { extractErrorMessage } from '../../utils/extractErrorMessage ';
import toast from 'react-hot-toast';
import AgentLoginLogs from './AgentLoginLogs';
import AgentActiveLogs from './AgentActiveLogs';

const Agents360: React.FC = () => {
    const { id } = useParams()
    const [agent, setAgent] = useState<any | null>(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [productStocks, setProductStocks] = useState<any[]>([])
    const [toolStocks, setToolStocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [hubs, setHubs] = useState<any[]>([]);

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [pagination, setPagination] = useState<any>(null)

    const [performance, setPerformance] = useState<any>(null);

    const [dateRange, setDateRange] = useState({
        start_date: "",
        end_date: "",
    });

    // ✅ CORRECT
    const fetchPerformance = async () => {
        // if (!dateRange.start_date || !dateRange.end_date) return;

        try {
            const res = await axiosInstance.get(
                `${Api.agentPerformance}/${id}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
            );

            setPerformance(res.data?.data);
        } catch (err) {
            console.error("Performance fetch failed", err);
        }
    };

    // ✅ useEffect OUTSIDE
    useEffect(() => {
        fetchPerformance();
    }, [dateRange.start_date, dateRange.end_date]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile_number: "",
        hub_id: "",
        agent_type: "",
        start_time: "",
        end_time: "",
        vehicle_type: "",
        vehicle_number: "",
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        upi_id: "",
        cumulative_rating: "",
        is_admin_permission_required: false,
        status: ""
    });

    // ---------------- FETCH MASTER DATA ----------------
    useEffect(() => {
        fetchHubsByZone();
    }, []);

    const fetchHubsByZone = async () => {
        const res = await axiosInstance.get(Api?.allHubs);
        setHubs(res?.data?.hubs || []);
    };

    const handleEditOpen = () => {

        setFormData({
            // name: agent?.user_details?.name || "",
            // email: agent?.user_details?.email || "",
            // mobile_number: agent?.user_details?.mobile_number || "",

            // hub_id: agent?.user_details?.hub_id || "",

            // agent_type: agent?.agent_type || "",
            // is_admin_permission_required: agent?.is_admin_permission_required || false,

            // start_time: agent?.start_time
            //     ? agent.start_time.substring(0, 5)
            //     : "",

            // end_time: agent?.end_time
            //     ? agent.end_time.substring(0, 5)
            //     : "",

            // vehicle_type: agent?.vehicle_type || "",
            // vehicle_number: agent?.vehicle_number || "",

            // account_number: agent?.account_number || "",
            // ifsc_code: agent?.ifsc_code || "",
            // status: agent?.user_details?.status,
            // ✅ USER DETAILS
            name: agent?.user_details?.name || "",
            email: agent?.user_details?.email || "",
            mobile_number: agent?.user_details?.mobile_number || "",

            // ✅ BASIC
            hub_id: agent?.hub || "",
            agent_type: agent?.agent_type || "",
            status: agent?.user_details?.status || "",

            // ✅ TIME (format fix)
            start_time: agent?.start_time
                ? agent.start_time.slice(0, 5)
                : "",
            end_time: agent?.end_time
                ? agent.end_time.slice(0, 5)
                : "",

            // ✅ VEHICLE
            vehicle_type: agent?.vehicle_type || "",
            vehicle_number: agent?.vehicle_number || "",

            // ✅ BANK
            bank_name: agent?.bank_name || "",
            account_number: agent?.account_number || "",
            ifsc_code: agent?.ifsc_code || "",
            upi_id: agent?.upi_id || "",

            // ✅ RATING
            cumulative_rating: agent?.cumulative_rating || "0.00",

            // ✅ PERMISSION
            is_admin_permission_required:
                agent?.is_admin_permission_required || false,
        });

        setShowEditModal(true);

    };
    const [apiErrors, setApiErrors] = useState<string>("");

    const handleUpdateAgent = async () => {
        setApiErrors('')
        try {

            const payload = {
                // USER DETAILS
                name: formData.name,
                email: formData.email,
                mobile_number: formData.mobile_number,

                // BASIC
                hub_id: formData.hub_id,
                agent_type: formData.agent_type,
                status: "ACTIVE",

                start_time: formData.start_time,
                end_time: formData.end_time,

                // VEHICLE
                vehicle_type: formData.vehicle_type,
                vehicle_number: formData.vehicle_number,

                // BANK
                bank_name: formData.bank_name,
                account_number: formData.account_number,
                ifsc_code: formData.ifsc_code,
                upi_id: formData.upi_id,

                // PERMISSION
                is_admin_permission_required:
                    formData.is_admin_permission_required,

                // RATING (optional)
                cumulative_rating: formData.cumulative_rating,
            };

            const updatedApi = await axiosInstance.put(
                `${Api?.agentUser}${agent?.user}`,
                payload
            );

            if (updatedApi) {
                fetchAgentProduct();
                toast.success("Agent updated successfully");
                setShowEditModal(false);
            }
        } catch (error: any) {
            setApiErrors(extractErrorMessage(error));
            // setApiErrors(error?.response?.data?.message || "Update failed");
        }
    };

    const handleStatusToggle = async () => {
        try {

            const form = new FormData();

            form.append(
                "is_active",
                String(!agent?.user_details?.is_active)
            );

            await axiosInstance.put(
                `${Api?.agentUser}${agent?.user}`,
                form
            );

            fetchAgentProduct();

        } catch (err) {
            console.log(err);
        }
    };

    const handleAccountStatusToggle = async () => {
        try {

            const form = new FormData();

            const newStatus =
                agent?.user_details?.status === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE";

            form.append("status", newStatus);

            await axiosInstance.put(
                `${Api?.agentUser}${agent?.user}`, // 🔥 slash important
                form
            );

            fetchAgentProduct();

        } catch (err) {
            toast.error(extractErrorMessage(err))
        }
    };

    const handleKycUpdate = async (
        field: string,
        status: "VERIFIED" | "REJECTED"
    ) => {
        try {

            const form = new FormData();

            form.append(field, status);

            await axiosInstance.put(
                `${Api?.agentUser}${agent?.user}`,
                form
            );

            fetchAgentProduct();

        } catch (err) {
            console.error("KYC Update Error:", err);
        }
    };


    // useEffect(() => {
    //     fetchAgentProduct()
    // }, [id, activeTab === 'product'])

    useEffect(() => {
        if (activeTab === "product") {
            fetchAgentProduct();
        }
    }, [id, activeTab, page, pageSize]);

    const fetchAgentProduct = async () => {
        try {
            const res = await axiosInstance.get(`${Api?.agents}${id}`)
            setAgent(res?.data?.agent)
            // Product Stocks
            const productRes = await axiosInstance.get(
                `${Api?.agentProductStock}?agent_id=${id}&page=${page}&size=${pageSize}`
            )
            console.log(productRes)
            setProductStocks(productRes?.data?.agent_stocks)
            const p = productRes?.data?.pagination

            if (p) {
                setPagination(p)
                setPage(p.page)
                setTotalPages(p.total_pages)
            }
            // const toolRes = await axiosInstance.get(`${Api?.agentToolsStock}/?agent_id=${id}`);
            // setToolStocks(toolRes?.data?.data)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAgentTool()
    }, [id, activeTab === 'tool'])

    const fetchAgentTool = async () => {
        try {
            const toolRes = await axiosInstance.get(
                `${Api?.agentToolsStock}?agent_id=${id}&page=${page}&size=${pageSize}`
            )

            setToolStocks(toolRes?.data?.data?.stocks || [])

            const p = toolRes?.data?.data?.pagination

            if (p) {
                setPagination(p)
                setPage(p.page)
                setTotalPages(p.total_pages)
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        fetchAgentTool()
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setPage(1)
        fetchAgentTool()
    }


    if (loading) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className="space-y-3">
            <div className='flex justify-between'>
                <div
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back</span>
                </div>
                <button
                    onClick={handleEditOpen}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm"
                >
                    Edit Agent
                </button>
            </div>
            <div className="bg-white rounded-2xl border shadow-md p-8">

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* LEFT SIDE */}
                    <div className="flex items-start gap-8 items-center">
                        {/* PROFILE IMAGE */}
                        {agent?.profile_image_url ? (
                            <img
                                src={agent.profile_image_url}
                                className="w-32 h-32 rounded-2xl object-cover shadow-sm border"
                                alt="profile"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-5xl font-bold shadow-sm">
                                {agent?.user_name?.charAt(0)}
                            </div>
                        )}

                        {/* NAME + ROLE */}
                        <div>
                            <h2 className="text-3xl font-semibold text-gray-900 capitalize">
                                {agent?.user_name}
                            </h2>

                            <p className="text-gray-500 mt-1 text-sm">
                                Email: <span className="font-medium text-gray-700">{agent?.user_details?.email}</span>
                            </p>


                            <div className="flex items-center gap-3 py-2">

                                {/* STATUS LABEL */}
                                <span
                                    className={`text-sm font-medium ${agent?.user_details?.status === "ACTIVE"
                                        ? "text-green-600"
                                        : "text-red-500"
                                        }`}
                                >
                                    {agent?.user_details?.status === "ACTIVE"
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                                {/* TOGGLE */}
                                <button
                                    onClick={handleAccountStatusToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition
            ${agent?.user_details?.status === "ACTIVE"
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                ${agent?.user_details?.status === "ACTIVE"
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                            }`}
                                    />
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE DETAILS GRID */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">

                        {/* MOBILE */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile Number</p>
                            <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                <Phone size={16} />
                                {agent?.user_details?.mobile_number}
                            </div>
                        </div>

                        {/* HUB */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Hub</p>
                            <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                <MapPin size={16} />
                                {agent?.hub_name}
                            </div>
                        </div>

                        {/* JOINED DATE */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Joined On</p>
                            <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                <Calendar size={16} />
                                {new Date(agent?.user_details?.date_joined || "").toLocaleDateString()}
                            </div>
                        </div>

                        {/* EMAIL VERIFIED */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email Verification</p>
                            <div className="mt-1 font-medium">
                                {agent?.user_details?.is_email_verified ? (
                                    <span className="text-green-600 flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-2">
                                        <XCircle size={16} />
                                        Not Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* MOBILE VERIFIED */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile Verification</p>
                            <div className="mt-1 font-medium">
                                {agent?.user_details?.is_mobile_verified ? (
                                    <span className="text-green-600 flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center gap-2">
                                        <XCircle size={16} />
                                        Not Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* RATING */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Cumulative Rating</p>
                            <div className="flex items-center gap-2 mt-1 text-yellow-500 font-semibold">
                                <Star size={18} />
                                {agent?.cumulative_rating || "0"}
                            </div>
                        </div>

                        {/* vehicle_type */}
                        {agent?.vehicle_type && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Type</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                    <Bike size={16} />
                                    {agent?.vehicle_type}
                                </div>
                            </div>
                        )}

                        {/* vehicle_number */}
                        {agent?.vehicle_number && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Number</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                    <Palette size={16} />
                                    {agent?.vehicle_number}
                                </div>
                            </div>
                        )}

                        {/* account_number */}
                        {agent?.account_number && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Account Number</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                    <CreditCard size={16} />
                                    {agent?.account_number}
                                </div>
                            </div>
                        )}

                        {/* ifsc_code */}
                        {agent?.ifsc_code && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">IFSC Code</p>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                    <ServerCog size={16} />
                                    {agent?.ifsc_code}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* TABS */}
            <div className="bg-white rounded-lg border">

                <div className="flex border-b">

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'profile'
                            ? 'border-b-2 border-orange-600 text-orange-600'
                            : 'text-gray-600'
                            }`}
                    >
                        My Profile
                    </button>

                    <button
                        onClick={() => setActiveTab('product')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'product'
                            ? 'border-b-2 border-orange-600 text-orange-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Agent Product Stock
                    </button>

                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'tools'
                            ? 'border-b-2 border-orange-600 text-orange-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Agent Tool Stocks
                    </button>

                    <button
                        onClick={() => setActiveTab('loginLog')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'loginLog'
                            ? 'border-b-2 border-orange-600 text-orange-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Agent Login Log
                    </button>

                    <button
                        onClick={() => setActiveTab('activeLog')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'activeLog'
                            ? 'border-b-2 border-orange-600 text-orange-600'
                            : 'text-gray-600'
                            }`}
                    >
                        Agent Active Log
                    </button>

                </div>

                <div className="p-6">

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="space-y-8">

                            {/* ===== BASIC INFORMATION ===== */}
                            {/* <div className="bg-gray-50 rounded-xl p-6 border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                                    <Info label="Full Name" value={agent?.user_details?.name} />
                                    <Info label="Email" value={agent?.user_details?.email} />
                                    <Info label="Mobile Number" value={agent?.user_details?.mobile_number} />
                                    <Info label="Role" value={agent?.user_details?.role} />
                                    <Info label="Hub Name" value={agent?.hub_name} />
                                    <Info label="Agent Type" value={agent?.agent_type} />
                                    <Info label="Staff" value={agent?.user_details?.is_staff ? "Yes" : "No"} />
                                    <Info label="Admin Permission Required" value={agent?.is_admin_permission_required ? "Yes" : "No"} />
                                    <Info label="Joined On" value={new Date(agent?.user_details?.date_joined || "").toLocaleDateString()} />
                                    <Info label="Cumulative Rating" value={agent?.cumulative_rating} />
                                    <Info label="Start Time" value={agent?.start_time} />
                                    <Info label="End Time" value={agent?.end_time} />

                                </div>
                            </div> */}


                            <div className="bg-white rounded-2xl border shadow-sm p-6">

                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                    {/* 🧩 LEFT SIDE (NOW CARD STYLE) */}
                                    <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                                            <Info label="Full Name" value={agent?.user_details?.name} />
                                            <Info label="Email" value={agent?.user_details?.email} />
                                            <Info label="Mobile Number" value={agent?.user_details?.mobile_number} />
                                            <Info label="Role" value={agent?.user_details?.role} />
                                            <Info label="Hub Name" value={agent?.hub_name} />
                                            <Info label="Agent Type" value={agent?.agent_type} />
                                            <Info label="Staff" value={agent?.user_details?.is_staff ? "Yes" : "No"} />
                                            <Info label="Admin Permission Required" value={agent?.is_admin_permission_required ? "Yes" : "No"} />
                                            <Info label="Joined On" value={new Date(agent?.user_details?.date_joined || "").toLocaleDateString()} />
                                            <Info label="Cumulative Rating" value={agent?.cumulative_rating} />
                                            <Info label="Start Time" value={agent?.start_time} />
                                            <Info label="End Time" value={agent?.end_time} />

                                        </div>

                                    </div>

                                    {/* 🧩 RIGHT SIDE (MATCHED DESIGN) */}
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm h-fit">

                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-800">
                                                Agent Performance
                                            </h4>
                                            <p className="text-xs text-gray-400">
                                                Track performance by date
                                            </p>
                                        </div>

                                        {/* DATE */}
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <input
                                                type="date"
                                                value={dateRange.start_date}
                                                onChange={(e) =>
                                                    setDateRange({ ...dateRange, start_date: e.target.value })
                                                }
                                                className="border px-3 py-2 rounded-lg text-sm w-full"
                                            />

                                            <input
                                                type="date"
                                                value={dateRange.end_date}
                                                onChange={(e) =>
                                                    setDateRange({ ...dateRange, end_date: e.target.value })
                                                }
                                                className="border px-3 py-2 rounded-lg text-sm w-full"
                                            />
                                        </div>

                                        {performance ? (
                                            <>
                                                {/* INFO */}
                                                <div className="space-y-2 text-sm mb-5">
                                                    <PerfRow label="Agent Name" value={performance.agent_name} />
                                                    <PerfRow label="Mobile" value={performance.agent_mobile} />
                                                    <PerfRow label="Role" value={performance.role} />
                                                </div>

                                                {/* STATS */}
                                                <div className="grid grid-cols-2 gap-4">

                                                    <div className="bg-orange-50 border rounded-xl p-4 text-center">
                                                        <p className="text-xs text-gray-500">Total Orders</p>
                                                        <p className="text-2xl font-bold text-orange-600">
                                                            {performance.total_orders}
                                                        </p>
                                                    </div>

                                                    <div className="bg-green-50 border rounded-xl p-4 text-center">
                                                        <p className="text-xs text-gray-500">Working Hours</p>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {performance.total_working_hours}
                                                        </p>
                                                    </div>

                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-6 text-gray-400 text-sm">
                                                Select date range
                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* ===== ACCOUNT STATUS ===== */}
                            <div className="bg-gray-50 rounded-xl p-6 border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    Account Status
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

                                    {/* ACCOUNT ACTIVE TOGGLE */}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Account Status
                                        </p>

                                        <div className="flex items-center gap-3">

                                            {agent?.user_details?.is_active ? (
                                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                                                    Inactive
                                                </span>
                                            )}

                                            {/* TOGGLE */}
                                            <button
                                                onClick={handleStatusToggle}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition
          ${agent?.user_details?.is_active ? "bg-green-500" : "bg-gray-300"}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition
            ${agent?.user_details?.is_active ? "translate-x-6" : "translate-x-1"}`}
                                                />
                                            </button>

                                        </div>
                                    </div>

                                    {/* EMAIL VERIFIED */}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Email Verified
                                        </p>

                                        {agent?.user_details?.is_email_verified ? (

                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                <CheckCircle size={16} />
                                                Verified
                                            </span>

                                        ) : (

                                            <div className="flex items-center gap-3">

                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                                                    <XCircle size={16} />
                                                    Not Verified
                                                </span>

                                                {/* <button
                                                    onClick={() => handleVerify("is_email_verified")}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md"
                                                >
                                                    Verify
                                                </button> */}

                                            </div>

                                        )}
                                    </div>

                                    {/* MOBILE VERIFIED */}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Mobile Verified
                                        </p>

                                        {agent?.user_details?.is_mobile_verified ? (

                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                <CheckCircle size={16} />
                                                Verified
                                            </span>

                                        ) : (

                                            <div className="flex items-center gap-3">

                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                                                    <XCircle size={16} />
                                                    Not Verified
                                                </span>

                                                {/* <button
                                                    onClick={() => handleVerify("is_mobile_verified")}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md"
                                                >
                                                    Verify
                                                </button> */}

                                            </div>

                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* ===== DOCUMENTS ===== */}
                            <div className="bg-gray-50 rounded-xl p-6 border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    KYC Documents
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* AADHAR */}
                                    <DocumentCard
                                        title="Aadhar Card"
                                        url={agent?.aadhar_doc_url}
                                        verified={agent?.is_aadhar_verified}
                                        field="is_aadhar_verified"
                                        onUpdate={handleKycUpdate}
                                    />

                                    {/* PAN */}
                                    <DocumentCard
                                        title="PAN Card"
                                        url={agent?.pan_card_url}
                                        verified={agent?.is_pan_verified}
                                        field="is_pan_verified"
                                        onUpdate={handleKycUpdate}
                                    />

                                    {/* VIDEO KYC */}
                                    <DocumentCard
                                        title="Video KYC"
                                        url={agent?.video_kyc_url}
                                        verified={agent?.is_video_kyc_verified}
                                        field="is_video_kyc_verified"
                                        onUpdate={handleKycUpdate}
                                    />
                                    <DocumentCard
                                        title="Rc Document"
                                        url={agent?.rc_doc_url}
                                        verified={agent?.is_rc_verified}
                                        field="is_rc_verified"
                                        onUpdate={handleKycUpdate}
                                    />
                                    <DocumentCard
                                        title="License Document"
                                        url={agent?.license_doc_url}
                                        verified={agent?.is_license_verified}
                                        field="is_license_verified"
                                        onUpdate={handleKycUpdate}
                                    />

                                </div>
                            </div>

                        </div>
                    )}

                    {/* PRODUCT STOCK TAB */}
                    {activeTab === 'product' && (
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

                            {/* Header */}
                            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Product Stock Overview
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Manage and monitor available product inventory
                                </p>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 text-left">S.No</th>
                                            <th className="px-6 py-3 text-left">Product</th>
                                            <th className="px-6 py-3 text-left">Stock</th>
                                            <th className="px-6 py-3 text-left">Comment</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {productStocks?.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-10 text-gray-400">
                                                    No Stock Records Found
                                                </td>
                                            </tr>
                                        ) : (
                                            productStocks?.map((item, i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-orange-50 transition duration-150"
                                                >
                                                    {/* S.No */}
                                                    <td className="px-6 py-4 font-medium text-gray-600">
                                                        {i + 1}
                                                    </td>

                                                    {/* Product */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1 text-sm">

                                                            <div>
                                                                {/* <span className="font-medium text-gray-500">Name :</span>{' '} */}
                                                                <span className="font-semibold text-gray-900 capitalize">
                                                                    {item?.product?.name || '-'}
                                                                </span>
                                                            </div>



                                                        </div>
                                                    </td>

                                                    {/* Stock */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${item?.stock > 10
                                                                ? 'bg-green-100 text-green-700'
                                                                : item?.stock > 0
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}
                                                        >
                                                            {item?.stock}
                                                        </span>
                                                    </td>

                                                    {/* Comment */}
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {item?.comment || (
                                                            <span className="italic text-gray-400">
                                                                No comment added
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {!loading && pagination && (
                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        pageSize={pageSize}
                                        totalItems={pagination.total_elements}
                                        onPageChange={(newPage) => setPage(newPage)}
                                        onPageSizeChange={(size) => {
                                            setPageSize(size);
                                            setPage(1);
                                        }}
                                    />
                                )}

                            </div>
                        </div>
                    )}

                    {/* TOOL STOCK TAB */}
                    {activeTab === 'tools' && (
                        <div className="bg-white border rounded-lg overflow-x-auto">

                            <table className="min-w-full text-sm">

                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">S.No</th>
                                        <th className="px-6 py-3 text-left">Tool</th>
                                        <th className="px-6 py-3 text-left">Price</th>
                                        <th className="px-6 py-3 text-left">Stock</th>
                                        <th className="px-6 py-3 text-left">Comment</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">

                                    {toolStocks?.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-10 text-gray-400">
                                                No Tool Data Available
                                            </td>
                                        </tr>
                                    ) : (

                                        toolStocks.map((item, i) => (

                                            <tr key={i} className="hover:bg-gray-50">

                                                <td className="px-6 py-4 font-medium text-gray-600">
                                                    {i + 1}
                                                </td>

                                                {/* TOOL DETAILS */}
                                                <td className="px-6 py-4">

                                                    <div className="space-y-1 text-sm">

                                                        <div>
                                                            <span className="text-gray-500">Name :</span>{" "}
                                                            <span className="font-medium text-gray-900">
                                                                {item?.tool?.name || "-"}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <span className="text-gray-500">Brand :</span>{" "}
                                                            <span className="text-gray-700">
                                                                {item?.tool?.brand_details?.name || "-"}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <span className="text-gray-500">Category :</span>{" "}
                                                            <span className="text-gray-700">
                                                                {item?.tool?.category_details?.name || "-"}
                                                            </span>
                                                        </div>

                                                    </div>

                                                </td>

                                                {/* PRICE */}
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {item?.tool?.price ? `₹${item?.tool?.price?.toFixed(2)}` : "-"}
                                                </td>

                                                {/* STOCK */}
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item?.stock > 10
                                                            ? 'bg-green-100 text-green-700'
                                                            : item?.stock > 0
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {item?.stock}

                                                    </span>

                                                </td>

                                                {/* COMMENT */}
                                                < td className="px-6 py-4 text-gray-600" >
                                                    {item?.comment || "-"}
                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>
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

                    {/* AGENT ACTIVE LOGS */}
                    {activeTab === "loginLog" && (
                        <AgentLoginLogs userId={agent?.user_details?.id} />
                    )}

                    {/* AGENT ACTIVE LOGS */}
                    {activeTab === "activeLog" && (
                        <AgentActiveLogs userId={agent?.user_details?.id} />
                    )}
                </div>
            </div >


            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">

                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                        {/* HEADER */}
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Edit Agent Details
                            </h2>

                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-red-500 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="overflow-y-auto p-6 space-y-8">

                            {/* BASIC DETAILS */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <FormInput
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(v: any) => setFormData({ ...formData, name: v })}
                                    />

                                    <FormInput
                                        label="Email"
                                        value={formData.email}
                                        onChange={(v: any) => setFormData({ ...formData, email: v })}
                                    />

                                    <FormInput
                                        label="Mobile Number"
                                        value={formData.mobile_number}
                                        onChange={(v: any) => setFormData({ ...formData, mobile_number: v })}
                                    />
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1">
                                            Agent Type
                                        </label>
                                        <select
                                            value={formData.agent_type}
                                            onChange={(e: any) =>
                                                setFormData({ ...formData, agent_type: e.target.value })
                                            }
                                            className="px-3 py-2 border rounded-lg w-full"
                                        >
                                            <option value="">Select Agent Type</option>
                                            <option value="OWN">Own</option>
                                            <option value="PARTNERSHIP">Partnership</option>
                                        </select>
                                    </div>


                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1">
                                            Hub
                                        </label>
                                        <select
                                            value={formData.hub_id}
                                            onChange={(e) =>
                                                setFormData({ ...formData, hub_id: e.target.value })
                                            }
                                            className="px-3 py-2 border rounded-lg w-full"
                                        >
                                            <option value="">Select Hub</option>

                                            {hubs?.map((h: any) => (
                                                <option key={h.id} value={h.id}>
                                                    {h.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <FormInput
                                        label="Start Time"
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(v: any) => setFormData({ ...formData, start_time: v })}
                                    />

                                    <FormInput
                                        label="End Time"
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(v: any) => setFormData({ ...formData, end_time: v })}
                                    />

                                </div>
                            </div>

                            {/* VEHICLE DETAILS */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Vehicle Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <FormInput
                                        label="Vehicle Type"
                                        value={formData.vehicle_type}
                                        onChange={(v: any) => setFormData({ ...formData, vehicle_type: v })}
                                    />

                                    <FormInput
                                        label="Vehicle Number"
                                        value={formData.vehicle_number}
                                        onChange={(v: any) =>
                                            setFormData({ ...formData, vehicle_number: v })
                                        }
                                    />

                                </div>
                            </div>

                            {/* BANK DETAILS */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Bank Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <FormInput
                                        label="Bank Name"
                                        value={formData.bank_name}
                                        onChange={(v: any) =>
                                            setFormData({ ...formData, bank_name: v })
                                        }
                                    />

                                    <FormInput
                                        label="Account Number"
                                        value={formData.account_number}
                                        onChange={(v: any) =>
                                            setFormData({ ...formData, account_number: v })
                                        }
                                    />

                                    <FormInput
                                        label="IFSC Code"
                                        value={formData.ifsc_code}
                                        onChange={(v: any) =>
                                            setFormData({ ...formData, ifsc_code: v })
                                        }
                                    />

                                    <FormInput
                                        label="UPI ID"
                                        value={formData.upi_id}
                                        onChange={(v: any) =>
                                            setFormData({ ...formData, upi_id: v })
                                        }
                                    />

                                </div>
                            </div>

                            <FormInput
                                label="Rating"
                                type="number"
                                value={formData.cumulative_rating}
                                onChange={(v: any) =>
                                    setFormData({ ...formData, cumulative_rating: v })
                                }
                            />

                            {/* PERMISSIONS */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                                    Permissions
                                </h3>

                                <label className="flex items-center gap-3 text-sm">

                                    <input
                                        type="checkbox"
                                        checked={formData.is_admin_permission_required}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_admin_permission_required: e.target.checked
                                            })
                                        }
                                        className="w-4 h-4"
                                    />

                                    Admin Permission Required

                                </label>

                            </div>

                        </div>
                        {apiErrors && (
                            <p className="text-red-500 mt-2 text-end px-6">
                                {apiErrors}
                            </p>
                        )}

                        {/* FOOTER */}
                        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-white">

                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdateAgent}
                                className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                            >
                                Update Agent
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div >
    )
}

export default Agents360;
const Info = ({ label, value }: any) => (
    <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">
            {label}
        </p>
        <p className="mt-1 font-medium text-gray-900">
            {value || "-"}
        </p>
    </div>
)

const StatusBadge = ({ label, value }: any) => (
    <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {label}
        </p>

        {value ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <CheckCircle size={16} />
                Yes
            </span>
        ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                <XCircle size={16} />
                No
            </span>
        )}
    </div>
)

const DocumentCard = ({ title, url, verified, field, onUpdate }: any) => {

    return (
        <div className="bg-white rounded-xl border shadow-sm p-4">

            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">{title}</h4>

                <span
                    className={`px-2 py-1 text-xs rounded-full
        ${verified === "VERIFIED"
                            ? "bg-green-100 text-green-700"
                            : verified === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-600"}`}
                >
                    {verified}
                </span>

            </div>

            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:underline"
                >
                    View Document
                </a>
            ) : (
                <p className="text-sm text-gray-400">No Document Uploaded</p>
            )}

            {verified === "PENDING" && field && (

                <div className="flex gap-2 mt-4">

                    <button
                        onClick={() => onUpdate(field, "VERIFIED")}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-md"
                    >
                        Verify
                    </button>

                    <button
                        onClick={() => onUpdate(field, "REJECTED")}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                        Reject
                    </button>

                </div>

            )}

        </div>
    )
}

const FormInput = ({
    label,
    value,
    onChange,
    type = "text"
}: any) => (

    <div className="flex flex-col">

        <label className="text-xs font-semibold text-gray-600 mb-1">
            {label}
        </label>

        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />

    </div>

);

const PerfRow = ({ label, value }: any) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">{value}</span>
    </div>
);