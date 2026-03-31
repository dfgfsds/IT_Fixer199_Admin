// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../configs/axios-middleware";
// import Api from "../../api-endpoints/ApiUrls";

// const OrderViewModal = ({ order, onClose }: any) => {
//   const [payments, setPayments] = useState<any[]>([]);
//   const [refunds, setRefunds] = useState<any[]>([]);
//   const [modifications, setModifications] = useState<any[]>([]);

//   const fetchModifications = async () => {
//     try {
//       const res = await axiosInstance.get(
//         `${Api.orderItemModifications}?order_id=${order?.id}`
//       );

//       setModifications(res?.data?.order_item_modifications || []);
//     } catch (err) {
//       console.error("Modification fetch failed:", err);
//     }
//   };

//   useEffect(() => {
//     if (order?.id) {
//       fetchPayments();
//       fetchModifications(); // 👈 ADD THIS
//     }
//   }, [order]);

//   useEffect(() => {
//     if (order?.id) {
//       fetchPayments();
//     }
//   }, [order]);

//   const fetchPayments = async () => {
//     try {

//       const res = await axiosInstance.get(
//         `${Api?.orderCancel}/${order?.id}/payments-refunds/`
//       );

//       setPayments(res.data?.order_payments?.payments || []);
//       setRefunds(res.data?.order_payments?.refunds || []);

//     } catch (error) {
//       console.error("Payments fetch failed:", error);
//     }
//   };

//   if (!order) return null;
//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

//         {/* HEADER */}
//         <div className="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold tracking-wide">
//               Order #{order?.id.slice(0, 8)}
//             </h2>
//             <p className="text-sm opacity-90 mt-1">
//               {order?.order_status} • {order?.payment_status}
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="text-white text-2xl hover:scale-110 transition"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-8 space-y-10">

//           {/* CUSTOMER INFO */}
//           <section className="bg-orange-50/40 border border-orange-100 rounded-xl p-6">
//             <h3 className="text-lg font-semibold text-orange-600 mb-5">
//               Customer Information
//             </h3>

//             <div className="grid grid-cols-2 gap-8 text-sm">
//               <Info label="Name" value={order?.customer_name} />
//               <Info label="Phone" value={order?.customer_number} />
//               <Info label="Address" value={order?.address} />
//               <Info label="Google Address" value={order?.google_address} />
//             </div>
//           </section>

//           {/* SERVICE ITEMS */}
//           <section>
//             <h3 className="text-lg font-semibold text-gray-800 mb-5">
//               Service Items
//             </h3>

//             {order?.items?.map((item: any) => (
//               <div
//                 key={item?.id}
//                 className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm hover:shadow-md transition"
//               >
//                 <div className="flex justify-between items-center mb-4">
//                   <h4 className="font-semibold text-gray-900 text-base">
//                     {item?.item_details?.name}
//                   </h4>
//                   <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
//                     {item?.status}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-6 text-sm">
//                   <Info label="Type" value={item?.type} />
//                   <Info label="Quantity" value={item?.quantity} />
//                   <Info label="Unit Price" value={`₹${item?.price}`} />
//                   <Info label="Device ID" value={item?.device_id || "-"} />
//                   <div className="col-span-2">
//                     <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
//                       Issue Description
//                     </p>
//                     <p className="text-gray-700">
//                       {item?.issue_description_text || "-"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* {item?.item_details?.full_details?.media_files?.length > 0 && (
//                   <div className="mt-5">
//                     <img
//                       src={
//                         item?.item_details?.full_details?.media_files[0]
//                           ?.image_url
//                       }
//                       alt="service"
//                       className="w-40 h-28 object-cover rounded-lg border shadow-sm"
//                     />
//                   </div>
//                 )} */}
//               </div>
//             ))}
//           </section>

//           {/* PRICING */}
//           <section className="bg-gray-900 text-white rounded-xl p-6">
//             <h3 className="text-lg font-semibold mb-5">
//               Pricing Summary
//             </h3>

//             <div className="space-y-3 text-sm">
//               <div className="flex justify-between">
//                 <span>Total Amount</span>
//                 <span className="text-xl font-bold text-orange-400">
//                   ₹{order?.total_price}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span>Payment Status</span>
//                 <span>{order?.payment_status}</span>
//               </div>
//             </div>
//           </section>

//           {/* LOCATION */}
//           <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
//             <h3 className="text-lg font-semibold text-blue-600 mb-5">
//               Location Details
//             </h3>

