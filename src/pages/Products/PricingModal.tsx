import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Loader, Plus, Trash2 } from "lucide-react";
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

interface Props {
    show: boolean;
    onClose: () => void;
    product: any;
}

const PricingModal: React.FC<Props> = ({ show, onClose, product }) => {
    const [priceTypes, setPriceTypes] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [pricingList, setPricingList] = useState<any[]>([
        {
            pricing_type: "",
            hub: "",
            start_time: "",
            end_time: "",
            max_quantity: 1,
            price: "",
        },
    ]);
    console.log(product)
    // ---------------- Fetch Dropdown Data ----------------
    useEffect(() => {
        if (show) {
            fetchHubs();
            fetchPriceTypes()
        }
    }, [show]);

    const fetchHubs = async () => {
        const res = await axiosInstance.get(Api?.allHubs);
        setHubs(res?.data?.hubs || []);
    };

    // ---------------- Handle Change ----------------
    const handleChange = (index: number, field: string, value: any) => {
        const updated = [...pricingList];
        updated[index][field] = value;
        setPricingList(updated);
    };


    const fetchPriceTypes = async () => {
        const res = await axiosInstance.get(Api?.pricingType);
        setPriceTypes(res?.data?.data || []);
    };

    // ---------------- Add Pricing Row ----------------
    const addPricingRow = () => {
        setPricingList([
            ...pricingList,
            {
                pricing_type: "",
                hub: "",
                start_time: "",
                end_time: "",
                max_quantity: 1,
                price: "",
            },
        ]);
    };

    // ---------------- Remove Pricing Row ----------------
    const removePricingRow = (index: number) => {
        const updated = [...pricingList];
        updated.splice(index, 1);
        setPricingList(updated);
    };
    console.log(product)
    // ---------------- Submit ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setApiErrors("");
        setLoading(true);
        const payload = pricingList.map((item) => ({
            // product: product.id,
            pricing_type: item?.pricing_type,
            hub: item?.hub,
            start_time: item?.start_time,
            end_time: item?.end_time,
            max_quantity: item?.max_quantity,
            price: item?.price,
        }));
        const pricingPayload = {
            product: product.id,
            pricing: payload
        }
        try {
            const updateApi = await axiosInstance.post(Api?.pricingBulk, pricingPayload);
            if (updateApi) {
                onClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            setApiErrors(extractErrorMessage(error));

        }

    };

    if (!show || !product) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] no-scrollbar overflow-y-auto">

                <h2 className="text-xl font-semibold mb-6">
                    Add Pricing - {product.name}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {pricingList.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                            <h1 className="text-base font-bold">Pricing {index + 1}</h1>
                            {/* Remove Button */}
                            {pricingList.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePricingRow(index)}
                                    className="absolute top-2 right-2 text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Product Type *
                                </label>
                                <select
                                    value={item.pricing_type}
                                    onChange={(e) =>
                                        handleChange(index, "pricing_type", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select Pricing type</option>
                                    {priceTypes?.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hub Select */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Hub *
                                </label>
                                <select
                                    value={item.hub}
                                    onChange={(e) =>
                                        handleChange(index, "hub", e.target.value)
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">Select Hub</option>
                                    {hubs.map((hub) => (
                                        <option key={hub.id} value={hub.id}>
                                            {hub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Time */}
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={item.start_time}
                                        onChange={(e) =>
                                            handleChange(index, "start_time", e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={item.end_time}
                                        onChange={(e) =>
                                            handleChange(index, "end_time", e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>

                            </div>


                            {/* Quantity + Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Max Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={item.max_quantity}
                                        onChange={(e) =>
                                            handleChange(index, "max_quantity", e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) =>
                                            handleChange(index, "price", e.target.value)
                                        }
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                        </div>
                    ))}

                    {/* Add Row Button */}
                    <button
                        type="button"
                        onClick={addPricingRow}
                        className="flex items-center text-sm text-orange-600 font-medium"
                    >
                        <Plus size={16} className="mr-1" />
                        Add Another Pricing
                    </button>

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
                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                        >

                            {loading ? (
                                <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Creating... </div>) : "Save Pricing"}

                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PricingModal;
