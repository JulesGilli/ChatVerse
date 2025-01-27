import React, { useEffect, useRef } from 'react';

function ChatWindow({ messages, currentUserId, users }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getNickname = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

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
            <strong>{getNickname(msg.userId)}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} style={{ height: 0, margin: 0, padding: 0 }} />
      </div>
    </div>
  );
}

export default ChatWindow;
