import { useState } from "react";
import { clientPOS } from "../components/clientPOS";

export function useManualTillPayment(
  isEnabled,
  cart,
  branchId,
  setToast,
  setError,
  tillNumber = "174379"
) {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  //const [cartRef, setCartRef] = useState(null);

  const initiateManualTillPayment = async (
    cartTotal,
    items,
    branchId,
    customerTelephone
  ) => {
    if (!isEnabled || !branchId || !items.length) {
      setError("Cannot initiate payment: Invalid branch or empty cart");
      setToast({
        open: true,
        msg: "Cannot initiate payment: Invalid branch or empty cart",
        sev: "error",
      });
      return null;
    }

    try {
      const response = await clientPOS.post(
        "/api/mpesa/c2b/initiate",
        {
          amount: cartTotal,
          tillNumber: String(tillNumber),
          branch_id: branchId,
          items,
          customer_telephone: customerTelephone || null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );

      setTransactionId(response.data.transactionId);
      //setCartRef(response.data.cartRef);
      setPaymentStatus("pending");
      setToast({ open: true, msg: response.data.message, sev: "info" });

      return response.data;
    } catch (error) {
      console.error(
        "Payment initiation failed:",
        error.response?.data || error.message
      );
      setPaymentStatus("error");
      setError(error.response?.data?.error || "Failed to initiate payment");
      setToast({ open: true, msg: "Failed to initiate payment", sev: "error" });
      return null;
    }
  };

  // ✅ Added missing resetPayment
  const resetPayment = () => {
    setPaymentStatus(null);
    setTransactionId(null);
    //setCartRef(null);
  };

  return {
    paymentStatus,
    transactionId,
    //cartRef,
    initiateManualTillPayment,
    resetPayment, // now it works
  };
}

