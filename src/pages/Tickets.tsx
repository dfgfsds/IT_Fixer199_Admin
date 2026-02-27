// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Plus, Eye, MessageSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
// import { format } from 'date-fns';
// import { Ticket } from '../types';

// interface TicketWithDetails extends Ticket {
//   customer_name: string;
//   customer_phone: string;
//   order_number?: string;
//   assigned_name?: string;
// }

// const Tickets: React.FC = () => {
//   const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
//   const [filters, setFilters] = useState({
//     search: '',
//     status: 'all',
//     priority: 'all',
//     page: 1
//   });

//   useEffect(() => {
//     fetchTickets();
//   }, [filters]);

//   const fetchTickets = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const params = new URLSearchParams({
//         page: filters.page.toString(),
//         limit: '20',
//         ...(filters.status !== 'all' && { status: filters.status }),
//         ...(filters.priority !== 'all' && { priority: filters.priority }),
//         ...(filters.search && { search: filters.search })
//       });

//       const response = await fetch(`/api/tickets?${params}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setTickets(data.tickets);
//       }
//     } catch (error) {
//       console.error('Failed to fetch tickets:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewTicket = (ticket: TicketWithDetails) => {
//     setSelectedTicket(ticket);
//     setShowModal(true);
//   };

//   const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`/api/tickets/${ticketId}/status`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status })
//       });

//       if (response.ok) {
//         fetchTickets();
//         setShowModal(false);
//       }
//     } catch (error) {
//       console.error('Failed to update ticket status:', error);
//     }
//   };

//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'open', label: 'Open' },
//     { value: 'in_progress', label: 'In Progress' },
//     { value: 'resolved', label: 'Resolved' },
//     { value: 'closed', label: 'Closed' },
//     { value: 'escalated', label: 'Escalated' }
//   ];

//   const priorityOptions = [
//     { value: 'all', label: 'All Priority' },
//     { value: 'low', label: 'Low' },
//     { value: 'normal', label: 'Normal' },
//     { value: 'high', label: 'High' },
//     { value: 'urgent', label: 'Urgent' }
//   ];

//   const statusColors = {
//     open: 'bg-blue-100 text-blue-800',
//     in_progress: 'bg-yellow-100 text-yellow-800',
//     resolved: 'bg-green-100 text-green-800',
//     closed: 'bg-gray-100 text-gray-800',
//     escalated: 'bg-red-100 text-red-800'
//   };

//   const priorityColors = {
//     low: 'bg-green-100 text-green-800',
//     normal: 'bg-blue-100 text-blue-800',
//     high: 'bg-orange-100 text-orange-800',
//     urgent: 'bg-red-100 text-red-800'
//   };

