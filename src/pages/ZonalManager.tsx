import React, { useState, useEffect } from 'react';
import { MapPin, Users, TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import axiosInstance from '../configs/axios-middleware';
import Api from '../api-endpoints/ApiUrls';
import ZoneModal from '../components/Modals/ZoneModal';

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


  const filteredZones = zones.filter((zone) => {
    const searchText = search.toLowerCase();

    return (
      zone.name?.toLowerCase().includes(searchText) ||
      zone.city?.toLowerCase().includes(searchText) ||
      zone.state?.toLowerCase().includes(searchText) ||
      zone.pincode?.toLowerCase().includes(searchText) ||
      zone.manager_name?.toLowerCase().includes(searchText)
    );
  });


  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await axiosInstance.get(Api?.allZone);
      setZones(response?.data?.zones);
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async () => {
    if (!deleteZoneId) return;

    try {
      await axiosInstance.delete(`${Api?.zone}/${deleteZoneId}`);
      fetchZones();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteZoneId(null);
    }
  };


  const zoneStats = {
    totalZones: zones.length || 0,
    activeZones: zones.filter(z => z.is_active).length || 0,
    totalAgents: zones.reduce((sum, z) => sum + z.total_agents, 0),
    totalRevenue: zones.reduce((sum, z) => sum + z.monthly_revenue, 0)
  };
  //   const zoneStats = {
  //   totalZones: zones.length,
  //   activeZones: zones.filter(z => z.status === "ACTIVE").length,
  // };


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


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-blue-600">{zoneStats.totalZones}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-green-600">{zoneStats.activeZones}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-orange-600">{zoneStats.totalAgents}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-500">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{zoneStats?.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          placeholder="Search by zone, city, state, pincode, manager..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

      {/* Zones Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-lg font-bold text-orange-600 gap-5">
          Loading <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.length === 0 ? (
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
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                        <p className="text-sm text-gray-600">{zone.city}, {zone.state}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${zone.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Agents</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {zone.active_agents}/{zone.total_agents}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Orders</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {zone.total_orders}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Revenue</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{zone?.monthly_revenue?.toLocaleString()}
                      </span>
                    </div>

                    {zone.pending_tickets > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                          <span className="text-sm text-red-600">Pending Tickets</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {zone.pending_tickets}
                        </span>
                      </div>
                    )}

                    {zone.manager_name && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {zone.manager_name.charAt(0)}
                            </span>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            Manager: {zone.manager_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-4 space-x-3">
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