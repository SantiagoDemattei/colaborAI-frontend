import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCriticalPath, getCriticalTasks } from '../services/taskService';
import ErrorHandler from '../utils/errorHandler';

export default function CPMPertChart({ projectId, tasks, token, onTaskSelect, onRefresh }) {
  const [criticalPath, setCriticalPath] = useState([]);
  const [criticalTasks, setCriticalTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const canvasRef = useRef(null);

  const loadCPMData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pathData, criticalData] = await Promise.all([
        getCriticalPath(projectId, token),
        getCriticalTasks(projectId, token)
      ]);
      setCriticalPath(pathData);
      setCriticalTasks(criticalData);
    } catch (err) {
      const errorMessage = ErrorHandler.handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  // Cargar datos CPM-PERT
  useEffect(() => {
    if (projectId && tasks.length > 0) {
      loadCPMData();
    }
  }, [projectId, tasks, loadCPMData]);

  // Calcular posiciones de las tareas para el diagrama
  const calculateTaskPositions = useCallback(() => {
    if (!tasks || tasks.length === 0) return [];

    const positions = [];
    const levels = {};
    const processed = new Set();
    
    // Función para calcular el nivel de una tarea
    const calculateLevel = (task) => {
      if (processed.has(task.id)) return levels[task.id];
      
      let maxDependencyLevel = -1;
      if (task.dependsOnIds && task.dependsOnIds.length > 0) {
        for (const depId of task.dependsOnIds) {
          const depTask = tasks.find(t => t.id === depId);
          if (depTask) {
            maxDependencyLevel = Math.max(maxDependencyLevel, calculateLevel(depTask));
          }
        }
      }
      
      levels[task.id] = maxDependencyLevel + 1;
      processed.add(task.id);
      return levels[task.id];
    };

    // Calcular niveles para todas las tareas
    tasks.forEach(task => calculateLevel(task));

    // Agrupar tareas por nivel
    const tasksByLevel = {};
    tasks.forEach(task => {
      const level = levels[task.id];
      if (!tasksByLevel[level]) tasksByLevel[level] = [];
      tasksByLevel[level].push(task);
    });

    // Calcular posiciones
    const nodeWidth = 150;
    const nodeHeight = 80;
    const levelSpacing = 200;
    const nodeSpacing = 100;

    Object.keys(tasksByLevel).forEach(level => {
      const levelTasks = tasksByLevel[level];
      const levelY = parseInt(level) * levelSpacing + 50;
      
      levelTasks.forEach((task, index) => {
        const x = index * (nodeWidth + nodeSpacing) + 50;
        const y = levelY;
        
        positions.push({
          ...task,
          x,
          y,
          width: nodeWidth,
          height: nodeHeight,
          level: parseInt(level),
          isCritical: criticalTasks.some(ct => ct.id === task.id)
        });
      });
    });

    return positions;
  }, [tasks, criticalTasks]);

  // Renderizar el diagrama en canvas
  const renderDiagram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const positions = calculateTaskPositions();
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aplicar zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Dibujar conexiones (dependencias)
    positions.forEach(task => {
      if (task.dependsOnIds && task.dependsOnIds.length > 0) {
        task.dependsOnIds.forEach(depId => {
          const depTask = positions.find(p => p.id === depId);
          if (depTask) {
            const isCriticalConnection = criticalPath.includes(task.id) && criticalPath.includes(depId);
            
            ctx.strokeStyle = isCriticalConnection ? '#f44336' : '#666';
            ctx.lineWidth = isCriticalConnection ? 3 : 1;
            ctx.beginPath();
            ctx.moveTo(depTask.x + depTask.width, depTask.y + depTask.height / 2);
            ctx.lineTo(task.x, task.y + task.height / 2);
            ctx.stroke();

            // Dibujar flecha
            const angle = Math.atan2(
              (task.y + task.height / 2) - (depTask.y + depTask.height / 2),
              task.x - (depTask.x + depTask.width)
            );
            const arrowLength = 10;
            const arrowX = task.x - 5;
            const arrowY = task.y + task.height / 2;
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
              arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
              arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
              arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
              arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
        });
      }
    });

    // Dibujar nodos (tareas)
    positions.forEach(task => {
      const isSelected = selectedTask && selectedTask.id === task.id;
      const isCritical = task.isCritical;
      
      // Fondo del nodo
      ctx.fillStyle = isSelected ? '#e3f2fd' : (isCritical ? '#ffebee' : '#f5f5f5');
      ctx.strokeStyle = isSelected ? '#2196f3' : (isCritical ? '#f44336' : '#999');
      ctx.lineWidth = isSelected ? 3 : (isCritical ? 2 : 1);
      
      ctx.fillRect(task.x, task.y, task.width, task.height);
      ctx.strokeRect(task.x, task.y, task.width, task.height);

      // Texto del título
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
        task.x + task.width / 2,
        task.y + 20
      );

      // Información CPM (si está disponible)
      ctx.font = '10px Arial';
      ctx.fillStyle = '#666';
      
      if (task.estimatedDuration) {
        ctx.fillText(`Duración: ${task.estimatedDuration}d`, task.x + task.width / 2, task.y + 35);
      }
      
      if (task.earlyStart !== undefined && task.earlyFinish !== undefined) {
        ctx.fillText(`ES: ${task.earlyStart} EF: ${task.earlyFinish}`, task.x + task.width / 2, task.y + 50);
      }
      
      if (task.lateStart !== undefined && task.lateFinish !== undefined) {
        ctx.fillText(`LS: ${task.lateStart} LF: ${task.lateFinish}`, task.x + task.width / 2, task.y + 65);
      }

      // Marcador de tarea crítica
      if (isCritical) {
        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('CRÍTICA', task.x + task.width - 25, task.y + 12);
      }
    });

    ctx.restore();
  }, [calculateTaskPositions, criticalPath, zoom, selectedTask]);

  // Manejar click en el canvas
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    
    const positions = calculateTaskPositions();
    const clickedTask = positions.find(task => 
      x >= task.x && x <= task.x + task.width &&
      y >= task.y && y <= task.y + task.height
    );
    
    if (clickedTask) {
      setSelectedTask(clickedTask);
      if (onTaskSelect) {
        onTaskSelect(clickedTask);
      }
    } else {
      setSelectedTask(null);
    }
  }, [calculateTaskPositions, zoom, onTaskSelect]);

  // Renderizar cuando cambien los datos
  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>Cargando análisis CPM-PERT...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: '#f44336', 
        padding: '20px',
        backgroundColor: '#ffebee',
        borderRadius: '4px',
        border: '1px solid #f44336',
        textAlign: 'center'
      }}>
        {error}
        <br />
        <button 
          onClick={loadCPMData}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const containerStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    padding: '20px'
  };

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '0 5px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={toolbarStyle}>
        <div>
          <h3 style={{ margin: 0, color: '#1976d2' }}>Diagrama CPM-PERT</h3>
          {criticalPath.length > 0 && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              Camino crítico: {criticalPath.length} tareas | 
              Duración total: {criticalTasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0)} días
            </div>
          )}
        </div>
        
        <div>
          <button
            style={buttonStyle}
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            Zoom -
          </button>
          <span style={{ margin: '0 10px' }}>{Math.round(zoom * 100)}%</span>
          <button
            style={buttonStyle}
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            Zoom +
          </button>
          <button
            style={buttonStyle}
            onClick={() => setZoom(1)}
          >
            Reset
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              loadCPMData();
              if (onRefresh) onRefresh();
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        style={{
          border: '1px solid #ddd',
          cursor: 'pointer',
          width: '100%',
          height: '600px'
        }}
        onClick={handleCanvasClick}
      />

      {selectedTask && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
            {selectedTask.title}
            {selectedTask.isCritical && 
              <span style={{ 
                marginLeft: '10px', 
                backgroundColor: '#f44336', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '3px', 
                fontSize: '12px' 
              }}>
                CRÍTICA
              </span>
            }
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div><strong>Estado:</strong> {selectedTask.status}</div>
            <div><strong>Prioridad:</strong> {selectedTask.priority || 'Sin prioridad'}</div>
            <div><strong>Duración estimada:</strong> {selectedTask.estimatedDuration || 'No definida'} días</div>
            <div><strong>Asignado a:</strong> {selectedTask.assigneeName || 'Sin asignar'}</div>
            {selectedTask.earlyStart !== undefined && (
              <>
                <div><strong>Inicio temprano:</strong> {selectedTask.earlyStart}</div>
                <div><strong>Fin temprano:</strong> {selectedTask.earlyFinish}</div>
                <div><strong>Inicio tardío:</strong> {selectedTask.lateStart}</div>
                <div><strong>Fin tardío:</strong> {selectedTask.lateFinish}</div>
                <div><strong>Holgura:</strong> {selectedTask.slack || 0} días</div>
              </>
            )}
          </div>
          {selectedTask.description && (
            <div style={{ marginTop: '10px' }}>
              <strong>Descripción:</strong> {selectedTask.description}
            </div>
          )}
        </div>
      )}

      {criticalPath.length === 0 && tasks.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffc107',
          textAlign: 'center'
        }}>
          <strong>Información:</strong> Para generar el análisis CPM-PERT, asegúrate de que las tareas tengan:
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>Duración estimada definida</li>
            <li>Dependencias configuradas (si aplica)</li>
            <li>Al menos una tarea sin dependencias (punto de inicio)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
