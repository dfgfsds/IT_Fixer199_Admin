import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAuth } from "../../contexts/AuthContext";

const CustomerOutstanding: React.FC = () => {

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hubs, setHubs] = useState<any[]>([]);
    const { user } = useAuth();
    console.log(hubs)
    const [filters, setFilters] = useState({
        customer_mobile: "",
        order_id: "",
        user_id: "",
        hub_id: "",
        platform: "",
        type: "",
        start_date: "",
        end_date: ""
    });

    // 🔥 FETCH DATA
    const fetchData = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            // 🔥 ADMIN na hub_id remove pannunga
            if (user?.role === "ADMIN") {
                params.delete("hub_id");
            }

            // 🔥 other roles ku auto add
            if (user?.role !== "ADMIN") {
                if (user?.hub_id) {
                    params.set("hub_id", user.hub_id); // set use pannunga (override)
                }
            }

            const res = await axiosInstance.get(
                `${Api?.customerOutstanding}?${params.toString()}`
            );

            setData(res?.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchHubs = async () => {
        try {
            const res = await axiosInstance.get(`${Api.allHubs}`);
            const hubOptions = res.data?.hubs?.map((h: any) => ({ label: h.name, value: h.id })) || [];
            setHubs(hubOptions);
            if (hubOptions.length > 0 && !filters.hub_id) {
                setFilters(prev => ({ ...prev, hub_id: hubOptions[0].value }));
            }
        } catch (err) {
            console.error("Error fetching hubs:", err);
        }
    };

    useEffect(() => {
        fetchHubs();
    }, []);

    const handleClear = () => {
        const reset = {
            customer_mobile: "",
            order_id: "",
            user_id: "",
            hub_id: "",
            platform: "",
            type: "",
            start_date: "",
            end_date: ""
        };
        setFilters(reset);
        setTimeout(() => fetchData(), 0);
    };

    const exportExcel = () => {
        if (!data.length) return;

        const rows = data?.map((item: any, index: number) => ({
            "S.No": index + 1,
            "Order ID": item.order_id,
            "Customer Name": item.customer_name,
            "Mobile": item.customer_mobile,
            "Order Type": item.order_type,
            "Platform": item.order_platform,
            "Total Amount": item.total_amount,
            "Paid Amount": item.paid_amount,
            "Refunded": item.refunded,
            "Outstanding": item.outstanding,
            "Date": item.created_at?.split("T")[0]
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Outstanding");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(blob, "Customer_Outstanding_Report.xlsx");
    };

    return (
        <div className="space-y-4">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Customer Outstanding Report</h2>

                <button
                    onClick={exportExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                    Download Excel
                </button>
            </div>

            {/* 🔥 FILTER SECTION */}
            <div className="bg-white p-4 rounded-2xl shadow grid grid-cols-4 gap-4">

                {/* Customer Mobile */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Customer Mobile</label>
                    <input
                        type="text"
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.customer_mobile}
                        onChange={(e) =>
                            setFilters({ ...filters, customer_mobile: e.target.value })
                        }
                    />
                </div>

                {/* Order ID */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Order ID</label>
                    <input
                        type="text"
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.order_id}
                        onChange={(e) =>
                            setFilters({ ...filters, order_id: e.target.value })
                        }
                    />
                </div>

                {/* User ID */}
                {/* <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500">User ID</label>
        <input
            type="text"
            className="border p-2 rounded-xl bg-gray-50"
            value={filters.user_id}
            onChange={(e) =>
                setFilters({ ...filters, user_id: e.target.value })
            }
        />
    </div> */}

                {/* Hub ID */}
                {/* <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Hub ID</label>
                    <input
                        type="text"
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.hub_id}
                        onChange={(e) =>
                            setFilters({ ...filters, hub_id: e.target.value })
                        }
                    />
                </div> */}
                {(user?.role !== "HUB_MANAGER" && user?.role !== "MANAGER") && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Hub</label>
                        <select
                            className="border p-2 rounded-xl bg-gray-50"
                            value={filters.hub_id}
                            onChange={(e) =>
                                setFilters({ ...filters, hub_id: e.target.value })
                            }
                        >
                            <option value="">All Hubs</option>
                            {hubs?.map((h: any) => (
                                <option key={h?.value} value={h?.value}>{h?.label}</option>
                            ))}
                        </select>
                    </div>
                )}


                {/* Platform */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Platform</label>
                    <select
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.platform}
                        onChange={(e) =>
                            setFilters({ ...filters, platform: e.target.value })
                        }
                    >
                        <option value="">All Platforms</option>
                        <option value="WHATSAPP">WHATSAPP</option>
                        <option value="OWN_PLATFORM">OWN PLATFORM</option>
                        <option value="SHOP">SHOP</option>
                    </select>
                </div>

                {/* Type */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Order Type</label>
                    <select
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.type}
                        onChange={(e) =>
                            setFilters({ ...filters, type: e.target.value })
                        }
                    >
                        <option value="">All Types</option>
                        <option value="B2C">B2C</option>
                        <option value="B2B">B2B</option>
                    </select>
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Start Date</label>
                    <input
                        type="date"
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.start_date}
                        onChange={(e) =>
                            setFilters({ ...filters, start_date: e.target.value })
                        }
                    />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">End Date</label>
                    <input
                        type="date"
                        className="border p-2 rounded-xl bg-gray-50"
                        value={filters.end_date}
                        onChange={(e) =>
                            setFilters({ ...filters, end_date: e.target.value })
                        }
                    />
                </div>

                {/* ACTIONS */}
                <div className="col-span-4 flex gap-2 mt-2">
                    {/* <button
                        onClick={fetchData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                        Apply
                    </button> */}

                    <button
                        onClick={handleClear}
                        className="bg-gray-200 px-4 py-2 rounded-xl"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* 📊 TABLE */}
            <div className="bg-white rounded-2xl shadow overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">S.No</th>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Customer</th>
                            {/* <th className="p-3">Mobile</th> */}
                            <th className="p-3">Type</th>
                            <th className="p-3">Platform</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Paid</th>
                            <th className="p-3">Refund</th>
                            <th className="p-3 text-red-500">Outstanding</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="text-center p-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length ? (
                            data.map((item, index) => (
                                <tr key={item.order_id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 text-xs">{item.order_id}</td>
                                    <td className="p-3">
                                        {new Date(item.created_at).toLocaleDateString("en-IN")}
                                    </td>
                                    <td className="p-3 font-semibold flex justify-center">
                                        <div>
                                            <p className="text-gray-900 capitalize">{item.customer_name}</p>
                                            <p className="text-gray-400 text-xs">{item.customer_mobile}</p>
                                        </div>
                                    </td>
                                    {/* <td className="p-3">
                                        {item.customer_mobile}
                                        </td> */}
                                    <td className="p-3">{item.order_type}</td>
                                    <td className="p-3">{item.order_platform}</td>

                                    <td className="p-3 text-right">
                                        ₹{Number(item.total_amount).toLocaleString("en-IN")}
                                    </td>

                                    <td className="p-3 text-right text-green-600">
                                        ₹{Number(item.paid_amount).toLocaleString("en-IN")}
                                    </td>

                                    <td className="p-3 text-right text-orange-500">
                                        ₹{Number(item.refunded).toLocaleString("en-IN")}
                                    </td>

                                    <td className="p-3 text-right font-bold text-red-600">
                                        ₹{Number(item.outstanding).toLocaleString("en-IN")}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="text-center p-6 text-gray-400">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerOutstanding;