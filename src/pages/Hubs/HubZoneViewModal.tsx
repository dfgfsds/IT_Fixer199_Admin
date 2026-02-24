import React, { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    FeatureGroup,
    useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface Props {
    show: boolean;
    onClose: () => void;
    hub: any;
    zones: any[];
}

const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

const getColor = (index: number) => {
    const colors = ["red", "blue", "green", "orange", "purple"];
    return colors[index % colors.length];
};

/* 🔥 Separate Layer Loader Component */
const ZoneLayers = ({ zones, featureGroupRef }: any) => {
    const map = useMap();

    useEffect(() => {
        if (!zones?.length || !featureGroupRef?.current) return;

        const group = featureGroupRef?.current;

        group.clearLayers();

        zones.forEach((zone: any, index: number) => {
            const coords = zone?.zone_coordinates || [];
            if (!coords.length) return;

            const latLngs = coords?.map((c: any) => [c?.lat, c?.lng]);

            let layer: L.Layer;

            if (coords?.length === 1) {
                layer = L?.marker(latLngs[0])?.bindPopup(zone?.zone_name);
            } else if (coords?.length === 2) {
                layer = L?.polyline(latLngs as any, {
                    color: getColor(index),
                }).bindPopup(zone?.zone_name);
            } else {
                layer = L?.polygon(latLngs as any, {
                    color: getColor(index),
                    fillOpacity: 0.4,
                }).bindPopup(zone?.zone_name);
            }

            group.addLayer(layer);
        });

        const bounds = group?.getBounds();
        if (bounds?.isValid()) {
            map?.fitBounds(bounds);
        }

    }, [zones, map]);

    return null;
};

const HubZoneViewModal: React.FC<Props> = ({
    show,
    onClose,
    hub,
    zones,
}) => {
    const featureGroupRef = useRef<L.FeatureGroup>(null);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[90%] max-w-5xl p-4">

                <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        {hub?.name} - Zones View
                    </h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <MapContainer
                    center={CHENNAI_CENTER}
                    zoom={11}
                    style={{ height: "500px", width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <FeatureGroup ref={featureGroupRef}>
                        <EditControl
                            position="topright"
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

                    {/* 🔥 Load Zones AFTER map ready */}
                    <ZoneLayers zones={zones} featureGroupRef={featureGroupRef} />
                </MapContainer>

            </div>
        </div>
    );
};

export default HubZoneViewModal;
