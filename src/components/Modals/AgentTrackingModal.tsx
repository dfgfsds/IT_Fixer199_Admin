import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader } from "lucide-react";
import axiosInstance from "../../configs/axios-middleware";
import Api from '../../api-endpoints/ApiUrls';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    agentName: string;
}

const AgentTrackingModal: React.FC<Props> = ({
    isOpen,
    onClose,
    agentId,
    agentName,
}) => {
    const [date, setDate] = useState("");
    const [trackingData, setTrackingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTracking = async () => {
        if (!date) return;

        try {
            setLoading(true);

            const res = await axiosInstance.get(
                `${Api?.agentTracking}/?agent_id=${agentId}&date=${date}`
            );

            if (res?.data?.success) {
                setTrackingData(res.data.data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const positions =
        trackingData?.map((item) => [
            parseFloat(item.latitude),
            parseFloat(item.longitude),
        ]) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <h2 className="font-semibold text-lg">
                        Agent Tracking - {agentName}
                    </h2>
                    <button onClick={onClose} className="text-xl">✕</button>
                </div>

                {/* Controls */}
                <div className="p-4 border-b flex gap-3 items-center">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border px-3 py-2 rounded-lg"
                    />

                    <button
                        onClick={fetchTracking}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Fetch
                    </button>
                </div>

                {/* Map Section */}
                <div className="h-[500px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="animate-spin" />
                        </div>
                    ) : positions.length > 0 ? (
                        <MapContainer
                            center={positions[0] as any}
                            zoom={14}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {/* Route Line */}
                            <Polyline
                                positions={positions as any}
                                pathOptions={{ color: "blue", weight: 4 }}
                            />

                            {/* ✅ Start Marker */}
                            <Marker position={positions[0] as any}>
                                <Popup>
                                    <div>
                                        <strong>Start</strong> <br />
                                        {trackingData[0]?.captured_at}
                                    </div>
                                </Popup>
                            </Marker>

                            {/* ✅ End Marker */}
                            {positions.length > 1 && (
                                <Marker position={positions[positions.length - 1] as any}>
                                    <Popup>
                                        <div>
                                            <strong>End</strong> <br />
                                            {trackingData[trackingData.length - 1]?.captured_at}
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select date and fetch tracking
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AgentTrackingModal;