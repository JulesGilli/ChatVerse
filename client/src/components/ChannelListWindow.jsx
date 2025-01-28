import React from 'react';

function ChannelListWindow({ channels, onClose, onJoinChannel }) {
  return (
    <div className="channel-list-window">
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="header">
        <h2>Channels</h2>
      </div>
      <div className="channel-list">
        {channels.map((channel, index) => (
          <div
            key={index}
            className="channel-item"
            onClick={() => onJoinChannel(channel.name)}
          >
            {channel.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChannelListWindow;
