import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Select from 'react-select'
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editService?: any;
}

const ServiceModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editService,
}) => {
    const isEdit = !!editService;

    const [categories, setCategories] = useState<any[]>([]);
    const [priceTypes, setPriceTypes] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);

    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [newMedia, setNewMedia] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
    const [apiErrors, setApiErrors] = useState<string>("");


    const [form, setForm] = useState<any>({
        name: "",
        description: "",
        parent: "",
        is_otp_required: false,
        eta: 0,
        status: "ACTIVE",
        categories: [],
        pricing_models: [
            { price_type_id: "", price: "" }
        ],
        zone_hub_mappings: [
            { zone_id: "", hub_id: "" }
        ],
    });

    // ---------------- FETCH MASTER DATA ----------------
    useEffect(() => {
        fetchCategories();
        fetchPriceTypes();
        fetchHubsByZone();
    }, []);

    const fetchCategories = async () => {
        const res = await axiosInstance.get(Api?.categories);
        setCategories(res?.data?.data || []);
    };


    const fetchPriceTypes = async () => {
        const res = await axiosInstance.get(Api?.pricingType);
        setPriceTypes(res?.data?.data || []);
    };

    const fetchZones = async (id: any) => {
        const res = await axiosInstance.get(`${Api?.hubMapping}?hub=${id}`);
        console.log(res?.data)
        setZones(res?.data?.mappings || []);
    };

    const fetchHubsByZone = async () => {
        const res = await axiosInstance.get(Api?.allHubs);
        console.log(res?.data)
        setHubs(res?.data?.hubs || []);
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));
    const selectedCategoryOptions = categoryOptions.filter((option) =>
        form.categories.includes(option.value)
    );


    const handleCategoryChange = (selected: any) => {
        setForm({
            ...form,
            categories: selected ? selected.map((s: any) => s.value) : [],
        });
    };

    // ---------------- EDIT MODE ----------------
    useEffect(() => {
        if (!editService) return;

        const formattedPricing =
            editService.pricing_models?.length > 0
                ? editService.pricing_models.map((p: any) => ({
                    id: p.id,
                    price_type_id: p.pricing_type,
                    price: p.price,
                }))
                : [{ price_type_id: "", price: "" }];

        const formattedZoneHub =
            editService.zone_hub_mappings?.length > 0
                ? editService.zone_hub_mappings.map((z: any) => ({
                    id: z.id,
                    zone_id: z.zone,
                    hub_id: z.hub,
                }))
                : [{ zone_id: "", hub_id: "" }];

        setForm({
            name: editService.name || "",
            description: editService.description || "",
            parent: editService.parent || "",
            is_otp_required: editService.is_otp_required || false,
            eta: editService.eta || 0,
            status: editService.status || "ACTIVE",

            // ✅ THIS IS THE FIX
            categories:
                editService.categories?.map((c: any) => c.category) || [],

            pricing_models: formattedPricing,
            zone_hub_mappings: formattedZoneHub,
        });

        // Fetch zones based on hub
        editService.zone_hub_mappings?.forEach((z: any) => {
            if (z.hub) {
                fetchZones(z.hub);
            }
        });

    }, [editService]);



    // ---------------- PRICING HANDLERS ----------------
    const addPricing = () => {
        setForm({
            ...form,
            pricing_models: [
                ...form.pricing_models,
                { price_type_id: "", price: "" }
            ],
        });
    };

    const removePricing = (index: number) => {
        const updated = [...form.pricing_models];
        updated.splice(index, 1);
        setForm({ ...form, pricing_models: updated });
    };

    const handlePricingChange = (
        index: number,
        field: string,
        value: string
    ) => {
        const updated = [...form.pricing_models];
        updated[index][field] = value;
        setForm({ ...form, pricing_models: updated });
    };

    // ---------------- ZONE HUB HANDLERS ----------------
    const addZoneHub = () => {
        setForm({
            ...form,
            zone_hub_mappings: [
                ...form.zone_hub_mappings,
                { zone_id: "", hub_id: "" }
            ],
        });
    };

    const removeZoneHub = (index: number) => {
        const updated = [...form.zone_hub_mappings];
        updated.splice(index, 1);
        setForm({ ...form, zone_hub_mappings: updated });
    };

    const handleZoneHubChange = async (
        index: number,
        field: string,
        value: string
    ) => {
        const updated = [...form.zone_hub_mappings];
        updated[index][field] = value;
        setForm({ ...form, zone_hub_mappings: updated });

        if (field === "hub_id") {
            await fetchZones(value);
        }
    };

    // ---------------- MEDIA ----------------
    const handleMediaChange = (e: any) => {
        const files: any = Array.from(e.target.files);
        setNewMedia([...newMedia, ...files]);
        setPreviewUrls([
            ...previewUrls,
            ...files.map((f: any) => URL.createObjectURL(f)),
        ]);
    };

    const handleRemoveMedia = (index: number) => {
        const updatedPreviews = [...previewUrls];
        updatedPreviews.splice(index, 1);
        setPreviewUrls(updatedPreviews);

        // Existing media remove
        if (index < existingMedia.length) {
            const removed = existingMedia[index];

            setDeletedMediaIds((prev) => [...prev, removed.id]);

            const updatedExisting = [...existingMedia];
            updatedExisting.splice(index, 1);
            setExistingMedia(updatedExisting);
        }
        // New media remove
        else {
            const newIndex = index - existingMedia.length;
            const updatedNew = [...newMedia];
            updatedNew.splice(newIndex, 1);
            setNewMedia(updatedNew);
        }
    };


    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            const serviceObject = {
                name: form.name,
                description: form.description,
                parent: form.parent,
                is_otp_required: form.is_otp_required,
                eta: form.eta,
                status: form.status,
            };

            formData.append("service", JSON.stringify(serviceObject));

            form.categories.forEach((id: string) =>
                formData.append("categories", id)
            );

            form.pricing_models.forEach((p: any) =>
                formData.append("pricing_models", JSON.stringify(p))
            );

            form.zone_hub_mappings.forEach((z: any) =>
                formData.append("zone_hub_mappings", JSON.stringify(z))
            );

            newMedia.forEach((file: any) =>
                formData.append("media_files", file)
            );

            if (isEdit) {
                const updateApi = await axiosInstance.put(
                    `${Api?.services}/${editService.id}/`,
                    formData
                );
                if (updateApi) {
                    onSuccess();
                    onClose();
                }
            } else {
                const updateApi = await axiosInstance.post(
                    `${Api?.createService}`,
                    formData
                );
                if (updateApi) {
                    onSuccess();
                    onClose();
                }
            }

        } catch (error) {
            setApiErrors(extractErrorMessage(error));
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-8 py-5 border-b bg-gradient-to-r from-orange-50 to-white">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEdit ? "Edit Service" : "Create Service"}
                    </h2>
                    <p className="text-sm text-gray-500">
                        Configure service details, pricing & mappings
                    </p>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-8 py-6 space-y-8">

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* ================= BASIC INFO ================= */}
                        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">

                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        ETA (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.eta}
                                        onChange={(e) =>
                                            setForm({ ...form, eta: e.target.value })
                                        }
                                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">

                                <div>
                                    <label className="text-sm font-medium text-gray-700 pr-2">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({ ...form, status: e.target.value })
                                        }
                                        className="mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-700">
                                        OTP Required
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                is_otp_required: !form.is_otp_required,
                                            })
                                        }
                                        className={`relative w-12 h-6 rounded-full transition ${form.is_otp_required
                                            ? "bg-orange-600"
                                            : "bg-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${form.is_otp_required
                                                ? "translate-x-6"
                                                : ""
                                                }`}
                                        />
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* ================= CATEGORIES ================= */}
                        <div className="bg-white border rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Categories
                            </h3>

                            <Select
                                options={categoryOptions}
                                value={selectedCategoryOptions}
                                onChange={handleCategoryChange}
                                isMulti
                            />
                        </div>

                        {/* ================= PRICING MODELS ================= */}
                        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Pricing Models
                            </h3>

                            {form.pricing_models.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-lg"
                                >

                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Price Type
                                        </label>
                                        <select
                                            value={item.price_type_id}
                                            onChange={(e) =>
                                                handlePricingChange(index, "price_type_id", e.target.value)
                                            }
                                            className="mt-1 w-full border rounded-lg px-3 py-2"
                                        >
                                            <option value="">Select Type</option>
                                            {priceTypes?.map((p: any) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                handlePricingChange(index, "price", e.target.value)
                                            }
                                            className="mt-1 w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removePricing(index)}
                                        className="text-red-500 text-sm font-medium"
                                    >
                                        Remove
                                    </button>

                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addPricing}
                                className="text-orange-600 font-medium text-sm"
                            >
                                + Add Pricing Model
                            </button>
                        </div>

                        {/* ================= ZONE & HUB ================= */}
                        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Zone & Hub Mapping
                            </h3>

                            {form.zone_hub_mappings.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-lg"
                                >

                                    <div>
                                        <label className="text-sm text-gray-600">Hub</label>
                                        <select
                                            value={item.hub_id}
                                            onChange={(e) =>
                                                handleZoneHubChange(index, "hub_id", e.target.value)
                                            }
                                            className="mt-1 w-full border rounded-lg px-3 py-2"
                                        >
                                            <option value="">Select Hub</option>
                                            {hubs?.map((h: any) => (
                                                <option key={h.id} value={h.id}>
                                                    {h.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Zone</label>
                                        <select
                                            value={item.zone_id}
                                            onChange={(e) =>
                                                handleZoneHubChange(index, "zone_id", e.target.value)
                                            }
                                            className="mt-1 w-full border rounded-lg px-3 py-2"
                                        >
                                            <option value="">Select Zone</option>
                                            {zones?.map((z: any) => (
                                                <option key={z.zone} value={z.zone}>
                                                    {z.zone_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeZoneHub(index)}
                                        className="text-red-500 text-sm font-medium"
                                    >
                                        Remove
                                    </button>

                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addZoneHub}
                                className="text-orange-600 font-medium text-sm"
                            >
                                + Add Zone Mapping
                            </button>
                        </div>

                        {/* ================= MEDIA ================= */}
                        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Service Media
                            </h3>

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleMediaChange}
                                className="w-full"
                            />

                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt="preview"
                                                className="w-full h-28 object-cover rounded-lg border"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedia(index)}
                                                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {apiErrors && (
                            <p className="text-red-500 mt-2 text-end px-6">
                                {apiErrors}
                            </p>

                        )}
                        {/* Footer */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700"
                            >
                                Save Service
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>

    );
};

export default ServiceModal;
