import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";
import Api from '../../api-endpoints/ApiUrls';

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editTool: any;
}

const ToolModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editTool,
}) => {
    const isEdit = !!editTool;
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        model: "",
        specification: [
            { key: "", value: "" }
        ],
        category_id: "",
        brand: "",
    });

    useEffect(() => {
        fetchBrands();
        fetchCategories();
    }, []);

    const fetchBrands = async () => {
        const res = await axiosInstance.get(Api?.allBrands);
        setBrands(res?.data?.brands || []);
    };

    const fetchCategories = async () => {
        const res = await axiosInstance.get(Api?.categories);
        setCategories(res?.data?.data || []);
    };


    useEffect(() => {
        if (editTool) {

            let parsedSpecification: any[] = [{ key: "", value: "" }];

            if (editTool.specifications) {
                let specData = editTool.specifications;

                // If string → parse
                if (typeof specData === "string") {
                    try {
                        specData = JSON.parse(specData);
                    } catch (error) {
                        console.error("Invalid JSON format in specification");
                        specData = {};
                    }
                }

                // ✅ If object → convert to key/value array
                if (
                    typeof specData === "object" &&
                    !Array.isArray(specData)
                ) {
                    parsedSpecification = Object.entries(specData).map(
                        ([key, value]) => ({
                            key,
                            value,
                        })
                    );
                }
            }

            setForm({
                name: editTool.name || "",
                description: editTool.description || "",
                price: editTool.price || "",
                model: editTool.model || "",
                specification: parsedSpecification,
                category_id: editTool.category_id || "",
                brand: editTool.brand || "",
            });

        } else {
            setForm({
                name: "",
                description: "",
                price: "",
                model: "",
                specification: [{ key: "", value: "" }],
                category_id: "",
                brand: "",
            });
        }
    }, [editTool]);

    const handleSpecChange = (index: number, field: string, value: string) => {
        const updatedSpecs: any = [...form.specification];
        updatedSpecs[index][field] = value;
        setForm({ ...form, specification: updatedSpecs });
    };

    const addSpecification = () => {
        setForm({
            ...form,
            specification: [...form.specification, { key: "", value: "" }],
        });
    };

    const removeSpecification = (index: number) => {
        const updatedSpecs = [...form.specification];
        updatedSpecs.splice(index, 1);
        setForm({ ...form, specification: updatedSpecs });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setApiErrors("");

        try {
            // Extract specification separately
            const { specification, ...rest } = form;

            const payload = {
                ...rest,
                price: Number(form.price),

                specifications: specification
                    ?.filter((item: any) => item.key && item.value)
                    ?.reduce((acc: any, item: any) => {
                        acc[item.key] = item.value;
                        return acc;
                    }, {}),
            };

            if (isEdit) {
                await axiosInstance.put(
                    `${Api?.tools}/${editTool.id}/`,
                    payload
                );
            } else {
                await axiosInstance.post(
                    `${Api?.tools}/`,
                    payload
                );
            }

            onSuccess();
            onClose();
            setLoading(false);

        } catch (error) {
            setLoading(false);
            setApiErrors(extractErrorMessage(error));
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] no-scrollbar overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Tool" : "Create Tool"}
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
                        <label className="block text-sm mb-1">Model *</label>
                        <input
                            required
                            value={form.model}
                            onChange={(e) =>
                                setForm({ ...form, model: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Brand *
                        </label>
                        <select
                            value={form.brand}
                            onChange={(e) =>
                                setForm({ ...form, brand: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Select Brand</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Brand *
                        </label>
                        <select
                            value={form.category_id}
                            onChange={(e) =>
                                setForm({ ...form, category_id: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Select category</option>
                            {categories?.map((b) => (
                                <option key={b?.id} value={b?.id}>
                                    {b?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Price *</label>
                        <input
                            required
                            type="number"
                            value={form.price}
                            onChange={(e) =>
                                setForm({ ...form, price: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Specification
                        </label>

                        {form?.specification?.map((spec: any, index: number) => (
                            <div key={index} className="flex gap-2 mb-2">

                                <input
                                    type="text"
                                    placeholder="Key (e.g RAM)"
                                    value={spec?.key}
                                    onChange={(e) =>
                                        handleSpecChange(index, "key", e.target.value)
                                    }
                                    className="w-1/2 border rounded-lg px-3 py-2"
                                />

                                <input
                                    type="text"
                                    placeholder="Value (e.g 8GB)"
                                    value={spec.value}
                                    onChange={(e) =>
                                        handleSpecChange(index, "value", e.target.value)
                                    }
                                    className="w-1/2 border rounded-lg px-3 py-2"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    className="text-red-600 px-2"
                                >
                                    ✕
                                </button>

                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addSpecification}
                            className="mt-2 text-orange-600 text-sm font-medium"
                        >
                            + Add Specification
                        </button>
                    </div>


                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end">
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
                            {isEdit ? (
                                "Update"
                            ) : (
                                <>
                                    {loading ? (
                                        <div className="flex gap-2 items-center">
                                            <Loader size={16} className="animate-spin" />
                                            Creating...
                                        </div>
                                    ) : (
                                        "Create"
                                    )}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ToolModal;