import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import AttributeModal from "./AttributeModal";
import Api from "../../api-endpoints/ApiUrls";

interface AttributeType {
  attribute_id: string;
  attribute_name: string;
  attribute_values: any[];
  created_at: string;
}

const Attribute: React.FC = () => {
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAttribute, setEditAttribute] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await axiosInstance.get(Api?.attributeFields);
      setAttributes(res?.data?.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await axiosInstance.delete(`${Api?.attribute}/${deleteItem.attribute_id}`);
      setDeleteItem(null);
      fetchAttributes();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  /*
  SEARCH FILTER
  */

  const filteredData = useMemo(() => {
    return attributes.filter((attr: any) => {
      const nameMatch = attr?.attribute_name
        ?.toLowerCase()
        ?.includes(search.toLowerCase());

      const valueMatch = attr?.attribute_values
        ?.map((v: any) => v.value)
        ?.join(" ")
        ?.toLowerCase()
        ?.includes(search.toLowerCase());

      return nameMatch || valueMatch;
    });
  }, [attributes, search]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attribute Management</h1>

        <button
          onClick={() => {
            setEditAttribute(null);
            setShowModal(true);
          }}
          className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Attribute
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search attribute..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-[700px] w-full text-sm">

            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">S.No</th>
                <th className="px-6 py-3 text-left">Attribute Name</th>
                <th className="px-6 py-3 text-left">Values</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Loading attributes...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No attributes found
                  </td>
                </tr>
              ) : (

                filteredData.map((attr: any, index: number) => (

                  <tr
                    key={attr.attribute_id}
                    className="hover:bg-orange-50 transition"
                  >

                    {/* S.NO */}
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {index + 1}
                    </td>

                    {/* NAME */}
                    <td className="px-6 py-4 font-semibold text-gray-900 capitalize">
                      {attr?.attribute_name}
                    </td>

                    {/* VALUES */}
                    <td className="px-6 py-4">

                      <div className="flex flex-wrap gap-2">

                        {attr?.attribute_values?.map((v: any) => (
                          <span
                            key={v.value_id}
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {v.value}
                          </span>
                        ))}

                      </div>

                    </td>

                    {/* CREATED */}
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(attr?.created_at).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right flex justify-end gap-3">

                      <button
                        onClick={() => {
                          setEditAttribute(attr);
                          setShowModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteItem(attr)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL */}
      <AttributeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchAttributes}
        editAttribute={editAttribute}
      />

      {/* DELETE MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-lg font-semibold mb-4">
              Delete Attribute
            </h2>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete
              <b> {deleteItem.attribute_name}</b> ?
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setDeleteItem(null)}
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

export default Attribute;