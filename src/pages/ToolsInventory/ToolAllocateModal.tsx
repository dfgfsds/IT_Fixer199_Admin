import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader2, Wrench } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedItem: any;
    onSuccess?: () => void;
}

const ToolAllocateModal: React.FC<Props> = ({
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

    // 🔥 fetch agents
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

    // 🔥 submit
    const handleSubmit = async () => {
        if (!selectedAgent || quantity <= 0) return;
        setApiErrors('')
        try {
            setLoading(true);
            const updatedApi = await axiosInstance.post(`${Api.toolMovementDirect}`, {
                agent_id: selectedAgent,
                tools_id: selectedItem?.tool?.id,
                hub_id: selectedItem?.hub_id,
                stock: quantity,
                type: type,
            });
            if (updatedApi) {
                onSuccess?.();
                onClose();
                setApiErrors('')
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
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white flex items-center gap-2">
                    <Wrench size={20} />
                    <div>
                        <h2 className="text-xl font-bold">Tool Allocation</h2>
                        <p className="text-sm opacity-80">Assign tool to agent</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">

                    {/* TOOL INFO */}
                    <div className="bg-gray-50 border rounded-2xl p-5 space-y-2 text-sm">
                        <p><span className="text-gray-500">Tool:</span> <b>{selectedItem?.tool?.name}</b></p>
                        <p><span className="text-gray-500">Hub:</span> <b>{selectedItem?.hub_name}</b></p>
                        <p>
                            <span className="text-gray-500">Available:</span>{" "}
                            <b className={selectedItem?.stock_in_hub > 0 ? "text-green-600" : "text-red-600"}>
                                {selectedItem?.stock_in_hub}
                            </b>
                        </p>
                    </div>

                    {/* AGENT */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">
                            Select Agent
                        </label>
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">
                            Type
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setType("GIVE")}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${type === "GIVE"
                                    ? "bg-green-600 text-white"
                                    : "bg-white"
                                    }`}
                            >
                                GET
                            </button>

                            <button
                                onClick={() => setType("GET")}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium ${type === "GET"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white"
                                    }`}
                            >
                                GIVE
                            </button>
                        </div>
                    </div>

                    {/* QUANTITY */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}
                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-4 border-t">

                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
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

export default ToolAllocateModal;