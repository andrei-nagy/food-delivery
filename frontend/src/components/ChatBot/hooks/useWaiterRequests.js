import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { generateUniqueId } from "../utils/messageUtils";

export const useWaiterRequests = (url, language, setMessages) => {
  const [pendingWaiterRequest, setPendingWaiterRequest] = useState(null);
  const tableNumber = localStorage.getItem("tableNumber");

  const submitWaiterRequest = async (actionType, actionMessage) => {
    try {
      const response = await axios.post(`${url}/api/waiterorders/add`, {
        action: actionMessage,
        tableNo: tableNumber,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error submitting waiter request:", error);
      toast.error(
        language === "ro"
          ? "Ceva nu a funcționat. Vă rugăm să încercați din nou."
          : "Something went wrong. Please try again."
      );
      return false;
    }
  };

  const confirmWaiterRequest = (actionType, actionMessage) => {
    const isPayment = actionType === "payment";

    const confirmationMessage = {
      id: generateUniqueId(),
      text:
        language === "ro"
          ? `🤔 Sigur doriți să chemați un ospătar pentru **${
              isPayment ? "plată" : "asistență"
            }**?`
          : `🤔 Are you sure you want to call a waiter for **${
              isPayment ? "payment" : "assistance"
            }**?`,
      sender: "bot",
      timestamp: new Date(),
      hasButtons: true,
      buttons: [
        {
          text: language === "ro" ? "✅ Da, cheamă ospătar" : "✅ Yes, call waiter",
          action: "confirm_waiter",
          actionType: actionType,
          actionMessage: actionMessage,
        },
        {
          text: language === "ro" ? "❌ Nu, anulează" : "❌ No, cancel",
          action: "cancel_waiter",
        },
      ],
    };

    setMessages((prev) => [...prev, confirmationMessage]);
    setPendingWaiterRequest({ actionType, actionMessage });
  };

  return {
    submitWaiterRequest,
    confirmWaiterRequest,
    pendingWaiterRequest,
    setPendingWaiterRequest
  };
};