import React, { useState, useCallback } from 'react';
import { updateTask } from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function KanbanBoard({ tasks, token, onTaskUpdate, canModify, onSelectTask }) {
  const [draggingTask, setDraggingTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = [
    { id: 'PENDING', title: 'Pendiente', color: '#ff9800', icon: '⏳' },
    { id: 'IN_PROGRESS', title: 'En Progreso', color: '#2196f3', icon: '🔄' },
    { id: 'COMPLETED', title: 'Completada', color: '#4caf50', icon: '✅' }
  ];

  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const handleDragStart = (e, task) => {
    if (!canModify) return;
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (!canModify || !draggingTask) return;
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!canModify || !draggingTask || draggingTask.status === newStatus) {
      setDraggingTask(null);
      setDragOverColumn(null);
      return;
    }

    try {
      const updatedTask = { ...draggingTask, status: newStatus };
      await updateTask(draggingTask.id, updatedTask, token);
      ErrorHandler.showNotification('Estado de tarea actualizado exitosamente', 'success');
      onTaskUpdate && onTaskUpdate();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setDraggingTask(null);
      setDragOverColumn(null);
    }
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

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'COMPLETED') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const taskCardStyle = (task, isDragging) => ({
    backgroundColor: 'white',
    border: `1px solid ${isOverdue(task.dueDate, task.status) ? '#f44336' : 'var(--border-light)'}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    cursor: canModify ? 'move' : 'pointer',
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    transform: isDragging ? 'rotate(2deg)' : 'none'
  });

  const columnStyle = (column, isHighlighted) => ({
    backgroundColor: isHighlighted ? `${column.color}15` : 'var(--background-light)',
    border: `2px ${isHighlighted ? 'solid' : 'dashed'} ${isHighlighted ? column.color : 'var(--border-light)'}`,
    borderRadius: '12px',
    padding: '16px',
    minHeight: '500px',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '20px',
      padding: '20px 0'
    }}>
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        const isHighlighted = dragOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            style={columnStyle(column, isHighlighted)}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Encabezado de columna */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              padding: '8px 12px',
              backgroundColor: column.color,
              color: 'white',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{column.icon}</span>
                <span>{column.title}</span>
              </div>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {columnTasks.length}
              </span>
            </div>

            {/* Tareas */}
            <div>
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable={canModify}
                  style={taskCardStyle(task, draggingTask?.id === task.id)}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onSelectTask && onSelectTask(task.id, task)}
                  onMouseOver={(e) => {
                    if (!draggingTask) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!draggingTask) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  {/* Título de la tarea */}
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    lineHeight: '1.3'
                  }}>
                    {task.title}
                  </h4>

                  {/* Descripción (solo primeras líneas) */}
                  {task.description && (
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {task.description}
                    </p>
                  )}

                  {/* Información adicional */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Prioridad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        {getPriorityDisplayName(task.priority)}
                      </span>
                    </div>

                    {/* Fecha límite */}
                    {task.dueDate && (
                      <div style={{
                        fontSize: '11px',
                        color: isOverdue(task.dueDate, task.status) ? '#f44336' : 'var(--text-muted)',
                        fontWeight: isOverdue(task.dueDate, task.status) ? 'bold' : 'normal'
                      }}>
                        📅 {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate, task.status) && (
                          <span style={{ marginLeft: '4px', color: '#f44336' }}>⚠️</span>
                        )}
                      </div>
                    )}

                    {/* Asignado */}
                    {task.assignee ? (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        👤 {task.assignee.username}
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#ff9800' }}>
                        👤 Sin asignar
                      </div>
                    )}

                    {/* Dependencias */}
                    {task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        🔗 Depende de {task.dependsOnTaskIds.length} tarea{task.dependsOnTaskIds.length > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Indicador de no completable */}
                    {task.canBeCompleted === false && task.status !== 'COMPLETED' && (
                      <div style={{
                        fontSize: '11px',
                        color: '#f44336',
                        backgroundColor: '#ffebee',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        🚫 Bloqueada por dependencias
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{column.icon}</div>
                  <div>No hay tareas {column.title.toLowerCase()}</div>
                  {canModify && (
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                      Arrastra tareas aquí para cambiar su estado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
