import { Eye, MapPin, SearchX } from "lucide-react";
import { Order } from '../../types';
import { useState } from "react";
import OrderViewModal from "./OrderViewModal";
import OrderLocationModal from "./OrderLocationModal";
import RefundModal from "./RefundModal";
import Api from '../../api-endpoints/ApiUrls';
import axiosInstance from "../../configs/axios-middleware";

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onAssignAgent: (order: Order) => void;
  fetchOrders: any
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewOrder,
  onEditOrder,
  onAssignAgent,
  fetchOrders,
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
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    ASSIGNED: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    IN_TRANSIT: "bg-cyan-100 text-cyan-800",
    SERVICE_IN_PROGRESS: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };

  const [refundOrder, setRefundOrder] = useState<any>(null);
  const handleRefund = async (order: any) => {
    try {
      const updatedApi = await axiosInstance.post(`${Api?.refundOtpRequest}/`, {
        order_id: order.id,
      },
      );
      if (updatedApi) {
        setRefundOrder(order);
      }
    } catch (error) {
      console.error("OTP request failed", error);
    }
  };



  return (
    <div className="bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">

          {/* HEADER */}
          <thead className="bg-gray-100 border-b border-gray-300 text-xs uppercase tracking-wider text-gray-600">
            <tr>
              <th className="px-6 py-3">S.No</th>
              <th className="px-6 py-3">Order Id</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Zone</th>
              <th className="px-6 py-3">Slot</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">

            {orders && orders?.length > 0 ? (
              orders?.map((order: any, index: number) => (
                <tr
                  key={order?.id}
                  className="hover:bg-gray-50 transition-colors duration-150 capitalize"
                >

                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 capitalize">
                      {index + 1}
                    </div>

                  </td>
                  {/* ORDER ID */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 capitalize">
                      {order?.id}
                    </div>
                  </td>

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
                      {order?.zone_details?.name || "-"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
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
                    {order?.order_status === "CANCELLED" && order?.payment_status === "SUCCESS" && (
                      <button
                        onClick={() => handleRefund(order)}
                        className="ml-2 text-xs text-red-600 underline"
                      >
                        Refund
                      </button>
                    )}

                      {/* {order?.order_status === "CANCELLED" && order?.order_status === "SUCCESS" && (
                      <button
                        onClick={() => handleRefund(order)}
                        className="ml-2 text-xs text-red-600 underline"
                      >
                        Refund
                      </button>
                    )} */}
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

      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onSuccess={() => {
            setRefundOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>

  );
};

export default OrdersTable;