// import React, { useState, useEffect } from 'react';
// import { Search, Filter, ListRestart } from 'lucide-react';
// import OrdersTable from '../components/Orders/OrdersTable';
// import { Order, PaginationData } from '../types';
// import Api from '../api-endpoints/ApiUrls';
// import axiosInstance from '../configs/axios-middleware';

// const Orders: React.FC = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [pagination, setPagination] = useState<PaginationData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     status: "",
//     search: "",
//     startDate: "",
//     endDate: "",
//     page: 1,
//   });
//   const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

//   const [agents, setAgents] = useState<any[]>([]);
//   const [selectedAgent, setSelectedAgent] = useState("");

//   // useEffect(() => {
//   //   fetchOrders();
//   // }, []);
//   useEffect(() => {
//     fetchOrders();
//   }, [filters]);

//   // const fetchOrders = async () => {
//   //   try {
//   //     setLoading(true);

//   //     const params: any = {
//   //       page: filters.page,
//   //       limit: 20,
//   //     };

//   //     if (filters?.status) {
//   //       params.order_status = filters?.status;
//   //     }

//   //     if (filters?.search) {
//   //       params.search = filters?.search;
//   //     }

//   //     const response: any = await axiosInstance?.get(
//   //       `${Api?.orders}?is_active=true`);
//   //     if (response) {
//   //       setOrders(response?.data?.orders);
//   //       // setFilteredOrders(response?.data?.orders || []);
//   //       setPagination(response?.data?.pagination || null);
//   //     }


//   //   } catch (error) {
//   //     console.error("Failed to fetch orders:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();

//       params.append("page", String(filters.page));
//       params.append("limit", "20");
//       params.append("is_active", "true");

//       if (filters.status) params.append("status", filters.status);
//       if (filters.search) params.append("search", filters.search);
//       if (filters.startDate) params.append("start_date", filters.startDate);
//       if (filters.endDate) params.append("end_date", filters.endDate);

//       const response = await axiosInstance.get(
//         `${Api?.orders}?${params.toString()}`
//       );

//       setOrders(response?.data?.orders || []);
//       setFilteredOrders(response?.data?.orders || []); // 🔥 no frontend filter
//       setPagination(response?.data?.pagination || null);

//     } catch (error) {
//       console.error("Failed to fetch orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     let data = [...orders];

//     // 🔍 SEARCH
//     if (filters?.search.trim() !== '') {
//       const searchValue = filters?.search?.toLowerCase();

//       data = data?.filter((order: any) =>
//         order?.customer_name?.toLowerCase()?.includes(searchValue) ||
//         order?.customer_number?.includes(searchValue) ||
//         order?.id?.toLowerCase().includes(searchValue)
//       );
//     }

//     // 📂 STATUS
//     if (filters.status !== '') {
//       data = data.filter(
//         (order: any) => order.order_status === filters.status
//       );
//     }

//     // 🧑‍🔧 AGENT FILTER ✅ ADD THIS
//     if (selectedAgent) {
//       data = data.filter(
//         (order: any) =>
//           order?.agent_id === selectedAgent ||
//           order?.agent?.id === selectedAgent // fallback
//       );
//     }

//     setFilteredOrders(data);

//   }, [filters, orders, selectedAgent]);

//   // const fetchOrders = async () => {
//   //   try {
//   //     const token = localStorage.getItem('token');
//   //     const params = new URLSearchParams({
//   //       page: filters.page.toString(),
//   //       limit: '20',
//   //       ...(filters.status !== 'all' && { status: filters.status }),
//   //       ...(filters.search && { search: filters.search })
//   //     });

//   //     // const response = await fetch(`/api/orders?${params}`, {
//   //     //   headers: {
//   //     //     'Authorization': `Bearer ${token}`,
//   //     //   },
//   //     // });

//   //     const response: any = await axiosInstance.get(Api?.orders);
//   //     console.log(response?.data?.orders)
//   //     if (response) {
//   //       // const data = await response.json();
//   //       setOrders(response?.data?.orders);
//   //       // setPagination(data.pagination);
//   //     }
//   //   } catch (error) {
//   //     console.error('Failed to fetch orders:', error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleViewOrder = (order: Order) => {
//     console.log('View order:', order);
//     // Implement order details modal/page
//   };

//   const handleEditOrder = (order: Order) => {
//     console.log('Edit order:', order);
//     // Implement order edit functionality
//   };

//   const handleAssignAgent = (order: Order) => {
//     console.log('Assign agent to order:', order);
//     // Implement agent assignment modal
//   };

//   const statusOptions = [
//     { value: '', label: 'All Orders' },
//     { value: 'PENDING', label: 'Pending' },
//     { value: 'ASSIGNED', label: 'Assigned' },
//     { value: 'IN_PROGRESS', label: 'In Progress' },
//     { value: 'COMPLETED', label: 'Completed' },
//     { value: 'CANCELLED', label: 'Cancelled' },
//     // { value: 'refunded', label: 'Refunded' },
//   ];

