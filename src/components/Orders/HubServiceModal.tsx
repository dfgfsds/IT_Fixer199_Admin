import React, { useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader, UploadCloud } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

const HubServiceModal = ({ order, onClose, onSuccess }: any) => {
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    const [form, setForm] = useState({
        order_item_id: "",
        device_serial_number: "",
        device_condition_notes: "",
        images: [] as File[],
        videos: [] as File[],
    });

    const handleFileChange = (e: any, type: "images" | "videos") => {
        const files = Array.from(e.target.files);
        setForm({ ...form, [type]: files });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("order_id", order.id);
            formData.append("order_item_id", form.order_item_id);
            formData.append("device_serial_number", form.device_serial_number);
            formData.append("device_condition_notes", form.device_condition_notes);

            form.images.forEach((file) => formData.append("images", file));
            form.videos.forEach((file) => formData.append("videos", file));

            await axiosInstance.post(Api?.HubServiceRequest, formData);

            onSuccess();
        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Hub Service Request</h2>
                        <p className="text-xs text-gray-500">
                            Order ID: {order?.id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-6 overflow-y-auto"
                >

                    {/* DEVICE INFO */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-4">
                            Device Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Order Item ID *
                </label>
                <input
                  value={form.order_item_id}
                  onChange={(e) =>
                    setForm({ ...form, order_item_id: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Item
                                </label>
                                <select
                                    value={form.order_item_id}
                                    onChange={(e) =>
                                        setForm({ ...form, order_item_id: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                       <option value="">Select Order Item</option>
                                    {order?.items?.filter((item: any) => item?.type === "SERVICE")?.map((h: any) => (
                                        <option key={h.service_id} value={h.service_id}>
                                            {h?.item_details?.name}
                                        </option>
                                    ))}

                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                    Serial Number
                                </label>
                                <input
                                    value={form.device_serial_number}
                                    onChange={(e) =>
                                        setForm({ ...form, device_serial_number: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                        </div>

                        <div className="mt-4">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                Device Condition Notes
                            </label>
                            <textarea
                                value={form.device_condition_notes}
                                onChange={(e) =>
                                    setForm({ ...form, device_condition_notes: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-orange-500"
                                rows={3}
                            />
                        </div>

                    </div>

                    {/* FILE UPLOAD */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-4">
                            Upload Media
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* IMAGES */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                                    Images
                                </label>

                                <label className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                                    <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">
                                        Click to upload images
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "images")}
                                    />
                                </label>
                            </div>

                            {/* VIDEOS */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                                    Videos
                                </label>

                                <label className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                                    <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">
                                        Click to upload videos
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "videos")}
                                    />
                                </label>
                            </div>

                        </div>

                        {/* COUNT */}
                        <p className="text-xs text-gray-500 mt-2">
                            {form.images.length} Images • {form.videos.length} Videos selected
                        </p>
                    </div>

                </form>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end px-6">
                        {apiErrors}
                    </p>
                )}

                {/* FOOTER */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader size={16} className="animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            "Submit Request"
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default HubServiceModal;