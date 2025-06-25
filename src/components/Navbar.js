import React from 'react';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ onLogout, user, token }) {
  return (
    <nav style={{ 
      padding: '1rem', 
      background: '#1976d2', 
      color: 'white', 
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ColaborAI</span>
        <span style={{ marginLeft: 20 }}>Panel</span>
      </div>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <NotificationCenter
            token={token}
            userId={user.id}
          />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '15px' }}>
              👋 {user.username}
            </span>
            <button
              onClick={onLogout}
              style={{
                background: 'white',
                color: '#1976d2',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}