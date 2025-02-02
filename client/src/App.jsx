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
  // =======================
  // States
  // =======================
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState([]);

  const [channels, setChannels] = useState([]);
  const [showChannelList, setShowChannelList] = useState(false);

  const [joinedChannels, setJoinedChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [channelUsers, setChannelUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [currentFail, setError] = useState('');

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [myUserName, setMyUserName] = useState('');

  function onUpdateUsers(newUsers) {
    console.log("== [CLIENT] updateUsers ==", newUsers);
    console.log("== currentUserId ==", currentUserId);
  
    setUsers(newUsers);
    const me = newUsers.find((u) => u.id === currentUserId);
    if (me) {
      console.log("== found me ==", me);
      setMyUserName(me.name);
    } else {
      console.log("== Did NOT find me in newUsers ==");
    }
  }

  // =======================
  // useEffect: Socket init
  // =======================
  useEffect(() => {
    const newSocket = createSocketConnection(
      setCurrentUserId,
      onUpdateUsers, 
      handleNewMessage,
      handleListChannels,
      setError,
      addNotification,
      handleChannelAction,
      setChannelUsers,
      setShowUserList
    );
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // =======================
  // useEffect: privateChannelCreated
  // =======================
  useEffect(() => {
    if (!socket) return;

    socket.on('privateChannelCreated', (data) => {
      const { channelName } = data;
      setJoinedChannels((prev) => {
        if (prev.find((ch) => ch.name === channelName)) {
          return prev;
        }
        return [...prev, { name: channelName, messages: [], unreadCount: 0 }];
      });
    });
    

    return () => {
      socket.off('privateChannelCreated');
    };
  }, [socket]);

  // =======================
  // Callbacks Socket
  // =======================
  function handleNewMessage(message) {
    setJoinedChannels((prev) => {
      let foundChannel = false;

      const updated = prev.map((chan) => {
        if (chan.name === message.channel) {
          foundChannel = true;

          const newMessages = [...chan.messages, message];

          let newUnread = chan.unreadCount;
          if (message.userId !== currentUserId && selectedChannel !== message.channel) {
            newUnread += 1;
          }

          return {
            ...chan,
            messages: newMessages,
            unreadCount: newUnread,
          };
        }
        return chan;
      });

      if (!foundChannel) {
        updated.push({
          name: message.channel,
          messages: [message],
          unreadCount: 
          message.userId !== currentUserId && selectedChannel !== message.channel ? 1 : 0,

        });
      }
      return updated;
    });

    if (message.userId !== currentUserId && selectedChannel !== message.channel) {
      addNotification(`Nouveau message dans #${message.channel} de ${message.userName}`);
    }
  }

  function handleListChannels(channelData) {
    setChannels(channelData);
    setShowChannelList(true);
  }

  // =======================
  // Outils / Gestions
  // =======================
  function addNotification(message) {
    setNotifications((prev) => [...prev, { id: Date.now(), message }]);
  }

  function removeNotification(id) {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }

  function handleChannelAction(action, channelName) {
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
    }
  }

  // =======================
  // Commandes saisies
  // =======================
  function handleUserCommand(fullInput) {
    if (!socket) return;

    const parts = fullInput.trim().split(' ');
    const cmd = parts[0];
    const arg = parts[1];

    if (cmd.startsWith('/')) {
      switch (cmd) {
        case '/create':
          if (arg) {
            socket.emit('createChannel', { name: arg });
          } else {
            console.error('Error: no channel name after /create');
          }
          break;

        case '/join':
          if (arg) {
            socket.emit('joinChannel', { name: arg }, (response) => {
              if (response?.error) {
                addNotification(`Error: ${response.error}`);
              } else {
                onJoinChannel(arg);
              }
            });
          }
          break;

        case '/quit':
          if (arg) {
            socket.emit('leaveChannel', { name: arg });
            setJoinedChannels((prev) => prev.filter((chan) => chan.name !== arg));
            if (selectedChannel === arg) setSelectedChannel(null);
            handleChannelAction('quit', arg);
          }
          break;

        case '/list':
          socket.emit('getChannels', { filter: arg }, (response) => {
            if (response?.error) {
              addNotification(`Error: ${response.error}`);
            } else {
              setChannels(response?.channels || []);
              setShowChannelList(true);
            }
          });
          break;

        case '/select':
          if (arg) {
            setSelectedChannel(arg);
            handleChannelAction('select', arg);
          }
          break;

        case '/users':
          {
            const channelToList = arg || selectedChannel;
            if (!channelToList) {
              console.error('Error: No channel specified or selected for /users.');
              break;
            }
            socket.emit('listUsersInChannel', { name: channelToList });
          }
          break;

        case '/delete':
          if (arg) {
            socket.emit('deleteChannel', { name: arg });
          }
          break;

        case '/nick':
          if (!arg) {
            console.error('Error: No nickname specified for /nick.');
            return;
          }
          socket.emit('changeNickname', { name: arg });
          break;

        case '/msg':
          if (!arg) {
            console.error('Error: /msg <recipient> <message>.');
            return;
          }
          const messageContent = parts.slice(2).join(' ');
          if (!messageContent) {
            console.error('Error: No message specified for /msg.');
            return;
          }
          socket.emit('privateMessage', { to: arg, content: messageContent });
          break;

        default:
          console.log('Unknown command:', cmd);
          break;
      }
    } else {
      if (fullInput.trim() && selectedChannel) {
        socket.emit('sendMessage', {
          userId: currentUserId,
          content: fullInput.trim(),
          channel: selectedChannel,
        });
      } else if (!selectedChannel) {
        console.error('Error: No channel selected to send the message.');
      }
    }

    setInput('');
    setSuggestions([]);
  }

  function onJoinChannel(channelName) {
    setJoinedChannels((prev) => {
      if (prev.some((c) => c.name === channelName)) {
        return prev;
      }
      return [...prev, { name: channelName, messages: [] }];
    });
    setSelectedChannel(channelName);
    handleChannelAction('join', channelName);
  }

  // =======================
  // Saisie “auto-suggest”
  // =======================
  function handleInputChange(value) {
    setInput(value);

    const COMMANDS = [
      '/create', '/list', '/join', '/quit', '/delete',
      '/nick', '/users', '/msg',
    ];
    if (value.startsWith('/')) {
      const filtered = COMMANDS.filter((c) => c.startsWith(value));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }

  // =======================
  // Sélection d’un channel 
  // =======================
  function handleSelectChannel(channelName) {
    setSelectedChannel(channelName);

    setJoinedChannels((prev) =>
      prev.map((chan) => {
        if (chan.name === channelName) {
          return { ...chan, unreadCount: 0 };
        }
        return chan;
      })
    );
  }

  // =======================
  // Affichage
  // =======================
  return (
    <div className="app-container">
      <div className="toast-container">
        {notifications.map((n) => (
          <ToastNotification
            key={n.id}
            message={n.message}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>

      <Sidebar
        users={users}
        myUserName={myUserName}
        joinedChannels={joinedChannels}
        onCommand={handleUserCommand}
        currentFail={currentFail}
        selectedChannel={selectedChannel}
        onShowChannelList={() => setShowChannelList(true)}
        onSelectChannel={handleSelectChannel}
      />

      <div className="main-content">
        {showChannelList ? (
          <ChannelListWindow
            channels={channels}
            onClose={() => setShowChannelList(false)}
            onJoinChannel={(chName) => handleUserCommand(`/join ${chName}`)}
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
