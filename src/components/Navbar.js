import React from 'react';
import NotificationCenter from './NotificationCenter';
import '../styles/Navbar.css';

export default function Navbar({ onLogout, user, token }) {
  return (
    <nav className="navbar">
      <div>
        <span className="navbar-brand">ColaborAI</span>
        <span className="navbar-title">Panel</span>
      </div>
      
      {user && (
        <div className="navbar-user-section">
          <NotificationCenter
            token={token}
            userId={user.id}
          />
          
          <div className="navbar-user-info">
            <span className="navbar-greeting">
              👋 {user.username}
            </span>
            <button
              onClick={onLogout}
              className="navbar-logout-btn"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}