import React, { useEffect, useState } from "react";
import { ImportIcon, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import Api from "../../api-endpoints/ApiUrls";
import axiosInstance from "../../configs/axios-middleware";
const inputClass =
    "w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-orange-500";

const sectionClass =
    "border rounded-xl p-4 space-y-4 bg-gray-50";

const FileUpload = ({ label, value, onChange, onRemove }: any) => {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>

            <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center bg-white">
                <input
                    type="file"
                    className="hidden"
                    id={label}
                    onChange={onChange}
                />

                <label htmlFor={label} className="cursor-pointer text-orange-600 text-sm">
                    Click to upload
                </label>

                {value && (
                    <div className="mt-3 flex justify-between items-center bg-gray-100 px-3 py-2 rounded">
                        <span className="text-sm truncate">{value.name}</span>
                        <button onClick={onRemove} className="text-red-500 text-xs">
                            Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CreateAgentModal = ({ show, onClose, onSuccess }: any) => {
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");
    const [hubs, setHubs] = useState<any[]>([]);

    const [form, setForm] = useState<any>({
        name: "",
        email: "",
        mobile_number: "",
        password: "",
        comments: "",
        agent_type: "OWN",
        is_admin_permission_required: false,
        hub_id: "",
        start_time: "",
        end_time: "",
        vehicle_type: "",
        vehicle_number: "",
        rc_number: "",
        license_number: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
        profile_image: null,
        aadhar_doc: null,
        pan_card: null,
        video_kyc: null,
        rc_doc: null,
        license_doc: null,
    });

    useEffect(() => {
        fetchHubs();
    }, []);

    const fetchHubs = async () => {
        const res = await axiosInstance.get(Api?.allHubs);
        setHubs(res?.data?.hubs || []);
    };
    const resetForm = () => {
        Object.keys(form).forEach((key) => (form[key] = key.includes("doc") || key.includes("image") ? null : ""));
        setForm({ ...form });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.mobile_number || !form.password) {
            toast.error("Required fields missing");
            return;
        }

        try {
            setLoading(true);

            const fd = new FormData();

            Object.entries(form).forEach(([key, value]: any) => {
                if (value !== "" && value !== null) {
                    fd.append(key, value);
                }
            });

            const updatedApi = await axiosInstance.post(Api.userAgent, fd);
            if (updatedApi) {
                toast.success("Agent Created 🔥");
                onSuccess?.();
                handleClose();
            }

        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center gap-2">
                    <UserPlus size={20} />
                    <h2 className="text-xl font-bold">Create Agent</h2>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                    {/* BASIC */}
                    <div className={sectionClass}>
                        <h3 className="font-semibold text-gray-700">Basic Info</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Name *" className={inputClass}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <input placeholder="Email *" className={inputClass}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            <input placeholder="Mobile *" className={inputClass}
                                onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} />
                            <input type="password" placeholder="Password *" className={inputClass}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Comments</label>
                            <textarea
                                className={inputClass}
                                rows={3}
                                placeholder="Enter comments..."
                                value={form.comments}
                                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                Admin Permission Required
                            </label>

                            <button
                                onClick={() =>
                                    setForm({
                                        ...form,
                                        is_admin_permission_required: !form.is_admin_permission_required,
                                    })
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.is_admin_permission_required ? "bg-green-500" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.is_admin_permission_required
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* AGENT */}
                    <div className={sectionClass}>
                        <h3 className="font-semibold">Agent Details</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <select className={inputClass}
                                onChange={(e) => setForm({ ...form, agent_type: e.target.value })}>
                                <option value="">Select agent Type</option>
                                <option value="OWN">OWN</option>
                                <option value="PARTNERSHIP">PARTNERSHIP</option>
                            </select>

                            <select className={inputClass}
                                onChange={(e) => setForm({ ...form, hub_id: e.target.value })}>
                                <option value="">Select Hub</option>
                                {hubs?.map((hub) => (
                                    <option key={hub.id} value={hub.id}>
                                        {hub.name}
                                    </option>
                                ))}
                            </select>


                            <input type="time" className={inputClass}
                                onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                            <input type="time" className={inputClass}
                                onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                        </div>
                    </div>

                    {/* VEHICLE */}
                    <div className={sectionClass}>
                        <h3 className="font-semibold">Vehicle</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Vehicle Type" className={inputClass}
                                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} />
                            <input placeholder="Vehicle Number" className={inputClass}
                                onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
                            <input placeholder="RC Number" className={inputClass}
                                onChange={(e) => setForm({ ...form, rc_number: e.target.value })} />
                            <input placeholder="License Number" className={inputClass}
                                onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
                        </div>
                    </div>

                    {/* BANK */}
                    <div className={sectionClass}>
                        <h3 className="font-semibold">Bank Details</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Bank Name" className={inputClass}
                                onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                            <input placeholder="Account Number" className={inputClass}
                                onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                            <input placeholder="IFSC" className={inputClass}
                                onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })} />
                            <input placeholder="UPI ID" className={inputClass}
                                onChange={(e) => setForm({ ...form, upi_id: e.target.value })} />
                        </div>
                    </div>

                    {/* DOCUMENTS */}
                    <div className={sectionClass}>
                        <h3 className="font-semibold">Documents</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <FileUpload label="Profile Image"
                                value={form.profile_image}
                                onChange={(e: any) => setForm({ ...form, profile_image: e.target.files[0] })}
                                onRemove={() => setForm({ ...form, profile_image: null })} />

                            <FileUpload label="Aadhar"
                                value={form.aadhar_doc}
                                onChange={(e: any) => setForm({ ...form, aadhar_doc: e.target.files[0] })}
                                onRemove={() => setForm({ ...form, aadhar_doc: null })} />

                            <FileUpload label="PAN"
                                value={form.pan_card}
                                onChange={(e: any) => setForm({ ...form, pan_card: e.target.files[0] })}
                                onRemove={() => setForm({ ...form, pan_card: null })} />

                            <FileUpload label="License"
                                value={form.license_doc}
                                onChange={(e: any) => setForm({ ...form, license_doc: e.target.files[0] })}
                                onRemove={() => setForm({ ...form, license_doc: null })} />

                            <FileUpload
                                label="Video KYC"
                                value={form.video_kyc}
                                onChange={(e: any) =>
                                    setForm({ ...form, video_kyc: e.target.files[0] })
                                }
                                onRemove={() => setForm({ ...form, video_kyc: null })}
                            />

                            <FileUpload
                                label="RC Document"
                                value={form.rc_doc}
                                onChange={(e: any) =>
                                    setForm({ ...form, rc_doc: e.target.files[0] })
                                }
                                onRemove={() => setForm({ ...form, rc_doc: null })}
                            />
                        </div>
                    </div>

                </div>

                {/* Error */}
                {apiErrors && (
                    <p className="text-red-500 mt-2 text-end px-6">
                        {apiErrors}
                    </p>
                )}


                {/* FOOTER */}
                <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
                    <button
                        disabled={loading}
                        onClick={handleClose} className="px-4 py-2 border rounded-lg">
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        Create Agent
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateAgentModal;