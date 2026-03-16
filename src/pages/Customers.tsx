import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Phone, Mail, MapPin, Star } from 'lucide-react';
import { Customer, User } from '../types';
import axiosInstance from '../configs/axios-middleware';
import api from '../api-endpoints/ApiUrls';
import Pagination from '../components/Pagination';
interface CustomerWithUser extends Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithUser | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    loyaltyTier: 'all',
    page: 1
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchCustomers(page, pageSize);
  }, [search]);

  // const fetchCustomers = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const params = new URLSearchParams({
  //       page: filters.page.toString(),
  //       limit: '20',
  //       ...(filters.loyaltyTier !== 'all' && { loyaltyTier: filters.loyaltyTier }),
  //       ...(filters.search && { search: filters.search })
  //     });

  //     const response = await fetch(`/api/customers?${params}`, {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setCustomers(data.customers);
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch customers:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchCustomers = async (pageNumber = page, size = pageSize) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${api.allUsers}?role=CUSTOMER&page=${pageNumber}&size=${size}&search=${search}`
      );

      setCustomers(response.data?.users || []);

      const p = response.data?.pagination;

      if (p) {
        setPagination(p);
        setPage(p.page);
        setTotalPages(p.total_pages);
      }

    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCustomers(newPage, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    fetchCustomers(1, size);
  };

  const handleViewCustomer = (customer: CustomerWithUser) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const loyaltyTiers = [
    { value: 'all', label: 'All Tiers' },
    { value: 'basic', label: 'Basic' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' }
  ];

  const tierColors = {
    basic: 'bg-gray-100 text-gray-800',
    silver: 'bg-gray-200 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer profiles and service history</p>
        </div>
        {/* <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
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
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            {/* <select
              value={filters.loyaltyTier}
              onChange={(e) => setFilters({ ...filters, loyaltyTier: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {loyaltyTiers.map(tier => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select> */}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> S.No </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Customer </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Contact </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Joined </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Status </th>
                  {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"> Actions </th> */}
                </tr>
              </thead>
              <tbody>
                {customers?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">
                      No Customers Found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: any, index: number) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm"> {index + 1} </td>
                      <td className="px-6 py-4"> <div className="flex items-center"> <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"> <span className="text-orange-600 font-medium"> {customer?.name?.charAt(0)} </span> </div> <div className="ml-3"> <div className="text-sm font-medium text-gray-900"> {customer?.name} </div> <div className="text-xs text-gray-500"> {customer?.email} </div> </div> </div> </td>
                      <td className="px-6 py-4 text-sm"> <div className="flex items-center"> {customer?.mobile_number} </div> </td>
                      <td className="px-6 py-4 text-sm"> {new Date(customer?.date_joined).toLocaleDateString()} </td>
                      <td className="px-6 py-4"> <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} > {customer.status} </span> </td>
                      {/* <td className="px-6 py-4 text-right"> <button onClick={() => handleViewCustomer(customer)} className="text-gray-600 hover:text-black" > <Eye className="w-4 h-4" /> </button> </td>  */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!loading && pagination && (
              <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={pagination.total_elements}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xl">
                    {selectedCustomer.first_name.charAt(0)}{selectedCustomer.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tierColors[selectedCustomer.loyalty_tier as keyof typeof tierColors]
                    }`}>
                    {selectedCustomer.loyalty_tier} Customer
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedCustomer.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedCustomer.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedCustomer.address}, {selectedCustomer.pincode}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium">{selectedCustomer.total_orders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium">₹{selectedCustomer.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Order:</span>
                      <span className="font-medium">
                        {selectedCustomer.last_order_date ?
                          new Date(selectedCustomer.last_order_date).toLocaleDateString() :
                          'No orders yet'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;