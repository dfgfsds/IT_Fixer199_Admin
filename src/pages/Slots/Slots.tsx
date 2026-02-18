import React, { useEffect, useState } from "react";
import { Search, Eye, Edit, Plus, Trash2 } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import api from "../../api-endpoints/ApiUrls";
import SlotModal from "./SlotModal";


interface SlotType {
  id: string;
  zone_name: string;
  delete_status: boolean;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  status: string;
  zone: string;
}

const Slots: React.FC = () => {
  const [slots, setSlots] = useState<SlotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState<SlotType | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axiosInstance.get(api?.allStols);
      setSlots(response?.data?.slots);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSlotId) return;

    try {
      await axiosInstance.delete(`${api?.slot}/${deleteSlotId}`);
      fetchSlots();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteSlotId(null);
    }
  };


  const filteredSlots = slots.filter(
    (slot) =>
      slot?.zone_name?.toLowerCase().includes(search.toLowerCase()) ||
      slot?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Slot Management</h1>
          <p className="text-gray-500">Manage delivery time slots</p>
        </div>

        <button
          onClick={() => {
            setEditSlot(null);
            setShowFormModal(true);
          }}
          className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Slot
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search slots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">S.No</th>
                <th className="p-4 text-left">Zone</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Max Orders</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSlots.map((slot: any, index: number) => (
                <tr key={slot.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{slot.zone_name}</td>
                  <td className="p-4">{slot.name}</td>
                  <td className="p-4">
                    {slot.start_time} - {slot.end_time}
                  </td>
                  <td className="p-4">{slot.max_orders}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${slot.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {slot.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditSlot(slot);
                        setShowFormModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4 text-orange-600" />
                    </button>

                    <button
                      onClick={() => {
                        setDeleteSlotId(slot.id);
                        setShowDeleteModal(true);
                      }}
                    >

                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Slot Details
                </h2>
                <p className="text-sm text-gray-500">
                  View slot information
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-900">
                  {selectedSlot.name}
                </h3>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${selectedSlot.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {selectedSlot.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-gray-500 mb-1">Zone</p>
                  <p className="font-medium text-gray-900">
                    {selectedSlot.zone_name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Max Orders</p>
                  <p className="font-medium text-gray-900">
                    {selectedSlot.max_orders}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Start Time</p>
                  <p className="font-medium text-gray-900">
                    {selectedSlot.start_time}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">End Time</p>
                  <p className="font-medium text-gray-900">
                    {selectedSlot.end_time}
                  </p>
                </div>

              </div>

              {/* Description */}
              {selectedSlot.description && (
                <div>
                  <p className="text-gray-500 mb-1 text-sm">Description</p>
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700">
                    {selectedSlot.description}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* Create / Edit Modal */}
      <SlotModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={fetchSlots}
        editSlot={editSlot}
      />


      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 border-b bg-red-50">
              <h2 className="text-lg font-semibold text-red-600">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 text-sm text-gray-700">
              Are you sure you want to delete this slot?
              Once deleted, it will be permanently removed.
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
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

export default Slots;
