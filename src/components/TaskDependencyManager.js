import React, { useState, useEffect, useCallback } from 'react';
import { 
  addTaskDependency, 
  removeTaskDependency, 
  getTaskDependencies, 
  getTaskDependents,
  getTasksByProject 
} from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function TaskDependencyManager({ taskId, projectId, token, onUpdate }) {
  const [dependencies, setDependencies] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadDependencies = useCallback(async () => {
    try {
      const [deps, dependentsData, allTasks] = await Promise.all([
        getTaskDependencies(taskId, token),
        getTaskDependents(taskId, token),
        getTasksByProject(projectId, token)
      ]);
      
      setDependencies(deps);
      setDependents(dependentsData);
      
      // Filtrar tareas disponibles (excluir la tarea actual y sus dependientes)
      const dependentIds = dependentsData.map(task => task.id);
      const available = allTasks.filter(task => 
        task.id !== taskId && 
        !dependentIds.includes(task.id) &&
        !deps.some(dep => dep.id === task.id)
      );
      setAvailableTasks(available);
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [taskId, projectId, token]);

  useEffect(() => {
    if (taskId && projectId) {
      loadDependencies();
    }
  }, [loadDependencies, taskId, projectId]);

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    try {
      setProcessing(true);
      await addTaskDependency(taskId, parseInt(selectedTaskId), token);
      ErrorHandler.showNotification('Dependencia agregada exitosamente', 'success');
      setShowAddModal(false);
      setSelectedTaskId('');
      loadDependencies();
      onUpdate && onUpdate();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveDependency = async (dependencyId, dependencyTitle) => {
    if (!window.confirm(`¿Estás seguro de que quieres remover la dependencia con "${dependencyTitle}"?`)) {
      return;
    }

    try {
      setProcessing(true);
      await removeTaskDependency(taskId, dependencyId, token);
      ErrorHandler.showNotification('Dependencia removida exitosamente', 'success');
      loadDependencies();
      onUpdate && onUpdate();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessing(false);
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

  const getPriorityColor = (priority) => {
    if (!priority) return '#9e9e9e';
    const colors = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336'
    };
    return colors[priority] || '#666';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>⏳ Cargando dependencias...</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--background-light)',
      border: '1px solid var(--border-light)',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          🔗 Dependencias de Tareas
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={processing || availableTasks.length === 0}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: processing || availableTasks.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            opacity: processing || availableTasks.length === 0 ? 0.6 : 1
          }}
        >
          ➕ Agregar Dependencia
        </button>
      </div>

      {/* Tareas de las que depende */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
          📥 Esta tarea depende de:
        </h4>
        {dependencies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Esta tarea no depende de ninguna otra tarea.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dependencies.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <span style={{
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusDisplayName(task.status)}
                    </span>
                    {task.priority && (
                      <span style={{
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDependency(task.id, task.title)}
                  disabled={processing}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tareas que dependen de esta */}
      <div>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
          📤 Tareas que dependen de esta:
        </h4>
        {dependents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Ninguna tarea depende de esta.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dependents.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '6px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <span style={{
                      backgroundColor: getStatusColor(task.status),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusDisplayName(task.status)}
                    </span>
                    {task.priority && (
                      <span style={{
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}>
                  🔒 Bloqueada hasta completar esta
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para agregar dependencia */}
      {showAddModal && (
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
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
              Agregar Dependencia
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: 'var(--text-primary)'
              }}>
                Seleccionar tarea de la que depende:
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Seleccionar tarea...</option>
                {availableTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} ({getStatusDisplayName(task.status)})
                  </option>
                ))}
              </select>
            </div>

            {availableTasks.length === 0 && (
              <div style={{
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                color: '#856404',
                marginBottom: '20px'
              }}>
                ⚠️ No hay tareas disponibles para crear dependencias. 
                Las tareas no pueden depender de sí mismas o de tareas que ya dependen de esta.
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTaskId('');
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
                onClick={handleAddDependency}
                disabled={!selectedTaskId || processing}
                style={{
                  backgroundColor: !selectedTaskId || processing ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: !selectedTaskId || processing ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {processing ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
