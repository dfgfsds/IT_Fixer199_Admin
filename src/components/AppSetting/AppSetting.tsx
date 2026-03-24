// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from '../../api-endpoints/ApiUrls';
// import toast from "react-hot-toast";

// interface AppSettings {
//     app_name: string;
//     app_version: string;
//     play_store_url: string;
//     app_store_url: string;
//     support_email: string;
//     support_phone: string;
//     company_name: string;
//     company_address: string;
//     privacy_policy_url: string;
//     terms_and_conditions_url: string;
//     delete_account_url: string;
//     agent_partner_privacy_policy_url: string;
//     agent_partner_terms_and_conditions_url: string;
//     partner_app_version: string;
//     partner_app_play_store_url: string;
//     partner_app_store_url: string;
//     pg_api_key: string;
//     pg_api_secret: string;
//     contact_ambulance: string;
//     contact_police: string;
// }

// const AppSetting: React.FC = () => {
//     const [form, setForm] = useState<AppSettings>({} as AppSettings);
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);

//     useEffect(() => {
//         fetchSettings();
//     }, []);

//     const fetchSettings = async () => {
//         try {
//             setLoading(true);
//             const res = await axiosInstance.get(Api?.appSettings);
//             if (res) {
//                 setForm(res?.data?.data);

//             }
//         } catch (error) {
//             console.error("Fetch settings failed", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         setForm({
//             ...form,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async () => {
//         try {
//             setSaving(true);
//             const updatedApi = await axiosInstance.put(Api?.appSettings, form);
//             if (updatedApi) {
//                 alert("Settings updated successfully");
//                 fetchSettings();
//             }
//         } catch (error: any) {
//             toast.error("Update failed", error)
//             // console.error("Update failed", error);
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) return <p className="p-6">Loading settings...</p>;

//     return (
//         <div className="p-0 space-y-6">

//             <div>
//                 <h1 className="text-2xl font-bold">App Settings</h1>
//                 <p className="text-sm text-gray-500">
//                     Manage application configuration
//                 </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-3 rounded-lg border">

//                 <Input label="App Name" name="app_name" value={form.app_name} onChange={handleChange} />
//                 <Input label="App Version" name="app_version" value={form.app_version} onChange={handleChange} />
//                 <Input label="Play Store URL" name="play_store_url" value={form.play_store_url} onChange={handleChange} />
//                 <Input label="App Store URL" name="app_store_url" value={form.app_store_url} onChange={handleChange} />
//                 <Input label="Support Email" name="support_email" value={form.support_email} onChange={handleChange} />
//                 <Input label="Support Phone" name="support_phone" value={form.support_phone} onChange={handleChange} />
//                 <Input label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} />
//                 <Input label="Company Address" name="company_address" value={form.company_address} onChange={handleChange} />
//                 <Input label="Privacy Policy URL" name="privacy_policy_url" value={form.privacy_policy_url} onChange={handleChange} />
//                 <Input label="Terms URL" name="terms_and_conditions_url" value={form.terms_and_conditions_url} onChange={handleChange} />
//                 <Input label="Delete Account URL" name="delete_account_url" value={form.delete_account_url} onChange={handleChange} />

//                 <Input label="Partner App Version" name="partner_app_version" value={form.partner_app_version} onChange={handleChange} />
//                 <Input label="Partner Play Store URL" name="partner_app_play_store_url" value={form.partner_app_play_store_url} onChange={handleChange} />
//                 <Input label="Partner App Store URL" name="partner_app_store_url" value={form.partner_app_store_url} onChange={handleChange} />

//                 <Input label="Payment API Key" name="pg_api_key" value={form.pg_api_key} onChange={handleChange} />
//                 <Input label="Payment API Secret" name="pg_api_secret" value={form.pg_api_secret} onChange={handleChange} />

//                 <Input label="Ambulance Contact" name="contact_ambulance" value={form.contact_ambulance} onChange={handleChange} />
//                 <Input label="Police Contact" name="contact_police" value={form.contact_police} onChange={handleChange} />

//             </div>

//             <button
//                 onClick={handleSubmit}
//                 disabled={saving}
//                 className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
//             >
//                 {saving ? "Saving..." : "Save Settings"}
//             </button>

//         </div>
//     );
// };

// export default AppSetting;


// const Input = ({ label, name, value, onChange }: any) => (
//     <div>
//         <label className="text-sm font-medium text-gray-700">{label}</label>
//         <input
//             name={name}
//             value={value || ""}
//             onChange={onChange}
//             className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
//         />
//     </div>
// );


import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";

interface AppSettings {
    app_name: string;
    app_version: string;
    play_store_url: string;
    app_store_url: string;
    support_email: string;
    support_phone: string;
    company_name: string;
    company_address: string;

