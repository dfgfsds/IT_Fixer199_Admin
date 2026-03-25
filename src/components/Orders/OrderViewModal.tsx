import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";

const OrderViewModal = ({ order, onClose }: any) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [modifications, setModifications] = useState<any[]>([]);

  const fetchModifications = async () => {
    try {
      const res = await axiosInstance.get(
        `${Api.orderItemModifications}?order_id=${order?.id}`
      );

      setModifications(res?.data?.order_item_modifications || []);
    } catch (err) {
      console.error("Modification fetch failed:", err);
    }
  };

  useEffect(() => {
    if (order?.id) {
      fetchPayments();
      fetchModifications(); // 👈 ADD THIS
    }
  }, [order]);

  useEffect(() => {
    if (order?.id) {
      fetchPayments();
    }
  }, [order]);

  const fetchPayments = async () => {
    try {

      const res = await axiosInstance.get(
        `${Api?.orderCancel}/${order?.id}/payments-refunds/`
      );

      setPayments(res.data?.order_payments?.payments || []);
      setRefunds(res.data?.order_payments?.refunds || []);

    } catch (error) {
      console.error("Payments fetch failed:", error);
    }
  };

  if (!order) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* HEADER */}
        <div className="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-wide">
              Order #{order?.id.slice(0, 8)}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {order?.order_status} • {order?.payment_status}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white text-2xl hover:scale-110 transition"
          >
            ×
          </button>
        </div>

        <div className="p-8 space-y-10">

          {/* CUSTOMER INFO */}
          <section className="bg-orange-50/40 border border-orange-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-600 mb-5">
              Customer Information
            </h3>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <Info label="Name" value={order?.customer_name} />
              <Info label="Phone" value={order?.customer_number} />
              <Info label="Address" value={order?.address} />
              <Info label="Google Address" value={order?.google_address} />
            </div>
          </section>

          {/* SERVICE ITEMS */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-5">
              Service Items
            </h3>

            {order?.items?.map((item: any) => (
              <div
                key={item?.id}
                className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900 text-base">
                    {item?.item_details?.name}
                  </h4>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    {item?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <Info label="Type" value={item?.type} />
                  <Info label="Quantity" value={item?.quantity} />
                  <Info label="Unit Price" value={`₹${item?.price}`} />
                  <Info label="Device ID" value={item?.device_id || "-"} />
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                      Issue Description
                    </p>
                    <p className="text-gray-700">
                      {item?.issue_description_text || "-"}
                    </p>
                  </div>
                </div>

                {/* {item?.item_details?.full_details?.media_files?.length > 0 && (
                  <div className="mt-5">
                    <img
                      src={
                        item?.item_details?.full_details?.media_files[0]
                          ?.image_url
                      }
                      alt="service"
                      className="w-40 h-28 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )} */}
              </div>
            ))}
          </section>

          {/* PRICING */}
          <section className="bg-gray-900 text-white rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-5">
              Pricing Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="text-xl font-bold text-orange-400">
                  ₹{order?.total_price}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Payment Status</span>
                <span>{order?.payment_status}</span>
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-5">
              Location Details
            </h3>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <Info label="Zone ID" value={order?.zone_details?.name} />
              <Info label="Slot Time" value={order?.slot_time || "-"} />
              <Info label="Latitude" value={order?.latitude} />
              <Info label="Longitude" value={order?.longitude} />
            </div>
          </section>

          {/* AGENT + OTP */}
          <section className="bg-green-50 border border-green-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-600 mb-5">
              Agent & OTP
            </h3>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <Info label="Assigned Agent" value={order?.agent_details?.user_name || "Not Assigned"} />
              <Info label="OTP Required" value={order?.is_otp_required ? "Yes" : "No"} />
              <Info label="OTP Verified" value={order?.is_otp_verified ? "Yes" : "No"} />
            </div>
          </section>

        </div>

        <section className="bg-purple-50 border border-purple-100 rounded-xl p-6">

          <h3 className="text-lg font-semibold text-purple-600 mb-5">
            Payments & Refunds
          </h3>

          {/* PAYMENTS */}

          <div className="mb-6">


            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Payments
            </h4>

            {payments.length === 0 ? (
              <p className="text-sm text-gray-500">
                No payments found
              </p>
            ) : (
              payments?.map((payment: any) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 mb-3 bg-white"
                >

                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <Info label="Transaction ID" value={payment?.transaction_id} />

                    <Info label="Payment Method" value={payment?.payment_method} />

                    <Info label="Amount" value={`₹${payment?.amount}`} />

                    <Info label="Payment Status" value={payment?.payment_status} />

                    <Info
                      label="Date"
                      value={new Date(payment?.created_at).toLocaleDateString()}
                    />

                    <Info
                      label="Time"
                      value={new Date(payment?.created_at).toLocaleTimeString()}
                    />

                  </div>

                </div>
              ))
            )}


          </div>

          {/* REFUNDS */}

          <div>


            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Refunds
            </h4>

            {refunds.length === 0 ? (
              <p className="text-sm text-gray-500">
                No refunds issued
              </p>
            ) : (
              refunds.map((refund: any) => (
                <div
                  key={refund.id}
                  className="border rounded-lg p-4 mb-3 bg-white"
                >

                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <Info label="Refund Amount" value={`₹${refund.refund_amount}`} />

                    <Info label="Refund Status" value={refund.refund_status} />

                    <Info label="Reason" value={refund.reason || "-"} />

                    <Info label="Created At" value={refund.created_at} />

                  </div>

                </div>
              ))
            )}


          </div>

        </section>
        {/* ORDER MODIFICATIONS */}
        {modifications.length > 0 && (
          <section className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-5">
              Order Modifications
            </h3>

            {modifications.map((mod: any) => (
              <div
                key={mod.id}
                className="border rounded-xl p-5 mb-5 bg-white shadow-sm"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span className="font-semibold text-orange-600">
                      {mod.status}
                    </span>
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(mod.created_at).toLocaleString()}
                  </p>
                </div>

                {/* ITEMS */}
                {mod.modification_items.map((item: any) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 mb-4 bg-gray-50"
                  >

                    {/* TYPE BADGE */}
                    <div className="mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                        {item.modification_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">

                      {/* ORIGINAL */}
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Original</p>
                        <p className="font-medium">
                          {item.original_entity_details?.name || "-"}
                        </p>
                      </div>

                      {/* NEW */}
                      <div>
                        <p className="text-gray-400 text-xs mb-1">New</p>
                        <p className="font-medium">
                          {item.new_entity_details?.name || "-"}
                        </p>
                      </div>

                      {/* TYPE */}
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Item Type</p>
                        <p>{item.item_type}</p>
                      </div>

                      {/* QTY */}
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Quantity</p>
                        <p>{item.quantity}</p>
                      </div>

                      {/* PRICE CHANGE */}
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Old Price</p>
                        <p>₹{item.original_price}</p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-1">New Price</p>
                        <p className="text-green-600 font-semibold">
                          ₹{item.new_price}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}

                {/* REASON */}
                {mod.reason && (
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs">Reason</p>
                    <p className="text-sm">{mod.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* FOOTER */}
        <div className="px-8 py-5 bg-gray-50 border-t flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className="text-gray-800 font-medium">
      {value}
    </p>
  </div>
);

export default OrderViewModal;
