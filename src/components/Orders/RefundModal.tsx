import { useEffect, useState } from "react";
import Api from "../../api-endpoints/ApiUrls";
import axiosInstance from "../../configs/axios-middleware";
import { extractErrorMessage } from "../../utils/extractErrorMessage ";


const RefundModal = ({ order, onClose, onSuccess }: any) => {
    const [otp, setOtp] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string>("");

    useEffect(() => {
        const first = document.getElementById("otp-0");
        if (first) (first as HTMLInputElement).focus();
    }, []);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setApiErrors("Please enter valid 6 digit OTP");
            return;
        }

        try {
            setLoading(true);

            const updatedApi = await axiosInstance.post(`${Api?.refundOtpVerify}/`, {
                order_id: order.id,
                otp,
                notes,
            });

            if (updatedApi) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setApiErrors(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        const digit = value.replace(/\D/g, "");
        if (!digit) return;

        const otpArray = otp.split("");
        otpArray[index] = digit;

        const newOtp = otpArray.join("").slice(0, 6);
        setOtp(newOtp);

        const next = document.getElementById(`otp-${index + 1}`);
        if (next) (next as HTMLInputElement).focus();
    };

    const handleKeyDown = (e: any, index: number) => {
        if (e.key === "Backspace") {
            const otpArray = otp.split("");
            otpArray[index] = "";
            setOtp(otpArray.join(""));

            const prev = document.getElementById(`otp-${index - 1}`);
            if (prev) (prev as HTMLInputElement).focus();
        }
    };

    const handlePaste = (e: any) => {
        const paste = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        setOtp(paste);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

                {/* HEADER */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Refund Verification
                </h2>

                {/* ORDER INFO */}
                {/* <div className="bg-gray-50 rounded-lg p-4 mb-5 text-sm space-y-1">
          <div>
            <span className="font-medium text-gray-600">Order ID :</span>{" "}
            {order?.id}
          </div>
          <div>
            <span className="font-medium text-gray-600">Customer :</span>{" "}
            {order?.customer_name}
          </div>
          <div>
            <span className="font-medium text-gray-600">Amount :</span>{" "}
            ₹{order?.total_price}
          </div>
        </div> */}

                {/* FORM */}
                <div className="space-y-5">

                    {/* OTP LABEL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP
                        </label>

                        <div onPaste={handlePaste} className="flex justify-between gap-2">
                            {[...Array(6)].map((_, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={otp[index] || ""}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 h-12 text-center border rounded-lg text-lg font-semibold focus:ring-2 focus:ring-orange-500"
                                />
                            ))}
                        </div>
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Refund Notes
                        </label>

                        <textarea
                            placeholder="Enter reason for refund..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                </div>

                {/* ERROR */}
                {apiErrors && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                        {apiErrors}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        {loading ? "Processing..." : "Confirm Refund"}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default RefundModal;