import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editAttribute: any;
}

const AttributeModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editAttribute,
}) => {

    const isEdit = !!editAttribute;
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    const [form, setForm] = useState({
        name: "",
        value: "",
    });

    useEffect(() => {
        if (editAttribute) {
            setForm({
                name: editAttribute.name,
                value: editAttribute.value,
            });
        } else {
            setForm({ name: "", value: "" });
        }
    }, [editAttribute]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                const updateApi = await axiosInstance.put(
                    `/api/attribute/${editAttribute.attribute_id}`,
                    form
                );
                if (updateApi) {
                    onSuccess();
                    onClose();
                    setLoading(false);

                }
            } else {
                const updateApi = await axiosInstance.post("/api/attribute", form);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Attribute" : "Create Attribute"}
                    </h2>
                    <button onClick={onClose} className="text-xl">×</button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

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

                    <div>
                        <label className="block text-sm mb-1">Value *</label>
                        <input
                            required
                            value={form.value}
                            onChange={(e) =>
                                setForm({ ...form, value: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
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
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Create"}
                                </>)}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AttributeModal;
