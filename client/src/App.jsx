import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import reactLogo from './assets/react.svg'
import viteLogo from '../public/vite.svg'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messagesHistory, setHistoryMessage] = useState([]);
  const [message, setMessage] = useState(''); // Contient le message que l'utilisateur tape
  const [messages, setMessages] = useState([]); // Liste des messages reçus

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
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Met à jour la liste des messages
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
        userId: socket.id, // Utiliser l'ID de l'utilisateur (ou un autre identifiant)
        content: message,
      });
      setMessage(''); // Réinitialiser le champ de saisie
    }
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

      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tapez un message..."
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
}

export default App;
