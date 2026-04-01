import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Select from 'react-select';
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader, Plus, Trash2, X } from "lucide-react";

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
    const [priceTypes, setPriceTypes] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    console.log(attributesList)
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
        pricing: [
            { type: "", price: "" }
        ]
    });

    // ---------------- Fetch Data ----------------
    useEffect(() => {
        fetchBrands();
        fetchCategories();
        fetchAttributes();
        fetchPriceTypes();
    }, []);

    const getInitialForm = () => ({
        name: "",
        description: "",
        brand_id: "",
        model: "",
        type: "PRODUCT",
        sku: "",
        specification: [{ key: "", value: "" }],
        status: "ACTIVE",
        category_ids: [],
        attributes: [],
        pricing: [{ type: "", price: "" }]
    });

    const resetAll = () => {
        setForm(getInitialForm());

        setBrands([]);
        setCategories([]);
        setAttributesList([]);
        setPriceTypes([]);

        setExistingImages([]);
        setNewImages([]);
        setPreviewUrls([]);
        setMediaFiles([]);

        setApiErrors("");
        setLoading(false);
    };

    const handleClose = () => {
        resetAll();
        onClose();
    };

    const fetchPriceTypes = async () => {
        const res = await axiosInstance.get(Api?.pricingType);
        setPriceTypes(res?.data?.data || []);
    };


    const fetchBrands = async () => {
        const res = await axiosInstance.get(Api?.allBrands);
        setBrands(res?.data?.brands || []);
    };

    const fetchCategories = async () => {
        const res = await axiosInstance.get(Api?.categories);
        setCategories(res?.data?.data || []);
    };

    // const fetchAttributes = async () => {
    //     const res = await axiosInstance.get(Api?.attribute);
    //     setAttributesList(res?.data?.data || []);
    // };

    const fetchAttributes = async () => {
        const res = await axiosInstance.get(Api?.attributeFields);
        const values = (res?.data?.data || []).flatMap((attr: any) =>
            (attr?.attribute_values || []).map((val: any) => ({
                attribute_id: attr.attribute_id,
                attribute_name: attr.attribute_name,
                value_id: val.value_id,
                value: val.value,
            }))
        );

        setAttributesList(values);
    };

    const categoryOptions = categories?.filter((cat) => cat?.type === "PRODUCT")?.filter((i) => i?.status === "ACTIVE")?.map((cat) => ({
        value: cat?.id,
        label: cat?.name,
    }));

    const handleCategoryChange = (selected: any) => {
        setForm({
            ...form,
            category_ids: selected ? selected.map((s: any) => s.value) : [],
        });
    };

    const selectedCategoryOptions = categoryOptions?.filter((option) =>
        form?.category_ids.includes(option?.value)
    );


    const attributeOptions = attributesList?.map((attr) => ({
        value: attr?.value_id,
        label: `${attr.attribute_name}: ${attr.value}`,
        full: attr,
    }));


    const handleAttributeChange = (selected: any) => {
        if (!selected) {
            setForm({ ...form, attributes: [] });
            return;
        }

        // Logic: Keep only the latest selection for each unique attribute group
        const result: any[] = [];
        const seenAttributes = new Set();

        // Iterate backwards to pick the most recent choice for an attribute
        for (let i = selected.length - 1; i >= 0; i--) {
            const item = selected[i].full;
            if (!seenAttributes.has(item.attribute_id)) {
                result.unshift({
                    id: item.value_id,
                    attribute_name: item.attribute_name,
                    value: item.value,
                });
                seenAttributes.add(item.attribute_id);
            }
        }

        setForm({ ...form, attributes: result });
    };

    const selectedAttributeOptions = attributeOptions?.filter((option) =>
        form?.attributes?.some((a: any) => a?.id === option?.value)
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
            attributes: editProduct?.attributes_details?.map((a: any) => ({
                id: a.value_id,
                attribute_name: a.attribute_name,
                value: a.value
            })) || [],
            pricing: editProduct.product_pricing?.map((p: any) => ({
                type: p.type,
                price: p.price
            })) || [{ type: "", price: "" }],
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

    // ---------------- Pricing Rows ----------------
    const handlePricingChange = (index: number, field: string, value: string) => {
        const updatedPricing = [...form.pricing];
        updatedPricing[index] = { ...updatedPricing[index], [field]: value };
        setForm({ ...form, pricing: updatedPricing });
    };

    const addPricingRow = () => {
        if (form.pricing.length < priceTypes.length) {
            setForm({
                ...form,
                pricing: [...form.pricing, { type: "", price: "" }]
            });
        }
    };

    const removePricingRow = (index: number) => {
        const updatedPricing = [...form.pricing];
        updatedPricing.splice(index, 1);
        setForm({ ...form, pricing: updatedPricing });
    };


    // ---------------- Submit ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const pricingPayload = form.pricing
            .filter((p: any) => p.type && p.price)
            .map((p: any) => ({
                type: p.type,
                price: p.price
            }));

        try {
            const formData = new FormData();

            Object.keys(form).forEach((key) => {
                if (
                    key !== "category_ids" &&
                    key !== "attributes" &&
                    key !== "specification" &&
                    key !== "pricing"
                ) {
                    formData.append(key, form[key]);
                }
            });

            form.category_ids.forEach((id: string) => {
                formData.append("category_ids", id);
            });

            // ✅ Attributes
            const attributesPayload = form?.attributes.map((attr: any) => ({
                value_id: attr?.id,
            }));

            formData.append("attributes", JSON.stringify(attributesPayload));
            // form.attributes.forEach((attr: any) => {
            //     formData.append("attributes", JSON.stringify(attr?.id));
            // });

            // Send only new images
            // newImages.forEach((file) => {
            //     formData.append("media_files", file);
            // });

            newImages.forEach((file) => {
                formData.append("media_files[]", file);
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

            formData.append("pricing", JSON.stringify(pricingPayload));

            if (isEdit) {
                // const updateApi = await axiosInstance.put(`${Api?.products}/${editProduct.id}`, formData);
                // if (updateApi) {
                //     onSuccess();
                //     handleClose();
                //     setLoading(false);
                // }
                if (isEdit) {
                    const formData = new FormData();

                    // 🔹 Basic fields
                    formData.append("name", form.name);
                    formData.append("description", form.description);
                    formData.append("brand_id", form.brand_id);
                    formData.append("model", form.model);
                    formData.append("type", form.type);
                    formData.append("sku", form.sku);
                    formData.append("status", form.status);

                    // 🔹 CATEGORY FORMAT ✅
                    const categoryPayload = form.category_ids.map((id: string) => ({
                        category_id: id
                    }));
                    formData.append("category_ids", JSON.stringify(categoryPayload));

                    // 🔹 ATTRIBUTES FORMAT ✅
                    const attributePayload = form.attributes.map((attr: any) => ({
                        value_id: attr.id
                    }));
                    formData.append("attributes", JSON.stringify(attributePayload));

                    // 🔹 SPECIFICATION (OBJECT format) ✅
                    const specObject = form.specification
                        .filter((item: any) => item.key && item.value)
                        .reduce((acc: any, item: any) => {
                            acc[item.key] = item.value;
                            return acc;
                        }, {});
                    formData.append("specification", JSON.stringify(specObject));

                    // 🔥 DELETE MEDIA (IMPORTANT)
                    const originalIds = editProduct.media?.map((m: any) => m.id) || [];
                    const remainingIds = existingImages.map((m: any) => m.id);

                    const deleteMediaIds = originalIds.filter(
                        (id: string) => !remainingIds.includes(id)
                    );

                    deleteMediaIds.forEach((id: string) => {
                        formData.append("delete_media_ids", id);
                    });

                    // 🔹 NEW IMAGES
                    newImages.forEach((file) => {
                        formData.append("media_files", file);
                    });

                    const updateApi = await axiosInstance.put(
                        `${Api?.products}/${editProduct.id}`,
                        formData
                    );

                    if (updateApi) {
                        onSuccess();
                        handleClose();
                        setLoading(false);
                    }
                }
            } else {
                const updateApi = await axiosInstance.post(Api?.products, formData);
                if (updateApi) {
                    onSuccess();
                    handleClose();
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

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        {isEdit ? "Edit Product" : "Create Product"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

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
                            {/* <option value="VARIANT">VARIANT</option> */}
                        </select>
                    </div>

                    {/*
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
                    */}

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
                            className="w-full border rounded-lg px-3 py-2 capitalize"
                        >
                            <option value="">Select Brand</option>
                            {brands?.filter((b) => b?.type === "PRODUCT")?.filter((i) => i?.status === "ACTIVE")?.map((b) => (
                                <option key={b?.id} value={b?.id}>
                                    {b?.name}
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

                    {/* Type */}
                    {!editProduct && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium">Pricing Details</label>
                            {form.pricing.map((item: any, index: number) => {
                                // Filtering Logic: Exclude types selected in other rows
                                const selectedInOtherRows = form.pricing
                                    .filter((_: any, i: number) => i !== index)
                                    .map((p: any) => p.type);

                                const availableOptions = priceTypes.filter(
                                    (pt: any) => !selectedInOtherRows.includes(pt.name)
                                );

                                return (
                                    <div key={index} className="flex gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-100 relative">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-800 mb-1">Pricing Type *</label>
                                            <select
                                                value={item.type}
                                                onChange={(e) => handlePricingChange(index, "type", e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                required
                                            >
                                                <option value="">Select type</option>
                                                {availableOptions.map((p: any) => (
                                                    <option key={p?.name} value={p?.name}>
                                                        {p?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-800 mb-1">Price *</label>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handlePricingChange(index, "price", e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                                required
                                                placeholder="0.00"
                                            />
                                        </div>

                                        {form.pricing.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePricingRow(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="Remove Pricing"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {form.pricing.length < priceTypes.length && (
                                <button
                                    type="button"
                                    onClick={addPricingRow}
                                    className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center"
                                >
                                    <span className="text-lg mr-1">+</span> Add Another Pricing Type
                                </button>
                            )}
                        </div>
                    )}
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
                            onClick={handleClose}
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