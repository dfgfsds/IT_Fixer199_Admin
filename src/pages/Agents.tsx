// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Download, Plus, Eye, Edit, MapPin, Star, CheckCircle, XCircle, Clock } from 'lucide-react';
// import { Agent } from '../types';

// interface AgentWithUser extends Agent {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
//   zone_name: string;
//   total_orders: number;
//   avg_rating: number;
//   earnings_today: number;
//   earnings_month: number;
// }

// const Agents: React.FC = () => {
//   const [agents, setAgents] = useState<AgentWithUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedAgent, setSelectedAgent] = useState<AgentWithUser | null>(null);
//   const [filters, setFilters] = useState({
//     search: '',
//     status: 'all',
//     zone: 'all',
//     page: 1
//   });

//   useEffect(() => {
//     fetchAgents();
//   }, [filters]);

//   const fetchAgents = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const params = new URLSearchParams({
//         page: filters.page.toString(),
//         limit: '20',
//         ...(filters.status !== 'all' && { status: filters.status }),
//         ...(filters.zone !== 'all' && { zone: filters.zone }),
//         ...(filters.search && { search: filters.search })
//       });

//       const response = await fetch(`/api/agents?${params}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAgents(data.agents);
//       }
//     } catch (error) {
//       console.error('Failed to fetch agents:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewAgent = (agent: AgentWithUser) => {
//     setSelectedAgent(agent);
//     setShowModal(true);
//   };

//   const handleToggleAvailability = async (agentId: string, isAvailable: boolean) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`/api/agents/${agentId}/availability`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ is_available: !isAvailable })
//       });

//       if (response.ok) {
//         fetchAgents();
//       }
//     } catch (error) {
//       console.error('Failed to update agent availability:', error);
//     }
//   };

//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'available', label: 'Available' },
//     { value: 'busy', label: 'Busy' },
//     { value: 'offline', label: 'Offline' }
//   ];

