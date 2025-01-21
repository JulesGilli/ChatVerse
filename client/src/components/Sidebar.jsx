import React, { useState } from 'react';

function Sidebar({ users, channels, onCommand, currentFail }) {
  const [showInput, setShowInput] = useState(false); 
  const [actionType, setActionType] = useState('');
  const [channelName, setChannelName] = useState('');

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

      <h2>Actions</h2>
      <button onClick={() => handleButtonClick('create')}>Create Channel</button>
      <button onClick={() => handleButtonClick('delete')}>Delete Channel</button>

      <h2>Errors</h2>
      <p>{currentFail}</p>

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
