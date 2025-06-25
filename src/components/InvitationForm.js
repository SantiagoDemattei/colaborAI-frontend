import React, { useState } from 'react';
import { sendConnectionRequest } from '../services/invitationService';
import ErrorHandler from '../utils/errorHandler';

export default function InvitationForm({ token, onInvitationSent }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Validación
      const validation = ErrorHandler.validateForm(
        { usernameOrEmail },
        {
          usernameOrEmail: {
            required: true,
            label: 'Usuario o Email',
            minLength: 3
          }
        }
      );

      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      await sendConnectionRequest(user.id, usernameOrEmail, token);
      
      ErrorHandler.showNotification('Invitación enviada exitosamente', 'success');
      setUsernameOrEmail('');
      
      if (onInvitationSent) onInvitationSent();
      
    } catch (err) {
      const errorMessage = ErrorHandler.handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ marginTop: 0, color: '#1976d2' }}>Enviar Invitación</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Usuario o Email:
          </label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            placeholder="Ingresa el nombre de usuario o email"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            disabled={loading}
          />
        </div>
        
        {error && (
          <div style={{ 
            color: '#f44336', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            border: '1px solid #f44336'
          }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading || !usernameOrEmail.trim()}
          style={{
            backgroundColor: loading ? '#ccc' : '#1976d2',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Enviando...' : 'Enviar Invitación'}
        </button>
      </form>
    </div>
  );
}
