import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// Composant Sidebar
function Sidebar({ users, channels, onCommand, currentFail }) {
  return (
    <div className="sidebar">
      <h1>Users</h1>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.name}</li>
        ))}
      </ul>
      <h1>Channels</h1>
      <ul>
        {channels.map((channel, index) => (
          <li key={index} onClick={() => onCommand(`/join ${channel.name}`)}>
            {channel.name}
          </li>
        ))}
      </ul>
      <h2>Errors</h2>
      <p>{currentFail}</p>
    </div>
  );
}

// Composant ChatWindow
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

// Composant CommandInput
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

// Composant principal App
function App() {
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [messagesHistory, setHistoryMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [currentFail, setError] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setCurrentUserId(newSocket.id);
      console.log(`Connected with ID: ${newSocket.id}`);
    });

    newSocket.on('updateUsers', (data) => {
      setUsers(data);
    });

    newSocket.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    newSocket.on('messageHistory', (data) => {
      setHistoryMessage(data);
    });

    newSocket.on('listChannels', (data) => {
      setChannels(data);
    });

    newSocket.on('errors', (data) => {
      setError(data.error || 'Unknown error');
    });

    newSocket.on('userNicknameFetch', ({ userId, oldName, newNickname }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, name: newNickname } : user
        )
      );
      console.log(`${oldName} changed their nickname to ${newNickname}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCommand = (input) => {
    const trimmedInput = input.trim();

    if (trimmedInput.startsWith('/create')) {
      const channelName = trimmedInput.split(' ')[1];
      if (channelName && socket) {
        socket.emit('createChannel', { name: channelName });
      }
    } else if (trimmedInput.startsWith('/list')) {
      const channelFilter = trimmedInput.split(' ')[1];
      socket.emit('getChannels', { filter: channelFilter });
    } else if (trimmedInput.startsWith('/join')) {
      const channelName = trimmedInput.split(' ')[1];
      socket.emit('joinChannel', { name: channelName });
    } else if (trimmedInput.startsWith('/quit')) {
      const channelName = trimmedInput.split(' ')[1];
      socket.emit('leaveChannel', { name: channelName });
    } else if (trimmedInput.startsWith('/delete')) {
      const channelName = trimmedInput.split(' ')[1];
      socket.emit('deleteChannel', { name: channelName });
    } else if (trimmedInput.startsWith('/nick')) {
      const nickName = trimmedInput.split(' ')[1];
      console.log(nickName);
      socket.emit('changeNickname', { name: nickName });
    } else {
      if (trimmedInput && socket) {
        socket.emit('sendMessage', {
          userId: `user${currentUserId}`,
          content: trimmedInput,
        });
      }
    }
  };

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
