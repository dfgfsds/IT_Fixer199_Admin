import React, { useEffect, useState } from "react";
import axiosInstance from "../../../configs/axios-middleware";
import Api from "../../../api-endpoints/ApiUrls";
import { Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../../utils/extractErrorMessage ";

const TRACKING_STATUS = [
  "PENDING",
  "COLLECTED",
  "IN_TRANSIT_TO_HUB",
  "RECEIVED_AT_HUB",
  "UNDER_INSPECTION",
  "WAITING_FOR_PARTS",
  "REPAIR_IN_PROGRESS",
  "REPAIR_COMPLETED",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const TrackingModal = ({ show, onClose, requestId }: any) => {

  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!show || !requestId) return;
    fetchTracking();
  }, [show]);

  const fetchTracking = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `${Api.requestTracking}/${requestId}/`
      );

      setTracking(res?.data?.data || []);

    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {

    if (!status) {
      toast.error("Select status");
      return;
    }

    try {

      setLoading(true);

      await axiosInstance.post(
        `${Api.requestTracking}/${requestId}/`,
        {
          hub_status: status,
          notes: note,
          visible_to_customer: true
        }
      );

      if (status === "DELIVERED") {
        toast.success("OTP sent to customer");
        setOtpModal(true);
      } else {
        toast.success("Tracking updated");
        fetchTracking();
      }

      setStatus("");
      setNote("");

    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {

    if (!otp) {
      toast.error("Enter OTP");
      return;
    }

    try {

      setLoading(true);

      await axiosInstance.post(
        `${Api.deliveryVerifyOtp}/${requestId}/`,
        { otp }
      );

      toast.success("Delivery verified successfully");

      setOtp("");
      setOtpModal(false);

      fetchTracking();

    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const usedStatus = tracking.map(t => t.status);

  const availableStatus = TRACKING_STATUS.filter(
    s => !usedStatus.includes(s)
  );

  /* CHECK IF DELIVERED EXISTS */

  const deliveredExists = tracking.some(
    t => t.status === "DELIVERED"
  );

  if (!show) return null;

  return (

    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      {/* MODAL */}

      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">

          <h2 className="text-lg font-semibold">
            Device Tracking
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ✕
          </button>

        </div>

        <div className="p-6">

          {/* TIMELINE */}

          <div className="space-y-5 mb-8">

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin" />
              </div>
            ) : tracking.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No tracking history
              </p>
            ) : (

              tracking.map((t: any) => (

                <div key={t.id} className="flex gap-4">

                  <div>
                    <CheckCircle className="text-green-500 mt-1" size={20} />
                  </div>

                  <div className="flex-1 border rounded-lg p-4">

                    <p className="font-semibold text-sm">
                      {t.status.replaceAll("_", " ")}
                    </p>

                    {t.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t.notes}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(t.created_at).toLocaleString()}
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* ADD STATUS */}

          {!deliveredExists && (

            <div className="border-t pt-6 space-y-4">

              <h3 className="font-medium text-gray-700">
                Add Tracking Update
              </h3>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >

                <option value="">
                  Select Status
                </option>

                {availableStatus.map((s: any) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}

              </select>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter notes..."
                className="w-full border rounded-lg px-3 py-2"
              />

              <button
                onClick={handleAdd}
                disabled={loading}
                className="bg-orange-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Updating..." : "Add Update"}
              </button>

            </div>

          )}

        </div>

      </div>

      {/* OTP MODAL */}

      {otpModal && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-white w-full max-w-sm rounded-xl p-6">

            <h3 className="text-lg font-semibold mb-4">
              Verify Delivery OTP
            </h3>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border rounded-lg px-3 py-2 mb-4 text-center"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setOtpModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={verifyOtp}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Verify
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
};

export default TrackingModal;