import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";

interface ReportData {
    month: string;
    net_sales: number;
    net_purchase: number;
}

const MonthlyComparison: React.FC = () => {
    const [data, setData] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(false);

    const getDefaultDates = () => {
        const today = new Date();

        const end = today.toISOString().split("T")[0];

        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 1);

        const start = pastDate.toISOString().split("T")[0];

        return { start, end };
    };

    const defaultDates = getDefaultDates();

    const [filters, setFilters] = useState({
        start_date: defaultDates.start,
        end_date: defaultDates.end,
    });

    // const [filters, setFilters] = useState({
    //     start_date: "",
    //     end_date: "",
    // });

    // 🔥 Fetch Data
    const fetchData = async () => {
        if (!filters.start_date || !filters.end_date) return;

        try {
            setLoading(true);

            const res = await axiosInstance.get(
                Api.monthlyComparison,
                {
                    params: {
                        start_date: filters.start_date,
                        end_date: filters.end_date,
                    },
                }
            );

            setData(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching report:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleDownload = () => {
        if (!data.length) return;

        const formattedData = data.map((item, index) => ({
            "S.No": index + 1,
            Month: item.month,
            " Sales": item.net_sales,
            " Purchase": item.net_purchase,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

        XLSX.writeFile(workbook, "Monthly_Comparison_Report.xlsx");
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monthly Comparison</h1>
                    {/* <p className="text-gray-500">Manage and track all service orders</p> */}
                </div>
            </div>


            {/* 🔥 Header */}
            <div className="bg-white p-4 rounded-2xl shadow flex flex-wrap gap-4 items-end justify-between">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="text-sm font-semibold">Start Date</label>
                        <input
                            type="date"
                            className="border p-2 rounded-lg w-full"
                            value={filters.start_date}
                            onChange={(e) =>
                                setFilters({ ...filters, start_date: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">End Date</label>
                        <input
                            type="date"
                            className="border p-2 rounded-lg w-full"
                            value={filters.end_date}
                            onChange={(e) =>
                                setFilters({ ...filters, end_date: e.target.value })
                            }
                        />
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow"
                >
                    ⬇ Download Excel
                </button>
            </div>

            {/* 📊 Table */}
            <div className="mt-6 bg-white rounded-2xl shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">S.No</th>
                            <th className="p-3">Month</th>
                            <th className="p-3">Sales</th>
                            <th className="p-3">Purchase</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="text-center p-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center p-6 text-gray-500">
                                    No Data Found
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-medium">{index + 1}</td>
                                    <td className="p-3">{item.month}</td>
                                    <td className="p-3 text-green-600 font-semibold">
                                        ₹ {item.net_sales.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-blue-600 font-semibold">
                                        ₹ {item.net_purchase.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyComparison;