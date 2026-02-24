import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Select from 'react-select';
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editProduct: any;
}

const ProductModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editProduct,
}) => {
    const isEdit = !!editProduct;

    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [attributesList, setAttributesList] = useState<any[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");


    const [form, setForm] = useState<any>({
        name: "",
        description: "",
        brand_id: "",
        model: "",
        type: "PRODUCT",
        sku: "",
        specification: [
            { key: "", value: "" }
        ],
        status: "ACTIVE",
        category_ids: [],
        attributes: [],
    });

    // ---------------- Fetch Data ----------------
    useEffect(() => {
        fetchBrands();
        fetchCategories();
        fetchAttributes();
    }, []);

    const fetchBrands = async () => {
        const res = await axiosInstance.get(Api?.allBrands);
        setBrands(res?.data?.brands || []);
    };

    const fetchCategories = async () => {
        const res = await axiosInstance.get(Api?.categories);
        setCategories(res?.data?.data || []);
    };

    const fetchAttributes = async () => {
        const res = await axiosInstance.get(Api?.attribute);
        setAttributesList(res?.data?.data || []);
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    const handleCategoryChange = (selected: any) => {
        setForm({
            ...form,
            category_ids: selected ? selected.map((s: any) => s.value) : [],
        });
    };

    const selectedCategoryOptions = categoryOptions.filter((option) =>
        form.category_ids.includes(option.value)
    );


    const attributeOptions = attributesList.map((attr) => ({
        value: attr?.value_id,
        label: `${attr.name} - ${attr.value}`,
        full: attr,
    }));


    const handleAttributeChange = (selected: any) => {
        setForm({
            ...form,
            attributes: selected
                ? selected.map((s: any) => ({
                    id: s.full.value_id,
                    attribute_name: s.full.name,
                    value: s.full.value,
                }))
                : [],
        });
    };

    const selectedAttributeOptions = attributeOptions.filter((option) =>
        form.attributes.some((a: any) => a.id === option.value)
    );



    // ---------------- Edit Mode ----------------
    useEffect(() => {
        if (!editProduct) return;
        console.log(editProduct)
        let parsedSpecification: any[] = [{ key: "", value: "" }];

        if (editProduct.specification) {
            let specData = editProduct.specification;

            // If string → parse
            if (typeof specData === "string") {
                try {
                    specData = JSON.parse(specData);
                } catch (error) {
                    console.error("Invalid JSON format in specification");
                    specData = [];
                }
            }

            // If array → convert format
            if (Array.isArray(specData)) {
                parsedSpecification = specData.map((item: any) => {
                    const key = Object.keys(item)[0];
                    return {
                        key,
                        value: item[key],
                    };
                });
            }
        }

        setForm({
            name: editProduct.name || "",
            description: editProduct.description || "",
            brand_id: editProduct.brand || "",
            model: editProduct.model_name || "",
            type: editProduct.type || "PRODUCT",
            sku: editProduct.sku || "",
            status: editProduct.status || "ACTIVE",
            category_ids:
                editProduct.categories?.map((c: any) => c.id) || [],
            attributes: editProduct?.attributes?.map((a: any) => a?.value_id),
            // attributes: editProduct.attributes || [],
            specification: parsedSpecification,
        });

        if (editProduct.media) {
            setExistingImages(editProduct.media);
            setPreviewUrls(editProduct.media.map((m: any) => m.url));
        }
    }, [editProduct]);



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        setNewImages((prev) => [...prev, ...files]);

        const newPreviews = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviewUrls((prev) => [...prev, ...newPreviews]);
    };

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


    const handleSpecChange = (index: number, field: string, value: string) => {
        const updatedSpecs = [...form.specification];
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


    // ---------------- Submit ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();

            Object.keys(form).forEach((key) => {
                if (
                    key !== "category_ids" &&
                    key !== "attributes" &&
                    key !== "specification"
                ) {
                    formData.append(key, form[key]);
                }
            });

            form.category_ids.forEach((id: string) => {
                formData.append("category_ids", id);
            });

            // ✅ Attributes
            const attributesPayload = form.attributes.map((attr: any) => ({
                value_id: attr?.id,
            }));

            formData.append("attributes", JSON.stringify(attributesPayload));
            // form.attributes.forEach((attr: any) => {
            //     formData.append("attributes", JSON.stringify(attr?.id));
            // });

            // Send only new images
            newImages.forEach((file) => {
                formData.append("media_files", file);
            });


            // 🔥 Convert to required format
            const formattedSpecification = form.specification
                .filter((item: any) => item.key && item.value) // remove empty rows
                .map((item: any) => ({
                    [item.key]: item.value,
                }));

            formData.append(
                "specification",
                JSON.stringify(formattedSpecification)
            );

            if (isEdit) {
                const updateApi = await axiosInstance.put(`${Api?.products}/${editProduct.id}`, formData);
                if (updateApi) {
                    onSuccess();
                    onClose();
                    setLoading(false);
                }
            } else {
                const updateApi = await axiosInstance.post(Api?.products, formData);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] no-scrollbar overflow-y-auto">

                <h2 className="text-xl font-semibold mb-6">
                    {isEdit ? "Edit Product" : "Create Product"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Product Name *
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

                    {/* Model */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Model
                        </label>
                        <input
                            type="text"
                            value={form.model}
                            onChange={(e) =>
                                setForm({ ...form, model: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Enter model name"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Product Type *
                        </label>
                        <select
                            value={form.type}
                            onChange={(e) =>
                                setForm({ ...form, type: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="PRODUCT">PRODUCT</option>
                            <option value="VARIANT">VARIANT</option>
                        </select>
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


                    {/* SKU */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            SKU
                        </label>
                        <input
                            type="text"
                            value={form.sku}
                            onChange={(e) =>
                                setForm({ ...form, sku: e.target.value })
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
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Enter product description"
                        />
                    </div>


                    {/* Brand */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Brand *
                        </label>
                        <select
                            value={form.brand_id}
                            onChange={(e) =>
                                setForm({ ...form, brand_id: e.target.value })
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

                    {/* Categories Multi Select */}
                    {/* Categories Multi Select Dropdown */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Categories *
                        </label>

                        <Select
                            options={categoryOptions}
                            value={selectedCategoryOptions}
                            onChange={handleCategoryChange}
                            isMulti
                            placeholder="Select Categories"
                            className="text-sm"
                            classNamePrefix="select"
                        />
                    </div>


                    {/* Attributes Multi Select */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Attributes
                        </label>

                        <Select
                            options={attributeOptions}
                            value={selectedAttributeOptions}
                            onChange={handleAttributeChange}
                            isMulti
                            placeholder="Select Attributes"
                        />
                    </div>


                    {/* Media */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Product Images
                        </label>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full"
                        />

                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt="preview"
                                            className="w-full h-28 object-cover rounded-lg border"
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


                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}

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

export default ProductModal;
