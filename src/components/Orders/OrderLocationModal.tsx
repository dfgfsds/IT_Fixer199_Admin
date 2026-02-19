import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const OrderLocationModal = ({ order, onClose }: any) => {
  if (!order) return null;

  const position: [number, number] = [
    order.latitude,
    order.longitude,
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6">

        <h2 className="text-xl font-bold mb-4">Order Location</h2>

        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position}>
            <Popup>
              {order.customer_name}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderLocationModal;
