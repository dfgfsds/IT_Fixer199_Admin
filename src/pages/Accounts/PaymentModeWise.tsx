import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";

const getDefaultDates = () => {
  const today = new Date();
  const end = today.toISOString().split("T")[0];

  const past = new Date();
  past.setDate(past.getDate() - 7);

  const start = past.toISOString().split("T")[0];

  return { start, end };
};

const PaymentModeWise: React.FC = () => {
  const defaultDates = getDefaultDates();

  const [filters, setFilters] = useState({
    start_date: defaultDates.start,
    end_date: defaultDates.end,
    platform: "WHATSAPP",
    payment_status_filter: "FULLY_PAID",
  });

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 API CALL
  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        Api.paymentModeWise,
        { params: filters }
      );

      setData(res.data?.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  // 📥 Excel Download
  const handleDownload = () => {
    if (!data?.report?.length) return;

    const rows: any[] = [];

    data.report.forEach((day: any, index: number) => {
      if (day.payment_modes.length === 0) {
        rows.push({
          "S.No": index + 1,
          Date: day.date,
          "Payment Mode": "-",
          Amount: 0,
          Refund: 0,
          Transactions: 0,
        });
      } else {
        day.payment_modes.forEach((pm: any) => {
          rows.push({
            "S.No": rows.length + 1,
            Date: day.date,
            "Payment Mode": pm.payment_method,
            Amount: pm.total_amount,
            Refund: pm.total_refund,
            Transactions: pm.transaction_count,
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Mode Report");

    XLSX.writeFile(wb, "Payment_Mode_Report.xlsx");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🔥 HEADER */}
      <div className="bg-white p-5 rounded-2xl shadow flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Payment Mode Wise Report
          </h2>
          <p className="text-sm text-gray-500">
            Analyze revenue by payment methods
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Date */}
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters({ ...filters, start_date: e.target.value })
            }
            className="border p-2 rounded-lg"
          />

          <input
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters({ ...filters, end_date: e.target.value })
            }
            className="border p-2 rounded-lg"
          />

          {/* Platform */}
          <select
            value={filters.platform}
            onChange={(e) =>
              setFilters({ ...filters, platform: e.target.value })
            }
            className="border p-2 rounded-lg"
          >
            <option value="WHATSAPP">WHATSAPP</option>
            <option value="OWN_PLATFORM">OWN PLATFORM</option>
            <option value="SHOP">SHOP</option>
          </select>

          {/* Payment Status */}
          {/* <select
            value={filters.payment_status_filter}
            onChange={(e) =>
              setFilters({
                ...filters,
                payment_status_filter: e.target.value,
              })
            }
            className="border p-2 rounded-lg"
          >
            <option value="FULLY_PAID">FULLY PAID</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          </select> */}

          {/* Download */}
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            ⬇ Excel
          </button>
        </div>
      </div>

      {/* 🔥 SUMMARY */}
      {/* {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <h3 className="text-xl font-bold">
              {data.summary.total_orders}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Revenue</p>
            <h3 className="text-xl font-bold text-green-600">
              ₹ {data.summary.total_revenue}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Refund</p>
            <h3 className="text-xl font-bold text-red-500">
              ₹ {data.summary.total_refund_amount}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Fully Paid</p>
            <h3 className="text-xl font-bold text-blue-600">
              {data.summary.fully_paid_orders}
            </h3>
          </div>
        </div>
      )} */}

      {/* 📊 TABLE */}
      <div className="mt-6 bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">S.No</th>
              <th className="p-3">Date</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Refund</th>
              <th className="p-3">Transactions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : !data?.report?.length ? (
              <tr>
                <td colSpan={6} className="text-center p-6">
                  No Data
                </td>
              </tr>
            ) : (
              data.report.flatMap((day: any, index: number) => {
                if (day.payment_modes.length === 0) {
                  return [
                    <tr key={index}>
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{day.date}</td>
                      <td className="p-3">-</td>
                      <td className="p-3">0</td>
                      <td className="p-3">0</td>
                      <td className="p-3">0</td>
                    </tr>,
                  ];
                }

                return day.payment_modes.map((pm: any, i: number) => (
                  <tr key={`${index}-${i}`}>
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{day.date}</td>
                    <td className="p-3 font-medium">
                      {pm.payment_method}
                    </td>
                    <td className="p-3 text-green-600">
                      ₹ {pm.total_amount}
                    </td>
                    <td className="p-3 text-red-500">
                      ₹ {pm.total_refund}
                    </td>
                    <td className="p-3">
                      {pm.transaction_count}
                    </td>
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentModeWise;