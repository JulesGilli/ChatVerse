import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import reactLogo from './assets/react.svg'
import viteLogo from '../public/vite.svg'
import './App.css'

function App() {

  /* const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const socket = io('http://localhost:5050');
        socket.emit('displayUsers');

        socket.on("userId", (data) => {
          if(data.error){
            setError(data.error);
          }else{
            setUsers(data);
          }
        });
    }, []); */
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
  
    useEffect(() => {
      // Créer une connexion socket une seule fois
      const newSocket = io("http://localhost:5050");
      setSocket(newSocket);
  
      // Gérer les événements socket
      newSocket.on("connect", () => {
        console.log(`Connecté avec l'ID : ${newSocket.id}`);
      });
  
      newSocket.on("updateUsers", (data) => {
        setUsers(data);
      });
  
      // Nettoyer la connexion socket lorsque le composant est démonté
      return () => {
        newSocket.disconnect();
      };
    }, []); // Le tableau vide [] garantit que ce useEffect est exécuté une seule fois
  
    return (
      <div>
        <h1>Liste des utilisateurs connectés</h1>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
      </div>
    );

  /* const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  ) */
}

export default App
