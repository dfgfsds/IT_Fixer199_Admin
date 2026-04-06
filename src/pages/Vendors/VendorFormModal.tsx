// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";
// import { Loader } from "lucide-react";
// import { removeEmptyFields } from "../../utils/removeEmptyFields ";
// import { extractErrorMessage } from "../../utils/extractErrorMessage ";


// interface Props {
//     show: boolean;
//     onClose: () => void;
//     onSuccess: () => void;
//     editVendor: any;
// }

// const AddVendorModal: React.FC<Props> = ({
//     show,
//     onClose,
//     onSuccess,
//     editVendor,
// }) => {
//     const [loading, setLoading] = useState(false);
//     const [apiErrors, setApiErrors] = useState("");

//     const [vendor, setVendor] = useState({
//         name: "",
//         gst: "",
//         address: "",
//         email: "",
//         phone_number: "",
//         alternate_number: "",
//         contact_person: "",
//         bank_details: [
//             {
//                 account_number: "",
//                 ifsc: "",
//                 bank_name: "",
//                 account_holder_name: "",
//                 branch: "",
//             },
//         ],
//     });

//     const initialState = {
//         name: "",
//         gst: "",
//         address: "",
//         email: "",
//         phone_number: "",
//         alternate_number: "",
//         bank_details: [
//             {
//                 account_number: "",
//                 ifsc: "",
//                 bank_name: "",
//                 account_holder_name: "",
//                 branch: "",
//             },
//         ],
//         contact_person: "",
//     };

//     const handleClose = () => {
//         setVendor(initialState);
//         setApiErrors("");
//         onClose();
//     };

//     const addBank = () => {
//         setVendor({
//             ...vendor,
//             bank_details: [
//                 ...vendor.bank_details,
//                 {
//                     account_number: "",
//                     ifsc: "",
//                     bank_name: "",
//                     account_holder_name: "",
//                     branch: "",
//                 },
//             ],
//         });
//     };

//     const removeBank = (i: number) => {
//         const updated = [...vendor.bank_details];
//         updated.splice(i, 1);
//         setVendor({ ...vendor, bank_details: updated });
//     };

//     const handleBankChange = (i: number, field: string, value: string) => {
//         const updated: any = [...vendor.bank_details];
//         updated[i][field] = value;

//         setVendor({ ...vendor, bank_details: updated });
//     };

//     // 🔹 SET EDIT DATA
//     useEffect(() => {
//         if (editVendor) {
//             setVendor({
//                 name: editVendor.name || "",
//                 gst: editVendor.gst || "",
//                 address: editVendor.address || "",
//                 email: editVendor.email || "",
//                 phone_number: editVendor.phone_number || "",
//                 alternate_number: editVendor.alternate_number || "",
//                 contact_person: editVendor.contact_person || "",
//                 bank_details:
//                     editVendor.bank_details?.length > 0
//                         ? editVendor.bank_details
//                         : [
//                             {
//                                 account_number: "",
//                                 ifsc: "",
//                                 bank_name: "",
//                                 account_holder_name: "",
//                                 branch: "",
//                             },
//                         ],
//             });
//         }
//     }, [editVendor]);

//     // 🔹 SUBMIT
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setApiErrors("");
//         const cleaned = {
//             ...vendor,
//             bank_details: vendor.bank_details.filter(
//                 (b: any) => b.account_number && b.ifsc
//             ),
//         };

//         try {
//             setLoading(true);
//             // const cleaned = removeEmptyFields(vendor);
//             if (editVendor) {
//                 await axiosInstance.put(
//                     `${Api.vendor}${editVendor.id}/`,
//                     cleaned
//                 );
//             } else {
//                 await axiosInstance.post(`${Api.vendor}`, cleaned);
//             }
//             onSuccess();
//             handleClose();
//         } catch (error: any) {
//             setApiErrors(extractErrorMessage(error));
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!show) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">

//                 {/* HEADER */}
//                 <div className="flex justify-between mb-6">
//                     <h2 className="text-xl font-bold">
//                         {editVendor ? "Edit Supplier" : "Add Supplier"}
//                     </h2>

//                     <button
//                         onClick={handleClose}
//                     >×</button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">

//                     {/* NAME + GST */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Name
//                             </label>
//                             <input
//                                 value={vendor.name}
//                                 onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                                 placeholder="Vendor Name"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 GST
//                             </label>
//                             <input
//                                 value={vendor.gst}
//                                 onChange={(e) => setVendor({ ...vendor, gst: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                                 placeholder="GST Number"
//                             />
//                         </div>
//                     </div>