//   const ticketStats = {
//     open: tickets.filter(t => t.status === 'open').length,
//     inProgress: tickets.filter(t => t.status === 'in_progress').length,
//     escalated: tickets.filter(t => t.status === 'escalated').length,
//     resolved: tickets.filter(t => t.status === 'resolved').length
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Tickets & Escalations</h1>
//           <p className="text-gray-600">Manage customer support tickets and escalations</p>
//         </div>
//         <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
//           <Plus className="w-4 h-4 mr-2" />
//           Create Ticket
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Open Tickets</p>
//               <p className="text-2xl font-bold text-blue-600">{ticketStats.open}</p>
//             </div>
//             <div className="p-3 rounded-full bg-blue-500">
//               <MessageSquare className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">In Progress</p>
//               <p className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</p>
//             </div>
//             <div className="p-3 rounded-full bg-yellow-500">
//               <Clock className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Escalated</p>
//               <p className="text-2xl font-bold text-red-600">{ticketStats.escalated}</p>
//             </div>
//             <div className="p-3 rounded-full bg-red-500">
//               <AlertTriangle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Resolved</p>
//               <p className="text-2xl font-bold text-green-600">{ticketStats.resolved}</p>
//             </div>
//             <div className="p-3 rounded-full bg-green-500">
//               <CheckCircle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by ticket number, customer name..."
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
//           <div className="w-full sm:w-48">
//             <select
//               value={filters.priority}
//               onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//             >
//               {priorityOptions.map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Tickets Table */}
//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Ticket
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Subject
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Priority
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Created
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {tickets.map((ticket) => (
//                   <tr key={ticket.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           #{ticket.ticket_number}
//                         </div>
//                         {ticket.order_number && (
//                           <div className="text-sm text-gray-500">
//                             Order: #{ticket.order_number}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {ticket.customer_name}
//                         </div>
//                         <div className="text-sm text-gray-500">{ticket.customer_phone}</div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900 max-w-xs truncate">
//                         {ticket.subject}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]
//                         }`}>
//                         {ticket.priority}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]
//                         }`}>
//                         {ticket.status.replace('_', ' ')}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button
//                         onClick={() => handleViewTicket(ticket)}
//                         className="text-orange-600 hover:text-orange-900 p-1"
//                         title="View Ticket"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Ticket Details Modal */}
//       {showModal && selectedTicket && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900">
//                 Ticket #{selectedTicket.ticket_number}
//               </h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Ticket Information</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Subject:</span>
//                       <span className="font-medium">{selectedTicket.subject}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Priority:</span>
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[selectedTicket.priority]
//                         }`}>
//                         {selectedTicket.priority}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Status:</span>
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedTicket.status]
//                         }`}>
//                         {selectedTicket.status.replace('_', ' ')}
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Created:</span>
//                       <span className="font-medium">
//                         {format(new Date(selectedTicket.created_at), 'MMM dd, yyyy hh:mm a')}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Name:</span>
//                       <span className="font-medium">{selectedTicket.customer_name}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Phone:</span>
//                       <span className="font-medium">{selectedTicket.customer_phone}</span>
//                     </div>
//                     {selectedTicket.order_number && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Related Order:</span>
//                         <span className="font-medium">#{selectedTicket.order_number}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium text-gray-900 mb-3">Description</h4>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-700">{selectedTicket.description}</p>
//                 </div>
//               </div>

//               {selectedTicket.resolution && (
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Resolution</h4>
//                   <div className="bg-green-50 rounded-lg p-4">
//                     <p className="text-sm text-gray-700">{selectedTicket.resolution}</p>
//                     {selectedTicket.resolved_at && (
//                       <p className="text-xs text-gray-500 mt-2">
//                         Resolved on {format(new Date(selectedTicket.resolved_at), 'MMM dd, yyyy hh:mm a')}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-end space-x-3">
//                 {selectedTicket.status === 'open' && (
//                   <button
//                     onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
//                     className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
//                   >
//                     Start Working
//                   </button>
//                 )}
//                 {selectedTicket.status === 'in_progress' && (
//                   <>
//                     <button
//                       onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'escalated')}
//                       className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
//                     >
//                       Escalate
//                     </button>
//                     <button
//                       onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
//                       className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
//                     >
//                       Mark Resolved
//                     </button>
//                   </>
//                 )}
//                 {selectedTicket.status === 'resolved' && (
//                   <button
//                     onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')}
//                     className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
//                   >
//                     Close Ticket
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Tickets;



import React, { useEffect, useState, useMemo } from "react";
import { Eye, MessageSquare, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import Api from '../api-endpoints/ApiUrls';
import axiosInstance from "../configs/axios-middleware";


interface SupportTicket {
  id: string;
  ticket_number: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  comments: any[];
}

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(Api?.supportTickets);
     console.log(res)
      // setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 FILTER LOGIC
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchSearch =
        ticket.ticket_number
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        ticket.subject
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === "all" || ticket.status === filters.status;

      const matchPriority =
        filters.priority === "all" || ticket.priority === filters.priority;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, filters]);

  // 📊 STATS
  const stats = {
    OPEN: tickets.filter(t => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED: tickets.filter(t => t.status === "RESOLVED").length,
    CRITICAL: tickets.filter(t => t.priority === "CRITICAL").length,
  };

  const statusColors: any = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    WAITING_FOR_CUSTOMER: "bg-purple-100 text-purple-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
    REOPENED: "bg-red-100 text-red-800",
  };

  const priorityColors: any = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600">Manage customer support tickets</p>
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Open Tickets" value={stats.OPEN} color="blue" />
        <StatCard title="In Progress" value={stats.IN_PROGRESS} color="yellow" />
        <StatCard title="Resolved" value={stats.RESOLVED} color="green" />
        <StatCard title="Critical Priority" value={stats.CRITICAL} color="red" />
      </div>

      {/* 🔍 Filters */}
      <div className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row gap-4">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticket number or subject..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_CUSTOMER">Waiting For Customer</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REOPENED">Reopened</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) =>
            setFilters({ ...filters, priority: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

      </div>

      {/* 📋 Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 uppercase text-xs text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">Ticket</th>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Priority</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No Tickets Found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold">
                        #{ticket.ticket_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.category}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs truncate">
                      {ticket.subject}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[ticket.status]}`}>
                        {ticket.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(ticket.created_at), "MMM dd, yyyy")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal same as previous version (keep your existing modal code here) */}

    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <div className="bg-white rounded-xl border p-5 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold text-${color}-600`}>
      {value}
    </p>
  </div>
);

export default Tickets;