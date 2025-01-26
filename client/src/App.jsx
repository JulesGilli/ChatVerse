import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ChannelListWindow from './components/ChannelListWindow.jsx';
import { createSocketConnection } from './socketService';
import { handleCommand } from './inputManager'; // Importing the new command handler

const COMMANDS = [
  '/create',
  '/list',
  '/join',
  '/quit',
  '/delete',
  '/nick',
];

function CommandInput({ onCommand, suggestions, onInputChange, input }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onCommand(input);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onInputChange(suggestion);
  };

  return (
    <div className="command-input">
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
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
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showChannelList, setShowChannelList] = useState(false);

  useEffect(() => {
    const newSocket = createSocketConnection(
      setCurrentUserId,
      setUsers,
      setMessages,
      setHistoryMessage,
      (channelData) => {
        setChannels(channelData);
        setShowChannelList(true); 
      },
      setError
    );
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleUserCommand = (input) => {
    handleCommand(input, socket, currentUserId, setShowChannelList);
    setInput('');
    setSuggestions([]);
  };

  const handleInputChange = (value) => {
    setInput(value);

    if (value.startsWith('/')) {
      const filteredSuggestions = COMMANDS.filter((cmd) =>
        cmd.startsWith(value)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        users={users}
        channels={channels}
        onCommand={handleUserCommand}
        currentFail={currentFail}
      />
      <div className="main-content">
        {showChannelList ? (
          <ChannelListWindow
            channels={channels}
            onClose={() => setShowChannelList(false)}
          />
        ) : (
          <>
            <ChatWindow
              messages={messages}
              messageHistory={messagesHistory}
              currentUserId={currentUserId}
              users={users}
            />
            <CommandInput
              onCommand={handleUserCommand}
              suggestions={suggestions}
              onInputChange={handleInputChange}
              input={input} 
            />
          </>
        )}
      </div>
    </div>
  );
}
  
export default App;