    privacy_policy_url: string;
    terms_and_conditions_url: string;
    delete_account_url: string;

    agent_partner_privacy_policy_url: string;
    agent_partner_terms_and_conditions_url: string;

    partner_app_version: string;
    partner_app_play_store_url: string;
    partner_app_store_url: string;

    pg_api_key: string;
    pg_api_secret: string;

    contact_ambulance: string;
    contact_police: string;
}

const initialState: AppSettings = {
    app_name: "",
    app_version: "",
    play_store_url: "",
    app_store_url: "",
    support_email: "",
    support_phone: "",
    company_name: "",
    company_address: "",

    privacy_policy_url: "",
    terms_and_conditions_url: "",
    delete_account_url: "",

    agent_partner_privacy_policy_url: "",
    agent_partner_terms_and_conditions_url: "",

    partner_app_version: "",
    partner_app_play_store_url: "",
    partner_app_store_url: "",

    pg_api_key: "",
    pg_api_secret: "",

    contact_ambulance: "",
    contact_police: "",
};

const AppSetting: React.FC = () => {
    const [form, setForm] = useState<AppSettings>(initialState);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(Api?.appSettings);

            if (res?.data?.data) {
                setForm({ ...initialState, ...res.data.data }); // 🔥 safe merge
            }
        } catch (error) {
            console.error("Fetch settings failed", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            await axiosInstance.put(Api?.appSettings, form);

            toast.success("Settings updated successfully");
            fetchSettings();
        } catch (error) {
            console.error(error);
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-6">Loading settings...</p>;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">App Settings</h1>
                <p className="text-sm text-gray-500">
                    Manage application configuration
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">

                {/* App Info */}
                <Section title="App Info">
                    <Input label="App Name" name="app_name" value={form.app_name} onChange={handleChange} />
                    <Input label="App Version" name="app_version" value={form.app_version} onChange={handleChange} />
                </Section>

                {/* Store Links */}
                <Section title="Store Links">
                    <Input label="Play Store URL" name="play_store_url" value={form.play_store_url} onChange={handleChange} />
                    <Input label="App Store URL" name="app_store_url" value={form.app_store_url} onChange={handleChange} />
                </Section>

                {/* Support */}
                <Section title="Support">
                    <Input label="Support Email" name="support_email" value={form.support_email} onChange={handleChange} />
                    <Input label="Support Phone" name="support_phone" value={form.support_phone} onChange={handleChange} />
                </Section>

                {/* Company */}
                <Section title="Company Info">
                    <Input label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} />
                    <Input label="Company Address" name="company_address" value={form.company_address} onChange={handleChange} />
                </Section>

                {/* Policies */}
                <Section title="Policies">
                    <Input label="Privacy Policy URL" name="privacy_policy_url" value={form.privacy_policy_url} onChange={handleChange} />
                    <Input label="Terms & Conditions" name="terms_and_conditions_url" value={form.terms_and_conditions_url} onChange={handleChange} />
                    <Input label="Delete Account URL" name="delete_account_url" value={form.delete_account_url} onChange={handleChange} />
                </Section>

                {/* Partner */}
                <Section title="Partner Settings">
                    <Input label="Partner Privacy Policy" name="agent_partner_privacy_policy_url" value={form.agent_partner_privacy_policy_url} onChange={handleChange} />
                    <Input label="Partner Terms" name="agent_partner_terms_and_conditions_url" value={form.agent_partner_terms_and_conditions_url} onChange={handleChange} />
                    <Input label="Partner App Version" name="partner_app_version" value={form.partner_app_version} onChange={handleChange} />
                    <Input label="Partner Play Store URL" name="partner_app_play_store_url" value={form.partner_app_play_store_url} onChange={handleChange} />
                    <Input label="Partner App Store URL" name="partner_app_store_url" value={form.partner_app_store_url} onChange={handleChange} />
                </Section>

                {/* Payment */}
                <Section title="Payment">
                    <Input label="Payment API Key" name="pg_api_key" value={form.pg_api_key} onChange={handleChange} />

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Payment API Secret
                        </label>
                        <input
                            type="password"
                            name="pg_api_secret"
                            value={form.pg_api_secret || ""}
                            onChange={handleChange}
                            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </Section>

                {/* Emergency */}
                <Section title="Emergency Contacts">
                    <Input label="Ambulance Contact" name="contact_ambulance" value={form.contact_ambulance} onChange={handleChange} />
                    <Input label="Police Contact" name="contact_police" value={form.contact_police} onChange={handleChange} />
                </Section>

            </div>

            {/* Save Button */}
            <div className="pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                >
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

        </div>
    );
};

export default AppSetting;

/* ---------- Reusable Components ---------- */

const Section = ({ title, children }: any) => (
    <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-md font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const Input = ({ label, name, value, onChange }: any) => (
    <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
        />
    </div>
);