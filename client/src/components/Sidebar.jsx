import React, { useState } from 'react';

function Sidebar({ users, channels, onCommand, currentFail }) {
  return (
    <div className="sidebar">
      <h1>Sidebar Loaded</h1>
      <p>Static content for testing</p>
      <h1>Users</h1>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
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
      <h2>Errors</h2>
      <p>{currentFail}</p>
    </div>
  );
}

export default Sidebar;
