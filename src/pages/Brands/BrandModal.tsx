import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";
interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editBrand: any;
}

const BrandModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editBrand,
}) => {

    const isEdit = !!editBrand;

    const [form, setForm] = useState({
        name: "",
        status: "ACTIVE",
        is_featured: false,
        type: "PRODUCT",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [apiErrors, setApiErrors] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editBrand) {
            setForm({
                name: editBrand.name,
                status: editBrand.status,
                is_featured: editBrand.is_featured,
                type: editBrand.type,
            });
            setPreview(editBrand.logo_url);
        }
    }, [editBrand]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {

            const formData = new FormData();

            formData.append("name", form.name);
            formData.append("status", form.status);
            formData.append("type", form.type);
            formData.append("is_featured", String(form.is_featured));

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            if (isEdit) {
                const updateApi = await axiosInstance.put(
                    `${Api?.Brands}/${editBrand.id}`,
                    formData
                );
                if (updateApi) {
                    onSuccess();
                    onClose();
                }
            } else {
                const updateApi = await axiosInstance.post(Api?.Brands, formData);
                if (updateApi) {
                    onSuccess();
                    onClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            setApiErrors(extractErrorMessage(error));

        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] no-scrollbar overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Brand" : "Create Brand"}
                    </h2>
                    <button onClick={() => { onClose(), setApiErrors('') }} className="text-xl">×</button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-sm mb-1">Name *</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm mb-1">Type *</label>
                        <select
                            value={form.type}
                            onChange={(e) =>
                                setForm({ ...form, type: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="PRODUCT">PRODUCT</option>
                            <option value="TOOLS">TOOLS</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm mb-1">Status</label>
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

                    {/* Featured */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(e) =>
                                setForm({ ...form, is_featured: e.target.checked })
                            }
                        />
                        <label>Featured</label>
                    </div>

                    {/* Logo */}
                    <div>
                        <label className="block text-sm mb-1">Logo</label>

                        <input
                            type="file"
                            onChange={(e) => {
                                if (e.target.files) {
                                    const file = e.target.files[0];
                                    setLogoFile(file);
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
                        />

                        {preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className="mt-3 w-20 h-20 object-contain border rounded"
                            />
                        )}
                    </div>

                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => { onClose(), setApiErrors('') }}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                            {/* {isEdit ? "Update" : "Create"} */}
                            {isEdit ? "Update" :

                                (<>
                                    {loading ? (
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Create"}
                                </>)}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default BrandModal;