import React, { useEffect, useState } from 'react'
import { Search, Eye, Star, Loader, TrashIcon, Trash2Icon, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../configs/axios-middleware'
import Api from '../api-endpoints/ApiUrls';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/extractErrorMessage ';
import AgentTrackingModal from '../components/Modals/AgentTrackingModal';
import toast from 'react-hot-toast';
import CreateAgentModal from '../components/Agent/CreateAgentModal';
import Pagination from '../components/Pagination';
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
  const [createModal, setCreateModal] = useState(false);

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedHub, setSelectedHub] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [hubs, setHubs] = useState<any[]>([])

  const managerList = users
    ?.filter((item: any) => item?.role === "MANAGER")
    ?.filter((i: any) => i?.hub_id === selectedAgent?.hub);

  const fetchUsers = async () => {
    try {

      const response = await axiosInstance.get(`${Api.allUsers}?role=MANAGER&size=10000`,
      );
      setUsers(response.data?.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };


  // const handleOpenManagerModal = (agent: any) => {
  //   setSelectedAgent(agent);
  //   setManagerModal(true);
  //   fetchUsers();
  // }

  const handleAssignManager = async () => {
    setLoading(true);
    try {
      if (selectedManager) {
        const updatedApi = await axiosInstance.put(`${Api?.allocations}${selectedManager}`)
        if (updatedApi) {
          setLoading(false);
          setManagerModal(false);
          fetchAgents();
        }
      } else {
        const updatedApi = await axiosInstance.post(Api?.allocations, {
          agent: selectedAgent.id,
          manager: selectedManager
        })
        if (updatedApi) {
          setLoading(false);
          setManagerModal(false);
          fetchAgents();
        }
      }
    } catch (error) {
      setLoading(false);
      setApiErrors(extractErrorMessage(error));
    }
  }

  // Zones
  const openZoneModal = async (agent: any) => {
    setSelectedAgent(agent)
    setZoneModal(true)
    if (agent?.id) {
      const res = await axiosInstance.get(`${Api?.agentZones}/${agent?.id}`)
      setAgentZones(res?.data?.data)

      const zonesRes = await axiosInstance.get(`${Api?.hubMapping}?hub=${agent?.hub}`);
      console.log(zonesRes)
      setAllZones(zonesRes?.data?.mappings)
    }


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

  const handleOpenManagerModal = (agent: any) => {
    setSelectedAgent(agent);
    setSelectedManager(String(agent?.manager_details?.id || ""));
    setManagerModal(true);
    fetchUsers();
  };

  const handleDeleteManager = async (agent: any) => {
    try {
      if (!window.confirm("Remove this manager?")) return;

      await axiosInstance.delete(`${Api.allocations}manager/${agent.manager_details?.id}/`);

      fetchAgents();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };


  const handleDeleteZone = async (id: string) => {
    try {
      await axiosInstance.delete(`${Api?.addAgentZone}${selectedAgent.id}/${id}/`)
      openZoneModal(selectedAgent)
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }

  }


  useEffect(() => {
    fetchAgents()
  }, [filters])

  // const fetchAgents = async () => {
  //   try {
  //     const params = new URLSearchParams({
  //       ...(filters.search && { search: filters.search }),
  //       ...(filters.status !== 'all' && { status: filters.status })
  //     })
  //     // const res = await fetch(`/api/agents?${params}`, {
  //     //   headers: { Authorization: `Bearer ${token}` }
  //     // })
  //     const res: any = await axiosInstance.get(Api?.agents);
  //     if (res) {
  //       // const data = await res.json()
  //       setAgents(res?.data?.agents)
  //     }
  //   } catch (err) {
  //     console.log(err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchAgents = async () => {
    setLoading(true);

    try {
      const res: any = await axiosInstance.get(Api?.agents);
      setAgents(res?.data?.agents || []);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetManagerModal = () => {
    setSelectedAgent(null);
    setSelectedManager('');
    setUsers([]);
    setApiErrors('');
  };

  useEffect(() => {
    if (!managerModal) {
      resetManagerModal();
    }
  }, [managerModal]);

  const resetZoneModal = () => {
    setSelectedAgent(null);
    setSelectedZone('');
    setAgentZones([]);
    setAllZones([]);
    setzoneApiErrors('');
  };

  useEffect(() => {
    if (!zoneModal) {
      resetZoneModal();
    }
  }, [zoneModal]);


  // const filteredAgents = agents?.filter(agent => {
  //   const matchesSearch =
  //     agent.user_name
  //       ?.toLowerCase()
  //       .includes(filters.search.toLowerCase()) ||
  //     agent.user_details?.mobile_number
  //       ?.toLowerCase()
  //       .includes(filters.search.toLowerCase())

  //   const matchesStatus =
  //     filters.status === 'all' ||
  //     agent.user_details?.status === filters.status

  //   return matchesSearch && matchesStatus
  // })

  useEffect(() => {
    let data = [...agents];

    // 🔍 SEARCH
    if (filters.search) {
      data = data.filter((agent) =>
        agent.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        agent.user_details?.mobile_number?.includes(filters.search)
      );
    }

    // 📌 STATUS
    if (filters.status !== "all") {
      data = data.filter(
        (agent) => agent.user_details?.status === filters.status
      );
    }

    // 🏢 HUB
    if (selectedHub) {
      data = data.filter((agent: any) => agent.hub === selectedHub);
    }

    // 🔥 SORT (created_at)
    data.sort((a: any, b: any) => {
      const d1 = new Date(a.created_at).getTime();
      const d2 = new Date(b.created_at).getTime();

      return sortOrder === "recent" ? d2 - d1 : d1 - d2;
    });

    setFilteredData(data);
    setPage(1);
  }, [agents, filters, selectedHub, sortOrder]);

  const totalItems = filteredData?.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedData = filteredData?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    fetchHubs();
  }, []);

  // ✅ FETCH HUBS
  const fetchHubs = async () => {
    try {
      const res = await axiosInstance.get(Api?.allHubs);
      setHubs(res?.data?.hubs || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleStatusToggle = async (agent: any) => {
    const form = new FormData();

    try {

      const dataStatus = agent.user_details?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      form.append("status", dataStatus);

      const updatedApi = await axiosInstance.put(
        `${Api?.agentUser}${agent?.user}`,
        {
          status: dataStatus
        }
      );
      if (updatedApi) {
        toast.success("User status updated");
        fetchAgents();
      }

    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER + ACTION */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500">
            Manage and monitor all agents
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm transition"
        >
          + Add Agent
        </button>
      </div>

      {/* FILTERS */}
      {/* FILTERS */}
      {/* <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 items-center">

      
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>


        <div className="flex items-center gap-2">
  

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>


        <button
          onClick={() =>
            setFilters({
              search: "",
              status: "all",
            })
          }
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Clear
        </button>

      </div> */}
      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* LEFT SIDE */}
        <div className="flex flex-wrap gap-3 items-center w-full">

          {/* SEARCH */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>

          {/* STATUS */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>

          {/* HUB */}
          <select
            value={selectedHub}
            onChange={(e) => {
              setSelectedHub(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm capitalize focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Hubs</option>
            {hubs?.map((hub: any) => (
              <option key={hub?.id} value={hub?.id}>
                {hub?.name}
              </option>
            ))}
          </select>

          {/* SORT */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 justify-end">

          <button
            onClick={() => {
              setFilters({ search: "", status: "all" });
              setSelectedHub("");
              setSortOrder("recent");
              setPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Clear
          </button>

        </div>

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
                  Hub
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th> */}
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
              {paginatedData?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No Agents Found
                  </td>
                </tr>
              ) : (
                paginatedData?.map((agent: any, index: number) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    {/* Agent */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">

                        {agent.profile_image_url ? (
                          <img
                            src={agent.profile_image_url}
                            alt="profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                            {agent.user_name?.charAt(0)}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {agent.user_name}
                          </span>

                          <span className="text-xs text-gray-500">
                            {agent.user_details?.mobile_number}
                          </span>
                        </div>

                      </div>
                    </td>


                    {/* Zone */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {agent.hub_name}
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {agent?.cumulative_rating}
                        
                        </div>
                     
                      </div>
                    </td> */}

                    {user?.role !== 'HUB_MANAGER' && (
                      <td className="px-6 py-4">
                        {agent?.manager_details ? (
                          <div className="space-y-2 text-sm">

                            {/* Manager Info */}
                            <div>
                              <span className="font-medium text-gray-500">Name :</span>{" "}
                              <span className="font-semibold text-gray-900 capitalize">
                                {agent.manager_details?.name || "-"}
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-gray-500">Email :</span>{" "}
                              <span className="text-gray-800 break-all">
                                {agent.manager_details?.email || "-"}
                              </span>
                            </div>

                            <div>
                              <span className="font-medium text-gray-500">Mobile :</span>{" "}
                              <span className="text-gray-800">
                                {agent.manager_details?.mobile_number || "-"}
                              </span>
                            </div>

                            {/* 🔥 ACTION BUTTONS */}
                            <div className="flex gap-2 mt-2">

                              {/* Update */}
                              {/* <button
                                onClick={() => handleOpenManagerModal(agent)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              >
                                Update
                              </button> */}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteManager(agent)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                              >
                                Remove
                              </button>

                            </div>

                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenManagerModal(agent)}
                            disabled={agent.user_details?.status === "PENDING"}
                            className={`px-3 py-1.5 text-sm rounded-lg transition
    ${agent.user_details?.status === "PENDING"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                              }`}
                          >
                            + Add Manager
                          </button>
                        )}
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openZoneModal(agent)}
                        disabled={agent.user_details?.status === "PENDING"}
                        className={`px-3 py-1.5 text-sm rounded-lg transition
    ${agent.user_details?.status === "PENDING"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          }`}
                      >
                        View Zones ({agent.zone_details?.length || 0})
                      </button>
                    </td>


                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        {/* TOGGLE */}
                        <button
                          onClick={() => handleStatusToggle(agent)}
                          disabled={agent.user_details?.status === "PENDING"}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 
      ${agent.user_details?.status === "ACTIVE"
                              ? "bg-green-500 shadow-md"
                              : "bg-gray-300"}
      ${agent.user_details?.status === "PENDING" && "opacity-50 cursor-not-allowed"}
    `}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all duration-300
        ${agent.user_details?.status === "ACTIVE"
                                ? "translate-x-6"
                                : "translate-x-1"}
      `}
                          />
                        </button>

                        {/* STATUS TEXT */}
                        <div className="flex flex-col leading-tight">
                          <span
                            className={`text-sm font-medium
        ${agent.user_details?.status === "ACTIVE"
                                ? "text-green-600"
                                : agent.user_details?.status === "PENDING"
                                  ? "text-orange-500"
                                  : "text-gray-500"}
      `}
                          >
                            {agent.user_details?.status}
                          </span>

                          {/* SUB TEXT */}
                          {agent.user_details?.status === "PENDING" && (
                            <span className="text-xs text-gray-400">
                              Verification required
                            </span>
                          )}
                        </div>

                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 flex justify-end items-center gap-3 mt-8">

                      {/* Tracking */}
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setTrackingModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        Tracking
                        <MapPin className="w-3 h-3" />
                      </button>

                      {/* View */}
                      <button
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        View
                        <Eye className="w-3 h-3" />
                      </button>

                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(p: any) => setPage(p)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1); // 🔥 reset
        }}
      />
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

              {managerList?.length > 0 ? (
                managerList?.map((mgr: any) => (
                  <option key={mgr?.id} value={mgr?.id}>
                    {mgr?.name}
                  </option>
                ))
              ) : (
                <option disabled>No Manager Available in this location</option>
              )}
            </select>
            {/* Error */}
            {apiErrors && (
              <p className="text-red-500 mt-2 text-end px-6">
                {apiErrors}
              </p>
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button
                // onClick={() => { setManagerModal(false), setApiErrors('') }}
                onClick={() => {
                  setManagerModal(false);
                  resetManagerModal();
                }}

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
                    {selectedAgent?.user_details?.name?.charAt(0) || "A"}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">Name :</span>{" "}
                      <span className="font-semibold text-gray-900 capitalize">
                        {selectedAgent?.user_details?.name || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-medium">Mobile :</span>{" "}
                      <span className="text-gray-800">
                        {selectedAgent?.user_details?.mobile_number || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 font-medium">Email :</span>{" "}
                      <span className="text-gray-800 break-all">
                        {selectedAgent?.user_details?.email || "-"}
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
                          !agentZones?.zone_details?.some((z: any) => z?.id === zone?.zone)
                      )
                      .map((zone) => (
                        <option key={zone?.zone} value={zone?.zone}>
                          {zone?.zone_name}
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

      <CreateAgentModal
        show={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={fetchAgents}
      />
    </div>
  )
}

export default Agents
