import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getMyAssignedTasks, updateTask } from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function MyTasks({ token, userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // 'alphabetic', 'dueDate', 'priority'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filterByPriority, setFilterByPriority] = useState('all');

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
    if (!priority) return '#9e9e9e';
    const colors = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#f44336'
    };
    return colors[priority] || '#666';
  };

  const getPriorityDisplayName = (priority) => {
    if (!priority) return 'Sin prioridad';
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

  // Función para filtrar y ordenar tareas
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Filtro por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por estado
      const matchesStatus = filterByStatus === 'all' || task.status === filterByStatus;
      
      // Filtro por prioridad
      const matchesPriority = filterByPriority === 'all' || 
        (filterByPriority === 'none' ? !task.priority : task.priority === filterByPriority);
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'alphabetic':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;
          comparison = priorityB - priorityA; // Mayor prioridad primero
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [tasks, searchTerm, sortBy, sortOrder, filterByStatus, filterByPriority]);

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
          📋 Mis Tareas Asignadas ({filteredAndSortedTasks.length} de {tasks.length})
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

      {/* Barra de búsqueda y filtros */}
      <div style={{
        backgroundColor: 'var(--background-light)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {/* Búsqueda */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>

        {/* Filtros y ordenamiento */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Ordenar por:
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="dueDate">Fecha límite</option>
                <option value="alphabetic">Alfabético</option>
                <option value="priority">Prioridad</option>
                <option value="createdAt">Fecha creación</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--accent-color)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={sortOrder === 'asc' ? 'Cambiar a descendente' : 'Cambiar a ascendente'}
              >
                {sortOrder === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Filtrar por estado:
            </label>
            <select
              value={filterByStatus}
              onChange={(e) => setFilterByStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Filtrar por prioridad:
            </label>
            <select
              value={filterByPriority}
              onChange={(e) => setFilterByPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todas las prioridades</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
              <option value="none">Sin prioridad</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        {filteredAndSortedTasks.map((task) => (
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
