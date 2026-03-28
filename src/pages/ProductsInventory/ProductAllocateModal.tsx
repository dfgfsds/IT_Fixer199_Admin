import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader2, Package } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedItem: any;
    onSuccess?: () => void;
}

const ProductAllocateModal: React.FC<Props> = ({
    show,
    onClose,
    selectedItem,
    onSuccess,
}) => {
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [type, setType] = useState<"GIVE" | "GET">("GIVE");
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    useEffect(() => {
        if (!show) return;

        const fetchAgents = async () => {
            try {
                const res = await axiosInstance.get(Api.agents);
                setAgents(res?.data?.agents || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAgents();
    }, [show]);

    const handleSubmit = async () => {
        if (!selectedAgent || quantity <= 0) return;
        setApiErrors("");
        try {
            setLoading(true);

            const updatedApi = await axiosInstance.post(`${Api.productMovementDirect}`, {
                agent_id: selectedAgent,
                product_id: selectedItem?.product?.id,
                hub_id: selectedItem?.hub_id,
                stock: quantity,
                type: type,
            });
            if (updatedApi) {
                setApiErrors("");

                onSuccess?.();
                onClose();

                setSelectedAgent("");
                setQuantity(1);
                setType("GIVE");
            }


        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setSelectedAgent("");
        setQuantity(1);
        setType("GIVE");
        setApiErrors("");
    };

    const handleClose = () => {
        resetState();
        onClose();
    };



    if (!show || !selectedItem) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white flex items-center gap-2">
                    <Package size={20} />
                    <div>
                        <h2 className="text-xl font-bold">Product Allocation</h2>
                        <p className="text-sm opacity-80">Assign product to agent</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">

                    {/* INFO */}
                    <div className="bg-gray-50 border rounded-2xl p-5 text-sm space-y-2">
                        <p><b>Product:</b> {selectedItem?.product?.name}</p>
                        <p><b>Hub:</b> {selectedItem?.hub_name}</p>
                        <p>
                            <b>Available:</b>{" "}
                            <span className={selectedItem?.stock_in_hub > 0 ? "text-green-600" : "text-red-600"}>
                                {selectedItem?.stock_in_hub}
                            </span>
                        </p>
                    </div>

                    {/* AGENT */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Select Agent</label>
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg mt-1"
                        >
                            <option value="">Select Agent</option>
                            {agents?.filter((i: any) => i?.hub === selectedItem?.hub_id)?.map((a: any) => (
                                <option key={a.id} value={a.id}>
                                    {a.user_details?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Type</label>
                        <div className="flex gap-3 mt-2">

                            <button
                                onClick={() => setType("GIVE")}
                                className={`flex-1 py-2 rounded-lg border ${type === "GIVE" ? "bg-green-600 text-white" : ""
                                    }`}
                            >
                                GET
                            </button>

                            <button
                                onClick={() => setType("GET")}
                                className={`flex-1 py-2 rounded-lg border ${type === "GET" ? "bg-blue-600 text-white" : ""
                                    }`}
                            >
                                GIVE
                            </button>

                        </div>
                    </div>

                    {/* QUANTITY */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">Quantity</label>
                        <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full border px-3 py-2 rounded-lg mt-1"
                        />
                    </div>

                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}

                    {/* ACTION */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border rounded-lg">
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={16} />}
                            Submit
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductAllocateModal;