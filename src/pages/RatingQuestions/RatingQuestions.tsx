import { AlertCircle, Edit, Edit3, Loader2, Plus, RefreshCcw, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import RatingQuestionModal from "./RatingQuestionModal";

const RatingQuestions: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteQuestion, setDeleteQuestion] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [showFollowModal, setShowFollowModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [followForm, setFollowForm] = useState({
        rating_type: "",
        question_text: "",
        question_type: "TEXT",
    });
    const [followEditId, setFollowEditId] = useState<string | null>(null);
    const [apiError, setApiError] = useState("");

    const fetchRatingQuestions = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `${Api.RatingQuestions}`
            );

            setData(res?.data?.data || []);

        } catch (err) {
            toast.error(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRatingQuestions();
    }, []);
    const mainQuestions = data.filter((item) => !item.is_followup);

    const handleDeleteQuestion = async () => {
        if (!deleteQuestion) return;
        try {
            setDeleteLoading(true);

            await axiosInstance.delete(
                `${Api.RatingQuestions}/${deleteQuestion.id}/`
            );
            fetchRatingQuestions();
            setShowDeleteModal(false);
            setDeleteQuestion(null);
        } catch (error) {
            toast.error(extractErrorMessage(error));
        } finally {
            setDeleteLoading(false);
        }
    };
    const handleFollowSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (followEditId) {
                // ✏ UPDATE
                await axiosInstance.put(
                    `${Api.RatingQuestions}/${followEditId}/`,
                    {
                        parent_question: selectedQuestion.id,
                        rating_type: followForm.rating_type,
                        question_text: followForm.question_text,
                        question_type: followForm.question_type,
                        status: "ACTIVE",
                    }
                );
                toast.success("Updated");
            } else {
                // ➕ CREATE
                await axiosInstance.post(`${Api.RatingQuestions}/`, {
                    rating_type: followForm.rating_type,
                    question_text: followForm.question_text,
                    question_type: followForm.question_type,
                    is_followup: true,
                    parent_question: selectedQuestion.id,
                    status: "ACTIVE",
                });
                toast.success("Created");
            }

            fetchRatingQuestions();
            setFollowForm({ rating_type: "", question_text: "", question_type: "TEXT" });
            setFollowEditId(null);
            setShowFollowModal(false);

        } catch (err) {
            setApiError(extractErrorMessage(err));
        }
    }

    return (
        <>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold">
                    Rating Questions
                </h1>

                <button
                    onClick={() => {
                        setEditData(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg"
                >
                    <Plus size={16} /> Add Rating Questions
                </button>
            </div>

            {/* FILTERS */}
            <div className="bg-white p-4 rounded-lg border flex gap-4 mb-3">

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        // value={search}
                        // onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg"
                    />
                </div>

                <select
                    // value={stockFilter}
                    // onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="all">All Stock</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                </select>

            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-lg overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-orange-600" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">S.No</th>
                                <th className="px-4 py-3 text-left">Question</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Followups</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {mainQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10">
                                        No Questions Found
                                    </td>
                                </tr>
                            ) : (
                                mainQuestions.map((item: any, index: number) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">

                                        <td className="px-4 py-3">{index + 1}</td>

                                        <td className="px-4 py-3">
                                            {item.question_text}
                                        </td>

                                        <td className="px-4 py-3">
                                            {item.question_type}
                                        </td>

                                        {/* FOLLOWUPS */}
                                        <td className="px-4 py-3">
                                            <button
                                                //   onClick={() => {
                                                //     setSelectedFollowups(item.followups || []);
                                                //     setShowFollowModal(true);
                                                //   }}
                                                onClick={() => {
                                                    setSelectedQuestion(item);
                                                    setShowFollowModal(true);
                                                }}
                                                className="text-blue-600 underline"
                                            >
                                                View ({item.followups?.length || 0})
                                            </button>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditData(item);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-orange-600 hover:text-orange-800 p-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setDeleteQuestion(item);
                                                        setShowDeleteModal(!showDeleteModal)
                                                    }}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <RatingQuestionModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchRatingQuestions}
                editData={editData}
            />

            {showDeleteModal && deleteQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg p-6 w-full max-w-md">

                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Confirm Delete
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete inventory for
                            <span className="font-semibold">
                                {" "}{deleteQuestion?.product?.name}
                            </span>
                            {" "}in
                            <span className="font-semibold">
                                {" "}{deleteQuestion?.hub_name || "Selected Hub"}
                            </span>
                            ?
                        </p>

                        <div className="flex justify-end space-x-3">

                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteQuestion(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteQuestion}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                            >
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* {showFollowModal && selectedQuestion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-lg rounded-xl p-5">

                        <h2 className="text-lg font-semibold mb-4">
                            Followups - {selectedQuestion.question_text}
                        </h2>


                        <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">

                            {selectedQuestion.followups?.length === 0 ? (
                                <p className="text-gray-500">No followups</p>
                            ) : (
                                selectedQuestion.followups.map((f: any) => (
                                    <div
                                        key={f.id}
                                        className="border rounded p-2 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-sm">{f.question_text}</p>
                                            <p className="text-xs text-gray-500">{f.question_type}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setFollowEditId(f.id);
                                                    setFollowForm({
                                                        rating_type: f.rating_type,
                                                        question_text: f.question_text,
                                                        question_type: f.question_type,
                                                    });
                                                }}
                                                className="text-orange-600"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    await axiosInstance.delete(
                                                        `${Api.RatingQuestions}/${f.id}/`
                                                    );
                                                    fetchRatingQuestions();
                                                    setShowFollowModal(false);
                                                }}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>


                        <div className="border-t pt-3">

                            <h3 className="text-sm font-semibold mb-2">
                                {followEditId ? "Edit Followup" : "Add Followup"}
                            </h3>

                            <div>
                                <label className="text-sm font-medium">Rating Type *</label>
                                <select
                                    value={followForm.rating_type}
                                    onChange={(e) =>
                                        setFollowForm({ ...followForm, rating_type: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded-lg mt-1"
                                >
                                    <option value="">Select Rating Type</option>
                                    <option value="AGENT">AGENT</option>
                                    <option value="PRODUCT">PRODUCT</option>
                                    <option value="SERVICE">SERVICE</option>
                                    <option value="ORDER">ORDER</option>

                                </select>
                            </div>

                            <input
                                placeholder="Enter followup question"
                                value={followForm.question_text}
                                onChange={(e) =>
                                    setFollowForm({ ...followForm, question_text: e.target.value })
                                }
                                className="w-full border px-3 py-2 rounded mb-2"
                            />

                            <select
                                value={followForm.question_type}
                                onChange={(e) =>
                                    setFollowForm({ ...followForm, question_type: e.target.value })
                                }
                                className="w-full border px-3 py-2 rounded mb-3"
                            >
                                <option value="TEXT">TEXT</option>
                                <option value="STAR">STAR</option>
                            </select>

                            {apiError && (
                                <p className="text-red-500 text-sm text-end p-2">{apiError}</p>
                            )}


                            <div className="flex justify-end gap-2">

                                <button
                                    onClick={() => {
                                        setFollowEditId(null);
                                        setFollowForm({ rating_type: "", question_text: "", question_type: "TEXT" });
                                    }}
                                    className="px-3 py-1 border rounded"
                                >
                                    Clear
                                </button>

                                <button
                                    onClick={handleFollowSubmit}
                                    className="px-3 py-1 bg-orange-600 text-white rounded"
                                >
                                    {followEditId ? "Update" : "Add"}
                                </button>

                            </div>
                        </div>



                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowFollowModal(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )} */}

            {showFollowModal && selectedQuestion && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      {/* HEADER */}
      <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 leading-tight">Follow-up Questions</h2>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">For: {selectedQuestion.question_text}</p>
        </div>
        <button 
          onClick={() => setShowFollowModal(false)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* LIST SECTION */}
      <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Existing Follow-ups</h3>
        <div className="space-y-3">
          {selectedQuestion.followups?.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
               <p className="text-sm text-gray-400">No followup questions added yet.</p>
            </div>
          ) : (
            selectedQuestion.followups.map((f: any) => (
              <div
                key={f.id}
                className="group border border-gray-100 bg-gray-50/50 rounded-xl p-3 flex justify-between items-center hover:border-orange-200 hover:bg-orange-50/30 transition-all"
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-gray-700">{f.question_text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 font-bold uppercase">
                      {f.question_type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Type: {f.rating_type}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setFollowEditId(f.id);
                      setFollowForm({
                        rating_type: f.rating_type,
                        question_text: f.question_text,
                        question_type: f.question_type,
                      });
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    onClick={async () => {
                      if(window.confirm("Are you sure?")) {
                        await axiosInstance.delete(`${Api.RatingQuestions}/${f.id}/`);
                        fetchRatingQuestions();
                        setShowFollowModal(false);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="p-5 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${followEditId ? 'bg-blue-500' : 'bg-green-500'}`}></div>
          <h3 className="text-sm font-bold text-gray-800">
            {followEditId ? "Modify Follow-up" : "Create New Follow-up"}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Rating Type *</label>
            <select
              value={followForm.rating_type}
              onChange={(e) => setFollowForm({ ...followForm, rating_type: e.target.value })}
              className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            >
              <option value="">Select Type</option>
              <option value="AGENT">AGENT</option>
              <option value="PRODUCT">PRODUCT</option>
              <option value="SERVICE">SERVICE</option>
              <option value="ORDER">ORDER</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Input Type</label>
            <select
              value={followForm.question_type}
              onChange={(e) => setFollowForm({ ...followForm, question_type: e.target.value })}
              className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            >
              <option value="TEXT">TEXT INPUT</option>
              <option value="STAR">STAR RATING</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Question Text</label>
          <input
            placeholder="e.g., Please tell us more about the service..."
            value={followForm.question_text}
            onChange={(e) => setFollowForm({ ...followForm, question_text: e.target.value })}
            className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg mb-4 border border-red-100 flex items-center gap-2">
            <AlertCircle size={14} /> {apiError}
          </div>
        )}

        <div className="flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFollowEditId(null);
              setFollowForm({ rating_type: "", question_text: "", question_type: "TEXT" });
            }}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 underline decoration-dotted"
          >
            Reset Form
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFollowModal(false)}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleFollowSubmit}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
            >
              {followEditId ? <RefreshCcw size={16} /> : <Plus size={16} />}
              {followEditId ? "Save Changes" : "Add Question"}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
)}
        </>
    )
}

export default RatingQuestions;