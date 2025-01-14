import React from 'react';

function MessageInput({ message, setMessage, sendMessage }) {
  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Tapez un message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
}

export default MessageInput;
