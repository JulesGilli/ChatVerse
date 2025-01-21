import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import { createSocketConnection } from './socketService';
import { handleCommand } from './inputManager.js';
//import CommandInput from './components/CommandInput.jsx'

function CommandInput({ onCommand }) {
  const [input, setInput] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onCommand(input);
      setInput('');
    }
  };

  return (
    <div className="command-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a command or message..."
        onKeyDown={handleKeyPress}
      />
    </div>
  );
}

function App() {
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [messagesHistory, setHistoryMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [currentFail, setError] = useState('');

  useEffect(() => {
    const newSocket = createSocketConnection(setCurrentUserId, setUsers, setMessages, setHistoryMessage, setChannels, setError);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        users={users}
        channels={channels}
        onCommand={handleCommand}
        currentFail={currentFail}
      />
      <div className="main-content">
        <ChatWindow
          messages={messages}
          messageHistory={messagesHistory}
          currentUserId={`user${currentUserId}`}
        />
        <CommandInput onCommand={handleCommand} />
      </div>
    </div>
  );
}

export default App;
