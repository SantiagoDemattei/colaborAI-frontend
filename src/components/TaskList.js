import React, { useEffect, useState } from 'react';
import { getTasksByProject, deleteTask, assignTask, getAssignableUsers } from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function TaskList({ projectId, token, onSelectTask, canModify }) {
  const [tasks, setTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  useEffect(() => {
    if (!projectId) return;
    loadTasks();
    if (canModify) loadAssignableUsers();
  }, [projectId, token, canModify]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasksByProject(projectId, token);
      setTasks(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadAssignableUsers = async () => {
    try {
      const users = await getAssignableUsers(projectId, token);
      setAssignableUsers(users);
    } catch (err) {
      console.error('Error al cargar usuarios asignables:', err);
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?`)) {
      return;
    }

    try {
      setDeletingId(taskId);
      await deleteTask(taskId, token);
      ErrorHandler.showNotification('Tarea eliminada exitosamente', 'success');
      loadTasks();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssignTask = async (taskId) => {
    if (!selectedAssignee) return;

    try {
      setAssigningId(taskId);
      await assignTask(taskId, parseInt(selectedAssignee), token);
      ErrorHandler.showNotification('Tarea asignada exitosamente', 'success');
      setShowAssignModal(null);
      setSelectedAssignee('');
      loadTasks();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setAssigningId(null);
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

  const taskCardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  if (!projectId) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        📋 Selecciona un proyecto para ver sus tareas
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>
          🔄 Cargando tareas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: '#f44336', 
        padding: '20px', 
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        ❌ {error}
        <button 
          onClick={loadTasks}
          style={{
            marginLeft: '10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '4px',
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
        padding: '40px',
        color: '#666',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '2px dashed #ddd'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
        <h3 style={{ margin: '0 0 10px 0' }}>No hay tareas en este proyecto</h3>
        <p style={{ margin: 0 }}>¡Crea la primera tarea para comenzar a trabajar!</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          Tareas del Proyecto ({tasks.length})
        </h3>
      </div>
      
      <div>
        {tasks.map(task => (
          <div key={task.id} style={taskCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>
                    {getStatusIcon(task.status)}
                  </span>
                  <h4 style={{ 
                    margin: 0, 
                    color: '#1976d2',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {task.title}
                  </h4>
                </div>
                
                {task.description && (
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {task.description}
                  </p>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '14px' }}>
                  <span style={{ 
                    backgroundColor: getStatusColor(task.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusDisplayName(task.status)}
                  </span>
                  
                  {task.assigneeName ? (
                    <span style={{ color: '#4caf50' }}>
                      👤 Asignada a: <strong>{task.assigneeName}</strong>
                    </span>
                  ) : (
                    <span style={{ color: '#ff9800' }}>
                      👤 Sin asignar
                    </span>
                  )}
                  
                  {task.dueDate && (
                    <span style={{ color: '#666' }}>
                      📅 Vence: {ErrorHandler.formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '15px' }}>
                {canModify && (
                  <>
                    <button
                      onClick={() => onSelectTask && onSelectTask(task.id, task)}
                      style={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      title="Editar tarea"
                    >
                      ✏️ Editar
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowAssignModal(task.id);
                        setSelectedAssignee(task.assigneeId || '');
                      }}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      title="Asignar tarea"
                    >
                      👤 Asignar
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      disabled={deletingId === task.id}
                      style={{
                        backgroundColor: deletingId === task.id ? '#ccc' : '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: deletingId === task.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      title="Eliminar tarea"
                    >
                      {deletingId === task.id ? '⏳' : '🗑️'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de asignación */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1976d2' }}>
              Asignar Tarea
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Seleccionar usuario:
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Sin asignar</option>
                {assignableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAssignModal(null);
                  setSelectedAssignee('');
                }}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAssignTask(showAssignModal)}
                disabled={assigningId === showAssignModal}
                style={{
                  backgroundColor: assigningId === showAssignModal ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: assigningId === showAssignModal ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {assigningId === showAssignModal ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}