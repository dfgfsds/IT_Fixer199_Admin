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

const ProductWise: React.FC = () => {
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

      const res = await axiosInstance.get(Api.productWise, {
        params: filters,
      });

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

    data.report.forEach((day: any) => {
      if (day.products.length === 0) {
        rows.push({
          "S.No": rows.length + 1,
          Date: day.date,
          Product: "-",
          Quantity: 0,
          Amount: 0,
          Refund: 0,
          Orders: 0,
        });
      } else {
        day.products.forEach((p: any) => {
          rows.push({
            "S.No": rows.length + 1,
            Date: day.date,
            Product: p.product_name,
            Quantity: p.quantity_sold,
            Amount: p.total_amount,
            Refund: p.total_refund,
            Orders: p.order_count,
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Report");

    XLSX.writeFile(wb, "Product_Wise_Report.xlsx");
  };

  const tableRows: any[] = [];

let serial = 1;

data?.report?.forEach((day: any) => {
  if (!day.products || day.products.length === 0) {
    tableRows.push({
      serial: serial++,
      date: day.date,
      product: "-",
      qty: 0,
      amount: 0,
      refund: 0,
      orders: 0,
    });
  } else {
    day.products.forEach((p: any) => {
      tableRows.push({
        serial: serial++,
        date: day.date,
        product: p.product_name,
        qty: p.quantity_sold,
        amount: p.total_amount,
        refund: p.total_refund,
        orders: p.order_count,
      });
    });
  }
});

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🔥 HEADER */}
      <div className="bg-white p-5 rounded-2xl shadow flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Product Wise Report
          </h2>
          <p className="text-sm text-gray-500">
            Analyze product sales performance
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* DATE */}
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

          {/* PLATFORM */}
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

          {/* STATUS */}
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
            <option value="FULLY_PAID">FULLY_PAID</option>
            <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
          </select> */}

          {/* DOWNLOAD */}
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
            <p className="text-gray-500 text-sm">Orders</p>
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
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Refund</th>
              <th className="p-3">Orders</th>
            </tr>
          </thead>

         <tbody>
  {loading ? (
    <tr>
      <td colSpan={7} className="text-center p-6">
        Loading...
      </td>
    </tr>
  ) : tableRows.length === 0 ? (
    <tr>
      <td colSpan={7} className="text-center p-6">
        No Data
      </td>
    </tr>
  ) : (
    tableRows.map((row, index) => (
      <tr key={index} className="border-t hover:bg-gray-50">
        <td className="p-3 text-center font-medium">
          {row.serial}
        </td>
        <td className="p-3">{row.date}</td>
        <td className="p-3">{row.product}</td>
        <td className="p-3">{row.qty}</td>
        <td className="p-3 text-green-600">
          ₹ {row.amount}
        </td>
        <td className="p-3 text-red-500">
          ₹ {row.refund}
        </td>
        <td className="p-3">{row.orders}</td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default ProductWise;