import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editCategory: any;
}

const CategoryModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editCategory,
}) => {
    const isEdit = !!editCategory;

    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "ACTIVE",
        type: "SERVICE",
    });

    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    // 🔥 Load Edit Data
    useEffect(() => {
        if (editCategory) {
            setForm({
                name: editCategory.name || "",
                description: editCategory.description || "",
                status: editCategory.status || "ACTIVE",
                type: editCategory.type || "SERVICE",
            });

            if (editCategory.media) {
                setExistingImages(editCategory.media);
                setPreviewUrls(editCategory.media.map((m: any) => m.url));
            }
        } else {
            resetForm();
        }
    }, [editCategory]);

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            status: "ACTIVE",
            type: "SERVICE",
        });
        setExistingImages([]);
        setNewImages([]);
        setPreviewUrls([]);
    };

    // 🔥 Add New Images
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        setNewImages((prev) => [...prev, ...files]);

        const newPreviews = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviewUrls((prev) => [...prev, ...newPreviews]);
    };

    // 🔥 Remove Image (Existing + New)
    const handleRemoveImage = (index: number) => {
        const updatedPreviews = [...previewUrls];
        updatedPreviews.splice(index, 1);
        setPreviewUrls(updatedPreviews);

        if (index < existingImages.length) {
            const updatedExisting = [...existingImages];
            updatedExisting.splice(index, 1);
            setExistingImages(updatedExisting);
        } else {
            const newIndex = index - existingImages.length;
            const updatedNew = [...newImages];
            updatedNew.splice(newIndex, 1);
            setNewImages(updatedNew);
        }
    };

    // 🔥 Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("status", form.status);
            formData.append("type", form.type);

            // Append only NEW images
            newImages?.forEach((file) => {
                formData?.append("media_files", file);
            });

            if (isEdit) {
                await axiosInstance.put(
                    `${Api?.categories}/${editCategory.id}`,
                    formData
                );
            } else {
                await axiosInstance.post(Api?.categories,
                    formData
                );
            }
            onSuccess();
            onClose();
            resetForm();

        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] no-scrollbar overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Category" : "Create Category"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 text-xl">
                        ×
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* Status + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm({ ...form, status: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Type *
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) =>
                                    setForm({ ...form, type: e.target.value })
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="SERVICE">SERVICE</option>
                                <option value="PRODUCT">PRODUCT</option>
                                <option value="TOOLS">TOOLS</option>
                            </select>
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Media Files
                        </label>

                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="w-full"
                        />

                        {/* Preview */}
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt="preview"
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}


                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                            {isEdit ? "Update" :

                                (<>
                                    {loading ? (
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Saving... </div>) : "Create"}
                                </>)}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
