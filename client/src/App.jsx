import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import ChannelListWindow from './components/ChannelListWindow.jsx';
import UserListWindow from './components/UserListWindow.jsx';
import CommandInput from './components/CommandInput.jsx';
import ToastNotification from './components/ToastNotification.jsx';
import { createSocketConnection } from './socketService';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [currentFail, setError] = useState('');
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showChannelList, setShowChannelList] = useState(false);

  const [joinedChannels, setJoinedChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [channelUsers, setChannelUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false); 

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = createSocketConnection(
      setCurrentUserId,  
      setUsers,          
      handleNewMessage,  
      (channelData) => {  
        setChannels(channelData);
        setShowChannelList(true);
      },
      setError ,
      addNotification            
    );

    newSocket.on('usersInChannel', (users) => {
      setChannelUsers(users);
      setShowUserList(true);
    });

    newSocket.on('newChannel', (data) => {
      handleChannelAction('create', data.name);
    });

    newSocket.on('deleteChannel', (data) => {
      handleChannelAction('delete', data.name); 
    });

    newSocket.on('nicknameChanged', () => {
      handleChannelAction('rename');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleNewMessage = (message) => {
    setJoinedChannels((prev) =>
      prev.map((chan) =>
        chan.name === message.channel
          ? { ...chan, messages: [...chan.messages, message] }
          : chan
      )
    );
  };

  const onJoinChannel = (channelName) => {
    setJoinedChannels((prev) => {
      if (prev.find((c) => c.name === channelName)) {
        return prev;
      }
      return [...prev, { name: channelName, messages: [] }];
    });
    setSelectedChannel(channelName);
    handleChannelAction('join', channelName);
  };

  const addNotification = (message) => {
    setNotifications((prev) => [...prev, { id: Date.now(), message }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const handleChannelAction = (action, channelName) => {
    switch (action) {
      case 'create':
        addNotification(`Channel "${channelName}" created successfully!`);
        break;
      case 'delete':
        addNotification(`Channel "${channelName}" deleted.`);
        break;
      case 'join':
        addNotification(`You joined the channel "${channelName}".`);
        break;
      case 'quit':
        addNotification(`You left the channel "${channelName}".`);
        break;
      case 'rename':
        addNotification('Your nickname was changed successfully.');
        break;
      default:
        break;
    }
  };

  const handleUserCommand = (fullInput) => {
    const parts = fullInput.trim().split(' ');
    const cmd = parts[0];
    const arg = parts[1];
    

    if (cmd.startsWith('/')) {
      switch (cmd) {
        case '/create':
          if (arg && socket) {
            socket.emit('createChannel', { name: arg });
          }
          break;

        case '/list':
          if (socket) {
            socket.emit('getChannels', { filter: arg });
          }
          break;
  
        case '/join':
          if (arg && socket) {
            socket.emit('joinChannel', { name: arg }, (response) => {
              if (response.error) {
                console.error(response.error);
              } else {
                onJoinChannel(arg);
              }
            });
          }
          

        case '/quit':
          if (arg && socket) {
            socket.emit('leaveChannel', { name: arg });
            setJoinedChannels((prev) =>
              prev.filter((chan) => chan.name !== arg)
            );
            if (selectedChannel === arg) {
              setSelectedChannel(null);
            }
            handleChannelAction('quit', arg);
          }
          break;

        case '/users':
          const channelToList = arg || selectedChannel;
          if (!channelToList) {
            console.error("Aucun canal spécifié ni sélectionné pour /users.");
            break;
          }
          socket.emit('listUsersInChannel', { name: channelToList });
          break;

        case '/delete':
          if (arg && socket) {
            socket.emit('deleteChannel', { name: arg });
            handleChannelAction('delete', arg);
          }
          break;

        case '/nick':
          if (!arg) {
            console.error("Erreur : Aucun pseudonyme n'a été spécifié pour /nick.");
            return;
          }
          if (socket) {
            socket.emit('changeNickname', { name: arg });
          }
          break;

        case '/users':
          {
            const channelToList = arg || selectedChannel;
            if (!channelToList) {
              console.error("Aucun canal spécifié ni sélectionné pour /users.");
              break;
            }
            socket.emit("listUsersInChannel", { name: channelToList });
          }
          break;

        case '/msg':
          if (!arg) {
            console.error("Erreur : /msg <destinataire> <message>.");
            return;
          }
          const messageContent = parts.slice(2).join(' ');
          if (!messageContent) {
            console.error("Erreur : Aucun message spécifié pour /msg.");
            return;
          }
          if (socket) {
            socket.emit('privateMessage', { to: arg, content: messageContent });
          }
          break;

        default:
          console.log("Commande inconnue :", cmd);
          break;
      }
    } else {
      if (fullInput.trim() && socket && selectedChannel) {
        socket.emit('sendMessage', {
          userId: currentUserId,
          content: fullInput.trim(),
          channel: selectedChannel,
        });
      } else if (!selectedChannel) {
        console.error("Erreur : Aucun canal sélectionné pour envoyer le message.");
      }
    }

    setInput('');
    setSuggestions([]);
  };

  const handleInputChange = (value) => {
    setInput(value);
    const COMMANDS = ['/create', '/list', '/join', '/quit', '/delete', '/nick', '/users', '/msg'];
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
      <div className="toast-container">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
      <Sidebar
        users={users}
        joinedChannels={joinedChannels}
        onCommand={handleUserCommand}
        currentFail={currentFail}
        selectedChannel={selectedChannel}
      />
      <div className="main-content">
        {showChannelList ? (
          <ChannelListWindow
            channels={channels}
            onClose={() => setShowChannelList(false)}
          />
        ) : showUserList ? ( 
          <UserListWindow
            users={channelUsers}
            onClose={() => setShowUserList(false)}
          />
        ) : (
          <>
            <ChatWindow
              messages={
                joinedChannels.find((chan) => chan.name === selectedChannel)
                  ?.messages || []
              }
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
