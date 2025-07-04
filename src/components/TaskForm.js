import React, { useState, useEffect, useCallback } from 'react';
import { createTask, updateTask, getAssignableUsers } from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function TaskForm({ token, projectId, onSubmit, task }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAssignableUsers = useCallback(async () => {
    try {
      const users = await getAssignableUsers(projectId, token);
      setAssignableUsers(users);
    } catch (err) {
      console.error('Error al cargar usuarios asignables:', err);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      setStatus(task.status || 'PENDING');
      setPriority(task.priority || '');
      setAssigneeId(task.assigneeId || '');
      setEstimatedDuration(task.estimatedDuration || '');
    }
    
    if (projectId) {
      loadAssignableUsers();
    }
  }, [task, projectId, loadAssignableUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validación
      const validation = ErrorHandler.validateForm(
        { title, description },
        {
          title: {
            required: true,
            label: 'Título',
            minLength: 3,
            maxLength: 100
          },
          description: {
            required: false,
            label: 'Descripción',
            maxLength: 500
          }
        }
      );

      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const data = {
        title,
        description,
        dueDate: dueDate || null,
        status,
        priority: priority || null,
        assigneeId: assigneeId || null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null
      };
      
      let result;
      if (task && task.id) {
        result = await updateTask(task.id, data, token);
      } else {
        result = await createTask(data, projectId, token);
      }
      
      if (onSubmit) onSubmit(result);
      
      // Limpiar formulario solo si es creación
      if (!task) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatus('PENDING');
        setPriority('');
        setAssigneeId('');
        setEstimatedDuration('');
      }
      
      ErrorHandler.showNotification(
        task ? 'Tarea actualizada exitosamente' : 'Tarea creada exitosamente', 
        'success'
      );
    } catch (err) {
      const errorMessage = ErrorHandler.handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  };

  return (
    <div style={formStyle}>
      <h3 style={{ marginTop: 0, color: '#1976d2' }}>
        {task ? 'Editar Tarea' : 'Nueva Tarea'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Título: *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
            disabled={loading}
            placeholder="Ingresa el título de la tarea"
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Descripción:</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{...inputStyle, height: '80px', resize: 'vertical'}}
            disabled={loading}
            placeholder="Describe la tarea (opcional)"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fecha límite:</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={inputStyle}
              disabled={loading}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Estado:</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={inputStyle}
              disabled={loading}
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Prioridad:</label>
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
              style={inputStyle}
              disabled={loading}
            >
              <option value="">Sin prioridad</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Duración estimada (días):</label>
          <input
            type="number"
            value={estimatedDuration}
            onChange={e => setEstimatedDuration(e.target.value)}
            style={inputStyle}
            disabled={loading}
            placeholder="Ej: 5"
            min="1"
            max="365"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Asignar a:</label>
          <select
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            style={inputStyle}
            disabled={loading}
          >
            <option value="">Sin asignar</option>
            {assignableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
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
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loading || !title.trim()}
            style={{
              backgroundColor: loading || !title.trim() ? '#ccc' : '#1976d2',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              flex: 1
            }}
          >
            {loading ? 'Guardando...' : (task ? 'Actualizar Tarea' : 'Crear Tarea')}
          </button>
          
          {task && (
            <button
              type="button"
              onClick={() => onSubmit && onSubmit(null)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Información de dependencias para tareas existentes */}
      {task && task.id && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '6px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            🔗 Información de Dependencias
          </h4>
          
          {/* Dependencias */}
          {task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0 ? (
            <div style={{ marginBottom: '10px' }}>
              <strong>Esta tarea depende de:</strong>
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                {task.dependsOnTaskIds.length} tarea{task.dependsOnTaskIds.length > 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6c757d' }}>
              Esta tarea no depende de ninguna otra.
            </div>
          )}

          {/* Tareas dependientes */}
          {task.dependentTaskIds && task.dependentTaskIds.length > 0 ? (
            <div style={{ marginBottom: '10px' }}>
              <strong>Tareas que dependen de esta:</strong>
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                {task.dependentTaskIds.length} tarea{task.dependentTaskIds.length > 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Ninguna tarea depende de esta.
            </div>
          )}

          {/* Estado de completitud */}
          {task.canBeCompleted === false && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              color: '#856404',
              fontSize: '14px'
            }}>
              ⚠️ Esta tarea no puede ser completada hasta que se completen todas sus dependencias.
            </div>
          )}

          <div style={{ 
            marginTop: '10px', 
            fontSize: '12px', 
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            Para gestionar las dependencias, ve a la vista de lista del proyecto y usa el botón "🔗 Dependencias".
          </div>
        </div>
      )}
    </div>
  );
}