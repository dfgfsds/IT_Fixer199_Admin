import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader } from "lucide-react";
import { removeEmptyFields } from "../../utils/removeEmptyFields ";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";


interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editVendor: any;
}

const AddVendorModal: React.FC<Props> = ({
    show,
    onClose,
    onSuccess,
    editVendor,
}) => {
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState("");

    const [vendor, setVendor] = useState({
        name: "",
        gst: "",
        address: "",
        email: "",
        phone_number: "",
        alternate_number: "",
        account_number: "",
        ifsc: "",
        bank_name: "",
        account_holder_name: "",
        branch: "",
        contact_person: "",
    });

    const initialState = {
        name: "",
        gst: "",
        address: "",
        email: "",
        phone_number: "",
        alternate_number: "",
        account_number: "",
        ifsc: "",
        bank_name: "",
        account_holder_name: "",
        branch: "",
        contact_person: "",
    };

    const handleClose = () => {
        setVendor(initialState);
        setApiErrors("");
        onClose();
    };

    // 🔹 SET EDIT DATA
    useEffect(() => {
        if (editVendor) {
            setVendor({
                name: editVendor.name || "",
                gst: editVendor.gst || "",
                address: editVendor.address || "",
                email: editVendor.email || "",
                phone_number: editVendor.phone_number || "",
                alternate_number: editVendor.alternate_number || "",
                account_number: editVendor.account_number || "",
                ifsc: editVendor.ifsc || "",
                bank_name: editVendor.bank_name || "",
                account_holder_name: editVendor.account_holder_name || "",
                branch: editVendor.branch || "",
                contact_person: editVendor.contact_person || "",
            });
        }
    }, [editVendor]);

    // 🔹 SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiErrors("");
        try {
            setLoading(true);
            const cleaned = removeEmptyFields(vendor);
            if (editVendor) {
                await axiosInstance.put(
                    `${Api.vendor}${editVendor.id}/`,
                    cleaned
                );
            } else {
                await axiosInstance.post(`${Api.vendor}`, cleaned);
            }
            onSuccess();
            handleClose();
        } catch (error: any) {
            setApiErrors(extractErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">

                {/* HEADER */}
                <div className="flex justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {editVendor ? "Edit Supplier" : "Add Supplier"}
                    </h2>

                    <button
                        onClick={handleClose}
                    >×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* NAME + GST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                value={vendor.name}
                                onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Vendor Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST
                            </label>
                            <input
                                value={vendor.gst}
                                onChange={(e) => setVendor({ ...vendor, gst: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="GST Number"
                            />
                        </div>
                    </div>

                    {/* EMAIL + PHONE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                value={vendor.email}
                                onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                value={vendor.phone_number}
                                onChange={(e) => setVendor({ ...vendor, phone_number: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="9876543210"
                            />
                        </div>
                    </div>

                    {/* ALT + CONTACT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alternate Number
                            </label>
                            <input
                                value={vendor.alternate_number}
                                onChange={(e) => setVendor({ ...vendor, alternate_number: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Person
                            </label>
                            <input
                                value={vendor.contact_person}
                                onChange={(e) => setVendor({ ...vendor, contact_person: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            value={vendor.address}
                            onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Enter address..."
                        />
                    </div>

                    {/* BANK DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Account Number"
                            value={vendor.account_number}
                            onChange={(e) => setVendor({ ...vendor, account_number: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />

                        <input
                            placeholder="IFSC"
                            value={vendor.ifsc}
                            onChange={(e) => setVendor({ ...vendor, ifsc: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />

                        <input
                            placeholder="Bank Name"
                            value={vendor.bank_name}
                            onChange={(e) => setVendor({ ...vendor, bank_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />

                        <input
                            placeholder="Branch"
                            value={vendor.branch}
                            onChange={(e) => setVendor({ ...vendor, branch: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />

                        <input
                            placeholder="Account Holder Name"
                            value={vendor.account_holder_name}
                            onChange={(e) =>
                                setVendor({ ...vendor, account_holder_name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* ERROR */}
                    {apiErrors && (
                        <p className="text-red-500 text-sm text-right">{apiErrors}</p>
                    )}

                    {/* BUTTONS */}
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
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader size={16} className="animate-spin" />
                                    Saving...
                                </span>
                            ) : editVendor ? (
                                "Update Supplier"
                            ) : (
                                "Add Supplier"
                            )}
                        </button>
                    </div>
                </form>



            </div>
        </div>
    );
};

export default AddVendorModal;