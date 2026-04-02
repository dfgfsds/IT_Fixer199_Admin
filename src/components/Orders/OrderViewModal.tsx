import React, { useEffect, useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";

const OrderDetailsTabsModal = ({ order, onClose }: any) => {
  const [activeTab, setActiveTab] = useState("details");

  const [payments, setPayments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [modifications, setModifications] = useState<any[]>([]);

  // 🔥 Fetch Payments & Refunds
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

  // 🔥 Fetch Modifications
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

        {/* 🔥 TABS */}
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
        <div className="p-6 max-h-[360px] overflow-y-auto space-y-6">

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
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">
                            Issue Description
                          </p>
                          <p className="text-gray-700">
                            {item?.issue_description_text || "-"}
                          </p>
                        </div>
                      </div>

                      {/* 🔥 INTEGRATED ROBUST MEDIA GALLERY */}
                      <MediaGallery item={item} orderId={order?.id} />

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
                    <span className="font-medium text-gray-700 font-semibold">{mod.status}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(mod.created_at).toLocaleString()}
                    </span>
                  </div>

                  {mod.modification_items.map((item: any) => (
                    <div key={item.id} className="border p-4 rounded-xl mb-4 bg-gray-50/50">
                      <Grid>
                        <Info label="Type" value={item.modification_type} />
                        <Info label="Item Type" value={item.item_type} />
                        <Info label="Old" value={item.original_entity_details?.name || "-"} />
                        <Info label="New" value={item.new_entity_details?.name || "-"} />
                        <Info label="Old Price" value={`₹${item.original_price}`} />
                        <Info label="New Price" value={`₹${item.new_price}`} />
                      </Grid>
                      <div className="mt-3">
                        <MediaGallery item={item} orderId={mod.id} />
                      </div>
                    </div>
                  ))}

                  {mod.reason && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-gray-400 uppercase font-bold text-[10px]">Reason</p>
                      <p className="text-sm text-gray-700">{mod.reason}</p>
                    </div>
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
            className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition active:scale-95 shadow-md"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

/* 🔥 REUSABLE COMPONENTS */

const MediaGallery = ({ item, orderId }: any) => {
  const mediaSources = [
    item?.item_details?.full_details?.media_files,
    item?.item_details?.media_files,
    item?.media_files,
    item?.media,
    item?.item_details?.full_details?.video_files,
    item?.item_details?.full_details?.audio_files,
    item?.item_details?.full_details?.images,
  ];

  const allMedia: any[] = [];
  mediaSources.forEach(src => {
    if (Array.isArray(src)) allMedia.push(...src);
  });

  const uniqueMedia = Array.from(
    new Map(allMedia.map(m => [m.image_url || m.file_url || m.url, m])).values()
  );

  if (uniqueMedia.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">
        Media Files ({uniqueMedia.length})
      </p>
      <div className="flex flex-wrap gap-4">
        {uniqueMedia.map((file: any, idx: number) => {
          const url = file?.image_url || file?.file_url || file?.url || "";
          if (!url) return null;

          const isVideo = file?.file_type === "video" || file?.media_type === "video" || url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
          const isAudio = file?.file_type === "audio" || file?.media_type === "audio" || url.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
          const type = isVideo ? "Video" : isAudio ? "Audio" : "Image";

          const handleDownload = async (e: React.MouseEvent) => {
            e.stopPropagation();
            try {
              const response = await fetch(url);
              const blob = await response.blob();
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              const ext = isVideo ? ".mp4" : isAudio ? ".mp3" : ".jpg";
              link.download = `media_${orderId}_${idx + 1}${ext}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            } catch {
              window.open(url, "_blank");
            }
          };

          return (
            <div key={idx} className="relative group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-orange-200 hover:shadow-md">
              {isVideo ? (
                <video src={url} controls className="w-48 h-32 object-cover rounded-lg bg-black" />
              ) : isAudio ? (
                <div className="w-48 h-32 flex flex-col items-center justify-center bg-purple-50 rounded-lg p-2 border border-purple-100">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <audio src={url} controls className="w-full h-8 scale-90" />
                </div>
              ) : (
                <img
                  src={url}
                  alt={`media-${idx}`}
                  className="w-40 h-28 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(url, "_blank")}
                />
              )}

              <div className="absolute top-2 left-2 pointer-events-none">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase shadow-sm ${isVideo ? "bg-red-500 text-white" : isAudio ? "bg-purple-500 text-white" : "bg-blue-500 text-white"
                  }`}>
                  {type}
                </span>
              </div>

              <button
                onClick={handleDownload}
                title={`Download ${type}`}
                className="absolute top-2 right-2 bg-white/95 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-75 hover:scale-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  <div className="border rounded-xl p-4 shadow-sm bg-white mb-4">{children}</div>
);

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight text-[10px]">{label}</p>
    <p className="font-medium text-gray-800">{value || "-"}</p>
  </div>
);

const Empty = ({ text }: any) => (
  <div className="text-center py-10 text-gray-400 text-sm italic">{text}</div>
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
    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize border shadow-sm ${colors}`}>
      {status || "Unknown"}
    </span>
  );
};

export default OrderDetailsTabsModal;