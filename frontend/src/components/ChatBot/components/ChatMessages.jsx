import React from "react";

const ChatMessages = ({ messages, isTyping, messagesEndRef, onQuickReply, onButtonClick }) => {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.sender}`}>
          <div className="message-content">
            {message.text
              .split("**")
              .map((part, index) =>
                index % 2 === 1 ? (
                  <strong key={index}>{part}</strong>
                ) : (
                  part
                )
              )}

            {message.hasButtons && (
              <div className="confirmation-buttons">
                {message.buttons.map((button, index) => (
                  <button
                    key={index}
                    className={`confirmation-button ${button.action} ${
                      button.disabled ? "disabled" : ""
                    }`}
                    onClick={() =>
                      !button.disabled &&
                      onButtonClick(button, message.id)
                    }
                    disabled={button.disabled}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            )}

            {message.quickReplies && (
              <div className="quick-replies">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="quick-reply"
                    onClick={() => onQuickReply(reply)}
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="message-time">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="message bot typing">
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;