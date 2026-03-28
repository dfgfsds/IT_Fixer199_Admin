import React, { useState, useEffect } from 'react';
import { MapPin, Users, TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import axiosInstance from '../configs/axios-middleware';
import Api from '../api-endpoints/ApiUrls';
import ZoneModal from '../components/Modals/ZoneModal';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils/extractErrorMessage ';

interface Zone {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  is_active: boolean;
  manager_id?: string;
  manager_name?: string;
  total_agents: number;
  active_agents: number;
  total_orders: number;
  monthly_revenue: number;
  pending_tickets: number;
}

const ZonalManager: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editZone, setEditZone] = useState<any>('');
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [paginations, setPagination] = useState<any>(null);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">("");

  useEffect(() => {
    fetchZones();
  }, [search, statusFilter]);

  const fetchZones = async (pageNumber = page, size = pageSize) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${Api?.allZone}?page=${pageNumber}&size=${size}&search=${search}&status=${statusFilter}`
      );
      setZones(response?.data?.zones || []);
      const p = response?.data?.pagination;
      if (p) {
        setPagination(p);
        setPage(p.page);
        setTotalPages(p.total_pages);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchZones(newPage, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    fetchZones(1, size);
  };

  const handleDelete = async () => {
    if (!deleteZoneId) return;
    try {
      await axiosInstance.delete(`${Api?.zone}/${deleteZoneId}`);
      fetchZones();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setShowDeleteModal(false);
      setDeleteZoneId(null);
    }
  };


  const zoneStats = {
    totalZones: zones?.length || 0,
    activeZones: zones?.filter(z => z.is_active).length || 0,
    totalAgents: zones?.reduce((sum, z) => sum + z.total_agents, 0),
    totalRevenue: zones?.reduce((sum, z) => sum + z.monthly_revenue, 0)
  };

  const handleZoneToggle = async (zone: any) => {
    try {
      const payload = {
        status: zone.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      }
      const updatedApi = await axiosInstance.put(`${Api.zone}/${zone.id}`, payload)
      if (updatedApi) {
        fetchZones();
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Zonal Manager Panel
          </h1>
          <p className="text-gray-600">
            Manage zones and regional operations
          </p>
        </div>

        <button
          onClick={() => {
            setEditZone(null);
            setShowFormModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition"
        >
          + Create Zone
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-3 items-center justify-between">
        {/* LEFT */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search zone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          />
          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        {/* RIGHT */}
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setPage(1);
          }}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
        >
          Clear
        </button>
      </div>


      {/* Zones Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-lg font-bold text-orange-600 gap-5">
          Loading <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                <MapPin className="w-10 h-10 mb-4 text-gray-400" />
                {zones.length === 0 ? (
                  <>
                    <p className="text-lg font-semibold">No Zones Created Yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Click "Create Zone" to add one.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold">No Matching Zones Found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                {zones?.map((zone: any) => (
                  <div
                    key={zone.id}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  // onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">{zone.name}</h3>
                          <p className="text-sm text-gray-400 capitalize">{zone?.description?.slice(0, 100)}...</p>
                        </div>
                      </div>
                      {/* <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${zone.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {zone?.status ? 'Active' : 'Inactive'}
                      </span> */}

                      <div className="flex items-center  gap-2">

                        <span className={`text-xs font-medium ${zone.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                          {zone.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                        </span>

                        <button
                          onClick={() => handleZoneToggle(zone)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition
  ${zone.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition
    ${zone.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Agents</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {zone?.total_agents}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Orders</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {zone?.total_orders}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 space-x-3">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/zone-slots?zone_id=${zone.id}`);
                        }}
                        className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                      >
                        View Slots   {zone?.slots_count}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditZone(zone);
                          setShowFormModal(true);
                        }}
                        className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteZoneId(zone.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-sm px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}
              </>)}


          </div>
          {!loading && paginations && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={paginations?.total_elements || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}

      {/* Zone Details Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Zone Details - {selectedZone.name}</h2>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Zone Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedZone.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{selectedZone.city}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">{selectedZone.state}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pincode:</span>
                      <span className="font-medium">{selectedZone.pincode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedZone.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedZone.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Agents:</span>
                      <span className="font-medium">{selectedZone.total_agents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Agents:</span>
                      <span className="font-medium">{selectedZone.active_agents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">{selectedZone.total_orders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span className="font-medium">₹{selectedZone?.monthly_revenue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending Tickets:</span>
                      <span className="font-medium">{selectedZone.pending_tickets}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedZone.manager_name && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Zone Manager</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {selectedZone.manager_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h5 className="font-medium text-gray-900">{selectedZone.manager_name}</h5>
                        <p className="text-sm text-gray-600">Zone Manager</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  View Agents
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  View Orders
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                  Edit Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFormModal && (
        <ZoneModal
          show={showFormModal}
          onClose={() => { setShowFormModal(false), setEditZone('') }}
          onSuccess={fetchZones}
          editZone={editZone}
          setEditZone={setEditZone}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="px-6 py-4 border-b bg-red-50">
              <h2 className="text-lg font-semibold text-red-600">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>

            <div className="p-6 text-sm text-gray-700">
              Are you sure you want to delete this zone?
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowDeleteModal(false)}
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

export default ZonalManager;