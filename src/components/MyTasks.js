import React, { useEffect, useState, useCallback } from 'react';
import { getMyAssignedTasks, updateTask } from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function MyTasks({ token, userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const loadMyTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyAssignedTasks(token);
      setTasks(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMyTasks();
  }, [loadMyTasks]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = { ...task, status: newStatus };
      
      await updateTask(taskId, updatedTask, token);
      ErrorHandler.showNotification('Estado de tarea actualizado exitosamente', 'success');
      loadMyTasks();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#ff9800',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50'
    };
    return colors[status] || '#666';
  };

  const getStatusDisplayName = (status) => {
    const names = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completada'
    };
    return names[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': '⏳',
      'IN_PROGRESS': '🔄',
      'COMPLETED': '✅'
    };
    return icons[status] || '📝';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336'
    };
    return colors[priority] || '#666';
  };

  const getPriorityDisplayName = (priority) => {
    const names = {
      'LOW': 'Baja',
      'MEDIUM': 'Media',
      'HIGH': 'Alta'
    };
    return names[priority] || priority;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const cardStyle = {
    backgroundColor: 'var(--background-light)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 8px var(--shadow-color)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const statusButtonStyle = (status, isActive) => ({
    padding: '6px 12px',
    margin: '0 4px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: isActive ? getStatusColor(status) : 'var(--accent-color)',
    color: isActive ? 'white' : 'var(--text-primary)',
    transition: 'all 0.3s ease'
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando tus tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: 'var(--background-light)',
        borderRadius: '8px',
        border: '1px solid var(--danger-color)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <p style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>Error: {error}</p>
        <button 
          onClick={loadMyTasks}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        backgroundColor: 'var(--background-light)',
        borderRadius: '8px',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>No tienes tareas asignadas</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Cuando se te asignen tareas en los proyectos, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px' 
      }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
          📋 Mis Tareas Asignadas ({tasks.length})
        </h2>
        <button 
          onClick={loadMyTasks}
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--primary-color)';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'var(--accent-color)';
            e.target.style.color = 'var(--text-primary)';
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      <div>
        {tasks.map((task) => (
          <div 
            key={task.id} 
            style={{
              ...cardStyle,
              borderLeft: `4px solid ${getStatusColor(task.status)}`,
              ...(isOverdue(task.dueDate) && task.status !== 'COMPLETED' 
                ? { borderColor: '#f44336', backgroundColor: '#ffebee' } 
                : {})
            }}
            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px var(--shadow-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-color)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>
                    {getStatusIcon(task.status)}
                  </span>
                  <h3 style={{ 
                    margin: 0, 
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {task.title}
                  </h3>
                  {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                    <span style={{
                      marginLeft: '10px',
                      padding: '2px 8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      VENCIDA
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: getStatusColor(task.status),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusDisplayName(task.status)}
                  </span>
                  
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Prioridad: {getPriorityDisplayName(task.priority)}
                  </span>
                  
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    📅 Vence: {formatDate(task.dueDate)}
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Proyecto:</strong>
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    {task.projectName}
                  </span>
                </div>

                {expandedTask === task.id && (
                  <div style={{ 
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid var(--border-light)'
                  }}>
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Descripción:</strong>
                      <p style={{ 
                        margin: '8px 0',
                        color: 'var(--text-muted)',
                        lineHeight: '1.5'
                      }}>
                        {task.description || 'Sin descripción'}
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Cambiar estado:</strong>
                      <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                          <button
                            key={status}
                            style={statusButtonStyle(status, task.status === status)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (task.status !== status && updatingId !== task.id) {
                                handleStatusUpdate(task.id, status);
                              }
                            }}
                            disabled={updatingId === task.id || task.status === status}
                          >
                            {updatingId === task.id && task.status !== status ? 
                              '⏳' : getStatusIcon(status)} {getStatusDisplayName(status)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      <span>📅 Creada: {formatDate(task.createdAt)}</span>
                      {task.createdByName && (
                        <span>👤 Creada por: {task.createdByName}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                marginLeft: '15px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                textAlign: 'right'
              }}>
                <div>{expandedTask === task.id ? '🔽' : '▶️'}</div>
                <div style={{ marginTop: '5px' }}>
                  {expandedTask === task.id ? 'Contraer' : 'Expandir'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
