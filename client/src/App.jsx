import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messagesHistory, setHistoryMessage] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`Connecté avec l'ID : ${newSocket.id}`);
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

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit('sendMessage', {
        userId: socket.id,
        content: message,
      });
      setMessage('');
    }
  };

  return (
    <div className="app-container">
      <Sidebar users={users} />
      <div className="main-content">
        <UserProfile />
        <ChatWindow
          messagesHistory={messagesHistory}
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}

export default App;
