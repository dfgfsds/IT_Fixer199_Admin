import React, { useState, useEffect } from 'react';
import { Search, Filter, ListRestart } from 'lucide-react';
import OrdersTable from '../components/Orders/OrdersTable';
import { Order, PaginationData } from '../types';
import Api from '../api-endpoints/ApiUrls';
import axiosInstance from '../configs/axios-middleware';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // useEffect(() => {
  //   fetchOrders();
  // }, []);
  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: filters.page,
        limit: 20,
      };

      if (filters?.status) {
        params.order_status = filters?.status;
      }

      if (filters?.search) {
        params.search = filters?.search;
      }

      const response: any = await axiosInstance?.get(
        Api?.orders,
        { params }   // 👈 THIS WAS MISSING
      );
      if (response) {
        setOrders(response?.data?.orders);
        // setFilteredOrders(response?.data?.orders || []);
        setPagination(response?.data?.pagination || null);
      }


    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...orders];

    // 🔍 SEARCH FILTER
    if (filters?.search.trim() !== '') {
      const searchValue = filters?.search?.toLowerCase();

      data = data?.filter((order: any) =>
        order?.customer_name?.toLowerCase()?.includes(searchValue) ||
        order?.customer_number?.includes(searchValue) ||
        order?.id?.toLowerCase().includes(searchValue)
      );
    }

    // 📂 STATUS FILTER
    if (filters.status !== '') {
      data = data.filter(
        (order: any) => order.order_status === filters.status
      );
    }

    setFilteredOrders(data);

  }, [filters, orders]);

  // const fetchOrders = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const params = new URLSearchParams({
  //       page: filters.page.toString(),
  //       limit: '20',
  //       ...(filters.status !== 'all' && { status: filters.status }),
  //       ...(filters.search && { search: filters.search })
  //     });

  //     // const response = await fetch(`/api/orders?${params}`, {
  //     //   headers: {
  //     //     'Authorization': `Bearer ${token}`,
  //     //   },
  //     // });

  //     const response: any = await axiosInstance.get(Api?.orders);
  //     console.log(response?.data?.orders)
  //     if (response) {
  //       // const data = await response.json();
  //       setOrders(response?.data?.orders);
  //       // setPagination(data.pagination);
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch orders:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleViewOrder = (order: Order) => {
    console.log('View order:', order);
    // Implement order details modal/page
  };

  const handleEditOrder = (order: Order) => {
    console.log('Edit order:', order);
    // Implement order edit functionality
  };

  const handleAssignAgent = (order: Order) => {
    console.log('Assign agent to order:', order);
    // Implement agent assignment modal
  };

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    // { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage and track all service orders</p>
        </div>
        {/* <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </button>
        </div> */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number, customer name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={() =>
              setFilters({
                status: '',
                search: '',
                page: 1
              })
            }

          >
            <ListRestart className="w-4 h-4 mr-2" />
            Rest
          </button>
          {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button> */}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
          onAssignAgent={handleAssignAgent}
        />
      )}

      {/* Pagination */}
      {pagination && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;