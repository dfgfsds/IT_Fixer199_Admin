import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import { Loader2 } from "lucide-react";
import Api from "../../api-endpoints/ApiUrls";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const InventoryModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
}) => {
    const [products, setProducts] = useState<any[]>([]);
    const [hubs, setHubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    const initialForm = {
        product_id: "",
        hub_id: "",
        stock_in_hub: 0,
    };

    const [form, setForm] = useState(initialForm);

    const resetForm = () => {
        setForm(initialForm);
        setApiErrors("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };


    const fetchData = async () => {
        const prod = await axiosInstance.get(`${Api?.products}?size=1000`);
        const hubRes = await axiosInstance.get(Api?.allHubs);
        setProducts(prod?.data?.products);
        setHubs(hubRes.data?.hubs || []);
    };


    useEffect(() => {
        if (!show) return;



        fetchData();
    }, [show]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            setLoading(true);

            const updatedApi = await axiosInstance.post(
              `${Api?.productInventory}/`,
                form
            );

            if (updatedApi) {
                onSuccess();
                handleClose();
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">

            <div className="bg-white rounded-2xl w-full max-w-xl p-4">

                <h2 className="text-xl font-semibold mb-6">
                    Create Inventory
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Product */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Product *
                        </label>
                        <select
                            required
                            value={form.product_id}
                            onChange={(e) =>
                                setForm({ ...form, product_id: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded-lg"
                        >
                            <option value="">Select Product</option>
                            {products?.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hub */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Hub *
                        </label>
                        <select
                            required
                            value={form.hub_id}
                            onChange={(e) =>
                                setForm({ ...form, hub_id: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded-lg"
                        >
                            <option value="">Select Hub</option>
                            {hubs.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Stock *
                        </label>
                        <input
                            type="number"
                            min="0"
                            required
                            value={form.stock_in_hub}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    stock_in_hub: Number(e.target.value),
                                })
                            }
                            className="w-full border px-3 py-2 rounded-lg"
                        />
                    </div>
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end">
                            {apiErrors}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
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
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default InventoryModal;