import React, { useState, useEffect } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";
import { Loader2 } from "lucide-react";

interface ShopStatusUpdateModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ShopStatusUpdateModal: React.FC<ShopStatusUpdateModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(order?.payment_status || "");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(order);
  const [itemSerials, setItemSerials] = useState<{ [key: string]: string[] }>({});
  const [availableSerials, setAvailableSerials] = useState<{
    [key: string]: string[];
  }>({});

  // Fetch full order details on mount
  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${Api?.orders}${order?.id}/`);
        const fullOrder = response.data?.data || response.data;
        if (fullOrder) {
          setOrderDetail(fullOrder);
        }
      } catch (error) {
        console.error("Failed to fetch order details", error);
        setOrderDetail(order);
      } finally {
        setLoading(false);
      }
    };

    if (order?.id) {
      fetchFullDetails();
    }
  }, [order?.id]);

  // Initialize serial numbers from the orderDetail object
  useEffect(() => {
    if (orderDetail?.items) {
      const initialSerials: { [key: string]: string[] } = {};
      orderDetail.items.forEach((item: any) => {
        if (item.type === "PRODUCT") {
          // Identify existing serial numbers from various possible fields
          let existingSns: string[] = [];

          if (
            Array.isArray(item.serial_numbers) &&
            item.serial_numbers.length > 0
          ) {
            existingSns = [...item.serial_numbers];
          } else if (
            typeof item.serial_numbers === "string" &&
            item.serial_numbers.trim()
          ) {
            existingSns = item.serial_numbers
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          } else if (
            typeof item.serial_number === "string" &&
            item.serial_number.trim()
          ) {
            existingSns = [item.serial_number.trim()];
          } else if (
            typeof item.device_id === "string" &&
            item.device_id.trim()
          ) {
            existingSns = [item.device_id.trim()];
          }

          const sns = [...existingSns];
          while (sns.length < item.quantity) sns.push("");
          if (sns.length > item.quantity) sns.length = item.quantity;

          initialSerials[item.id] = sns;

          fetchAvailability(item?.item_details?.id || item?.product_id);
        }
      });
      setItemSerials(initialSerials);
    }
  }, [orderDetail]);

  const fetchAvailability = async (productId: string) => {
    if (!productId) return;
    try {
      const params: any = { product_id: productId };
      if (order?.hub_id) params.hub_id = order.hub_id;

      const res = await axiosInstance.get(Api.productSerialAvailability, { params });
      const serials = res.data?.availability?.[0]?.available_serial_numbers || [];

      let parsedSerials: string[] = [];
      if (typeof serials === "string") {
        parsedSerials = serials.split(",").map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(serials)) {
        parsedSerials = serials;
      }

      setAvailableSerials(prev => ({
        ...prev,
        [productId]: [...new Set(parsedSerials)]
      }));
    } catch (error) {
      console.error("Failed to fetch serials", error);
    }
  };

  const handleSnChange = (orderItemId: string, snIndex: number, value: string) => {
    setItemSerials(prev => {
      const updated = [...(prev[orderItemId] || [])];
      updated[snIndex] = value;
      return { ...prev, [orderItemId]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    if (order?.payment_status !== "SUCCESS" && !paymentStatus) {
      toast.error("Please select a payment status");
      return;
    }

    // Validate Serial Numbers for Products
    const serialPayload = [];
    for (const item of orderDetail.items || []) {
      if (item.type === "PRODUCT") {
        const sns = itemSerials[item.id] || [];
        if (sns.length < item.quantity || sns.some(s => !s.trim())) {
          toast.error(`Please provide serial numbers for ${item?.item_details?.name || 'Product'}`);
          return;
        }
        serialPayload.push({
          order_item_id: item.id,
          serial_numbers: sns
        });
      }
    }

    try {
      setLoading(true);
      const payload: any = {
        order_status: status,
        serial_numbers: serialPayload
      };

      if (order?.payment_status !== "SUCCESS") {
        payload.payment_status = paymentStatus;
      }

      const response = await axiosInstance.post(
        `${Api?.manualActivate}${order?.id}/manual-update/`,
        payload
      );

      const updateData = response.data?.data || response.data;
      const message = response.data?.message || "";

      // Check for OTP requirement in data OR message
      const otpRequired =
        (updateData?.is_otp_required && !updateData?.is_otp_verified) ||
        message.toLowerCase().includes("otp sent");

      if (otpRequired && status === "COMPLETED") {
        setShowOtpInput(true);
        toast.success(message || "OTP sent to customer");
      } else {
        toast.success(`Order status updated to ${status} successfully`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);

      // verify otp
      const response = await axiosInstance.post(
        `${Api?.orderCancel}/${order?.id}/manual-update/verify-otp/`,
        { otp }
      );

      if (response.status === 200) {
        toast.success("Order status verified and updated successfully!");
        onSuccess();
      }
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Update Shop Order Status</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Order ID: <span className="font-mono text-blue-600">{order?.id}</span>
        </p>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {!showOtpInput ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select New Status</label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choosing Status</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {order?.payment_status !== "SUCCESS" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Update Payment Status</label>
                  <select
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Choose Payment Status</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              )}

              {/* Serial Number Management */}
              {orderDetail?.items?.some((i: any) => i.type === "PRODUCT") && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Item Serial Numbers</h3>
                  <div className="space-y-4">
                    {orderDetail.items.filter((i: any) => i.type === "PRODUCT").map((item: any) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-semibold text-gray-700">{item?.item_details?.name}</p>
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">QTY: {item.quantity}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.from({ length: item.quantity }).map((_, snIdx) => {
                            const currentSns = itemSerials[item.id] || [];
                            const productId = item?.item_details?.id || item?.product_id;

                            const otherSelectedSns: string[] = [];
                            Object.entries(itemSerials).forEach(([oId, sns]) => {
                              sns.forEach((sn, idx) => {
                                if (!(oId === item.id && idx === snIdx) && sn) {
                                  otherSelectedSns.push(sn);
                                }
                              });
                            });

                            const pool = availableSerials[productId] || [];
                            const currentVal = currentSns[snIdx] || "";

                            const existingInOrder = item.serial_numbers || [];
                            const combinedPool = [...new Set([...pool, ...existingInOrder])];

                            const options = combinedPool.filter(sn =>
                              sn === currentVal || !otherSelectedSns.includes(sn)
                            );

                            return (
                              <select
                                key={snIdx}
                                className="w-full border border-gray-300 p-2 rounded-lg text-xs focus:ring-1 focus:ring-orange-500 outline-none bg-white"
                                value={currentVal}
                                onChange={(e) => handleSnChange(item.id, snIdx, e.target.value)}
                              >
                                <option value="">Select S/N {snIdx + 1}</option>
                                {options.length === 0 && (
                                  <option value="" disabled className="text-red-500 font-bold">🚫 No available stock in hub</option>
                                )}
                                {options.map(sn => (
                                  <option key={sn} value={sn}>{sn}</option>
                                ))}
                              </select>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Customer OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all tracking-widest text-center text-xl font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              {/* <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100 italic text-xs text-green-700">
                Special verification is required as this order contains restricted items.
              </div> */}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>

          {!showOtpInput ? (
            <button
              onClick={handleSubmit}
              disabled={loading || !status}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Updating..." : "Update Status"}
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Verifying..." : "Verify & Complete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopStatusUpdateModal;