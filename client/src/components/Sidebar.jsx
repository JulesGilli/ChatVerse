import React, { useState } from 'react';
import logo from '../assets/Logo.png';
import renameIcon from '../assets/Rename.png';
import showIcon from '../assets/Show.png';
import createIcon from '../assets/Create.png';
import deleteIcon from '../assets/Delete.png';

function Sidebar({ users, joinedChannels, onCommand, currentFail, selectedChannel, onShowChannelList }) {
  const [showInput, setShowInput] = useState(false);
  const [actionType, setActionType] = useState('');
  const [channelName, setChannelName] = useState('');
  const [nickname, setNickname] = useState('');
  const [showRenameInput, setShowRenameInput] = useState(false);

  const handleButtonClick = (type) => {
    setActionType(type);
    setShowInput(true);
  };

  const handleSubmit = () => {
    if (channelName.trim()) {
      onCommand(`/${actionType} ${channelName}`);
      setChannelName('');
      setShowInput(false);
    }
  };

  const handleRenameSubmit = () => {
    if (nickname.trim()) {
      onCommand(`/nick ${nickname}`);
      setNickname('');
      setShowRenameInput(false);
    }
  };

  const handleChannelClick = (channelName) => {
    if (selectedChannel === channelName) return;
    onSelectChannel(channelName);
  };


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="ChatVerse Logo" className="logo" />
        <h1 className="title">ChatVerse</h1>
      </div>

      <h2>Actions</h2>
      <button onClick={() => handleButtonClick('create')}>
        <img src={createIcon} alt="Create Icon" className="icon" /> Create Channel
      </button>
      <button onClick={() => handleButtonClick('delete')}>
        <img src={deleteIcon} alt="Delete Icon" className="icon" /> Delete Channel
      </button>
      <button onClick={() => setShowRenameInput(true)}>
        <img src={renameIcon} alt="Rename Icon" className="icon" /> Rename
      </button>
      <button onClick={() => onCommand('/list')}>
        <img src={showIcon} alt="Show Icon" className="icon" /> Show Channels
      </button>

      {showRenameInput && (
        <div className="input-overlay">
          <div className="input-container">
            <h3>Rename</h3>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter new nickname"
            />
            <button onClick={handleRenameSubmit}>Submit</button>
            <button onClick={() => setShowRenameInput(false)}>Cancel</button>
          </div>
        </div>
      )}

      <h1>Users</h1>
      <ul>
        {users.length > 0 ? (
          users.map((user, index) => <li key={index}>{user.name}</li>)
        ) : (
          <li className="empty-list">No users connected</li>
        )}
      </ul>

      <h1>My Channels</h1>
      <ul>
        {joinedChannels.length > 0 ? (
          joinedChannels.map((channel, index) => {
            const isSelected = channel.name === selectedChannel;
            return (
              <li
                key={index}
                onClick={() => handleChannelClick(channel.name)}
                className={isSelected ? 'selected-channel' : ''}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{channel.name}</span>
                {channel.unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '8px',
                    }}
                  >
                    {channel.unreadCount}
                  </span>
                )}
              </li>

            );
          })
        ) : (
          <li className="empty-list">No channels joined</li>
        )}
      </ul>

      {showInput && (
        <div className="input-overlay">
          <div className="input-container">
            <h3>{actionType === 'create' ? 'Create Channel' : 'Delete Channel'}</h3>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter channel name"
            />
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => setShowInput(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
