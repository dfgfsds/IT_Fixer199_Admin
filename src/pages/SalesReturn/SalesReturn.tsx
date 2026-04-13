import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import Api from "../../api-endpoints/ApiUrls";

// Modal.setAppElement("#root");

interface SalesReturnItem {
    id: string;
    product_name: string;
    quantity: string;
    rate: string;
    serial_numbers: string;
    notes: string;
}

interface SalesReturnType {
    id: string;
    return_date: string;
    reason: string;
    status: string;
    sale_order: string;
    items: SalesReturnItem[];
}

const SalesReturn: React.FC = () => {
    const [data, setData] = useState<SalesReturnType[]>([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        status: "",
        sale_order_id: "",
        product_id: "",
    });

    const [selectedRow, setSelectedRow] = useState<SalesReturnType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🔥 FETCH API
    const fetchSalesReturns = async () => {
        try {
            setLoading(true);

            const params: any = {
                page,
                size: pageSize,
                ...filters,
            };

            // remove empty filters
            Object.keys(params).forEach((key) => {
                if (!params[key]) delete params[key];
            });

            const res = await axios.get(Api?.salesReturns, { params });
            console.log("API Response:", res?.data?.data); // Debug log
            setData(res?.data?.data?.sales_returns || []);
            setTotalPages(res.data?.data?.pagination?.total_pages || 1);
            setPagination(res.data?.data?.pagination || null);
        } catch (err) {
            console.error("API Error:", err);
            setData([]); // ❌ blank page avoid
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesReturns();
    }, [page, pageSize, filters]);

    // 🔹 Handlers
    const handlePageChange = (p: number) => setPage(p);
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const handleFilterChange = (e: any) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            start_date: "",
            end_date: "",
            status: "",
            sale_order_id: "",
            product_id: "",
        });
    };

    const openModal = (row: SalesReturnType) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRow(null);
        setIsModalOpen(false);
    };

    return (
        <div className="p-4">

            {/* 🔍 HEADER FILTER */}
            <div className="grid grid-cols-5 gap-3 mb-4">
                <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />

                <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />

                <input
                    type="text"
                    name="sale_order_id"
                    placeholder="Sale Order ID"
                    value={filters.sale_order_id}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />

                <input
                    type="text"
                    name="product_id"
                    placeholder="Product ID"
                    value={filters.product_id}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                >
                    <option value="">All Status</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>

                <button
                    onClick={clearFilters}
                    className="bg-gray-200 px-3 py-2 rounded col-span-1"
                >
                    Clear
                </button>
            </div>

            {/* 📊 TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">S.No</th>
                            <th className="p-2 border">Return Date</th>
                            <th className="p-2 border">Sale Order</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Reason</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>

                    {/* <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No Data
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id}>
                  <td className="p-2 border">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className="p-2 border">
                    {new Date(row.return_date).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">{row.sale_order}</td>
                  <td className="p-2 border">{row.status}</td>
                  <td className="p-2 border">{row.reason}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openModal(row)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody> */}
                </table>
            </div>

            {/* 📄 PAGINATION */}
            {!loading && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={pagination?.total_elements || 0}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            {/* 🔥 VIEW MODAL */}
            {/* <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="bg-white p-5 max-w-3xl mx-auto mt-20 rounded shadow"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-lg font-bold mb-4">Return Items</h2>

        {selectedRow?.items?.length ? (
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">Product</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">Serial</th>
              </tr>
            </thead>
            <tbody>
              {selectedRow.items.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.product_name}</td>
                  <td className="border p-2">{item.quantity}</td>
                  <td className="border p-2">{item.rate}</td>
                  <td className="border p-2">{item.serial_numbers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Items</p>
        )}

        <div className="text-right mt-4">
          <button
            onClick={closeModal}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </Modal> */}
        </div>
    );
};

export default SalesReturn;