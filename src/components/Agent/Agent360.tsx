// import { useParams } from "react-router-dom";

// const Agents360: React.FC = () => {
//     const { id } = useParams();
//     console.log(id)

//     return (
//         <>
//             <h1>Hello</h1>
//         </>
//     )
// }
// export default Agents360;

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Api from '../../api-endpoints/ApiUrls';
import axiosInstance from '../../configs/axios-middleware';
import { ArrowLeft, ArrowLeftIcon, Calendar, CheckCircle, Mail, MapPin, Phone, Star, User, XCircle } from 'lucide-react';

interface AgentDetails {
    id: string
    user_name: string
    profile_image_url: string
    agent_type: string
    hub_name: string
    user_details: {
        mobile_number: string
        email: string
        is_staff: boolean
        date_joined: string
        status: string
    }
}

const Agents360: React.FC = () => {
    const { id } = useParams()
    const [agent, setAgent] = useState<any | null>(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [productStocks, setProductStocks] = useState<any[]>([])
    const [toolStocks, setToolStocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgent()
    }, [id])

    const fetchAgent = async () => {
        try {
            const token = localStorage.getItem('token')

            // Agent Details
            const res = await axiosInstance.get(`${Api?.agents}${id}`)
            // const data = await res.json()
            setAgent(res?.data?.agent)

            // Product Stocks
            const productRes = await fetch(
                `${Api?.agentProductStock}?agent_id=${id}`
            )
            const productData = await productRes.json()
            setProductStocks(Array.isArray(productData) ? productData : [productData])

            // Tool Stocks
            const toolRes = await fetch(`/api/tools/agent-stocks/?agent_id=${id}`)
            const toolData = await toolRes.json()
            setToolStocks(Array.isArray(toolData) ? toolData : [toolData])

        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className="space-y-6">
            <div
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition"
            >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back</span>
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

                            {/* STATUS BADGE */}
                            <div className="mt-4">
                                {agent?.user_details?.is_active ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                                        <CheckCircle size={16} />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-red-100 text-red-600 font-medium">
                                        <XCircle size={16} />
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE DETAILS GRID */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">

                        {/* EMAIL */}
                        {/* <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                            <div className="flex items-center gap-2 mt-1 text-gray-800 font-medium">
                                <Mail size={16} />
                                {agent?.user_details?.email}
                            </div>
                        </div> */}

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
                </div>

                <div className="p-6">

                    {/* PROFILE TAB */}
{activeTab === "profile" && (
  <div className="space-y-8">

    {/* ===== BASIC INFORMATION ===== */}
    <div className="bg-gray-50 rounded-xl p-6 border">
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
    </div>


    {/* ===== ACCOUNT STATUS ===== */}
    <div className="bg-gray-50 rounded-xl p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Account Status
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

        <StatusBadge
          label="Account Status"
          value={agent?.user_details?.is_active}
        />

        <StatusBadge
          label="Email Verified"
          value={agent?.user_details?.is_email_verified}
        />

        <StatusBadge
          label="Mobile Verified"
          value={agent?.user_details?.is_mobile_verified}
        />

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
        />

        {/* PAN */}
        <DocumentCard
          title="PAN Card"
          url={agent?.pan_card_url}
          verified={agent?.is_pan_verified}
        />

        {/* VIDEO KYC */}
        <DocumentCard
          title="Video KYC"
          url={agent?.video_kyc_url}
          verified="VERIFIED"
        />

      </div>
    </div>

  </div>
)}


                    {/* PRODUCT STOCK TAB */}
                    {activeTab === 'product' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs">Product ID</th>
                                        <th className="px-4 py-2 text-left text-xs">Stock</th>
                                        <th className="px-4 py-2 text-left text-xs">Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productStocks.map((item, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-4 py-2">{item.product}</td>
                                            <td className="px-4 py-2">{item.stock}</td>
                                            <td className="px-4 py-2">{item.comment}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TOOL STOCK TAB */}
                    {activeTab === 'tools' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs">Tool ID</th>
                                        <th className="px-4 py-2 text-left text-xs">Stock</th>
                                        <th className="px-4 py-2 text-left text-xs">Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {toolStocks.map((item, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-4 py-2">{item.tool}</td>
                                            <td className="px-4 py-2">{item.stock}</td>
                                            <td className="px-4 py-2">{item.comment}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
            
        </div>
    )
}

export default Agents360
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

const DocumentCard = ({ title, url, verified }: any) => (
  <div className="bg-white rounded-xl border shadow-sm p-4">

    <div className="flex justify-between items-center mb-3">
      <h4 className="font-medium text-gray-900">{title}</h4>

      <span className={`px-2 py-1 text-xs rounded-full ${
        verified === "VERIFIED"
          ? "bg-green-100 text-green-700"
          : verified === "PENDING"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-600"
      }`}>
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
  </div>
)
