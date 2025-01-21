import React from 'react';

function ChatWindow({ messages, messageHistory, currentUserId }) {
  return (
    <div className="chat-window">
      <div className="messages">
        {messageHistory.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.userId === currentUserId ? 'sent' : 'received'
            }`}
          >
            <strong>{msg.userId}:</strong> {msg.content}
          </div>
        ))}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.userId === currentUserId ? 'sent' : 'received'
            }`}
          >
            <strong>{msg.userId}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatWindow;
