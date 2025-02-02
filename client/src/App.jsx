import React, { useEffect, useState, useRef } from 'react';
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

  const currentUserIdRef = useRef(currentUserId);
  const selectedChannelRef = useRef(selectedChannel);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    selectedChannelRef.current = selectedChannel;
  }, [selectedChannel]);

  function onUpdateUsers(newUsers) {
    setUsers(newUsers);
    const me = newUsers.find((u) => u.id === currentUserId);
    if (me) setMyUserName(me.name);
  }

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

    newSocket.on('messageSentConfirmation', (message) => {
      setJoinedChannels(prev => prev.map(chan => 
        chan.name === message.channel 
          ? { ...chan, messages: [...chan.messages, message] }
          : chan
      ));
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('privateChannelCreated', ({ channelName }) => {
      setJoinedChannels(prev => prev.some(c => c.name === channelName) 
        ? prev 
        : [...prev, { name: channelName, messages: [], unreadCount: 0 }]
      );
    });

    return () => socket.off('privateChannelCreated');
  }, [socket]);

  function handleNewMessage(message) {
    const isCurrentUser = message.userId === currentUserIdRef.current;
    const isSelectedChannel = selectedChannelRef.current === message.channel;

    setJoinedChannels(prev => prev.map(chan => {
      if (chan.name !== message.channel) return chan;
      
      return isSelectedChannel 
        ? { ...chan, messages: [...chan.messages, message], unreadCount: 0 }
        : { ...chan, 
            messages: [...chan.messages, message], 
            unreadCount: isCurrentUser ? chan.unreadCount : chan.unreadCount + 1 
          };
    }));

    if (!isCurrentUser && !isSelectedChannel) {
      addNotification(`New message in #${message.channel} from ${message.userName}`);
    }
  }

  function handleListChannels(channelData) {
    setChannels(channelData);
    setShowChannelList(true);
  }

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

  function handleUserCommand(fullInput) {
    if (!socket) return;

    const parts = fullInput.trim().split(' ');
    const cmd = parts[0];
    const arg = parts[1];

    if (cmd.startsWith('/')) {
      switch (cmd) {
        case '/create':
          if (arg) socket.emit('createChannel', { name: arg });
          break;
        case '/join':
          if (arg) socket.emit('joinChannel', { name: arg }, (response) => {
            if (!response?.error) onJoinChannel(arg);
          });
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
            if (!response?.error) {
              setChannels(response?.channels || []);
              setShowChannelList(true);
            }
          });
          break;
        case '/select':
          if (arg) setSelectedChannel(arg);
          break;
        case '/users':
          const channelToList = arg || selectedChannel;
          if (channelToList) socket.emit('listUsersInChannel', { name: channelToList });
          break;
        case '/delete':
          if (arg) socket.emit('deleteChannel', { name: arg });
          break;
        case '/nick':
          if (arg) socket.emit('changeNickname', { name: arg });
          break;
        case '/msg':
          if (arg) {
            const messageContent = parts.slice(2).join(' ');
            if (messageContent) socket.emit('privateMessage', { to: arg, content: messageContent });
          }
          break;
        default:
          console.log('Unknown command:', cmd);
      }
    } else {
      if (fullInput.trim() && selectedChannel) {
        socket.emit('sendMessage', {
          userId: currentUserId,
          content: fullInput.trim(),
          channel: selectedChannel,
        });
      }
    }
    setInput('');
    setSuggestions([]);
  }

  function onJoinChannel(channelName) {
    setJoinedChannels((prev) => {
      if (prev.some((c) => c.name === channelName)) return prev;
      return [...prev, { name: channelName, messages: [] }];
    });
    setSelectedChannel(channelName);
    handleChannelAction('join', channelName);
  }

  function handleInputChange(value) {
    setInput(value);
    const COMMANDS = ['/create','/list','/join','/quit','/delete','/nick','/users','/msg'];
    if (value.startsWith('/')) setSuggestions(COMMANDS.filter((c) => c.startsWith(value)));
    else setSuggestions([]);
  }

  function handleSelectChannel(channelName) {
    setSelectedChannel(channelName);
    setJoinedChannels(prev => prev.map(chan => 
      chan.name === channelName ? { ...chan, unreadCount: 0 } : chan
    ));
  }

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
              messages={joinedChannels.find(chan => chan.name === selectedChannel)?.messages || []}
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