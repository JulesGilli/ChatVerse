import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages, currentUserId, users }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.userId === currentUserId ? 'sent' : 'received'
            }`}
          >
            <strong>{msg.userName}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} style={{ height: 0, margin: 0, padding: 0 }} />
      </div>
    </div>
  );
}

export default ChatWindow;
