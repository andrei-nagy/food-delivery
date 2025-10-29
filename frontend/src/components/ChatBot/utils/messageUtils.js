export const generateUniqueId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export const processConfirmationResponse = (response, pendingLanguageChange, pendingWaiterRequest, language, setMessages, setPendingLanguageChange, setPendingWaiterRequest, submitWaiterRequest, switchLanguage) => {
  const lowerResponse = response.toLowerCase().trim();
  const tableNumber = localStorage.getItem("tableNumber");

  // Handle payment method text responses
  if (!pendingLanguageChange && !pendingWaiterRequest) {
    if (/(card|pos|terminal|contactless)/i.test(lowerResponse)) {
      const userMessage = {
        id: generateUniqueId(),
        text: response,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      setTimeout(() => {
        // This will be handled by the parent component
        return true;
      }, 500);
      return true;
    } else if (/(cash|numerar|bani)/i.test(lowerResponse)) {
      const userMessage = {
        id: generateUniqueId(),
        text: response,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      setTimeout(() => {
        // This will be handled by the parent component
        return true;
      }, 500);
      return true;
    }
  }

  if (pendingLanguageChange) {
    if (
      (language === "ro" &&
        (lowerResponse === "da" || lowerResponse === "yes")) ||
      (language === "en" &&
        (lowerResponse === "yes" || lowerResponse === "da"))
    ) {
      switchLanguage(pendingLanguageChange);
    } else if (
      lowerResponse === "nu" ||
      lowerResponse === "no" ||
      lowerResponse === "not"
    ) {
      const cancelMessage = {
        id: generateUniqueId(),
        text:
          language === "ro"
            ? "✅ Am anulat schimbarea limbii."
            : "✅ Language change cancelled.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, cancelMessage]);
      setPendingLanguageChange(null);
    } else {
      const invalidMessage = {
        id: generateUniqueId(),
        text:
          language === "ro"
            ? "❌ Vă rugăm să răspundeți cu **'da'** sau **'nu'**, sau folosiți butoanele."
            : "❌ Please reply with **'yes'** or **'no'**, or use the buttons.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, invalidMessage]);
    }
    return true;
  }

  if (pendingWaiterRequest) {
    if (
      (language === "ro" &&
        (lowerResponse === "da" || lowerResponse === "yes")) ||
      (language === "en" &&
        (lowerResponse === "yes" || lowerResponse === "da"))
    ) {
      submitWaiterRequest(
        pendingWaiterRequest.actionType,
        pendingWaiterRequest.actionMessage
      ).then((success) => {
        const resultMessage = {
          id: generateUniqueId(),
          text: success
            ? language === "ro"
              ? `✅ Un ospătar va veni la masa ${tableNumber} în câteva momente!`
              : `✅ A waiter will come to table ${tableNumber} shortly!`
            : language === "ro"
            ? "❌ Nu am reușit să trimitem cererea. Vă rugăm să încercați din nou sau folosiți butonul de asistență."
            : "❌ We couldn't send your request. Please try again or use the assistance button.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, resultMessage]);
      });
    } else if (
      lowerResponse === "nu" ||
      lowerResponse === "no" ||
      lowerResponse === "not"
    ) {
      const cancelMessage = {
        id: generateUniqueId(),
        text:
          language === "ro"
            ? "✅ Am anulat chemarea ospătarului."
            : "✅ Waiter call cancelled.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, cancelMessage]);
    } else {
      const invalidMessage = {
        id: generateUniqueId(),
        text:
          language === "ro"
            ? "❌ Vă rugăm să răspundeți cu **'da'** sau **'nu'**, sau folosiți butoanele."
            : "❌ Please reply with **'yes'** or **'no'**, or use the buttons.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, invalidMessage]);
    }
    setPendingWaiterRequest(null);
    return true;
  }

  return false;
};

export const showPaymentOptions = (language, setMessages, generateUniqueId) => {
  const paymentMessage = {
    id: generateUniqueId(),
    text: 
      language === "ro" 
        ? "💳 **Cum doriți să plătiți?**\n\nAlegeți metoda de plată preferată:"
        : "💳 **How would you like to pay?**\n\nChoose your preferred payment method:",
    sender: "bot",
    timestamp: new Date(),
    hasButtons: true,
    buttons: [
      {
        text: language === "ro" ? "💳 Card" : "💳 Card",
        action: "pay_by_card",
      },
      {
        text: language === "ro" ? "💵 Cash" : "💵 Cash",
        action: "pay_by_cash",
      },
      {
        text: language === "ro" ? "❌ Anulează" : "❌ Cancel",
        action: "cancel_payment",
      }
    ],
  };

  setMessages((prev) => [...prev, paymentMessage]);
};