//                     {/* EMAIL + PHONE */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email
//                             </label>
//                             <input
//                                 type="email"
//                                 value={vendor.email}
//                                 onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                                 placeholder="email@example.com"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Phone
//                             </label>
//                             <input
//                                 value={vendor.phone_number}
//                                 onChange={(e) => setVendor({ ...vendor, phone_number: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                                 placeholder="9876543210"
//                             />
//                         </div>
//                     </div>

//                     {/* ALT + CONTACT */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Alternate Number
//                             </label>
//                             <input
//                                 value={vendor.alternate_number}
//                                 onChange={(e) => setVendor({ ...vendor, alternate_number: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Contact Person
//                             </label>
//                             <input
//                                 value={vendor.contact_person}
//                                 onChange={(e) => setVendor({ ...vendor, contact_person: e.target.value })}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                             />
//                         </div>
//                     </div>

//                     {/* ADDRESS */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Address
//                         </label>
//                         <textarea
//                             rows={3}
//                             value={vendor.address}
//                             onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
//                             placeholder="Enter address..."
//                         />
//                     </div>

//                     {/* BANK DETAILS */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-4">
//                             <div className="flex justify-between items-center">
//                                 <h3 className="font-semibold">Bank Details</h3>

//                                 <button type="button" onClick={addBank} className="text-orange-600 text-sm">
//                                     + Add Bank
//                                 </button>
//                             </div>

//                             {vendor.bank_details.map((bank: any, i: number) => (
//                                 <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">

//                                     <input
//                                         placeholder="Account Number"
//                                         value={bank.account_number}
//                                         onChange={(e) => handleBankChange(i, "account_number", e.target.value)}
//                                         className="input"
//                                     />

//                                     <input
//                                         placeholder="IFSC"
//                                         value={bank.ifsc}
//                                         onChange={(e) => handleBankChange(i, "ifsc", e.target.value)}
//                                         className="input"
//                                     />

//                                     <input
//                                         placeholder="Bank Name"
//                                         value={bank.bank_name}
//                                         onChange={(e) => handleBankChange(i, "bank_name", e.target.value)}
//                                         className="input"
//                                     />

//                                     <input
//                                         placeholder="Branch"
//                                         value={bank.branch}
//                                         onChange={(e) => handleBankChange(i, "branch", e.target.value)}
//                                         className="input"
//                                     />

//                                     <input
//                                         placeholder="Account Holder Name"
//                                         value={bank.account_holder_name}
//                                         onChange={(e) =>
//                                             handleBankChange(i, "account_holder_name", e.target.value)
//                                         }
//                                         className="input"
//                                     />

//                                     <button
//                                         type="button"
//                                         onClick={() => removeBank(i)}
//                                         className="text-red-500 text-sm"
//                                     >
//                                         Remove
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* ERROR */}
//                     {apiErrors && (
//                         <p className="text-red-500 text-sm text-right">{apiErrors}</p>
//                     )}

//                     {/* BUTTONS */}
//                     <div className="flex justify-end gap-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             className="px-4 py-2 border rounded-lg"
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-4 py-2 bg-orange-600 text-white rounded-lg"
//                         >
//                             {loading ? (
//                                 <span className="flex items-center gap-2">
//                                     <Loader size={16} className="animate-spin" />
//                                     Saving...
//                                 </span>
//                             ) : editVendor ? (
//                                 "Update Supplier"
//                             ) : (
//                                 "Add Supplier"
//                             )}
//                         </button>
//                     </div>
//                 </form>



//             </div>
//         </div>
//     );
// };

// export default AddVendorModal;

import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import { Loader, X, Plus, Trash2 } from "lucide-react";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editVendor: any;
}

