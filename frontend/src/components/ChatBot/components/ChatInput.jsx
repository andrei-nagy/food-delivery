import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { IoIosRestaurant, IoMdTime } from "react-icons/io";
import { MdRestaurantMenu, MdPayment, MdSupportAgent } from "react-icons/md";

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  onKeyPress, 
  onQuickAction,
  language,
  inputRef
}) => {
  const handleInputFocus = () => {
    // Focus logic will be handled by parent if needed
  };

  const handleInputBlur = () => {
    // Blur logic will be handled by parent if needed
  };

  return (
    <div className="chat-input-container">
      <div className="quick-actions">
        <button onClick={() => onQuickAction("recommendation")}>
          <IoIosRestaurant />
          {language === "ro" ? "Recomandări" : "Recommend"}
        </button>
        <button onClick={() => onQuickAction("payment")}>
          <MdPayment />
          {language === "ro" ? "Plată" : "Payment"}
        </button>
        <button onClick={() => onQuickAction("hours")}>
          <IoMdTime />
          {language === "ro" ? "Program" : "Hours"}
        </button>
        <button onClick={() => onQuickAction("menu")}>
          <MdRestaurantMenu />
          {language === "ro" ? "Meniu" : "Menu"}
        </button>
        <button onClick={() => onQuickAction("help")}>
          <MdSupportAgent />
          {language === "ro" ? "Ajutor" : "Help"}
        </button>
      </div>

      <div className="chat-input">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={onKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={
            language === "ro"
              ? "Scrieți mesajul aici..."
              : "Type your message here..."
          }
          className="message-input"
          maxLength={200}
        />
        <button
          onClick={onSendMessage}
          className="send-button"
          disabled={!inputMessage.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;