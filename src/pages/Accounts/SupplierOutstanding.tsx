import React, { useEffect, useState } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";
import Api from "../../api-endpoints/ApiUrls";
import axiosInstance from "../../configs/axios-middleware";

interface Vendor {
  label: string;
  value: string;
}

interface ReportData {
  vendor_id: string;
  vendor_name: string;
  total_purchase_amount: number;
  total_paid_amount: number;
  total_return_credit: number;
  outstanding_balance: number;
}

const SupplierOutstanding: React.FC = () => {
  const [vendorOptions, setVendorOptions] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch Vendors
  const fetchVendors = async () => {
    try {
      const res = await axiosInstance.get(`${Api.vendor}?size=10000`);

      const options = res.data?.vendors?.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      setVendorOptions(options || []);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };

  // 🔥 Fetch Report
  // const fetchReport = async (vendorId: string) => {
  //   try {
  //     setLoading(true);

  //     const res = await axiosInstance.get(Api.supplierOutstanding, {
  //       params: { vendor_id: vendorId },
  //     });

  //     setData(res.data?.data || []);
  //   } catch (err) {
  //     console.error("Report fetch error:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchReport = async (vendorId: string = "") => {
  try {
    setLoading(true);

    const res = await axiosInstance.get(Api.supplierOutstanding, {
      params: { vendor_id: vendorId }, // "" na kuda pogum
    });

    setData(res.data?.data || []);
  } catch (err) {
    console.error("Report fetch error:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchVendors();
  fetchReport(""); // 🔥 initial load
  
}, []);
  // 🔥 Vendor Change
  // const handleVendorChange = (selected: any) => {
  //   setSelectedVendor(selected);
  //   if (selected?.value) {
  //     fetchReport(selected.value);
  //   } else {
  //     setData([]);
  //   }
  // };
  const handleVendorChange = (selected: any) => {
  setSelectedVendor(selected);

  // ✅ always call API
  fetchReport(selected?.value || "");
};

  // 📥 Excel Download
  const handleDownload = () => {
    if (!data.length) return;

    const formatted = data.map((item, index) => ({
      "S.No": index + 1,
      "Vendor Name": item.vendor_name,
      "Total Purchase": item.total_purchase_amount,
      "Total Paid": item.total_paid_amount,
      "Return Credit": item.total_return_credit,
      "Outstanding Balance": item.outstanding_balance,
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Supplier Outstanding");

    XLSX.writeFile(wb, "Supplier_Outstanding_Report.xlsx");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🔥 HEADER */}
      <div className="bg-white p-5 rounded-2xl shadow flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Supplier Outstanding Report
          </h2>
          <p className="text-sm text-gray-500">
            View vendor-wise outstanding balances
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Vendor Select */}
          <div className="w-64">
            <Select
              options={vendorOptions}
              value={selectedVendor}
              onChange={handleVendorChange}
              placeholder="Select Vendor"
              isClearable
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!data.length}
            className={`px-5 py-2 rounded-xl text-white shadow ${
              data.length
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            ⬇ Download Excel
          </button>
        </div>
      </div>

      {/* 📊 TABLE */}
      <div className="mt-6 bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 text-center">S.No</th>
              <th className="p-3">Vendor Name</th>
              <th className="p-3">Total Purchase</th>
              <th className="p-3">Total Paid</th>
              <th className="p-3">Return Credit</th>
              <th className="p-3">Outstanding</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">
                  Select a vendor to view report
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center font-medium">
                    {index + 1}
                  </td>

                  <td className="p-3 font-semibold text-gray-700">
                    {item.vendor_name}
                  </td>

                  <td className="p-3 text-green-600 font-semibold">
                    ₹ {item.total_purchase_amount.toLocaleString()}
                  </td>

                  <td className="p-3 text-blue-600 font-semibold">
                    ₹ {item.total_paid_amount.toLocaleString()}
                  </td>

                  <td className="p-3 text-yellow-600 font-semibold">
                    ₹ {item.total_return_credit.toLocaleString()}
                  </td>

                  <td className="p-3 text-red-600 font-bold">
                    ₹ {item.outstanding_balance.toLocaleString()}
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

export default SupplierOutstanding;