const AddVendorModal: React.FC<Props> = ({ show, onClose, onSuccess, editVendor }) => {
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState("");

    const initialState = {
        name: "",
        gst: "",
        address: "",
        email: "",
        phone_number: "",
        alternate_number: "",
        contact_person: "",
        bank_details: [
            { account_number: "", ifsc: "", bank_name: "", account_holder_name: "", branch: "" },
        ],
    };

    const [vendor, setVendor] = useState(initialState);

    useEffect(() => {
        if (editVendor) {
            setVendor({
                name: editVendor.name || "",
                gst: editVendor.gst || "",
                address: editVendor.address || "",
                email: editVendor.email || "",
                phone_number: editVendor.phone_number || "",
                alternate_number: editVendor.alternate_number || "",
                contact_person: editVendor.contact_person || "",
                bank_details: editVendor.bank_details?.length > 0 
                    ? editVendor.bank_details 
                    : initialState.bank_details,
            });
        }
    }, [editVendor, show]);

    const handleClose = () => {
        setVendor(initialState);
        setApiErrors("");
        onClose();
    };

    const handleBankChange = (i: number, field: string, value: string) => {
        const updated: any = [...vendor.bank_details];
        updated[i][field] = value;
        setVendor({ ...vendor, bank_details: updated });
    };

    const addBank = () => {
        setVendor({
            ...vendor,
            bank_details: [...vendor.bank_details, { ...initialState.bank_details[0] }],
        });
    };

    const removeBank = (i: number) => {
        const updated = [...vendor.bank_details];
        updated.splice(i, 1);
        setVendor({ ...vendor, bank_details: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiErrors("");
        const cleaned = {
            ...vendor,
            bank_details: vendor.bank_details.filter(b => b.account_number && b.ifsc),
        };

        try {
            setLoading(true);
            if (editVendor) {
                await axiosInstance.put(`${Api.vendor}${editVendor.id}/`, cleaned);
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                
                {/* HEADER */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editVendor ? "Edit Supplier Details" : "Create New Supplier"}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* FORM BODY */}
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 flex-1 no-scrollbar">
                    
                    {/* BASIC INFORMATION */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Vendor Name" value={vendor.name} onChange={(v:any) => setVendor({...vendor, name: v})} placeholder="Enter name" required />
                            <InputField label="GST Number" value={vendor.gst} onChange={(v:any) => setVendor({...vendor, gst: v})} placeholder="Ex: 22AAAAA0000A1Z5" />
                            <InputField label="Email Address" type="email" value={vendor.email} onChange={(v:any) => setVendor({...vendor, email: v})} placeholder="vendor@mail.com" />
                            <InputField label="Contact Person" value={vendor.contact_person} onChange={(v:any) => setVendor({...vendor, contact_person: v})} placeholder="Person Name" />
                            <InputField label="Phone Number" value={vendor.phone_number} onChange={(v:any) => setVendor({...vendor, phone_number: v})} placeholder="98765 43210" />
                            <InputField label="Alternate Number" value={vendor.alternate_number} onChange={(v:any) => setVendor({...vendor, alternate_number: v})} placeholder="Optional" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">Primary Address</label>
                            <textarea 
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
                                value={vendor.address}
                                onChange={(e) => setVendor({...vendor, address: e.target.value})}
                                placeholder="Enter full address here..."
                            />
                        </div>
                    </div>

                    {/* BANKING DETAILS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Bank Accounts</h3>
                            <button type="button" onClick={addBank} className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all border border-blue-200">
                                <Plus size={14} /> Add Bank Account
                            </button>
                        </div>

                        <div className="space-y-4">
                            {vendor.bank_details.map((bank, i) => (
                                <div key={i} className="relative p-5 border border-gray-200 rounded-xl bg-gray-50/50 group hover:border-blue-300 transition-colors">
                                    {vendor.bank_details.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeBank(i)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-md transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mr-8">
                                        <InputField label="Account Number" value={bank.account_number} onChange={(v:any) => handleBankChange(i, "account_number", v)} placeholder="Account No" dense />
                                        <InputField label="IFSC Code" value={bank.ifsc} onChange={(v:any) => handleBankChange(i, "ifsc", v)} placeholder="IFSC Code" dense />
                                        <InputField label="Bank Name" value={bank.bank_name} onChange={(v:any) => handleBankChange(i, "bank_name", v)} placeholder="Bank Name" dense />
                                        <InputField label="Account Holder" value={bank.account_holder_name} onChange={(v:any) => handleBankChange(i, "account_holder_name", v)} placeholder="Holder Name" dense />
                                        <InputField label="Branch" value={bank.branch} onChange={(v:any) => handleBankChange(i, "branch", v)} placeholder="Branch Name" dense />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* FOOTER */}
                <div className="p-6 border-t bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm">
                        {apiErrors && <span className="text-red-600 font-medium">Error: {apiErrors}</span>}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={handleClose} type="button" className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="flex-1 md:flex-none px-8 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : null}
                            {loading ? "Processing..." : editVendor ? "Update Supplier" : "Create Supplier"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for Inputs
const InputField = ({ label, value, onChange, placeholder, type = "text", required = false, dense = false }: any) => (
    <div className="space-y-1">
        <label className={`block font-semibold text-gray-600 ${dense ? 'text-[11px]' : 'text-xs'}`}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm ${dense ? 'py-2' : 'py-2.5'}`}
        />
    </div>
);

export default AddVendorModal;