// import React from 'react';
// import { format } from 'date-fns';
// import { Eye, Edit, Trash2, User, Calendar } from 'lucide-react';
// import { Order } from '../../types';

import { Eye, MapPin, SearchX } from "lucide-react";

// interface OrdersTableProps {
//   orders: Order[];
//   onViewOrder: (order: Order) => void;
//   onEditOrder: (order: Order) => void;
//   onAssignAgent: (order: Order) => void;
// }

// const statusColors:any = {
//   PENDING: 'bg-yellow-100 text-yellow-800',
//   assigned: 'bg-blue-100 text-blue-800',
//   in_progress: 'bg-indigo-100 text-indigo-800',
//   completed: 'bg-green-100 text-green-800',
//   cancelled: 'bg-red-100 text-red-800',
//   refunded: 'bg-gray-100 text-gray-800',
// };

// const priorityColors = {
//   low: 'bg-green-100 text-green-800',
//   normal: 'bg-blue-100 text-blue-800',
//   high: 'bg-orange-100 text-orange-800',
//   urgent: 'bg-red-100 text-red-800',
// };

// const OrdersTable: React.FC<OrdersTableProps> = ({ 
//   orders, 
//   onViewOrder, 
//   onEditOrder, 
//   onAssignAgent 
// }) => {
//   console.log(orders

//   )
//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Order Details
//               </th> */}
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Customer
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Agent
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Amount
//               </th>
//               {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Created
//               </th> */}
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {orders?.map((order:any) => (
//               <tr key={order.id} className="hover:bg-gray-50">
//                 {/* <td className="px-6 py-4 whitespace-nowrap">
//                   <div>
//                     <div className="text-sm font-medium text-gray-900">
//                       #{order.address}
//                     </div>
//                     <div className="text-sm text-gray-500">{order.service_type}</div>
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
//                       priorityColors[order.priority]
//                     }`}>
//                       {order.priority}
//                     </span>
//                   </div>
//                 </td> */}
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div>
//                     <div className="text-sm font-medium text-gray-900 capitalize">
//                       {order?.customer_name} {order.customer_last_name}
//                     </div>
//                     <div className="text-sm text-gray-500">{order?.customer_number}</div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {order.agent_first_name ? (
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {order.agent_first_name} {order.agent_last_name}
//                       </div>
//                       <div className="text-sm text-gray-500">Assigned</div>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => onAssignAgent(order)}
//                       className="inline-flex items-center px-3 py-1 border border-orange-300 text-xs font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100"
//                     >
//                       <User className="w-3 h-3 mr-1" />
//                       Assign Agent
//                     </button>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                     statusColors[order?.order_status]
//                   }`}>
//                     {order?.order_status?.replace('_', ' ')}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                   ₹{order?.total_price}
//                 </td>
//                 {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   <div className="flex items-center">
//                     <Calendar className="w-4 h-4 mr-1" />
//                     {format(new Date(order?.created_at), 'MMM dd, yyyy')}
//                   </div>
//                   <div className="text-xs text-gray-400">
//                     {format(new Date(order?.created_at), 'hh:mm a')}
//                   </div>
//                 </td> */}
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   <div className="flex items-center justify-end space-x-2">
//                     <button
//                       onClick={() => onViewOrder(order)}
//                       className="text-gray-600 hover:text-gray-900 p-1"
//                       title="View Details"
//                     >
//                       <Eye className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => onEditOrder(order)}
//                       className="text-orange-600 hover:text-orange-900 p-1"
//                       title="Edit Order"
//                     >
//                       <Edit className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default OrdersTable;

import { Order } from '../../types';
import { useState } from "react";
import OrderViewModal from "./OrderViewModal";
import OrderLocationModal from "./OrderLocationModal";
interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onAssignAgent: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewOrder,
  onEditOrder,
  onAssignAgent
}) => {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locationOrder, setLocationOrder] = useState(null);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
  };

  const handleMap = (order: any) => {
    setLocationOrder(order);
  };

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };


  return (
    <div className="bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">

          {/* HEADER */}
          <thead className="bg-gray-100 border-b border-gray-300 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Zone / Slot</th>
              {/* <th className="px-6 py-3">Agent</th> */}
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
<tbody className="divide-y divide-gray-200">

  {orders && orders?.length > 0 ? (
    orders?.map((order: any) => (
      <tr
        key={order?.id}
        className="hover:bg-gray-50 transition-colors duration-150"
      >

        {/* CUSTOMER */}
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900 capitalize">
            {order?.customer_name}
          </div>
          <div className="text-xs text-gray-500">
            {order?.customer_number}
          </div>
        </td>

        {/* ZONE / SLOT */}
        <td className="px-6 py-4">
          <div className="text-gray-800">
            {order?.zone_id}
          </div>
          <div className="text-xs text-gray-500">
            {order?.slot_time || "-"}
          </div>
        </td>

        {/* STATUS */}
        <td className="px-6 py-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded 
              ${statusColors[order?.order_status]}`}
          >
            {order?.order_status}
          </span>
        </td>

        {/* AMOUNT */}
        <td className="px-6 py-4 font-semibold text-gray-900">
          ₹{order?.total_price}
        </td>

        {/* ACTIONS */}
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-4">

            <button
              onClick={() => handleViewOrder(order)}
              className="text-gray-600 hover:text-black transition"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleMap(order)}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <MapPin className="w-4 h-4" />
            </button>

          </div>
        </td>

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">

          {/* ICON */}
          <SearchX className="w-12 h-12 mb-4 text-gray-300" />

          {/* TEXT */}
          <p className="text-lg font-medium text-gray-500">
            No Orders Found
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filter criteria
          </p>

        </div>
      </td>
    </tr>
  )}

</tbody>


        </table>
      </div>

      {/* MODALS */}
      {selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {locationOrder && (
        <OrderLocationModal
          order={locationOrder}
          onClose={() => setLocationOrder(null)}
        />
      )}
    </div>

  );
};


export default OrdersTable;