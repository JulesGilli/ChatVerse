import React from 'react';
import MessageInput from './MessageInput';

function ChatWindow({ messagesHistory, messages, message, setMessage, sendMessage }) {
  return (
    <div className="chat-window">
      <h2>Messages</h2>
      <div className="messages">
        {messagesHistory.map((msgH, indexH) => (
          <div key={indexH} className="message received">
            <p>
              <strong>{msgH.userId}:</strong> {msgH.content}
            </p>
          </div>
        ))}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.userId === 'You' ? 'sent' : 'received'}`}>
            <p>
              <strong>{msg.userId}:</strong> {msg.content}
            </p>
          </div>
        ))}
      </div>
      <MessageInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default ChatWindow;
