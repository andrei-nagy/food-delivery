import React from "react";
import { FaTimes, FaRedo, FaGlobe, FaRobot } from "react-icons/fa";

const ChatHeader = ({ language, onClose, onClearChat, onSwitchLanguage }) => {
  return (
    <div className="chat-header">
      <div className="chat-title">
        <div className="avatar">
          <FaRobot />
        </div>
        <div className="title-text">
          <div className="main-title">Diana AI</div>
          <div className="subtitle">
            {language === "ro" ? "Asistent restaurant" : "Restaurant assistant"}
            <small> (v1.5)</small>
          </div>
        </div>
      </div>
      <div className="chat-actions">
        <button
          className="clear-chat-btn"
          onClick={onClearChat}
          title={language === "ro" ? "Șterge conversația" : "Clear conversation"}
        >
          <FaRedo />
        </button>
        <button
          className="language-switch-btn"
          onClick={() => onSwitchLanguage(language === "ro" ? "en" : "ro")}
          title={language === "ro" ? "Switch to English" : "Treceți la Română"}
        >
          <FaGlobe />
          <span className="language-indicator">
            {language === "ro" ? "RO" : "EN"}
          </span>
        </button>
        <button
          className="close-chat"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;