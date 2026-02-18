import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Select from "react-select";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editService: any;
}

const ServiceModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editService,
}) => {
    const isEdit = !!editService;

    const [categories, setCategories] = useState<any[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [form, setForm] = useState<any>({
        name: "",
        description: "",
        status: "ACTIVE",
        parent: "",
        categories: [],
    });

    // ---------------- Fetch Categories ----------------
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await axiosInstance.get("/api/category");
        setCategories(res?.data?.data || []);
    };

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    const selectedCategoryOptions = categoryOptions.filter((opt) =>
        form.categories.includes(opt.value)
    );

    const handleCategoryChange = (selected: any) => {
        setForm({
            ...form,
            categories: selected ? selected.map((s: any) => s.value) : [],
        });
    };

    // ---------------- Edit Mode ----------------
    useEffect(() => {
        if (editService) {
            setForm({
                name: editService.name,
                description: editService.description,
                status: editService.status,
                parent: editService.parent || "",
                categories: editService.categories || [],
            });

            if (editService.media_files) {
                setExistingMedia(editService.media_files);
                setPreviewUrls(editService.media_files.map((m: any) => m.url));
            }
        }
    }, [editService]);

    // ---------------- Media ----------------
    const handleFileChange = (e: any) => {
        const files = Array.from(e.target.files || []);
        setMediaFiles((prev: any) => [...prev, ...files]);

        const previews = files.map((file: any) =>
            URL.createObjectURL(file)
        );
        setPreviewUrls((prev) => [...prev, ...previews]);
    };

    const handleRemoveImage = (index: number) => {
        const updatedPreviews = [...previewUrls];
        updatedPreviews.splice(index, 1);
        setPreviewUrls(updatedPreviews);

        if (index < existingMedia.length) {
            const updatedExisting = [...existingMedia];
            updatedExisting.splice(index, 1);
            setExistingMedia(updatedExisting);
        } else {
            const newIndex = index - existingMedia.length;
            const updatedNew = [...mediaFiles];
            updatedNew.splice(newIndex, 1);
            setMediaFiles(updatedNew);
        }
    };

    // ---------------- Submit ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const formData = new FormData();

        // service object
        formData.append(
            "service",
            JSON.stringify({
                name: form.name,
                description: form.description,
                status: form.status,
                parent: form.parent,
            })
        );

        // categories
        form.categories.forEach((id: string) => {
            formData.append("categories", id);
        });

        // media
        mediaFiles.forEach((file) => {
            formData.append("media_files", file);
        });

        // existing media keep
        existingMedia.forEach((m: any) => {
            formData.append("existing_media_ids", m.id);
        });

        if (isEdit) {
            await axiosInstance.put(
                `/api/services/${editService.id}/`,
                formData
            );
        } else {
            await axiosInstance.post(
                "/api/services/create/",
                formData
            );
        }

        onSuccess();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                <h2 className="text-xl font-semibold mb-6">
                    {isEdit ? "Edit Service" : "Create Service"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Service Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
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
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>


                    {/* Categories Multi Select */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Categories
                        </label>

                        <Select
                            options={categoryOptions}
                            value={selectedCategoryOptions}
                            onChange={handleCategoryChange}
                            isMulti
                            placeholder="Select Categories"
                        />
                    </div>

                    {/* Media */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Service Images
                        </label>

                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />

                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status */}
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

                    {/* Buttons */}
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
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                            {isEdit ? "Update" : "Create"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ServiceModal;
