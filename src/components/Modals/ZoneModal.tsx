import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import {
    MapContainer,
    TileLayer,
    FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader } from "lucide-react";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editZone: any;
    setEditZone: any;
}

const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

const ZoneModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editZone,
    setEditZone,
}) => {
    const isEdit = !!editZone;
    const [loading, setLoading] = useState(false);
    const featureGroupRef = useRef<any>(null);
    const [apiErrors, setApiErrors] = useState<string>("");

    const [form, setForm] = useState<any>({
        name: "",
        description: "",
        coordinates: [],
        status: "ACTIVE",
    });

    // ---------------- RESET / SET FORM ----------------
    useEffect(() => {
        if (!show) return;

        if (editZone) {
            setForm({
                name: editZone.name || "",
                description: editZone.description || "",
                coordinates: editZone.coordinates || [],
                status: editZone.status || "ACTIVE",
            });
        } else {
            setForm({
                name: "",
                description: "",
                coordinates: [],
                status: "ACTIVE",
            });

            // Clear map layers if creating new
            if (featureGroupRef.current) {
                featureGroupRef.current.clearLayers();
            }
        }
    }, [editZone, show]);

    // ---------------- LOAD POLYGON IN EDIT MODE ----------------
    useEffect(() => {
        if (!show) return;
        if (!form.coordinates?.length) return;
        if (!featureGroupRef?.current) return;

        const layerGroup = featureGroupRef?.current;
        layerGroup?.clearLayers();

        const latLngs = form?.coordinates?.map((point: any) => [
            point?.lat,
            point?.lng,
        ]);

        const polygon = L?.polygon(latLngs, {
            color: "#f97316",
            fillColor: "#fdba74",
            fillOpacity: 0.4,
            weight: 3,
        });

        layerGroup?.addLayer(polygon);

        const map = layerGroup?._map;
        if (map) {
            map?.fitBounds(polygon?.getBounds(), {
                padding: [40, 40],
            });
        }
    }, [form?.coordinates, show]);


    // ---------------- DRAW POLYGON ----------------
    const handleCreated = (e: any) => {
        const layerGroup = featureGroupRef?.current;

        // Only allow ONE polygon
        layerGroup.clearLayers();

        const layer = e?.layer;
        const latlngs = layer?.getLatLngs()[0];

        const formattedCoords = latlngs?.map((point: any) => ({
            lat: point?.lat,
            lng: point?.lng,
        }));

        layerGroup?.addLayer(layer);

        setForm((prev: any) => ({
            ...prev,
            coordinates: formattedCoords,
        }));
    };

    const handleDeleted = () => {
        setForm((prev: any) => ({
            ...prev,
            coordinates: [],
        }));
    };

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await axiosInstance.put(
                    `${Api.zone}/${editZone.id}`,
                    form
                );
            } else {
                await axiosInstance.post(Api.createZone, form);
            }

            onSuccess();
            setEditZone(null);
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleEdited = (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
            const latlngs = layer.getLatLngs()[0];

            const formattedCoords = latlngs.map((point: any) => ({
                lat: point.lat,
                lng: point.lng,
            }));

            setForm((prev: any) => ({
                ...prev,
                coordinates: formattedCoords,
            }));
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">

                {/* HEADER */}
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {isEdit ? "Edit Zone" : "Create Zone"}
                    </h2>

                    <button
                        onClick={() => {
                            setEditZone(null);
                            onClose();
                        }}
                        className="text-gray-500 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* NAME + STATUS */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Zone Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter zone name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm({ ...form, status: e.target.value })
                                }
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Optional description"
                        />
                    </div>

                    {/* MAP */}
                    <div>
                        <label className="block font-medium mb-2">
                            Draw Zone Area
                        </label>

                        <MapContainer
                            center={CHENNAI_CENTER}
                            zoom={11}
                            style={{ height: "400px", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            <FeatureGroup ref={featureGroupRef}>
                                <EditControl
                                    position="topright"
                                    onCreated={handleCreated}
                                    onDeleted={handleDeleted}
                                    onEdited={handleEdited}
                                    draw={{
                                        rectangle: false,
                                        circle: false,
                                        marker: false,
                                        circlemarker: false,
                                        polyline: false,
                                    }}
                                    edit={{
                                        remove: true,
                                    }}
                                />
                            </FeatureGroup>
                        </MapContainer>

                    </div>

                    {/* Error */}
                    {apiErrors && (
                        <p className="text-red-500 mt-2 text-end px-6">
                            {apiErrors}
                        </p>
                    )}

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setEditZone(null);
                                onClose();
                            }}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                            {isEdit ? "Edit Zone" :

                                (<>
                                    {loading ? (
                                        <div className="flex gap-2 items-center "> <Loader size={16} className="animate-spin" />Saving... </div>) : "Add Zone"}
                                </>)}

                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ZoneModal;
