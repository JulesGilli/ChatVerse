import React from 'react';

function UserListWindow({ users, onClose }) {
  return (
    <div className="user-list-window">
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="header">
        <h2>Users in Channel</h2>
      </div>
      <div className="user-list">
        {users.map((user, index) => (
          <div key={index} className="user-item">
            {user.name || user} 
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserListWindow;
