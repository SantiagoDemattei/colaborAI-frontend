import React, { useState, useEffect, useCallback } from 'react';
import { getPendingRequests, getSentRequests, acceptConnectionRequest, rejectConnectionRequest } from '../services/invitationService';
import ErrorHandler from '../utils/errorHandler';

export default function InvitationManager({ token, userId }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('received');

  const loadInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const [pending, sent] = await Promise.all([
        getPendingRequests(userId, token),
        getSentRequests(userId, token)
      ]);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleAcceptRequest = async (connectionId) => {
    try {
      setProcessingId(connectionId);
      await acceptConnectionRequest(connectionId, userId, token);
      ErrorHandler.showNotification('Invitación aceptada', 'success');
      loadInvitations();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      setProcessingId(connectionId);
      await rejectConnectionRequest(connectionId, userId, token);
      ErrorHandler.showNotification('Invitación rechazada', 'info');
      loadInvitations();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    border: 'none',
    backgroundColor: isActive ? '#1976d2' : '#f5f5f5',
    color: isActive ? 'white' : '#333',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    marginRight: '5px',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  const invitationItemStyle = {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const buttonStyle = (type) => ({
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
    fontWeight: 'bold',
    backgroundColor: type === 'accept' ? '#4caf50' : '#f44336',
    color: 'white'
  });

  if (loading) return <div>Cargando invitaciones...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>Gestión de Invitaciones</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          style={tabStyle(activeTab === 'received')}
          onClick={() => setActiveTab('received')}
        >
          Recibidas ({pendingRequests.length})
        </button>
        <button 
          style={tabStyle(activeTab === 'sent')}
          onClick={() => setActiveTab('sent')}
        >
          Enviadas ({sentRequests.length})
        </button>
      </div>

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

      {activeTab === 'received' && (
        <div>
          <h3>Invitaciones Recibidas</h3>
          {pendingRequests.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No tienes invitaciones pendientes</p>
          ) : (
            pendingRequests.map(request => (
              <div key={request.id} style={invitationItemStyle}>
                <div>
                  <strong>{request.requesterUsername}</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {ErrorHandler.formatDateTime(request.createdAt)}
                  </div>
                </div>
                <div>
                  <button
                    style={buttonStyle('accept')}
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? 'Procesando...' : 'Aceptar'}
                  </button>
                  <button
                    style={buttonStyle('reject')}
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? 'Procesando...' : 'Rechazar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div>
          <h3>Invitaciones Enviadas</h3>
          {sentRequests.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No has enviado invitaciones</p>
          ) : (
            sentRequests.map(request => (
              <div key={request.id} style={invitationItemStyle}>
                <div>
                  <strong>{request.requestedUsername}</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Estado: <span style={{ 
                      fontWeight: 'bold',
                      color: request.status === 'PENDING' ? '#ff9800' : 
                            request.status === 'ACCEPTED' ? '#4caf50' : '#f44336'
                    }}>
                      {request.status === 'PENDING' ? 'Pendiente' :
                       request.status === 'ACCEPTED' ? 'Aceptada' : 'Rechazada'}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {ErrorHandler.formatDateTime(request.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
