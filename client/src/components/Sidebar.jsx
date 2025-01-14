import React, { useState } from 'react';
import defaultAvatar from '../assets/pp_user.png'; // Import corrigé

function Sidebar({ users }) {
  const [search, setSearch] = useState('');

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sidebar">
      <h1>Utilisateurs connectés</h1>
      {/* Barre de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Liste des utilisateurs */}
      <ul className="user-list">
        {filteredUsers.map((user, index) => (
          <li key={index} className="user-item">
            <div className="user-avatar">
              {/* Utilisation de l'image par défaut si aucun avatar n'est fourni */}
              <img
                src={user.avatar || defaultAvatar}
                alt={user.name}
              />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-status">{user.status || 'En ligne'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
