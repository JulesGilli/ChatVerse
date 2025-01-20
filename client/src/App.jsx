import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
 
function App() {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messagesHistory, setHistoryMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(''); // Champ pour commandes ou messages
  const [channels, setChannels] = useState([]); // Liste des salons rejoints
 
  useEffect(() => {
    const newSocket = io('http://localhost:5050');
    setSocket(newSocket);
 
    newSocket.on('connect', () => {
      console.log(`Connecté avec l'ID : ${newSocket.id}`);
    });

    newSocket.on('getJoinedRooms', (data) => {
      setRooms(data);
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


    newSocket.on('listChannels',(data) => {
      setChannels(data);
    })
 
    return () => {
      newSocket.disconnect();
    };
  }, []);
 
  const handleCommand = () => {
    const trimmedInput = input.trim();
 
    if (trimmedInput.startsWith('/create')) {
      // Commande /join
      const channelName = trimmedInput.split(' ')[1]; // Extraire le nom du canal
      if (channelName && socket) {
        socket.emit('createChannel', { name: channelName });
        console.log(`crée le canal : ${channelName}`);
      }
    } else if (trimmedInput.startsWith('/list')) {
      const channelFilter = trimmedInput.split(' ')[1];
        socket.emit('getChannels', {filter: channelFilter});
        console.log(`liste les canaux commençant par : ${channelFilter}`);
      } 
      else if (trimmedInput.startsWith('/join')) {
        const channelName = trimmedInput.split(' ')[1];
          socket.emit('joinChannel', {name: channelName});
          console.log(`join channel named: ${channelName}`);
      } else {
      // Par défaut, envoyer un message
      if (trimmedInput && socket) {
        socket.emit('sendMessage', {
          userId: "user"+socket.id,
          content: trimmedInput,
        });
      }
    }
 
    setInput(''); // Réinitialiser le champ
  };
 
  return (
    <div>
      <h1>Liste des utilisateurs connectés</h1>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.name}</li>
        ))}
      </ul>
 
      <h2>Messages</h2>
      <ul>
        {messagesHistory.map((msgH, indexH) => (
          <li key={indexH}>
            <strong>{msgH.userId}:</strong> {msgH.content}
          </li>
        ))}
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.userId}:</strong> {msg.content}
          </li>
        ))}
      </ul>
 
      <h2>ListChannels</h2>
      <ul>
        {channels.map((channel, index) => (
          <li key={index}>
            <strong>{channel.name}</strong> 
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez une commande ou un message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommand();
          }}
        />
      </div>
    </div>
  );
}
 
export default App;
 
 