import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages, messageHistory, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messageHistory]);
  
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
        <div ref={messagesEndRef} style={{ height: 0, margin: 0, padding: 0 }} />
      </div>
    </div>
  );
}

export default ChatWindow;
