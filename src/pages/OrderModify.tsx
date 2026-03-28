
import React, { useState, useEffect } from 'react';
import { Search, ListRestart } from 'lucide-react';
import OrdersTable from '../components/Orders/OrdersTable';
import { Order, PaginationData } from '../types';
import Api from '../api-endpoints/ApiUrls';
import axiosInstance from '../configs/axios-middleware';
import Pagination from '../components/Pagination';

const OrderModify: React.FC = () => {

    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const getToday = () => {
        return new Date().toISOString().split("T")[0];
    };
    const [filters, setFilters] = useState({
        status: "",
        search: "",
        startDate: getToday(),
        endDate: "",
        page: 1,
    });

    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState("");
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let data = [...orders];

    // 🔍 SEARCH
    if (filters.search.trim() !== '') {
      const searchValue = filters.search.toLowerCase();

      data = data.filter((order: any) =>
        order.customer_name?.toLowerCase().includes(searchValue) ||
        order.customer_number?.includes(searchValue) ||
        order.id?.toLowerCase().includes(searchValue)
      );
    }

    // 📅 DATE FILTER
    if (filters.startDate) {
      data = data.filter(
        (o: any) =>
          new Date(o.created_at) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      data = data.filter(
        (o: any) =>
          new Date(o.created_at) <= new Date(filters.endDate)
      );
    }

    // 🔥 SORT
    data.sort((a: any, b: any) => {
      const d1 = new Date(a.created_at).getTime();
      const d2 = new Date(b.created_at).getTime();

      return sortOrder === "recent" ? d2 - d1 : d1 - d2;
    });

    setFilteredOrders(data);
    setPage(1);

  }, [orders, filters, sortOrder]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );


    // ✅ FETCH ORDERS (API FILTER)
    const fetchOrders = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.append("page", String(filters.page));
            params.append("limit", "20");
            params.append("is_active", "false");

            if (filters.status) params.append("status", filters.status);
            if (filters.search) params.append("search", filters.search);
            if (filters.startDate) params.append("start_date", filters.startDate);
            if (filters.endDate) params.append("end_date", filters.endDate);

            // 🔥 IMPORTANT FIX
            if (selectedAgent) {
                params.append("assigned_agent_id", selectedAgent);
            }

            const response = await axiosInstance.get(
                `${Api?.orders}?${params.toString()}`
            );

            setOrders(response?.data?.orders?.filter((item: any) => item?.is_active === false) || []);
            setPagination(response?.data?.pagination || null);

        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ TRIGGER API
    useEffect(() => {
        fetchOrders();
    }, [filters, selectedAgent]);

    // ✅ FETCH AGENTS
    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await axiosInstance.get(Api?.agents);
            setAgents(res?.data?.agents || []);
        } catch (err) {
            console.error("Agent fetch error", err);
        }
    };

    const statusOptions = [
        { value: '', label: 'All Orders' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'ASSIGNED', label: 'Assigned' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold">Orders Management</h1>
                <p className="text-gray-500">Manage and track all service orders</p>
            </div>

            {/* FILTER UI */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-sm">

                {/* TITLE */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Filters
                    </h2>

                    <button
                        onClick={() => {
                            setFilters({
                                status: "",
                                search: "",
                                startDate: getToday(),
                                endDate: "",
                                page: 1,
                            });
                            setSelectedAgent("");
                            setSortOrder("recent");
                        }}
                        className="flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition w-full sm:w-auto"
                    >
                        <ListRestart size={16} />
                        Reset
                    </button>
                </div>

                {/* FILTER GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                    {/* SEARCH */}
                    <div className="relative">
                        <label className="text-xs text-gray-500 mb-1 block">
                            Search
                        </label>
                        <Search className="absolute left-3 top-[38px] text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Order / Customer"
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({ ...filters, search: e.target.value, page: 1 })
                            }
                            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilters({ ...filters, status: e.target.value, page: 1 })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* AGENT */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Agent
                        </label>
                        <select
                            value={selectedAgent}
                            onChange={(e) => {
                                setSelectedAgent(e.target.value);
                                setFilters(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">All Agents</option>
                            {agents.map((a: any) => (
                                <option key={a.id} value={a.id}>
                                    {a.user_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* DATE RANGE */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">
                            Date Range
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, startDate: e.target.value, page: 1 })
                                }
                                className="w-full border rounded-lg px-2 py-2"
                            />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, endDate: e.target.value, page: 1 })
                                }
                                className="w-full border rounded-lg px-2 py-2"
                            />
                        </div>
                    </div>

                    {/* SORT */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Sort
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value as any);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="recent">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* TABLE */}
            {loading ? (
                <div className="flex justify-center h-40 items-center">
                    <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full"></div>
                </div>
            ) : (
                <OrdersTable
                    orders={filteredOrders} // ✅ directly orders
                    onViewOrder={() => { }}
                    onEditOrder={() => { }}
                    onAssignAgent={() => { }}
                    fetchOrders={fetchOrders}
                />
            )}
  <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
        </div>
    );
};

export default OrderModify;