//   useEffect(() => {
//     fetchAgents();
//   }, []);

//   const fetchAgents = async () => {
//     try {
//       const res = await axiosInstance.get(Api?.agents); // 🔥 check your API
//       console.log(res?.data)
//       setAgents(res?.data?.agents || []);
//     } catch (err) {
//       console.error("Agent fetch error", err);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
//           <p className="text-gray-600">Manage and track all service orders</p>
//         </div>
//         {/* <div className="flex items-center space-x-3">
//           <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//             <Download className="w-4 h-4 mr-2" />
//             Export
//           </button>
//           <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
//             <Plus className="w-4 h-4 mr-2" />
//             New Order
//           </button>
//         </div> */}
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by order number, customer name..."
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//           <div className="w-full sm:w-48">
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//             >
//               {statusOptions.map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <select
//             value={selectedAgent}
//             onChange={(e) => setSelectedAgent(e.target.value)}
//             className="w-full sm:w-48 px-3 py-2 border rounded-lg"
//           >
//             <option value="">All Agents</option>

//             {agents?.map((agent: any) => (
//               <option key={agent?.id} value={agent?.id}>
//                 {agent?.user_name}
//               </option>
//             ))}
//           </select>

//           <div className="flex gap-4">

//             {/* START DATE */}
//             <input
//               type="date"
//               value={filters.startDate}
//               onChange={(e) =>
//                 setFilters({ ...filters, startDate: e.target.value, page: 1 })
//               }
//               className="px-3 py-2 border rounded-lg"
//             />

//             {/* END DATE */}
//             <input
//               type="date"
//               value={filters.endDate}
//               onChange={(e) =>
//                 setFilters({ ...filters, endDate: e.target.value, page: 1 })
//               }
//               className="px-3 py-2 border rounded-lg"
//             />

//           </div>
//           <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             onClick={() => {
//               setFilters({
//                 status: "",
//                 search: "",
//                 startDate: "",
//                 endDate: "",
//                 page: 1,
//               })
//               setSelectedAgent("");
//             }
//             }

//           >
//             <ListRestart className="w-4 h-4 mr-2" />
//             Rest
//           </button>
//           {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//             <Filter className="w-4 h-4 mr-2" />
//             More Filters
//           </button> */}
//         </div>
//       </div>

//       {/* Orders Table */}
//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
//         </div>
//       ) : (
//         <OrdersTable
//           orders={filteredOrders}
//           onViewOrder={handleViewOrder}
//           onEditOrder={handleEditOrder}
//           onAssignAgent={handleAssignAgent}
//           fetchOrders={fetchOrders}
//         />
//       )}

//       {/* Pagination */}
//       {pagination && (
//         <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-700">
//               Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
//                 disabled={filters.page === 1}
//                 className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Previous
//               </button>
//               <span className="px-3 py-2 text-sm">
//                 Page {filters.page} of {pagination.pages}
//               </span>
//               <button
//                 onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
//                 disabled={filters.page === pagination.pages}
//                 className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;



import React, { useState, useEffect } from 'react';
import { Search, ListRestart } from 'lucide-react';
import OrdersTable from '../components/Orders/OrdersTable';
import { Order, PaginationData } from '../types';
import Api from '../api-endpoints/ApiUrls';
import axiosInstance from '../configs/axios-middleware';

const Orders: React.FC = () => {

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
    page: 1,
  });

  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");

  // ✅ FETCH ORDERS (API FILTER)
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", String(filters.page));
      params.append("limit", "20");
      params.append("is_active", "true");

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

      setOrders(response?.data?.orders || []);
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
 <div className="bg-white border rounded-2xl p-6 shadow-sm">

  {/* TITLE */}
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-lg font-semibold text-gray-800">
      Filters
    </h2>

    <button
      onClick={() => {
        setFilters({
          status: "",
          search: "",
          startDate: "",
          endDate: "",
          page: 1,
        });
        setSelectedAgent("");
      }}
      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
    >
      <ListRestart size={16} />
      Reset
    </button>
  </div>

  {/* FILTER GRID */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

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

    {/* DATE */}
    <div>
      <label className="text-xs text-gray-500 mb-1 block">
        Date Range
      </label>
      <div className="flex gap-2">
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

  </div>
</div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full"></div>
        </div>
      ) : (
        <OrdersTable
          orders={orders} // ✅ directly orders
          onViewOrder={() => {}}
          onEditOrder={() => {}}
          onAssignAgent={() => {}}
          fetchOrders={fetchOrders}
        />
      )}

    </div>
  );
};

export default Orders;