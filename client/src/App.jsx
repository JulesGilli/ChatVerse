import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
 
function App() {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messagesHistory, setHistoryMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(''); // Champ pour commandes ou messages
  const [rooms, setRooms] = useState([]); // Liste des salons rejoints
 
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
 
    newSocket.on('updateRooms', (data) => {
      setRooms(data); // Met à jour la liste des salons
    });
 
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
    } else if (trimmedInput.startsWith('/join')) {
      const channelName = trimmedInput.split(' ')[1]; // Extraire le nom du canal
      if (channelName && socket) {
        socket.emit('joinChannel', { name: channelName });
        console.log(`Rejoint le canal : ${channelName}`);
      }
    } else {
      // Par défaut, envoyer un message
      if (trimmedInput && socket) {
        socket.emit('sendMessage', {
          userId: socket.id,
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
        {console.log(messagesHistory)}
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
 
      <h2>Salons rejoints</h2>
 
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
 
 