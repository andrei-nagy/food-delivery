import React from "react";
import { StoreContext } from "../../context/StoreContext";
import { useChatLogic } from "./hooks/useChatLogic";
import { usePopularProducts } from "./hooks/usePopularProducts";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import "./ChatBot.css";

const ChatBot = ({ show, onClose }) => {
  const { url } = React.useContext(StoreContext);
  
  const {
    messages,
    inputMessage,
    setInputMessage,
    language,
    isTyping,
    messagesEndRef,
    modalRef,
    inputRef,
    handleSendMessage,
    handleKeyPress,
    handleQuickReply,
    handleQuickAction,
    handleClose,
    handleModalClick,
    clearChat,
    switchLanguage,
    handleButtonClick
  } = useChatLogic(show, onClose, url);

  usePopularProducts(show, url);

  if (!show) return null;

  return (
    <div className="modal-overlay-diana" onClick={handleClose}>
      <div className="diana-ai-modal" onClick={handleModalClick} ref={modalRef}>
        <div className="diana-ai-chat">
          <ChatHeader 
            language={language}
            onClose={handleClose}
            onClearChat={clearChat}
            onSwitchLanguage={switchLanguage}
          />
          
          <ChatMessages 
            messages={messages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            onQuickReply={handleQuickReply}
            onButtonClick={handleButtonClick}
          />
          
          <ChatInput 
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            onQuickAction={handleQuickAction}
            language={language}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBot;