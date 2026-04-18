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
    serial_numbers: string[];
    discount: string;
    device_id: string;
    media: any[];
    brand: string;
    hsn_code: string;
    description: string;
}

const MAPS_API_KEY = "AIzaSyAflftNedMvJ812sMI1l0h7kqj1-HBYDE8";

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
    const [apiErrors, setApiErrors] = useState<string>("");
    // Map state
    const [mapOpen, setMapOpen] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [paymentType, setPaymentType] = useState("");

    const [form, setForm] = useState({
        customer_name: "",
        customer_number: "",
        customer_email: "",
        customer_gst: "",
        address: "",
        google_address: "",
        latitude: "" as any,
        longitude: "" as any,
        user_id: null as string | null,
        hub_id: "",
        zone_id: "",
        payment_method: "",
        transaction_id: "",
        is_paid: false,
        no_razorpay: true,
        no_assignment: true,
        order_platform: "SHOP",
        order_type: "",
        partial_payment_amount: "",
        is_otp_required: false,
        slot_id: "",
        is_instant_slot: false,
        items: [
            {
                type: "",
                category_id: "",
                product_id: "",
                service_id: "",
                quantity: 1,
                amount: 0,
                issue_description_text: "",
                attributes: {} as Record<string, string>,
                serial_numbers: [] as string[],
                discount: "",
                device_id: "",
                media: [],
                brand: "",
                hsn_code: "",
                description: ""
            } as OrderItem
        ]
    });


    const [locationData, setLocationData] = useState<any>(null);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [availableSerials, setAvailableSerials] = useState<{ [key: number]: string[] }>({});

    useEffect(() => {
        fetchInitialData();
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    useEffect(() => {
        if (!mapOpen) return;
        initMap();
    }, [mapOpen]);

    useEffect(() => {
        if (paymentType === "PAID") {
            setForm(prev => ({
                ...prev,
                is_paid: true,
                payment_method: "CASH"
            }));
        } else if (paymentType === "RAZORPAY") {
            setForm(prev => ({
                ...prev,
                is_paid: false,
                payment_method: "RAZORPAY"
            }));
        }
    }, [paymentType]);

    const initMap = async () => {
        setMapLoading(true);
        try {
            await loadGoogleMaps();

            // Default center: Chennai
            const defaultCenter = { lat: 13.0827, lng: 80.2707 };

            const map = new (window as any).google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 12,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                clickableIcons: false, // Prevent POI popups
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
                    address: addr,
                    google_address: addr
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
                    address: addr,
                    google_address: addr
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
                        longitude: coords.lng.toFixed(7),
                        google_address: prev.address
                    }));
                }
            } else if (form.latitude && form.longitude) {
                const lat = Number(form.latitude);
                const lng = Number(form.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const pos = { lat, lng };
                    map.setCenter(pos);
                    map.setZoom(16);
                    marker.setPosition(pos);

                    // Automatically reverse geocode to fill the address
                    const addr = await reverseGeocode(lat, lng);
                    setForm(prev => ({
                        ...prev,
                        address: addr || prev.address,
                        google_address: addr || prev.google_address
                    }));
                }
            }
        } catch (err) {
            console.error("Map init error:", err);
            toast.error("Failed to load Google Maps. Check your API key.");
        } finally {
            setMapLoading(false);
        }
    };

    const handleLocateOnMap = async () => {
        if (!mapOpen) {
            setMapOpen(true);
            return;
        }

        const addressModified = form.address.trim() !== "" && form.address !== form.google_address;

        if (!addressModified && form.latitude && form.longitude && !isNaN(Number(form.latitude)) && !isNaN(Number(form.longitude))) {
            const lat = Number(form.latitude);
            const lng = Number(form.longitude);
            const pos = { lat, lng };

            if (googleMapRef.current && markerRef.current) {
                googleMapRef.current.setCenter(pos);
                googleMapRef.current.setZoom(17);
                markerRef.current.setPosition(pos);
                markerRef.current.setAnimation((window as any).google.maps.Animation.DROP);

                setMapLoading(true);
                const addr = await reverseGeocode(lat, lng);
                setMapLoading(false);

                setForm(prev => ({
                    ...prev,
                    address: addr || prev.address,
                    google_address: addr || prev.google_address
                }));
                toast.success("Location updated from coordinates!");
                return;
            }
        }

        if (!form.address.trim()) {
            toast.error("Please enter an address or coordinates first");
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
            longitude: coords.lng.toFixed(7),
            google_address: prev.address
        }));

        toast.success("Location found!");
    };

    const fetchZoneAndSlots = async (lat: string, lon: string) => {
        // if (!lat || !lon || !scenario || form.no_assignment) return;
        if (!lat || !lon || form.no_assignment) return;

        setFetchingSlots(true);
        try {
            const res = await axiosInstance.get(`${Api.zoneByLocation}?lat=${lat}&lng=${lon}`);
            const data = res.data?.zone_slot;
            setLocationData(data);

            if (data?.zone?.id) {
                setForm(prev => ({
                    ...prev,
                    slot_id: "",
                    is_instant_slot: false
                }));
            }
        } catch (error) {
            console.error("Failed to fetch slots:", error);
        } finally {
            setFetchingSlots(false);
        }
    };

    useEffect(() => {
        if (form.latitude && form.longitude && !form.no_assignment) {
            fetchZoneAndSlots(form.latitude, form.longitude);
        } else {
            setLocationData(null);
        }
    }, [form.latitude, form.longitude, form.no_assignment]);

    // }, [form.latitude, form.longitude, form.no_assignment, scenario]);

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

    const fetchAvailableSerials = async (productId: string, index: number) => {
        if (!productId) return;
        try {
            const params: any = { product_id: productId };
            if (form.hub_id) params.hub_id = form.hub_id;

            const res = await axiosInstance.get(Api.productSerialAvailability, { params });
            const availabilityData = res.data?.availability || res.data || [];
            let serials: string[] = [];

            const dataToLoop = Array.isArray(availabilityData) ? availabilityData : [];

            dataToLoop.forEach((item: any) => {
                if (item.available_serial_numbers) {
                    if (typeof item.available_serial_numbers === "string") {
                        const split = item.available_serial_numbers.split(",").map((s: string) => s.trim()).filter(Boolean);
                        serials = [...serials, ...split];
                    } else if (Array.isArray(item.available_serial_numbers)) {
                        serials = [...serials, ...item.available_serial_numbers];
                    }
                } else if (item.serial_numbers && Array.isArray(item.serial_numbers)) {
                    serials = [...serials, ...item.serial_numbers];
                }
            });

            setAvailableSerials(prev => ({ ...prev, [index]: [...new Set(serials)] }));
        } catch (error) {
            console.error("Failed to fetch serials", error);
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
        if (hubId) {
            fetchZones(hubId);
            // Re-fetch serials for all items if hub changes
            form.items.forEach((item, idx) => {
                if (item.type === "PRODUCT" && item.product_id) {
                    fetchAvailableSerials(item.product_id, idx);
                }
            });
        } else {
            setZones([]);
        }
    };

    const handleAddItem = () => {
        setForm({
            ...form,
            items: [...form.items, {
                type: "", category_id: "", product_id: "", service_id: "",
                quantity: 1, amount: 0, issue_description_text: "",
                attributes: {} as Record<string, string>,
                serial_numbers: [] as string[],
                discount: "", device_id: "", media: [], brand: "", hsn_code: "",
                description: ""
            } as OrderItem]
        });
    };

    const handleRemoveItem = (index: number) => {
        if (form.items.length === 1) return;
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });

        const shiftIndices = (prev: any) => {
            const next: any = {};
            let newIdx = 0;
            form.items.forEach((_, i) => {
                if (i !== index) {
                    if (prev[i] !== undefined) next[newIdx] = prev[i];
                    newIdx++;
                }
            });
            return next;
        };

        setRowItems(prev => shiftIndices(prev));
        setLoadingRows(prev => shiftIndices(prev));
        setAvailableSerials(prev => shiftIndices(prev));
    };

    const fetchItemsByCategory = async (index: number, type: string, categoryId: string) => {
        if (!categoryId || !type) return;
        setLoadingRows(prev => ({ ...prev, [index]: true }));
        try {
            const url = type === "PRODUCT" ? Api.products : Api.services;
            const res = await axiosInstance.get(`${url}?category_id=${categoryId}&include_categories=true&include_attribute=true&include_pricing=true`);
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
            newItems[index].serial_numbers = [];
            setRowItems(prev => { const u = { ...prev }; delete u[index]; return u; });
        } else if (field === "category_id") {
            newItems[index].product_id = "";
            newItems[index].service_id = "";
            newItems[index].attributes = {};
            newItems[index].serial_numbers = [];
            fetchItemsByCategory(index, newItems[index].type, value);
        } else if (field === "product_id" || field === "service_id") {
            newItems[index].attributes = {};
            newItems[index].serial_numbers = [];

            const selectedId = value;
            const selectedItem = (rowItems[index] || []).find((i: any) => i.id === selectedId);
            if (selectedItem) {
                if (newItems[index].type === "PRODUCT") {
                    const priceObj = selectedItem.product_pricing?.[0] || selectedItem.pricing?.[0];
                    if (priceObj && priceObj.price) {
                        newItems[index].amount = priceObj.price;
                    } else if (selectedItem.price) {
                        newItems[index].amount = selectedItem.price;
                    }
                }
                else {
                    const priceVal = selectedItem.price || selectedItem.pricing_models?.[0]?.price;
                    if (priceVal) {
                        newItems[index].amount = priceVal;
                    }
                }

                // Fetch available serial numbers
                if (newItems[index].type === "PRODUCT") {
                    fetchAvailableSerials(selectedId, index);
                }
            }
        } else if (field === "quantity") {
            // Update serial numbers array length if quantity changes
            const qty = Math.max(1, parseInt(value) || 0);
            const currentSNS = [...(newItems[index].serial_numbers || [])];
            if (currentSNS.length < qty) {
                while (currentSNS.length < qty) currentSNS.push("");
            } else if (currentSNS.length > qty) {
                currentSNS.splice(qty);
            }
            newItems[index].serial_numbers = currentSNS;
        }
        setForm({ ...form, items: newItems });
    };

    const handleSerialNumberChange = (itemIndex: number, snIndex: number, value: string) => {
        const newItems = [...form.items];
        const sns = [...(newItems[itemIndex].serial_numbers || [])];
        sns[snIndex] = value;
        newItems[itemIndex].serial_numbers = sns;
        setForm({ ...form, items: newItems });
    };

    const handleAttributeChange = (index: number, attrId: string, valueId: string) => {
        const newItems = [...form.items];
        newItems[index].attributes = { ...newItems[index].attributes, [attrId]: valueId };
        setForm({ ...form, items: newItems });
    };

    const handleSubmit = async () => {
        setApiErrors('')
        // if (!scenario) { toast.error("Please select a business scenario preset first"); return; }
        if (!form.customer_name || !form.customer_number || !form.address || !form.hub_id || !form.zone_id || !form.order_platform || !form.order_type || !form.payment_method) {
            toast.error("Please fill all required fields"); return;
        }

        if (!form.latitude || !form.longitude || isNaN(Number(form.latitude)) || isNaN(Number(form.longitude))) {
            toast.error("Location coordinates are mandatory");
            return;
        }

        if (form.no_razorpay && !form.payment_method) {
            toast.error("Please select a payment method"); return;
        }
        if (!form.no_assignment && (!form.latitude || !form.longitude)) {
            toast.error("Coordinates are mandatory for agent assignment. Please pick the location on the map.");
            return;
        }
        if (!form.no_assignment && !form.slot_id && !form.is_instant_slot) {
            toast.error("Please select an arrival time (Instant or a Slot)");
            return;
        }
        if (!/^\d{10}$/.test(form.customer_number)) {
            toast.error("Please enter a valid 10-digit mobile number"); return;
        }
        if (form.items.length === 0) { toast.error("Add at least one item"); return; }

        // Validate Serial Numbers for Products (Only for Cases 1, 2, 3)
        // if (["1", "2", "3"].includes(scenario)) {
        for (let i = 0; i < form.items.length; i++) {
            const item = form.items[i];
            const itemLabel = `Item ${i + 1}`;

            if (!item.type) {
                toast.error(`Please select a Type for ${itemLabel}`);
                return;
            }

            if (!item.category_id) {
                toast.error(`Please select a Category for ${itemLabel}`);
                return;
            }

            // Product vs Service specific ID check
            if (item.type === "PRODUCT" && !item.product_id) {
                toast.error(`Please select a Product for ${itemLabel}`);
                return;
            }
            if (item.type === "SERVICE" && !item.service_id) {
                toast.error(`Please select a Service for ${itemLabel}`);
                return;
            }

            if (!item.quantity || item.quantity <= 0) {
                toast.error(`Please enter a valid Quantity for ${itemLabel}`);
                return;
            }

            // Check for undefined, null, empty string, or negative amount
            if (item.amount === undefined || item.amount === null || item.amount === "" || Number(item.amount) < 0) {
                toast.error(`Please enter a valid Amount for ${itemLabel}`);
                return;
            }

            if (item.type === "PRODUCT" && item.product_id) {
                const sns = item.serial_numbers || [];
                const productName = (rowItems[i] || []).find((p: any) => p.id === item.product_id)?.name || `Item ${i + 1}`;

                if (sns.length < item.quantity || sns.some(s => !s.trim())) {
                    toast.error(`Please provide all serial numbers for ${productName}`);
                    return;
                }
            }
            // }
        }

        try {
            setLoading(true);

            const payload = {
                customer_name: form.customer_name,
                customer_number: form.customer_number,
                customer_email: form.customer_email || "",
                customer_gst: form.customer_gst || "",
                address: form.address,
                google_address: form.google_address || form.address,
                latitude: form.latitude ? Number(form.latitude) : 0,
                longitude: form.longitude ? Number(form.longitude) : 0,
                user_id: form.user_id,
                hub_id: form.hub_id,
                zone_id: form.zone_id,
                payment_method: form.payment_method,
                transaction_id: form.transaction_id || "",
                is_paid: !!form.is_paid,
                no_razorpay: !!form.no_razorpay,
                no_assignment: !!form.no_assignment,
                order_platform: form.order_platform,
                order_type: form.order_type || "B2C",
                partial_payment_amount: form.partial_payment_amount || "0",
                is_otp_required: !!form.is_otp_required,
                slot_id: (form.is_instant_slot || !form.slot_id) ? null : form.slot_id,
                is_instant_slot: !!form.is_instant_slot,
                items: form.items?.map((item: any) => {
                    const priceVal = String(item.amount || "0");
                    const cleanAttributes = Object.fromEntries(
                        Object.entries(item.attributes || {}).filter(([_, v]) => v !== "" && v !== null)
                    );
                    const baseItem: any = {
                        type: item.type,
                        quantity: Number(item.quantity),
                        issue_description_text: item.issue_description_text || "",
                        description: item.description || "",
                        attributes: JSON.stringify(cleanAttributes),
                        serial_numbers: item.serial_numbers?.filter((sn: string) => sn.trim() !== "") || [],
                        discount: item.discount || "0",
                        device_id: item.device_id || "",
                        media: item.media || [],
                        brand: item.brand || "",
                        hsn_code: item.hsn_code || "",
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
                        prefill: { name: form.customer_name, contact: form.customer_number, email: form.customer_email },
                        theme: { color: "#EA580C" }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                } else {
                    toast.success("Order Created Successfully!"); onSuccess(); onClose();
                }
            }
        } catch (error) {
            setApiErrors(extractErrorMessage(error));
            // console.error("Order creation error:", error);
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
                    {/* <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                    case "1": updates = { payment_method: "", no_razorpay: true, no_assignment: true, is_paid: false, order_platform: "SHOP" }; break;
                                    case "2": updates = { payment_method: "RAZORPAY", no_razorpay: false, no_assignment: true, is_paid: false, order_platform: "SHOP" }; break;
                                    case "3": updates = { payment_method: "", no_razorpay: true, no_assignment: true, is_paid: true, order_platform: "SHOP" }; break;
                                    case "4": updates = { payment_method: "RAZORPAY", no_razorpay: false, no_assignment: false, is_paid: false, order_platform: "SHOP" }; break;
                                    case "5": updates = { payment_method: "", no_razorpay: true, no_assignment: false, is_paid: false, order_platform: "SHOP" }; break;
                                    case "6": updates = { payment_method: "", no_razorpay: true, no_assignment: false, is_paid: true, order_platform: "SHOP" }; break;
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
                    </div> */}

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
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                value={form.customer_email}
                                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                placeholder="Enter customer email address"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Customer GST</label>
                            <input
                                type="text"
                                value={form.customer_gst}
                                onChange={(e) => setForm({ ...form, customer_gst: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                placeholder="Enter GST number"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Order Type *
                            </label>
                            <select
                                value={form.order_type}
                                className="border rounded-lg px-3 py-2 outline-none focus:border-orange-500"
                                onChange={(e) => setForm({ ...form, order_type: e.target.value })}
                            >
                                <option value="">Select Order Type</option>
                                <option value="B2C">B2C (Business to Consumer)</option>
                                <option value="B2B">B2B (Business to Business)</option>
                            </select>
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
                                    <label className="text-sm font-semibold text-gray-700">
                                        Latitude *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.latitude}
                                        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                        placeholder="Enter latitude"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Longitude *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.longitude}
                                        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                        placeholder="Enter longitude"
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
                            <label className="text-sm font-semibold text-gray-700">
                                Order Platform *
                            </label>
                            <select
                                value={form.order_platform}
                                onChange={(e) => setForm({ ...form, order_platform: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                            >
                                <option value="SHOP">Shop</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="OWN_PLATFORM">Own Platform</option>
                                <option value="CALL">Call</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Partial Payment Amount</label>
                            <input
                                type="number"
                                min="0"
                                value={form.partial_payment_amount}
                                disabled={form.is_paid}
                                onChange={(e) => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    setForm({ 
                                        ...form, 
                                        partial_payment_amount: val.toString(),
                                        is_paid: val > 0 ? false : form.is_paid 
                                    });
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition ${form.is_paid ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}`}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex items-center gap-6 pt-6 md:col-span-2">
                            <label
                                className="flex items-center gap-2 group transition-all cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={!form.no_assignment}
                                    onChange={(e) => {
                                        const needsAssign = e.target.checked;
                                        setForm({ ...form, no_assignment: !needsAssign });
                                        if (!needsAssign) {
                                            setLocationData(null);
                                            setForm(prev => ({ ...prev, slot_id: "", is_instant_slot: false }));
                                        }
                                    }}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">Auto Assign Agent</span>
                            </label>

                            <label className="flex items-center gap-2 group transition-all cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_otp_required}
                                    onChange={(e) => setForm({ ...form, is_otp_required: e.target.checked })}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">OTP Required</span>
                            </label>
                        </div>

                        {/* Availability & Scheduling */}
                        {!form.no_assignment && (form.latitude && form.longitude) && (
                            <div className="md:col-span-2 space-y-4 pt-4">
                                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                                    Availability & Arrival *
                                    <Loader2 size={14} className={`text-orange-500 ${fetchingSlots ? 'animate-spin' : 'hidden'}`} />
                                </h4>

                                {fetchingSlots ? (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm italic py-2">
                                        <Loader2 size={14} className="animate-spin" />
                                        Checking availability…
                                    </div>
                                ) : !locationData ? (
                                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 italic">
                                        No service zone or slots found for this location. Try moving the map pin.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Instant Delivery Option */}
                                        {locationData.instant_availability?.available && (
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Instant Arrival</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, is_instant_slot: !form.is_instant_slot, slot_id: "" })}
                                                    className={`w-full h-[42px] px-4 py-2 border rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${form.is_instant_slot
                                                        ? 'border-orange-500 ring-1 ring-orange-500/20'
                                                        : 'border-gray-300 bg-white text-gray-600 hover:border-orange-300'
                                                        }`}
                                                >
                                                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${form.is_instant_slot ? 'border-orange-600' : 'border-gray-300'}`}>
                                                        {form.is_instant_slot && <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
                                                    </div>
                                                    <span className="truncate">⚡ {locationData.instant_availability.eta_start_time} - {locationData.instant_availability.eta_end_time}</span>
                                                </button>
                                            </div>
                                        )}

                                        {/* Scheduled Slot Option */}
                                        {locationData.slots && locationData.slots.length > 0 && (
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Scheduled visit slot</label>
                                                <select
                                                    value={form.slot_id}
                                                    onChange={(e) => setForm({ ...form, slot_id: e.target.value, is_instant_slot: false })}
                                                    className={`w-full h-[42px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition ${form.slot_id ? 'border-orange-500' : 'border-gray-300'}`}
                                                >
                                                    <option value="">Select Scheduled Slot</option>
                                                    {(locationData.slots || []).map((s: any) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.start_time} - {s.end_time}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {(!locationData.instant_availability?.available && (!locationData.slots || locationData.slots.length === 0)) && (
                                            <div className="md:col-span-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                                                No arrival slots available right now.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Type *</label>
                                        <select
                                            value={item.type}
                                            onChange={(e) => handleItemChange(index, "type", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                        >
                                            <option value="">Choose Type</option>
                                            <option value="PRODUCT">Product</option>
                                            <option value="SERVICE">Service</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Category *</label>
                                        <select
                                            value={item.category_id}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "pointer" }}
                                            onChange={(e) => handleItemChange(index, "category_id", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
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
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">
                                            {item.type === "PRODUCT" ? "Select Product" : "Select Service"} *
                                        </label>
                                        <select
                                            value={item.type === "PRODUCT" ? item.product_id : item.service_id}
                                            disabled={!item.category_id || loadingRows[index]}
                                            style={{ cursor: (!item.category_id || loadingRows[index]) ? "not-allowed" : "pointer" }}
                                            onChange={(e) => handleItemChange(index, item.type === "PRODUCT" ? "product_id" : "service_id", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
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
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Qty *</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "text" }}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                            min="1"
                                        />
                                    </div>

                                    <div className="md:col-span-2 relative group">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Amount *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.amount}
                                            disabled={!item.type}
                                            style={{ cursor: !item.type ? "not-allowed" : "text" }}
                                            onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
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
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{group.name}</label>
                                                        <select
                                                            value={item.attributes[group.id] || ""}
                                                            onChange={(e) => handleAttributeChange(index, group.id, e.target.value)}
                                                            className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
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

                                    {/* Additional Item Fields */}
                                    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Brand</label>
                                            <input
                                                type="text"
                                                value={item.brand}
                                                onChange={(e) => handleItemChange(index, "brand", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                                placeholder="Brand name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">HSN Code</label>
                                            <input
                                                type="text"
                                                value={item.hsn_code}
                                                onChange={(e) => handleItemChange(index, "hsn_code", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                                placeholder="HSN Code"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Device ID</label>
                                            <input
                                                type="text"
                                                value={item.device_id}
                                                onChange={(e) => handleItemChange(index, "device_id", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                                placeholder="Device ID"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Discount</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.discount}
                                                onChange={(e) => {
                                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                    handleItemChange(index, "discount", val.toString());
                                                }}
                                                className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Item Description</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition"
                                                placeholder="Item specific description"
                                            />
                                        </div>
                                    </div>

                                    {/* Description/Instruction */}
                                    <div className="md:col-span-12 mt-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Issue Description / Instruction</label>
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

                                    {/* Serial Numbers for Products - Only for Case 1, 2, 3 (No Agent) */}
                                    {item.type === "PRODUCT" &&
                                        // ["1", "2", "3"].includes(scenario) &&
                                        (
                                            <div className="md:col-span-12 mt-2 bg-white/50 p-3 rounded-lg border border-orange-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Serial Numbers ({item.quantity}) *</label>
                                                    {(!availableSerials[index] || availableSerials[index].length === 0) && item.product_id && (
                                                        <span className="text-[10px] font-medium text-red-500 italic">No stock found in this hub</span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {Array.from({ length: Math.max(1, item.quantity || 1) }).map((_, snIdx) => {
                                                        const currentSns = item.serial_numbers || [];

                                                        const otherSelectedSns = form.items.flatMap((it, itIdx) => {
                                                            if (it.product_id === item.product_id) {
                                                                return (it.serial_numbers || []).filter((_, sIdx) => !(itIdx === index && sIdx === snIdx));
                                                            }
                                                            return [];
                                                        });

                                                        return (
                                                            <select
                                                                key={snIdx}
                                                                className="w-full px-3 py-1.5 border rounded-lg bg-white text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                                                                value={currentSns[snIdx] || ""}
                                                                onChange={(e) => handleSerialNumberChange(index, snIdx, e.target.value)}
                                                            >
                                                                <option value="">Choose S/N {snIdx + 1}</option>
                                                                {(() => {
                                                                    const pool = availableSerials[index] || [];
                                                                    const filteredOptions = pool.filter(sn => !otherSelectedSns.includes(sn));

                                                                    if (pool.length === 0) {
                                                                        return <option disabled className="text-red-500 font-bold">🚫 No available stock in hub</option>;
                                                                    }

                                                                    if (filteredOptions.length === 0 && pool.length > 0) {
                                                                        return <option disabled>No more units left in selection</option>;
                                                                    }

                                                                    return filteredOptions.map(sn => (
                                                                        <option key={sn} value={sn}>
                                                                            {sn}
                                                                        </option>
                                                                    ));
                                                                })()}
                                                            </select>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
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
                                <label className="text-sm font-medium text-gray-700">
                                    Payment Method *
                                </label>
                                <select
                                    // value={!form.no_razorpay ? "RAZORPAY" : form.payment_method}
                                    value={form.payment_method}
                                    disabled={paymentType === "RAZORPAY"}
                                    // style={{ pointerEvents: !form.no_razorpay ? "none" : "auto", opacity: !form.no_razorpay ? 0.9 : 1, cursor: !form.no_razorpay ? "not-allowed" : "pointer" }}
                                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition bg-white"
                                >
                                    {paymentType !== "RAZORPAY" ? (
                                        <>
                                            <option value="">Choose Payment Method</option>
                                            <option value="CASH">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="WALLET">Wallet</option>
                                        </>
                                    ) : (
                                        <option value="RAZORPAY">Razorpay</option>
                                    )}
                                </select>
                            </div>

                            {/* <div className="flex items-center gap-10 pt-6 md:col-span-2">
                                <label
                                    // onClick={(e) => { if (scenario) e.preventDefault(); }}
                                    onClick={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 group transition-all"
                                    // style={{ cursor: scenario ? "not-allowed" : "pointer", opacity: scenario ? 0.9 : 1 }}
                                    style={{ cursor: "pointer", opacity: 1 }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.is_paid}
                                        // style={{ pointerEvents: scenario ? "none" : "auto" }}
                                        style={{ pointerEvents: "auto" }}
                                        onChange={(e) => setForm({ ...form, is_paid: e.target.checked })}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">Payment Received</span>
                                </label>

                                <label
                                    // onClick={(e) => { if (scenario) e.preventDefault(); }}
                                    onClick={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 group transition-all"
                                    // style={{ cursor: scenario ? "not-allowed" : "pointer", opacity: scenario ? 0.9 : 1 }}
                                    style={{ cursor: "pointer", opacity: 1 }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!form.no_razorpay}
                                        // style={{ pointerEvents: scenario ? "none" : "auto" }}
                                        style={{ pointerEvents: "auto" }}
                                        onChange={(e) => setForm({ ...form, no_razorpay: !e.target.checked })}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition font-medium">Enable Razorpay</span>
                                </label>
                            </div> */}
                            <div className="flex items-center gap-10 pt-6 md:col-span-2">

                                {/* Payment Received */}
                                <label className={`flex items-center gap-2 ${Number(form.partial_payment_amount) > 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                    <input
                                        type="checkbox"
                                        checked={paymentType === "PAID"}
                                        disabled={Number(form.partial_payment_amount) > 0}
                                        onChange={(e) => {
                                            const isChecking = e.target.checked;
                                            setPaymentType(isChecking ? "PAID" : "");
                                            setForm({ 
                                                ...form, 
                                                is_paid: isChecking,
                                                payment_method: isChecking ? "CASH" : "",
                                                partial_payment_amount: isChecking ? "0" : form.partial_payment_amount
                                            })
                                        }}
                                        className="w-4 h-4 text-orange-600 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span className="text-sm">Payment Received</span>
                                </label>

                                {/* Razorpay */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={paymentType === "RAZORPAY"}
                                        onChange={(e) => {
                                            const isChecking = e.target.checked;
                                            setPaymentType(isChecking ? "RAZORPAY" : "");
                                            setForm(prev => ({
                                                ...prev,
                                                no_razorpay: !isChecking,
                                                payment_method: isChecking ? "RAZORPAY" : "",
                                                is_paid: isChecking ? false : prev.is_paid
                                            }));
                                        }}
                                        className="w-4 h-4 text-orange-600 cursor-pointer"
                                    />
                                    <span className="text-sm">Enable Razorpay</span>
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
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end px-6">
                        {apiErrors}
                    </p>
                )}
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