//   const verificationColors = {
//     pending: 'bg-yellow-100 text-yellow-800',
//     verified: 'bg-green-100 text-green-800',
//     rejected: 'bg-red-100 text-red-800'
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Agent & Delivery Management</h1>
//           <p className="text-gray-600">Manage field agents and delivery personnel</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//             <Download className="w-4 h-4 mr-2" />
//             Export
//           </button>
//           <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
//             <Plus className="w-4 h-4 mr-2" />
//             Add Agent
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Agents</p>
//               <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
//             </div>
//             <div className="p-3 rounded-full bg-blue-500">
//               <CheckCircle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Available Now</p>
//               <p className="text-2xl font-bold text-green-600">
//                 {agents.filter(a => a.is_available).length}
//               </p>
//             </div>
//             <div className="p-3 rounded-full bg-green-500">
//               <CheckCircle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Pending Verification</p>
//               <p className="text-2xl font-bold text-yellow-600">
//                 {agents.filter(a => a.verification_status === 'pending').length}
//               </p>
//             </div>
//             <div className="p-3 rounded-full bg-yellow-500">
//               <Clock className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Avg Rating</p>
//               <p className="text-2xl font-bold text-orange-600">
//                 {agents.length > 0 ?
//                   (agents.reduce((sum, a) => sum + a.avg_rating, 0) / agents.length).toFixed(1) :
//                   '0.0'
//                 }
//               </p>
//             </div>
//             <div className="p-3 rounded-full bg-orange-500">
//               <Star className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by name, agent code, phone..."
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//           <div className="w-full sm:w-48">
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//             >
//               {statusOptions.map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Agents Table */}
//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Agent
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Zone
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Performance
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Earnings
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {agents.map((agent) => (
//                   <tr key={agent.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
//                           <span className="text-orange-600 font-medium">
//                             {agent?.first_name?.charAt(0)}{agent?.last_name?.charAt(0)}
//                           </span>
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {agent.first_name} {agent.last_name}
//                           </div>
//                           <div className="text-sm text-gray-500">#{agent.agent_code}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{agent.phone}</div>
//                       <div className="text-sm text-gray-500">{agent.email}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center text-sm text-gray-900">
//                         <MapPin className="w-4 h-4 mr-2 text-gray-400" />
//                         {agent.zone_name}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex flex-col space-y-1">
//                         <div className="flex items-center">
//                           {agent.is_available ? (
//                             <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
//                           ) : (
//                             <XCircle className="w-4 h-4 text-red-500 mr-1" />
//                           )}
//                           <span className="text-sm">
//                             {agent.is_available ? 'Available' : 'Offline'}
//                           </span>
//                         </div>
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verificationColors[agent.verification_status as keyof typeof verificationColors]
//                           }`}>
//                           {agent.verification_status}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         <div className="flex items-center">
//                           <Star className="w-4 h-4 text-yellow-400 mr-1" />
//                           {agent?.avg_rating?.toFixed(1)} ({agent?.total_reviews})
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {agent.total_orders} orders completed
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         <div>Today: ₹{agent.earnings_today}</div>
//                         <div className="text-xs text-gray-500">
//                           Month: ₹{agent.earnings_month}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <div className="flex items-center justify-end space-x-2">
//                         <button
//                           onClick={() => handleViewAgent(agent)}
//                           className="text-gray-600 hover:text-gray-900 p-1"
//                           title="View Details"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleToggleAvailability(agent.id, agent.is_available)}
//                           className={`p-1 ${agent.is_available ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
//                           title={agent.is_available ? 'Mark Offline' : 'Mark Available'}
//                         >
//                           {agent.is_available ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
//                         </button>
//                         <button className="text-orange-600 hover:text-orange-900 p-1" title="Edit Agent">
//                           <Edit className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Agent Details Modal */}
//       {showModal && selectedAgent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900">Agent Details</h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="space-y-6">
//               <div className="flex items-center space-x-4">
//                 <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
//                   <span className="text-orange-600 font-bold text-xl">
//                     {selectedAgent?.first_name?.charAt(0)}{selectedAgent?.last_name?.charAt(0)}
//                   </span>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {selectedAgent.first_name} {selectedAgent.last_name}
//                   </h3>
//                   <p className="text-gray-600">Agent Code: #{selectedAgent.agent_code}</p>
//                   <div className="flex items-center mt-1">
//                     {selectedAgent.is_available ? (
//                       <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-red-500 mr-1" />
//                     )}
//                     <span className="text-sm">
//                       {selectedAgent.is_available ? 'Available' : 'Offline'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
//                   <div className="space-y-2">
//                     <div className="text-sm">
//                       <span className="text-gray-600">Email:</span> {selectedAgent.email}
//                     </div>
//                     <div className="text-sm">
//                       <span className="text-gray-600">Phone:</span> {selectedAgent.phone}
//                     </div>
//                     <div className="text-sm">
//                       <span className="text-gray-600">Zone:</span> {selectedAgent.zone_name}
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Rating:</span>
//                       <div className="flex items-center">
//                         <Star className="w-4 h-4 text-yellow-400 mr-1" />
//                         <span className="font-medium">{selectedAgent?.avg_rating?.toFixed(1)}</span>
//                       </div>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Total Orders:</span>
//                       <span className="font-medium">{selectedAgent.total_orders}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Reviews:</span>
//                       <span className="font-medium">{selectedAgent.total_reviews}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {selectedAgent?.skills?.map((skill, index) => (
//                     <span
//                       key={index}
//                       className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Earnings</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Today:</span>
//                       <span className="font-medium">₹{selectedAgent.earnings_today}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">This Month:</span>
//                       <span className="font-medium">₹{selectedAgent.earnings_month}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verificationColors[selectedAgent.verification_status as keyof typeof verificationColors]
//                     }`}>
//                     {selectedAgent.verification_status}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Agents;

import React, { useEffect, useState } from 'react'
import { Search, Eye, Star, Loader, TrashIcon, Trash2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../configs/axios-middleware'
import Api from '../api-endpoints/ApiUrls';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/extractErrorMessage ';
import AgentTrackingModal from '../components/Modals/AgentTrackingModal';
interface AgentResponse {
  id: string
  user_name: string
  profile_image_url: string
  hub_name: string
  user_details: {
    mobile_number: string
    status: string
  }
}

const Agents: React.FC = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<AgentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  })
  const { user }: any = useAuth();

  // Agent Manager Allocation

  const [managerModal, setManagerModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [apiErrors, setApiErrors] = useState<string>("");


  const [zoneModal, setZoneModal] = useState(false)
  const [agentZones, setAgentZones] = useState<any>([])
  const [allZones, setAllZones] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState('')
  const [zoneApiErrors, setzoneApiErrors] = useState<string>("");
  const [trackingModal, setTrackingModal] = useState(false);

  const fetchUsers = async () => {
    try {

      const response = await axiosInstance.get(`${Api.allUsers}`,
      );
      console.log(response)
      setUsers(response.data?.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenManagerModal = (agent: any) => {
    setSelectedAgent(agent);
    setManagerModal(true);
    fetchUsers();
  }

  const handleAssignManager = async () => {
    setLoading(true);

    try {
      const updatedApi = await axiosInstance.post(Api?.allocations, {
        agent: selectedAgent.id,
        manager: selectedManager
      })
      if (updatedApi) {

      }
      setLoading(false);
      setManagerModal(false);
      fetchAgents();
    } catch (error) {
      setLoading(false);
      setApiErrors(extractErrorMessage(error));
    }
  }


  // Zones
  const openZoneModal = async (agent: any) => {
    setSelectedAgent(agent)
    setZoneModal(true)

    const res = await axiosInstance.get(`${Api?.agentZones}/${agent?.id}`)
    setAgentZones(res?.data?.data)

    const zonesRes = await axiosInstance.get(Api?.allZone);
    console.log(zonesRes)
    setAllZones(zonesRes?.data?.zones)

  }

  const handleAddZone = async () => {
    setLoading(true);
    setzoneApiErrors('');
    try {
      const updateAPi = await axiosInstance.post(Api?.addAgentZone, {
        agent: selectedAgent.id,
        zone: selectedZone
      })
      if (updateAPi) {
        setLoading(false);
        openZoneModal(selectedAgent)
      }

    } catch (error) {
      setLoading(false);
      setzoneApiErrors(extractErrorMessage(error));
    }

  }

  const handleDeleteZone = async (id: string) => {
    await axiosInstance.delete(`${Api?.addAgentZone}${selectedAgent.id}/${id}/`)
    openZoneModal(selectedAgent)
  }


  useEffect(() => {
    fetchAgents()
  }, [filters])

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status })
      })
      // const res = await fetch(`/api/agents?${params}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      const res: any = await axiosInstance.get(Api?.agents);
      if (res) {
        // const data = await res.json()
        setAgents(res?.data?.agents)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents?.filter(agent => {
    const matchesSearch =
      agent.user_name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      agent.user_details?.mobile_number
        ?.toLowerCase()
        .includes(filters.search.toLowerCase())

    const matchesStatus =
      filters.status === 'all' ||
      agent.user_details?.status === filters.status

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900">Agents</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="PENDING">PENDING</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hub
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                {user?.role !== 'HUB_MANAGER' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zones
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
              {filteredAgents?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No Agents Found
                  </td>
                </tr>
              ) : (
                filteredAgents?.map((agent: any, index: number) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    {/* Agent */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 flex items-center space-x-3">
                      {agent.profile_image_url ? (
                        <img
                          src={agent.profile_image_url}
                          alt="profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10  rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                          {agent.user_name?.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm capitalize font-medium text-gray-900">
                        {agent.user_name}
                      </span>
                    </td>

                    {/* Mobile */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {agent.user_details?.mobile_number}
                    </td>

                    {/* Zone */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {agent.hub_name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {agent?.cumulative_rating}
                          {/* ({agent?.total_reviews}) */}
                        </div>
                        {/* <div className="text-xs text-gray-500">
                           {agent.total_orders} orders completed
                         </div> */}
                      </div>
                    </td>

                    {user?.role !== 'HUB_MANAGER' && (
                      <td className="px-6 py-4">
                        {agent?.manager_details ? (
                          <div className="space-y-1 text-sm">

                            <div>
                              <span className="font-medium text-gray-500">Name :</span>{' '}
                              <span className="font-semibold text-gray-900 capitalize">
                                {agent.manager_details?.name || '-'}
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-gray-500">Email :</span>{' '}
                              <span className="text-gray-800 break-all">
                                {agent.manager_details?.email || '-'}
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-gray-500">Mobile :</span>{' '}
                              <span className="text-gray-800">
                                {agent.manager_details?.mobile_number || '-'}
                              </span>
                            </div>

                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenManagerModal(agent)}
                            className="px-3 py-1.5 text-sm bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition font-medium"
                          >
                            + Add Manager
                          </button>
                        )}
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openZoneModal(agent)}
                        className="text-blue-600 hover:underline"
                      >
                        View Zones ({agent.zone_details?.length || 0})
                      </button>
                    </td>


                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.user_details?.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : agent.user_details?.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {agent.user_details?.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-3 flex">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setTrackingModal(true);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg"
                      >
                        Tracking
                      </button>

                      <button
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        className="text-gray-600 hover:text-orange-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>



                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {managerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] no-scrollbar overflow-y-auto">
            <h2 className="text-lg font-semibold mb-5">Assign Manager</h2>

            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="">Select Manager</option>
              {users.filter((item: any) => item?.role === 'MANAGER')?.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.name}
                </option>
              ))}
            </select>
            {/* Error */}
            {apiErrors && (
              <p className="text-red-500 mt-2 text-end px-6">
                {apiErrors}
              </p>
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => { setManagerModal(false), setApiErrors('') }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignManager}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                {loading ? (
                  <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Submitting... </div>) : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-500 to-orange-600">
              <h2 className="text-white font-semibold text-lg">
                Manage Agent Zones
              </h2>
              <button
                onClick={() => setZoneModal(false)}
                className="text-white hover:opacity-80 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
              {/* 🔵 Agent Info Card */}
              <div className="bg-gradient-to-r from-orange-50 to-white border rounded-2xl p-4 shadow-sm">

                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-lg">
                    {agentZones?.agent_details?.name?.charAt(0) || "A"}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">Name :</span>{" "}
                      <span className="font-semibold text-gray-900 capitalize">
                        {agentZones?.agent_details?.name || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-medium">Mobile :</span>{" "}
                      <span className="text-gray-800">
                        {agentZones?.agent_details?.mobile_number || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-medium">Email :</span>{" "}
                      <span className="text-gray-800 break-all">
                        {agentZones?.agent_details?.email || "-"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
              {/* Add Zone Section */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Add New Zone
                </h3>

                <div className="flex gap-3">
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="flex-1 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">Select Zone</option>
                    {allZones
                      .filter(
                        (zone) =>
                          !agentZones?.zone_details?.some((z: any) => z?.id === zone?.id)
                      )
                      .map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={handleAddZone}
                    disabled={!selectedZone || loading}
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Adding... </div>) : "Add"}
                  </button>
                </div>
              </div>


              {/* Existing Zones */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Assigned Zones
                </h3>

                {agentZones?.zone_details?.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-6">
                    No zones assigned yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agentZones?.zone_details?.map((zone: any) => (
                      <div
                        key={zone?.id}
                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition px-4 py-3 rounded-xl border"
                      >
                        <span className="capitalize font-medium text-gray-800">
                          {zone?.name}
                        </span>

                        <button
                          onClick={() => handleDeleteZone(zone?.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          <Trash2Icon size={16} />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
            {/* Error */}
            {zoneApiErrors && (
              <p className="text-red-500 mt-2 text-end px-6">
                {zoneApiErrors}
              </p>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setZoneModal(false)}
                className="px-5 py-2 rounded-xl border hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <AgentTrackingModal
        isOpen={trackingModal}
        onClose={() => setTrackingModal(false)}
        agentId={selectedAgent?.id}
        agentName={selectedAgent?.user_name}
      />
    </div>
  )
}

export default Agents
