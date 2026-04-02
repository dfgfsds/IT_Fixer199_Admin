import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { X, Plus, MapPin, Loader2, Map } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

interface CreateOrderModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface OrderItem {
    type: string;
    category_id: string;
    product_id: string;
    service_id: string;
    quantity: number;
    amount: any;
    issue_description_text: string;
    attributes: Record<string, string>;
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let mapsLoadPromise: Promise<void> | null = null;

const loadGoogleMaps = (): Promise<void> => {
    if (mapsLoadPromise) return mapsLoadPromise;
    mapsLoadPromise = new Promise((resolve, reject) => {
        if ((window as any).google?.maps) { resolve(); return; }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => { mapsLoadPromise = null; reject(new Error("Google Maps failed to load")); };
        document.head.appendChild(script);
    });
    return mapsLoadPromise;
};


const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
            } else {
                resolve(null);
            }
        });
    });
};

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
                resolve(results[0].formatted_address);
            } else {
                resolve(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
        });
    });
};

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [hubs, setHubs] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [razorPayKey, setRazorPayKey] = useState<string>("");
    const [scenario, setScenario] = useState("");
    const [rowItems, setRowItems] = useState<{ [key: number]: any[] }>({});
    const [loadingRows, setLoadingRows] = useState<{ [key: number]: boolean }>({});

    // Map state
    const [mapOpen, setMapOpen] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const autocompleteRef = useRef<any>(null);

    const [form, setForm] = useState({
        customer_name: "",
        customer_number: "",
        address: "",
        latitude: "" as any,
        longitude: "" as any,
        user_id: null,
        hub_id: "",
        zone_id: "",
        payment_method: "CASH",
        transaction_id: "",
        is_paid: false,
        no_razorpay: true,
        no_assignment: true,
        order_platform: "WHATSAPP",
        items: [
            {
                type: "",
                category_id: "",
                product_id: "",
                service_id: "",
                quantity: 1,
                amount: 0,
                issue_description_text: "",
                attributes: {} as Record<string, string>
            } as OrderItem
        ]
    });

    useEffect(() => {
        fetchInitialData();
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    useEffect(() => {
        if (!mapOpen) return;
        initMap();
    }, [mapOpen]);

    const initMap = async () => {
        setMapLoading(true);
        try {
            await loadGoogleMaps();

            // Default center: India
            const defaultCenter = { lat: 20.5937, lng: 78.9629 };

            const map = new (window as any).google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 5,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                ]
            });

            const marker = new (window as any).google.maps.Marker({
                map,
                draggable: true,
                animation: (window as any).google.maps.Animation.DROP,
                icon: {
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }
            });

            // Marker drag end → reverse geocode
            marker.addListener("dragend", async () => {
                const pos = marker.getPosition();
                const lat = pos.lat();
                const lng = pos.lng();
                const addr = await reverseGeocode(lat, lng);
                setForm(prev => ({
                    ...prev,
                    latitude: lat.toFixed(7),
                    longitude: lng.toFixed(7),
                    address: addr
                }));
            });

            // Map click → move marker + reverse geocode
            map.addListener("click", async (e: any) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                marker.setPosition(e.latLng);
                marker.setAnimation((window as any).google.maps.Animation.DROP);
                const addr = await reverseGeocode(lat, lng);
                setForm(prev => ({
                    ...prev,
                    latitude: lat.toFixed(7),
                    longitude: lng.toFixed(7),
                    address: addr
                }));
            });

            googleMapRef.current = map;
            markerRef.current = marker;

            // If address already typed → geocode it immediately
            if (form.address.trim()) {
                const coords = await geocodeAddress(form.address);
                if (coords) {
                    map.setCenter(coords);
                    map.setZoom(16);
                    marker.setPosition(coords);
                    setForm(prev => ({
                        ...prev,
                        latitude: coords.lat.toFixed(7),
                        longitude: coords.lng.toFixed(7)
                    }));
                }
            } else if (form.latitude && form.longitude) {
                const pos = { lat: Number(form.latitude), lng: Number(form.longitude) };
                map.setCenter(pos);
                map.setZoom(16);
                marker.setPosition(pos);
            }
        } catch (err) {
            console.error("Map init error:", err);
            toast.error("Failed to load Google Maps. Check your API key.");
        } finally {
            setMapLoading(false);
        }
    };

    // ── "Locate on Map" button: geocode current address ───────────────────
    const handleLocateOnMap = async () => {
        if (!mapOpen) {
            setMapOpen(true);
            return;
        }
        // Map already open — just geocode the current address
        if (!form.address.trim()) {
            toast.error("Please enter an address first");
            return;
        }
        if (!googleMapRef.current || !markerRef.current) return;

        setMapLoading(true);
        const coords = await geocodeAddress(form.address);
        setMapLoading(false);

        if (!coords) {
            toast.error("Could not find that address. Try being more specific.");
            return;
        }

        googleMapRef.current.setCenter(coords);
        googleMapRef.current.setZoom(17);
        markerRef.current.setPosition(coords);
        markerRef.current.setAnimation((window as any).google.maps.Animation.DROP);

        setForm(prev => ({
            ...prev,
            latitude: coords.lat.toFixed(7),
            longitude: coords.lng.toFixed(7)
        }));

        toast.success("Location found! Drag the pin to fine-tune.");
    };

    const fetchInitialData = async () => {
        try {
            const [hubsRes, settingsRes, categoriesRes] = await Promise.all([
                axiosInstance.get(Api.allHubs),
                axiosInstance.get(Api.appSettings),
                axiosInstance.get(Api.categories)
            ]);
            setHubs(hubsRes.data?.hubs || hubsRes.data?.data || hubsRes.data || []);
            setRazorPayKey(settingsRes.data?.pg_api_key || settingsRes.data?.data?.pg_api_key || "");
            setCategories(categoriesRes.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        }
    };

    const fetchZones = async (hubId: string) => {
        try {
            const res = await axiosInstance.get(`${Api.hubMapping}?hub=${hubId}`);
            setZones(res.data?.mappings || []);
        } catch (error) {
            console.error("Failed to fetch zones:", error);
        }
    };

    const handleHubChange = (hubId: string) => {
        setForm({ ...form, hub_id: hubId, zone_id: "" });
        if (hubId) fetchZones(hubId);
        else setZones([]);
    };

    const handleAddItem = () => {
        setForm({
            ...form,
            items: [...form.items, {
                type: "", category_id: "", product_id: "", service_id: "",
                quantity: 1, amount: 0, issue_description_text: "",
                attributes: {} as Record<string, string>
            } as OrderItem]
        });
    };

    const handleRemoveItem = (index: number) => {
        if (form.items.length === 1) return;
        setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    };

    const fetchItemsByCategory = async (index: number, type: string, categoryId: string) => {
        if (!categoryId || !type) return;
        setLoadingRows(prev => ({ ...prev, [index]: true }));
        try {
            const url = type === "PRODUCT" ? Api.products : Api.services;
            const res = await axiosInstance.get(`${url}?category_id=${categoryId}&include_categories=true&include_attribute=true`);
            const data = res.data?.products || res.data?.services || res.data?.data || [];
            setRowItems(prev => ({ ...prev, [index]: Array.isArray(data) ? data : (data.data || []) }));
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoadingRows(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...form.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === "type") {
            newItems[index].category_id = "";
            newItems[index].product_id = "";
            newItems[index].service_id = "";
            newItems[index].issue_description_text = "";
            newItems[index].attributes = {};
            setRowItems(prev => { const u = { ...prev }; delete u[index]; return u; });
        } else if (field === "category_id") {
            newItems[index].product_id = "";
            newItems[index].service_id = "";
            newItems[index].attributes = {};
            fetchItemsByCategory(index, newItems[index].type, value);
        } else if (field === "product_id" || field === "service_id") {
            newItems[index].attributes = {};
        }
        setForm({ ...form, items: newItems });
    };

    const handleAttributeChange = (index: number, attrId: string, valueId: string) => {
        const newItems = [...form.items];
        newItems[index].attributes = { ...newItems[index].attributes, [attrId]: valueId };
        setForm({ ...form, items: newItems });
    };

    const handleSubmit = async () => {
        if (!scenario) { toast.error("Please select a business scenario preset first"); return; }
        if (!form.customer_name || !form.customer_number || !form.address || !form.hub_id || !form.zone_id) {
            toast.error("Please fill all required fields"); return;
        }
        if (!/^\d{10}$/.test(form.customer_number)) {
            toast.error("Please enter a valid 10-digit mobile number"); return;
        }
        if (form.items.length === 0) { toast.error("Add at least one item"); return; }

        try {
            setLoading(true);
            const payload = {
                ...form,
                user_id: null,
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                items: form.items?.map((item: any) => {
                    const priceVal = Number(item.amount);
                    const cleanAttributes = Object.fromEntries(
                        Object.entries(item.attributes || {}).filter(([_, v]) => v !== "" && v !== null)
                    );
                    const baseItem: any = {
                        type: item.type,
                        quantity: Number(item.quantity),
                        issue_description_text: item.issue_description_text,
                        attributes: cleanAttributes
                    };
                    if (item.type === "PRODUCT") {
                        baseItem.product_id = item.product_id;
                        baseItem.amount = priceVal;
                    } else {
                        baseItem.service_id = item.service_id;
                        baseItem.price = priceVal;
                    }
                    return baseItem;
                })
            };

            const response = await axiosInstance.post(Api.manualActivate, payload);
            if (response.data) {
                const createData = response.data.order_creation || response.data.data;
                const rzpOrderId = createData?.razorpay_order_id;
                const rzpAmount = createData?.amount;
                if (rzpOrderId && (window as any).Razorpay) {
                    const options = {
                        key: razorPayKey,
                        amount: rzpAmount,
                        currency: "INR",
                        name: "IT Fixer",
                        description: `Order Payment for ${form.customer_name}`,
                        order_id: rzpOrderId,
                        handler: () => { toast.success("Payment Successful!"); onSuccess(); onClose(); },
                        prefill: { name: form.customer_name, contact: form.customer_number },
                        theme: { color: "#EA580C" }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                } else {
                    toast.success("Order Created Successfully!"); onSuccess(); onClose();
                }
            }
        } catch (error) {
            console.error("Order creation error:", error);
            toast.error(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9000] p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
                        <p className="text-sm text-gray-500 text-nowrap">Fill in the details to generate a direct order</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-300">

                    {/* Preset Scenario Selector */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight">Order Scenario Preset</h3>
                            </div>
                        </div>
                        <select
                            value={scenario}
                            className="bg-white border-2 border-orange-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500 font-medium text-gray-700"
                            onChange={(e) => {
                                const caseId = e.target.value;
                                setScenario(caseId);
                                if (!caseId) return;
                                let updates: any = {};
                                switch (caseId) {
                                    case "1": updates = { payment_method: "CASH", no_razorpay: true, no_assignment: true, is_paid: false, order_platform: "WHATSAPP" }; break;
                                    case "2": updates = { payment_method: "RAZORPAY", no_razorpay: false, no_assignment: true, is_paid: false, order_platform: "OWN_PLATFORM" }; break;
                                    case "3": updates = { payment_method: "UPI", no_razorpay: true, no_assignment: true, is_paid: true, order_platform: "SHOP" }; break;
                                    case "4": updates = { payment_method: "RAZORPAY", no_razorpay: false, no_assignment: false, is_paid: false, order_platform: "OWN_PLATFORM" }; break;
                                    case "5": updates = { payment_method: "CASH", no_razorpay: true, no_assignment: false, is_paid: false, order_platform: "WHATSAPP" }; break;
                                    case "6": updates = { payment_method: "UPI", no_razorpay: true, no_assignment: false, is_paid: true, order_platform: "SHOP" }; break;
                                }
                                setForm(prev => ({ ...prev, ...updates }));
                                toast.success(`Case ${caseId} logic applied`);
                            }}
                        >
                            <option value="">Choose Scenario</option>
                            <option value="1">Case 1: Pending Payment, No Razorpay, No Agent</option>
                            <option value="2">Case 2: Pending Payment, Razorpay, No Agent</option>
                            <option value="3">Case 3: Success Payment, No Agent</option>
                            <option value="4">Case 4: Pending Payment, Razorpay, With Agent Assignment</option>
                            <option value="5">Case 5: Pending Payment, No Razorpay, With Agent Assignment</option>
                            <option value="6">Case 6: Success Payment, With Agent Assignment</option>
                        </select>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                                Customer Information
                            </h3>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Customer Name *</label>
                            <input
                                type="text"
                                value={form.customer_name}
                                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                placeholder="Enter customer name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Mobile Number *</label>
                            <input
                                type="tel"
                                maxLength={10}
                                value={form.customer_number}
                                onChange={(e) => setForm({ ...form, customer_number: e.target.value.replace(/\D/g, '') })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                placeholder="Enter 10-digit mobile number"
                            />
                        </div>

                        {/* Full Address + Map*/}
                        <div className="md:col-span-2 space-y-3">
                            {/* Label row with map button on the right */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Full Address *</label>
                                <button
                                    type="button"
                                    onClick={handleLocateOnMap}
                                    disabled={mapLoading}
                                    title={mapOpen ? "Search this address on map" : "Open map"}
                                    className="flex items-center gap-[6px] pl-3 pr-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition active:scale-95 disabled:opacity-60 text-sm font-semibold shadow-sm"
                                >
                                    {mapLoading
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <MapPin size={16} />
                                    }
                                    {mapOpen ? "Search Address" : "Open Map"}
                                </button>
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition min-h-[80px]"
                                placeholder="Enter mapping address"
                            />

                            {/* Coordinates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Latitude</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={form.latitude}
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 outline-none cursor-default"
                                        placeholder="Auto-filled from map"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Longitude</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={form.longitude}
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 outline-none cursor-default"
                                        placeholder="Auto-filled from map"
                                    />
                                </div>
                            </div>

                            {/* Collapsible Map Panel */}
                            {mapOpen && (
                                <div className="rounded-xl overflow-hidden border border-orange-200 shadow-md mt-4">
                                    {/* Map toolbar */}
                                    <div className="bg-orange-50 px-4 py-2 flex items-center justify-between border-b border-orange-100">
                                        <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                                            <Map size={15} />
                                            Click anywhere or drag the pin to set exact location
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMapOpen(false)}
                                            className="text-gray-400 hover:text-gray-700 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Map container */}
                                    <div className="relative">
                                        {mapLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                                    <Loader2 size={28} className="animate-spin text-orange-500" />
                                                    <span className="text-sm font-medium">Loading map…</span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={mapRef} style={{ height: "320px", width: "100%" }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="md:col-span-2">
                            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                Assignment & Logistics
                            </h3>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Select Hub *</label>
                            <select
                                value={form.hub_id}
                                onChange={(e) => handleHubChange(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                            >
                                <option value="">Select Hub</option>
                                {hubs.map((h: any) => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Select Zone *</label>
                            <select
                                value={form.zone_id}
                                onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                disabled={!form.hub_id}
                            >
                                <option value="">Select Zone</option>
                                {zones.map((z: any) => (
                                    <option key={z.zone} value={z.zone}>{z.zone_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Platform</label>
                            <select
                                value={form.order_platform}
                                onChange={(e) => setForm({ ...form, order_platform: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                            >
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="OWN_PLATFORM">Own Platform</option>
                                <option value="SHOP">Shop</option>
                                <option value="CALL">Call</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-6 pt-6">
                            <label
                                onClick={(e) => { if (scenario) e.preventDefault(); }}
                                className="flex items-center gap-2 group transition-all"
                                style={{ cursor: scenario ? "not-allowed" : "pointer", opacity: scenario ? 0.9 : 1 }}
                            >
                                <input
                                    type="checkbox"
                                    checked={!form.no_assignment}
                                    style={{ pointerEvents: scenario ? "none" : "auto" }}
                                    onChange={(e) => setForm({ ...form, no_assignment: !e.target.checked })}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">Auto Assign Agent</span>
                            </label>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                Order Items
                            </h3>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-xl bg-gray-50 relative group">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
                                        <select
                                            value={item.type}
                                            onChange={(e) => handleItemChange(index, "type", e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg bg-white text-sm"
                                        >
                                            <option value="">Choose Type</option>
                                            <option value="PRODUCT">Product</option>
                                            <option value="SERVICE">Service</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
                                        <select
                                            value={item.category_id}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "pointer" }}
                                            onChange={(e) => handleItemChange(index, "category_id", e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg bg-white text-sm"
                                        >
                                            {!item.type ? (
                                                <option value="">Select Type First</option>
                                            ) : (
                                                <>
                                                    <option value="">Choose Category</option>
                                                    {categories
                                                        .filter((cat: any) => cat.type === item.type && cat.status === "ACTIVE")
                                                        .map((cat: any) => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))
                                                    }
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                            {item.type === "PRODUCT" ? "Select Product" : "Select Service"}
                                        </label>
                                        <select
                                            value={item.type === "PRODUCT" ? item.product_id : item.service_id}
                                            disabled={!item.category_id || loadingRows[index]}
                                            style={{ cursor: (!item.category_id || loadingRows[index]) ? "not-allowed" : "pointer" }}
                                            onChange={(e) => handleItemChange(index, item.type === "PRODUCT" ? "product_id" : "service_id", e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg bg-white text-sm"
                                        >
                                            {loadingRows[index] ? (
                                                <option>Loading Items...</option>
                                            ) : !item.category_id ? (
                                                <option value="">Select Category First</option>
                                            ) : (
                                                <>
                                                    <option value="">Choose item</option>
                                                    {(rowItems[index] || []).map((p: any) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Qty</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "text" }}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg bg-white text-sm"
                                            min="1"
                                        />
                                    </div>

                                    <div className="md:col-span-2 relative group">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.amount}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "text" }}
                                            onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg bg-white text-sm"
                                            placeholder="0.00"
                                        />
                                        {form.items.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                className="absolute -right-2 top-0 text-red-400 hover:text-red-600 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Attributes */}
                                    {(() => {
                                        const selectedId = item.type === "PRODUCT" ? item.product_id : item.service_id;
                                        const selectedItem = (rowItems[index] || []).find((i: any) => i.id === selectedId);
                                        const attrList = selectedItem?.attributes || [];
                                        if (attrList.length === 0) return null;
                                        const grouped: { [key: string]: { id: string; name: string; options: any[] } } = {};
                                        attrList.forEach((a: any) => {
                                            const name = a.attribute_name || a.name || "Option";
                                            const id = a.attribute_id;
                                            if (!grouped[name]) grouped[name] = { id, name, options: [] };
                                            grouped[name].options.push(a);
                                        });
                                        return (
                                            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                                                {Object.values(grouped).map(group => (
                                                    <div key={group.name}>
                                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{group.name}</label>
                                                        <select
                                                            value={item.attributes[group.id] || ""}
                                                            onChange={(e) => handleAttributeChange(index, group.id, e.target.value)}
                                                            className="w-full px-3 py-1.5 border rounded-lg bg-white text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                                                        >
                                                            <option value="">Select {group.name}</option>
                                                            {group.options.map((opt: any) => (
                                                                <option key={opt.id || opt.value_id} value={opt.id || opt.value_id}>
                                                                    {opt.value}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {/* Description */}
                                    <div className="md:col-span-12 mt-2">
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block capitalize">Instruction</label>
                                        <input
                                            type="text"
                                            value={item.issue_description_text}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "text" }}
                                            onChange={(e) => handleItemChange(index, "issue_description_text", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                            placeholder="Enter issue details"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="pt-4 border-t space-y-6">
                        <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                            Payment Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                <select
                                    value={!form.no_razorpay ? "RAZORPAY" : form.payment_method}
                                    style={{ pointerEvents: !form.no_razorpay ? "none" : "auto", opacity: !form.no_razorpay ? 0.9 : 1, cursor: !form.no_razorpay ? "not-allowed" : "pointer" }}
                                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition bg-white font-medium shadow-sm"
                                >
                                    {form.no_razorpay ? (
                                        <>
                                            <option value="CASH">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="WALLET">Wallet</option>
                                        </>
                                    ) : (
                                        <option value="RAZORPAY">Razorpay</option>
                                    )}
                                </select>
                            </div>

                            <div className="flex items-center gap-10 pt-6 md:col-span-2">
                                <label
                                    onClick={(e) => { if (scenario) e.preventDefault(); }}
                                    className="flex items-center gap-2 group transition-all"
                                    style={{ cursor: scenario ? "not-allowed" : "pointer", opacity: scenario ? 0.9 : 1 }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.is_paid}
                                        style={{ pointerEvents: scenario ? "none" : "auto" }}
                                        onChange={(e) => setForm({ ...form, is_paid: e.target.checked })}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">Payment Received</span>
                                </label>

                                <label
                                    onClick={(e) => { if (scenario) e.preventDefault(); }}
                                    className="flex items-center gap-2 group transition-all"
                                    style={{ cursor: scenario ? "not-allowed" : "pointer", opacity: scenario ? 0.9 : 1 }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!form.no_razorpay}
                                        style={{ pointerEvents: scenario ? "none" : "auto" }}
                                        onChange={(e) => setForm({ ...form, no_razorpay: !e.target.checked })}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">Enable Razorpay</span>
                                </label>
                            </div>

                            {form.is_paid && (
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={form.transaction_id}
                                        onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                        placeholder="Enter transaction reference number"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : "Create Order Now"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateOrderModal;
