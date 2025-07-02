import React, { useState, useEffect, useCallback } from 'react';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../services/notificationService';
import ErrorHandler from '../utils/errorHandler';

export default function NotificationCenter({ token, userId, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getUserNotifications(userId, token);
      setNotifications(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount(userId, token);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error al cargar contador de notificaciones:', err);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
      
      // Actualizar cada 30 segundos
      const interval = setInterval(() => {
        loadUnreadCount();
        if (isOpen) loadNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId, isOpen, loadNotifications, loadUnreadCount]);

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setProcessingId(notificationId);
      await markAsRead(notificationId, userId, token);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setProcessingId('all');
      await markAllAsRead(userId, token);
      loadNotifications();
      loadUnreadCount();
      ErrorHandler.showNotification('Todas las notificaciones marcadas como leídas', 'success');
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'CONNECTION_REQUEST': '👤',
      'CONNECTION_ACCEPTED': '✅',
      'PROJECT_INVITATION': '📋',
      'TASK_ASSIGNED': '📝',
      'TASK_COMPLETED': '✅',
      'PROJECT_UPDATE': '📊'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return '#f5f5f5';
    
    const colors = {
      'CONNECTION_REQUEST': '#2196f3',
      'CONNECTION_ACCEPTED': '#4caf50',
      'PROJECT_INVITATION': '#ff9800',
      'TASK_ASSIGNED': '#9c27b0',
      'TASK_COMPLETED': '#4caf50',
      'PROJECT_UPDATE': '#607d8b'
    };
    return colors[type] || '#1976d2';
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Icono de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          position: 'relative',
          padding: '10px',
          borderRadius: '50%',
          backgroundColor: isOpen ? '#e3f2fd' : 'transparent'
        }}
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          width: '400px',
          maxHeight: '500px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #ddd',
            backgroundColor: '#1976d2',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0 }}>Notificaciones</h4>
            <div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={processingId === 'all'}
                  style={{
                    background: 'none',
                    border: '1px solid white',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginRight: '10px'
                  }}
                >
                  {processingId === 'all' ? 'Marcando...' : 'Marcar todas'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Cargando notificaciones...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', color: '#f44336', textAlign: 'center' }}>
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No tienes notificaciones
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: notification.read ? '#f9f9f9' : '#fff',
                    borderLeft: `4px solid ${getNotificationColor(notification.type, notification.read)}`,
                    cursor: !notification.read ? 'pointer' : 'default'
                  }}
                  onClick={!notification.read ? () => handleMarkAsRead(notification.id) : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: notification.read ? 'normal' : 'bold',
                        marginBottom: '5px',
                        color: notification.read ? '#666' : '#222'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{ErrorHandler.formatDateTime(notification.createdAt)}</span>
                        {!notification.read && (
                          <span style={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px'
                          }}>
                            NUEVO
                          </span>
                        )}
                        {processingId === notification.id && (
                          <span style={{ color: '#1976d2', fontSize: '10px' }}>
                            Marcando...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
