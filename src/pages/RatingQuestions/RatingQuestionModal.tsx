import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader2 } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import toast from "react-hot-toast";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: any;
}

const RatingQuestionModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editData,
}) => {
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const initialForm = {
        rating_type: "",
        question_text: "",
        question_type: "STAR",
    };

    const [form, setForm] = useState(initialForm);

    // 🔥 SET EDIT DATA
    useEffect(() => {
        if (editData) {
            setForm({
                rating_type: editData?.rating_type,
                question_text: editData.question_text,
                question_type: editData.question_type,
            });
        } else {
            setForm(initialForm);
        }
    }, [editData]);

    const handleClose = () => {
        setForm(initialForm);
        setApiError("");
        onClose();
    };

    // 🔥 SUBMIT (CREATE / UPDATE)
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (editData) {
                // ✏ UPDATE
                const updated = await axiosInstance.put(
                    `${Api.RatingQuestions}/${editData.id}/`,
                    {
                        rating_type: form?.rating_type,
                        question_text: form?.question_text,
                        question_type: form?.question_type,
                        status: "ACTIVE",
                    }
                );
                if (updated) {
                    onSuccess();
                    handleClose();
                    toast.success("Updated successfully");
                }

            } else {
                // ➕ CREATE
                const updated = await axiosInstance.post(`${Api.RatingQuestions}/`, {
                    rating_type: form?.rating_type,
                    question_text: form?.question_text,
                    question_type: form?.question_type,
                    status: "ACTIVE",
                });
                if (updated) {
                    onSuccess();
                    handleClose();
                    toast.success("Created successfully");
                }
            }


        } catch (err) {
            setApiError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">

            <div className="bg-white rounded-2xl w-full max-w-md p-5">

                <h2 className="text-lg font-semibold mb-4">
                    {editData ? "Edit Question" : "Create Question"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* rating_type */}
                    <div>
                        <label className="text-sm font-medium">Rating Type *</label>
                        <select
                            value={form.rating_type}
                            onChange={(e) =>
                                setForm({ ...form, rating_type: e.target.value })
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

                    {/* QUESTION */}
                    <div>
                        <label className="text-sm font-medium">Question *</label>
                        <input
                            required
                            value={form.question_text}
                            onChange={(e) =>
                                setForm({ ...form, question_text: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded-lg mt-1"
                        />
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="text-sm font-medium">Type *</label>
                        <select
                            value={form.question_type}
                            onChange={(e) =>
                                setForm({ ...form, question_type: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded-lg mt-1"
                        >
                            <option value="STAR">STAR</option>
                            <option value="TEXT">TEXT</option>
                        </select>
                    </div>

                    {apiError && (
                        <p className="text-red-500 text-sm">{apiError}</p>
                    )}

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-3">

                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {editData ? "Update" : "Create"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default RatingQuestionModal;