import React, { useState } from "react";
import axiosInstance from "../../configs/axios-middleware";
import Api from "../../api-endpoints/ApiUrls";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";

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
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `${Api?.manualActivate}${order?.id}/manual-update/`,
        {
          order_status: status,
          payment_status: status === "COMPLETED" ? "SUCCESS" : order?.payment_status || "PENDING",
          assign_agent: false,
          agent_id: order?.assigned_agent_id || null,
          order_platform: "SHOP",
        }
      );

      const updateData = response.data?.["Order updated successfully"] || response.data?.data;
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Update Shop Order Status</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Order ID: <span className="font-mono text-blue-600">{order?.id}</span>
        </p>

        <div className="space-y-4">
          {!showOtpInput ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select New Status</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose Status</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Customer OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all tracking-widest text-center text-lg font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">Special verification is required as this order contains OTP-restricted items.</p>
            </div>
          )}

          {/* <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <span className="font-bold">Note:</span>
              This will manually update the order's status on the platform.
            </p>
          </div> */}
        </div>

        <div className="mt-8 flex justify-end gap-3">
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
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          ) : (
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
            >
              {loading ? "Verifying..." : "Verify & Complete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopStatusUpdateModal;