//             <div className="grid grid-cols-2 gap-8 text-sm">
//               <Info label="Zone ID" value={order?.zone_details?.name} />
//               <Info label="Slot Time" value={order?.slot_time || "-"} />
//               <Info label="Latitude" value={order?.latitude} />
//               <Info label="Longitude" value={order?.longitude} />
//             </div>
//           </section>

//           {/* AGENT + OTP */}
//           <section className="bg-green-50 border border-green-100 rounded-xl p-6">
//             <h3 className="text-lg font-semibold text-green-600 mb-5">
//               Agent & OTP
//             </h3>

//             <div className="grid grid-cols-2 gap-8 text-sm">
//               <Info label="Assigned Agent" value={order?.agent_details?.user_name || "Not Assigned"} />
//               <Info label="OTP Required" value={order?.is_otp_required ? "Yes" : "No"} />
//               <Info label="OTP Verified" value={order?.is_otp_verified ? "Yes" : "No"} />
//             </div>
//           </section>

//         </div>

//         <section className="bg-purple-50 border border-purple-100 rounded-xl p-6">

//           <h3 className="text-lg font-semibold text-purple-600 mb-5">
//             Payments & Refunds
//           </h3>

//           {/* PAYMENTS */}

//           <div className="mb-6">


//             <h4 className="text-sm font-semibold text-gray-700 mb-3">
//               Payments
//             </h4>

//             {payments.length === 0 ? (
//               <p className="text-sm text-gray-500">
//                 No payments found
//               </p>
//             ) : (
//               payments?.map((payment: any) => (
//                 <div
//                   key={payment.id}
//                   className="border rounded-lg p-4 mb-3 bg-white"
//                 >

//                   <div className="grid grid-cols-2 gap-4 text-sm">

//                     <Info label="Transaction ID" value={payment?.transaction_id} />

//                     <Info label="Payment Method" value={payment?.payment_method} />

//                     <Info label="Amount" value={`₹${payment?.amount}`} />

//                     <Info label="Payment Status" value={payment?.payment_status} />

//                     <Info
//                       label="Date"
//                       value={new Date(payment?.created_at).toLocaleDateString()}
//                     />

//                     <Info
//                       label="Time"
//                       value={new Date(payment?.created_at).toLocaleTimeString()}
//                     />

//                   </div>

//                 </div>
//               ))
//             )}


//           </div>

//           {/* REFUNDS */}

//           <div>


//             <h4 className="text-sm font-semibold text-gray-700 mb-3">
//               Refunds
//             </h4>

//             {refunds.length === 0 ? (
//               <p className="text-sm text-gray-500">
//                 No refunds issued
//               </p>
//             ) : (
//               refunds.map((refund: any) => (
//                 <div
//                   key={refund.id}
//                   className="border rounded-lg p-4 mb-3 bg-white"
//                 >

//                   <div className="grid grid-cols-2 gap-4 text-sm">

//                     <Info label="Refund Amount" value={`₹${refund.refund_amount}`} />

//                     <Info label="Refund Status" value={refund.refund_status} />

//                     <Info label="Reason" value={refund.reason || "-"} />

//                     <Info label="Created At" value={refund.created_at} />

//                   </div>

//                 </div>
//               ))
//             )}


//           </div>

//         </section>
//         {/* ORDER MODIFICATIONS */}
//         {modifications.length > 0 && (
//           <section className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
//             <h3 className="text-lg font-semibold text-yellow-700 mb-5">
//               Order Modifications
//             </h3>

//             {modifications.map((mod: any) => (
//               <div
//                 key={mod.id}
//                 className="border rounded-xl p-5 mb-5 bg-white shadow-sm"
//               >

//                 {/* HEADER */}
//                 <div className="flex justify-between items-center mb-4">
//                   <p className="text-sm text-gray-600">
//                     Status:{" "}
//                     <span className="font-semibold text-orange-600">
//                       {mod.status}
//                     </span>
//                   </p>

//                   <p className="text-xs text-gray-400">
//                     {new Date(mod.created_at).toLocaleString()}
//                   </p>
//                 </div>

//                 {/* ITEMS */}
//                 {mod.modification_items.map((item: any) => (
//                   <div
//                     key={item.id}
//                     className="border rounded-lg p-4 mb-4 bg-gray-50"
//                   >

//                     {/* TYPE BADGE */}
//                     <div className="mb-2">
//                       <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
//                         {item.modification_type}
//                       </span>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 text-sm">

//                       {/* ORIGINAL */}
//                       <div>
//                         <p className="text-gray-400 text-xs mb-1">Original</p>
//                         <p className="font-medium">
//                           {item.original_entity_details?.name || "-"}
//                         </p>
//                       </div>

//                       {/* NEW */}
//                       <div>
//                         <p className="text-gray-400 text-xs mb-1">New</p>
//                         <p className="font-medium">
//                           {item.new_entity_details?.name || "-"}
//                         </p>
//                       </div>

//                       {/* TYPE */}
//                       <div>
//                         <p className="text-gray-400 text-xs mb-1">Item Type</p>
//                         <p>{item.item_type}</p>
//                       </div>

//                       {/* QTY */}
//                       <div>
//                         <p className="text-gray-400 text-xs mb-1">Quantity</p>
//                         <p>{item.quantity}</p>
//                       </div>

//                       {/* PRICE CHANGE */}
//                       <div>
//                         <p className="text-gray-400 text-xs mb-1">Old Price</p>
//                         <p>₹{item.original_price}</p>
//                       </div>

//                       <div>
//                         <p className="text-gray-400 text-xs mb-1">New Price</p>
//                         <p className="text-green-600 font-semibold">
//                           ₹{item.new_price}
//                         </p>
//                       </div>

//                     </div>
//                   </div>
//                 ))}

//                 {/* REASON */}
//                 {mod.reason && (
//                   <div className="mt-2">
//                     <p className="text-gray-400 text-xs">Reason</p>
//                     <p className="text-sm">{mod.reason}</p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </section>
//         )}

//         {/* FOOTER */}
//         <div className="px-8 py-5 bg-gray-50 border-t flex justify-end rounded-b-2xl">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
//           >
//             Close
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// const Info = ({ label, value }: any) => (
//   <div>
//     <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
//       {label}
//     </p>
//     <p className="text-gray-800 font-medium">
//       {value}
//     </p>
//   </div>
// );

// export default OrderViewModal;


import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";

