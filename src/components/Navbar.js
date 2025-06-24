import React from 'react';

export default function Navbar({ onLogout, user }) {
  return (
    <nav style={{ padding: '1rem', background: '#1976d2', color: 'white', marginBottom: '2rem' }}>
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ColaborAI</span>
      <span style={{ marginLeft: 20 }}>Panel</span>
      {user && (
        <span style={{ float: 'right' }}>
          {user.username}
          <button
            onClick={onLogout}
            style={{
              marginLeft: 20,
              background: 'white',
              color: '#1976d2',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        </span>
      )}
    </nav>
  );
}