import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useWaiterRequests } from "./useWaiterRequests";
import { findBestMatch } from "../utils/patternMatcher";
import { generateUniqueId, processConfirmationResponse, showPaymentOptions } from "../utils/messageUtils";

export const useChatLogic = (show, onClose, url) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [pendingLanguageChange, setPendingLanguageChange] = useState(null);
  
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const { submitWaiterRequest, confirmWaiterRequest, pendingWaiterRequest, setPendingWaiterRequest } = useWaiterRequests(url, language, setMessages);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 100);
    }
  }, [show, messages, scrollToBottom]);

  const handleClose = useCallback((e) => {
    if (e.target === e.currentTarget || e.target.closest(".close-chat")) {
      const inputElement = inputRef.current;
      if (inputElement) {
        inputElement.blur();
      }
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [onClose]);

  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsKeyboardVisible(true);
    setTimeout(scrollToBottom, 300);
  }, [scrollToBottom]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setIsKeyboardVisible(false), 500);
  }, []);

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("language");
    if (savedLanguage && (savedLanguage === "ro" || savedLanguage === "en")) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (show && messages.length === 0) {
      setMessages([
        {
          id: generateUniqueId(),
          text:
            language === "ro"
              ? "🤖 Bună! Sunt Diana AI și vă pot ajuta cu: \n\n• **Recomandări meniu** \n• **Informații preparate și ingrediente** \n• **Program și locație** \n• **Stare comandă** \n• **Chemare ospătar** \n• **Informații plăți** \n• **Cerințe speciale** \n\nÎntrebați-mă orice doriți să știți! 😊"
              : "🤖 Hello! I'm Diana AI and I can help you with: \n\n• **Menu recommendations** \n• **Dish and ingredient information** \n• **Hours and location** \n• **Order status** \n• **Calling a waiter** \n• **Payment information** \n• **Special requests** \n\nAsk me anything you'd like to know! 😊",
          sender: "bot",
          timestamp: new Date(),
          quickReplies:
            language === "ro"
              ? [
                  { text: "🍽️ Ce recomanzi?", action: "recommendation" },
                  { text: "📋 Meniul", action: "menu" },
                  { text: "🧾 Plata", action: "payment" },
                  { text: "🆘 Ajutor", action: "help" },
                ]
              : [
                  { text: "🍽️ Recommendations", action: "recommendation" },
                  { text: "📋 Menu", action: "menu" },
                  { text: "🧾 Payment", action: "payment" },
                  { text: "🆘 Help", action: "help" },
                ],
        },
      ]);
    }
  }, [language, show, messages.length]);

  const switchLanguage = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    sessionStorage.setItem("language", newLanguage);
    setPendingLanguageChange(null);

    const infoMessage = {
      id: generateUniqueId(),
      text:
        newLanguage === "ro"
          ? "🌍 Limba a fost schimbată în română!"
          : "🌍 Language switched to English!",
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, infoMessage]);

    toast.success(
      newLanguage === "ro"
        ? "Limba a fost schimbată în română!"
        : "Language switched to English!"
    );
  }, []);

  const confirmLanguageChange = useCallback((newLanguage) => {
    if (newLanguage === language) {
      const alreadySetMessage = {
        id: generateUniqueId(),
        text:
          newLanguage === "ro"
            ? "ℹ️ Limba este deja setată pe **română**!"
            : "ℹ️ The language is already set to **English**!",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, alreadySetMessage]);
      return;
    }

    const confirmationMessage = {
      id: generateUniqueId(),
      text:
        newLanguage === "ro"
          ? "🤔 Sigur doriți să schimbați limba în **română**?"
          : "🤔 Are you sure you want to switch to **English**?",
      sender: "bot",
      timestamp: new Date(),
      hasButtons: true,
      buttons: [
        {
          text: newLanguage === "ro" ? "✅ Da" : "✅ Yes",
          action: "confirm_language",
          language: newLanguage,
        },
        {
          text: newLanguage === "ro" ? "❌ Nu" : "❌ No",
          action: "cancel_language",
        },
      ],
    };

    setMessages((prev) => [...prev, confirmationMessage]);
    setPendingLanguageChange(newLanguage);
  }, [language]);

  const handlePaymentOptions = useCallback(() => {
    showPaymentOptions(language, setMessages, generateUniqueId);
  }, [language]);

  const handleButtonClick = useCallback(async (button, messageId) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.hasButtons) {
          return {
            ...msg,
            buttons: msg.buttons.map((btn) => ({
              ...btn,
              disabled: true,
            })),
          };
        }
        return msg;
      })
    );

    if (button.action === "confirm_language") {
      switchLanguage(button.language);
    } else if (button.action === "cancel_language") {
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
    } else if (button.action === "confirm_waiter") {
      const success = await submitWaiterRequest(
        button.actionType,
        button.actionMessage
      );

      const resultMessage = {
        id: generateUniqueId(),
        text: success
          ? language === "ro"
            ? `✅ Un ospătar va veni la masa în câteva momente!`
            : `✅ A waiter will come to table shortly!`
          : language === "ro"
          ? "❌ Nu am reușit să trimitem cererea. Vă rugăm să încercați din nou sau folosiți butonul de asistență."
          : "❌ We couldn't send your request. Please try again or use the assistance button.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, resultMessage]);
      setPendingWaiterRequest(null);
    } else if (button.action === "cancel_waiter") {
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
      setPendingWaiterRequest(null);
    } else if (button.action === "pay_by_card") {
      const userMessage = {
        id: generateUniqueId(),
        text: language === "ro" ? "Vreau să plătesc cu cardul" : "I want to pay by card",
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      setTimeout(() => {
        confirmWaiterRequest("payment", language === "ro" ? "Plată cu cardul" : "Card payment");
      }, 500);
    } else if (button.action === "pay_by_cash") {
      const userMessage = {
        id: generateUniqueId(),
        text: language === "ro" ? "Vreau să plătesc cash" : "I want to pay by cash",
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      
      setTimeout(() => {
        confirmWaiterRequest("payment", language === "ro" ? "Plată cash" : "Cash payment");
      }, 500);
    } else if (button.action === "cancel_payment") {
      const cancelMessage = {
        id: generateUniqueId(),
        text:
          language === "ro"
            ? "✅ Am anulat selecția metodei de plată."
            : "✅ Payment method selection cancelled.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, cancelMessage]);
    }
  }, [language, switchLanguage, submitWaiterRequest, confirmWaiterRequest]);

  const sendQuickMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: generateUniqueId(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    if (pendingLanguageChange || pendingWaiterRequest) {
      if (processConfirmationResponse(text, pendingLanguageChange, pendingWaiterRequest, language, setMessages, setPendingLanguageChange, setPendingWaiterRequest, submitWaiterRequest, switchLanguage)) {
        return;
      }
    }

    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = await findBestMatch(text, language, url);

      let botMessageText = "";
      let quickReplies = null;

      if (botResponse && typeof botResponse === "object") {
        if (botResponse.type === "language_change") {
          if (botResponse.newLanguage === language) {
            botMessageText =
              language === "ro"
                ? "ℹ️ Limba este deja setată pe **română**!"
                : "ℹ️ The language is already set to **English**!";
          } else {
            confirmLanguageChange(botResponse.newLanguage);
            setIsTyping(false);
            return;
          }
        } else if (botResponse.type === "waiter_request") {
          confirmWaiterRequest(
            botResponse.actionType,
            botResponse.actionMessage
          );
          setIsTyping(false);
          return;
        } else if (botResponse.type === "payment_options") {
          handlePaymentOptions();
          setIsTyping(false);
          return;
        } else if (botResponse.text) {
          botMessageText = botResponse.text;
          quickReplies = botResponse.quickReplies;
        }
      } else {
        botMessageText =
          botResponse ||
          (language === "ro"
            ? "🤔 Îmi pare rău, nu înțeleg întrebarea. Încercați să mă întrebați despre:\n\n• **Recomandări meniu**\n• **Informații preparate**\n• **Program restaurant**\n• **Chemare ospătar**\n• **Plată**"
            : "🤔 I'm sorry, I don't understand the question. Try asking me about:\n\n• **Menu recommendations**\n• **Dish information**\n• **Restaurant hours**\n• **Calling a waiter**\n• **Payment**");
      }

      const botMessage = {
        id: generateUniqueId(),
        text: botMessageText,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: quickReplies
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  }, [pendingLanguageChange, pendingWaiterRequest, language, url, submitWaiterRequest, switchLanguage, confirmLanguageChange, confirmWaiterRequest, handlePaymentOptions]);

  const handleQuickReply = useCallback((reply) => {
    if (reply.action === "view_full_menu") {
      window.location.href = "/category/All";
    } else if (reply.action === "view_pizza") {
      window.location.href = "/category/Pizza";
    } else if (reply.action === "view_salads") {
      window.location.href = "/category/Salads";
    } else if (reply.action === "view_grill") {
      window.location.href = "/category/Grill";
    } else if (reply.action === "payment") {
      handlePaymentOptions();
    } else {
      sendQuickMessage(reply.text);
    }
  }, [sendQuickMessage, handlePaymentOptions]);

  const handleQuickAction = useCallback((actionType) => {
    let message = "";
    switch (actionType) {
      case "recommendation":
        message = language === "ro" ? "Ce recomanzi?" : "What do you recommend?";
        break;
      case "payment":
        handlePaymentOptions();
        return;
      case "hours":
        message = language === "ro" ? "Program restaurant" : "Restaurant hours";
        break;
      case "menu":
        message = language === "ro" ? "Meniul" : "Menu";
        break;
      case "help":
        message = language === "ro" ? "Am nevoie de ajutor" : "I need help";
        break;
      default:
        message = language === "ro" ? "Ajutor" : "Help";
    }
    sendQuickMessage(message);
  }, [language, sendQuickMessage, handlePaymentOptions]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: generateUniqueId(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    if (pendingLanguageChange || pendingWaiterRequest) {
      if (processConfirmationResponse(inputMessage, pendingLanguageChange, pendingWaiterRequest, language, setMessages, setPendingLanguageChange, setPendingWaiterRequest, submitWaiterRequest, switchLanguage)) {
        return;
      }
    }

    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = await findBestMatch(inputMessage, language, url);

      let botMessageText = "";
      let quickReplies = null;

      if (botResponse && typeof botResponse === "object") {
        if (botResponse.type === "language_change") {
          if (botResponse.newLanguage === language) {
            botMessageText =
              language === "ro"
                ? "ℹ️ Limba este deja setată pe **română**!"
                : "ℹ️ The language is already set to **English**!";
          } else {
            confirmLanguageChange(botResponse.newLanguage);
            setIsTyping(false);
            return;
          }
        } else if (botResponse.type === "waiter_request") {
          confirmWaiterRequest(
            botResponse.actionType,
            botResponse.actionMessage
          );
          setIsTyping(false);
          return;
        } else if (botResponse.type === "payment_options") {
          handlePaymentOptions();
          setIsTyping(false);
          return;
        } else if (botResponse.text) {
          botMessageText = botResponse.text;
          quickReplies = botResponse.quickReplies;
        }
      } else {
        botMessageText =
          botResponse ||
          (language === "ro"
            ? "🤔 Îmi pare rău, nu înțeleg întrebarea. Încercați să mă întrebați despre:\n\n• **Recomandări meniu**\n• **Informații preparate**\n• **Program restaurant**\n• **Chemare ospătar**\n• **Plată**"
            : "🤔 I'm sorry, I don't understand the question. Try asking me about:\n\n• **Menu recommendations**\n• **Dish information**\n• **Restaurant hours**\n• **Calling a waiter**\n• **Payment**");
      }

      const botMessage = {
        id: generateUniqueId(),
        text: botMessageText,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: quickReplies
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  }, [inputMessage, pendingLanguageChange, pendingWaiterRequest, language, url, submitWaiterRequest, switchLanguage, confirmLanguageChange, confirmWaiterRequest, handlePaymentOptions]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: generateUniqueId(),
        text:
          language === "ro"
            ? "🤖 Bună! Sunt Diana AI și vă pot ajuta cu: \n\n• **Recomandări meniu** \n• **Informații preparate și ingrediente** \n• **Program și locație** \n• **Stare comandă** \n• **Chemare ospătar** \n• **Informații plăți** \n• **Cerințe speciale** \n\nÎntrebați-mă orice doriți să știți! 😊"
            : "🤖 Hello! I'm Diana AI and I can help you with: \n\n• **Menu recommendations** \n• **Dish and ingredient information** \n• **Hours and location** \n• **Order status** \n• **Calling a waiter** \n• **Payment information** \n• **Special requests** \n\nAsk me anything you'd like to know! 😊",
        sender: "bot",
        timestamp: new Date(),
        quickReplies:
          language === "ro"
            ? [
                { text: "🍽️ Ce recomanzi?", action: "recommendation" },
                { text: "📋 Meniul", action: "menu" },
                { text: "🧾 Plata", action: "payment" },
                { text: "🆘 Ajutor", action: "help" },
              ]
            : [
                { text: "🍽️ Recommendations", action: "recommendation" },
                { text: "📋 Menu", action: "menu" },
                { text: "🧾 Payment", action: "payment" },
                { text: "🆘 Help", action: "help" },
              ],
      },
    ]);
    setPendingLanguageChange(null);
    setPendingWaiterRequest(null);
  }, [language]);

  return {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    language,
    setLanguage,
    isTyping,
    isKeyboardVisible,
    messagesEndRef,
    modalRef,
    inputRef,
    handleSendMessage,
    handleKeyPress,
    handleQuickReply,
    handleQuickAction,
    handleClose,
    handleModalClick,
    handleInputFocus,
    handleInputBlur,
    clearChat,
    switchLanguage: confirmLanguageChange,
    handleButtonClick,
    confirmWaiterRequest,
    submitWaiterRequest
  };
};