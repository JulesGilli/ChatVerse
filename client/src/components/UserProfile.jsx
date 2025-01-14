import React from 'react';
import defaultAvatar from '../assets/pp_user.png'; 

function UserProfile() {
  return (
    <div className="user-profile">
      <div className="avatar">
        <img src={defaultAvatar} alt="User Avatar" />
      </div>
      <div className="username">User Name</div>
    </div>
  );
}

export default UserProfile;