const OrderDetailsTabsModal = ({ order, onClose }: any) => {
  const [activeTab, setActiveTab] = useState("details");

  const [payments, setPayments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [modifications, setModifications] = useState<any[]>([]);


  const fetchPaymentsAndRefunds = async () => {
    try {
      const res = await axiosInstance.get(
        `${Api?.orderCancel}/${order?.id}/payments-refunds/`
      );
      setPayments(res.data?.order_payments?.payments || []);
      setRefunds(res.data?.order_payments?.refunds || []);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchModifications = async () => {
    try {
      const res = await axiosInstance.get(
        `${Api.orderItemModifications}?order_id=${order?.id}`
      );
      setModifications(res?.data?.order_item_modifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (order?.id) {
      fetchPaymentsAndRefunds();
      fetchModifications();
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Order Details</h2>
            <p className="text-xs text-gray-500">Order ID: {order?.id}</p>
          </div>
          <button onClick={onClose} className="text-xl">×</button>
        </div>


        <div className="flex border-b px-4">
          {[
            { key: "details", label: "Order Details" },
            { key: "payments", label: "Payments", count: payments.length },
            { key: "refunds", label: "Refunds", count: refunds.length },
            { key: "modifications", label: "Modifications", count: modifications.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.key
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500"
                }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-6">

          {/* 🧩 ORDER DETAILS */}
          {activeTab === "details" && (
            <>
              <div className="space-y-5">
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

                      {item?.item_details?.full_details?.media_files?.length > 0 && (
                        <div className="mt-5">
                          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                            Media Files
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {item?.item_details?.full_details?.media_files?.map(
                              (file: any, idx: number) => {
                                const url = file?.image_url || file?.file_url || file?.url || "";
                                const isVideo =
                                  file?.file_type === "video" ||
                                  url?.match(/\.(mp4|webm|ogg|mov)$/i);

                                const handleDownload = async () => {
                                  try {
                                    const response = await fetch(url);
                                    const blob = await response.blob();
                                    const link = document.createElement("a");
                                    link.href = URL.createObjectURL(blob);
                                    link.download = `media_${idx + 1}${isVideo ? ".mp4" : ".jpg"}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(link.href);
                                  } catch {
                                    window.open(url, "_blank");
                                  }
                                };

                                return (
                                  <div key={idx} className="relative group">
                                    {isVideo ? (
                                      <video
                                        src={url}
                                        controls
                                        className="w-48 h-32 object-cover rounded-lg border shadow-sm bg-black"
                                      />
                                    ) : (
                                      <img
                                        src={url}
                                        alt={`media-${idx}`}
                                        className="w-40 h-28 object-cover rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition"
                                        onClick={() => window.open(url, "_blank")}
                                      />
                                    )}
                                    <button
                                      onClick={handleDownload}
                                      title="Download"
                                      className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
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
            </>
          )}

          {/* 🧩 PAYMENTS */}
          {activeTab === "payments" && (
            payments.length === 0 ? (
              <Empty text="No payments found" />
            ) : (
              <>
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Total Paid</p>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                    {payments.length} Payment{payments.length > 1 ? "s" : ""}
                  </div>
                </div>

                {payments.map((p: any) => (
                  <div key={p.id} className="border rounded-xl p-5 mb-3 shadow-sm bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        TXN: {p.transaction_id || "N/A"}
                      </span>
                      <StatusBadge status={p.payment_status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <Info label="Payment Method" value={p.payment_method || "-"} />
                      <Info label="Amount" value={`₹${p.amount}`} />
                      <Info label="Date" value={p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"} />
                      <Info label="Time" value={p.created_at ? new Date(p.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-"} />
                    </div>
                  </div>
                ))}
              </>
            )
          )}

          {/* 🧩 REFUNDS */}
          {activeTab === "refunds" && (
            refunds.length === 0 ? (
              <Empty text="No refunds issued" />
            ) : (
              <>
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Total Refunded</p>
                    <p className="text-2xl font-bold text-red-700">
                      ₹{refunds.reduce((sum: number, r: any) => sum + (parseFloat(r.refund_amount) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-red-600 bg-red-100 px-3 py-1 rounded-full font-medium">
                    {refunds.length} Refund{refunds.length > 1 ? "s" : ""}
                  </div>
                </div>

                {refunds.map((r: any) => (
                  <div key={r.id} className="border rounded-xl p-5 mb-3 shadow-sm bg-white hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-red-600">₹{r.refund_amount}</span>
                      <StatusBadge status={r.refund_status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <Info label="Reason" value={r.reason || "-"} />
                      <Info label="Date" value={r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"} />
                      {r.refund_method && <Info label="Refund Method" value={r.refund_method} />}
                      {r.transaction_id && <Info label="Transaction ID" value={r.transaction_id} />}
                      {r.admin_notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">Admin Notes</p>
                          <p className="font-medium text-gray-700">{r.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )
          )}

          {/* 🧩 MODIFICATIONS */}
          {activeTab === "modifications" && (
            modifications.length === 0 ? (
              <Empty text="No modifications" />
            ) : (
              modifications.map((mod) => (
                <Card key={mod.id}>
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">{mod.status}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(mod.created_at).toLocaleString()}
                    </span>
                  </div>

                  {mod.modification_items.map((item: any) => (
                    <div key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
                      <Grid>
                        <Info label="Type" value={item.modification_type} />
                        <Info label="Item Type" value={item.item_type} />
                        <Info label="Old" value={item.original_entity_details?.name || "-"} />
                        <Info label="New" value={item.new_entity_details?.name || "-"} />
                        <Info label="Old Price" value={`₹${item.original_price}`} />
                        <Info label="New Price" value={`₹${item.new_price}`} />
                      </Grid>
                    </div>
                  ))}

                  {mod.reason && (
                    <>
                      <p className="text-xs text-gray-400">Reason</p>
                      <p className="text-sm">{mod.reason}</p>
                    </>
                  )}
                </Card>
              ))
            )
          )}

        </div>

        {/* FOOTER */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-orange-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

/* 🔥 REUSABLE COMPONENTS */

const Section = ({ title, children }: any) => (
  <div>
    <h3 className="font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const Grid = ({ children }: any) => (
  <div className="grid grid-cols-2 gap-4 text-sm">{children}</div>
);

const Card = ({ children }: any) => (
  <div className="border rounded-xl p-4 shadow-sm">{children}</div>
);

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const Empty = ({ text }: any) => (
  <div className="text-center py-10 text-gray-400 text-sm">{text}</div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = (status || "").toLowerCase();
  const colors = s.includes("success") || s.includes("paid") || s.includes("approved") || s.includes("processed") || s.includes("completed")
    ? "bg-green-100 text-green-700"
    : s.includes("pending") || s.includes("initiated")
      ? "bg-yellow-100 text-yellow-700"
      : s.includes("fail") || s.includes("rejected") || s.includes("cancelled")
        ? "bg-red-100 text-red-700"
        : s.includes("progress") || s.includes("processing")
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700";

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${colors}`}>
      {status || "Unknown"}
    </span>
  );
};

export default OrderDetailsTabsModal;