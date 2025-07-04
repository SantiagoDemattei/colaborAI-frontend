import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getTasksByProject, deleteTask, assignTask, getAssignableUsers } from '../services/taskService';
import KanbanBoard from './KanbanBoard';
import TaskDependencyManager from './TaskDependencyManager';
import CPMPertChart from './CPMPertChart';
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
  const [showDependencyManager, setShowDependencyManager] = useState(null);
  
  // Estados para búsqueda, filtros y vista
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban' o 'cmp-pert'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByAssignee, setFilterByAssignee] = useState('all');

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasksByProject(projectId, token);
      setTasks(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  const loadAssignableUsers = useCallback(async () => {
    try {
      const users = await getAssignableUsers(projectId, token);
      setAssignableUsers(users);
    } catch (err) {
      console.error('Error al cargar usuarios asignables:', err);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) return;
    loadTasks();
    if (canModify) loadAssignableUsers();
  }, [projectId, canModify, loadTasks, loadAssignableUsers]);

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
      
      // Filtro por asignado
      const matchesAssignee = filterByAssignee === 'all' || 
        (filterByAssignee === 'unassigned' ? !task.assigneeId : 
         task.assigneeId === parseInt(filterByAssignee));
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    // Ordenamiento (solo para vista de lista)
    if (viewMode === 'list') {
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
            comparison = priorityB - priorityA;
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt) - new Date(b.createdAt);
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [tasks, searchTerm, sortBy, sortOrder, filterByStatus, filterByPriority, filterByAssignee, viewMode]);

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

  const getPriorityIcon = (priority) => {
    if (!priority) return '⚪';
    const icons = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🔴'
    };
    return icons[priority] || '⚪';
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
      {/* Encabezado con contador y selector de vista */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          📋 Tareas del Proyecto ({filteredAndSortedTasks.length} de {tasks.length})
        </h3>
        
        {/* Selector de vista */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Vista:</span>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: '4px',
              backgroundColor: viewMode === 'list' ? 'var(--primary-color)' : 'var(--accent-color)',
              color: viewMode === 'list' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📋 Lista
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: '4px',
              backgroundColor: viewMode === 'kanban' ? 'var(--primary-color)' : 'var(--accent-color)',
              color: viewMode === 'kanban' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📊 Kanban
          </button>
          <button
            onClick={() => setViewMode('cmp-pert')}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: '4px',
              backgroundColor: viewMode === 'cmp-pert' ? 'var(--primary-color)' : 'var(--accent-color)',
              color: viewMode === 'cmp-pert' ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🔗 CPM-PERT
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros para vista de lista */}
      {viewMode === 'list' && (
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

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Filtrar por asignado:
              </label>
              <select
                value={filterByAssignee}
                onChange={(e) => setFilterByAssignee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="all">Todos</option>
                <option value="unassigned">Sin asignar</option>
                {assignableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Renderizar según el modo de vista */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredAndSortedTasks}
          token={token}
          onTaskUpdate={loadTasks}
          canModify={canModify}
          onSelectTask={onSelectTask}
        />
      ) : viewMode === 'cmp-pert' ? (
        <CPMPertChart
          projectId={projectId}
          tasks={tasks}
          token={token}
          onTaskSelect={onSelectTask}
          onRefresh={loadTasks}
        />
      ) : (
        /* Vista de Lista */
        <div>
          {filteredAndSortedTasks.map(task => (
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

                  <span style={{ 
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getPriorityIcon(task.priority)} {getPriorityDisplayName(task.priority)}
                  </span>
                  
                  {task.assignee ? (
                    <span style={{ color: '#4caf50' }}>
                      👤 Asignada a: <strong>{task.assignee.username}</strong>
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
                      onClick={() => setShowDependencyManager(task.id)}
                      style={{
                        backgroundColor: '#9c27b0',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      title="Gestionar dependencias"
                    >
                      🔗 Dependencias
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
      )}

      {/* Gestor de dependencias */}
      {showDependencyManager && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            minWidth: '600px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: '20px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                Gestionar Dependencias
              </h3>
              <button
                onClick={() => setShowDependencyManager(null)}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕ Cerrar
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <TaskDependencyManager
                taskId={showDependencyManager}
                projectId={projectId}
                token={token}
                onUpdate={loadTasks}
              />
            </div>
          </div>
        </div>
      )}

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