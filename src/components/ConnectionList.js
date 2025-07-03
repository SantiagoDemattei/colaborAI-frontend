import React, { useState, useEffect, useCallback } from 'react';
import { getAcceptedConnections } from '../services/invitationService';
import ErrorHandler from '../utils/errorHandler';

export default function ConnectionList({ token, userId }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const acceptedConnections = await getAcceptedConnections(token);
      setConnections(acceptedConnections);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const connectionItemStyle = {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const getUserName = (connection) => {
    // Determinar qué usuario mostrar (el que no es el usuario actual)
    const currentUserId = parseInt(userId);
    if (connection.requester.id === currentUserId) {
      return connection.receiver;
    } else {
      return connection.requester;
    }
  };

  const formatConnectionDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  if (loading) return <div>Cargando conexiones...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>Mis Conexiones</h2>
      
      {error && (
        <div style={{ 
          color: '#f44336', 
          padding: '10px', 
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {connections.length === 0 ? (
        <div style={{ 
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginBottom: '10px' }}>No tienes conexiones activas</h3>
          <p>Las conexiones aparecerán aquí una vez que se acepten las invitaciones enviadas o recibidas.</p>
        </div>
      ) : (
        <div>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Tienes {connections.length} conexión{connections.length !== 1 ? 'es' : ''} activa{connections.length !== 1 ? 's' : ''}
          </p>
          
          {connections.map(connection => {
            const otherUser = getUserName(connection);
            return (
              <div key={connection.id} style={connectionItemStyle}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '16px', color: '#333' }}>
                      {otherUser.username}
                    </strong>
                    <span style={{ 
                      backgroundColor: '#4caf50',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      marginLeft: '10px'
                    }}>
                      CONECTADO
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '3px' }}>
                    {otherUser.email}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    <strong>Conexión iniciada:</strong> {formatConnectionDate(connection.createdAt)}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    <strong>Conexión establecida:</strong> {formatConnectionDate(connection.acceptedAt)}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: '#4caf50', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✓ Activa
                  </div>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '10px',
                    marginTop: '2px'
                  }}>
                    {connection.requester.id === parseInt(userId) ? 'Tú enviaste la invitación' : 'Te envió la invitación'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
