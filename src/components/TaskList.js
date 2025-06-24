import React, { useEffect, useState } from 'react';
import { getTasksByProject } from '../services/taskService';

export default function TaskList({ projectId, token, onSelectTask }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    getTasksByProject(projectId, token)
      .then(setTasks)
      .catch(() => setError('Error al cargar tareas'))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  if (!projectId) return <p>Selecciona un proyecto para ver sus tareas.</p>;
  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (tasks.length === 0) return <p>No hay tareas para este proyecto.</p>;

  return (
    <div>
      <h3>Tareas</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> - {task.status}
            {onSelectTask && (
              <button onClick={() => onSelectTask(task.id)} style={{ marginLeft: 10 }}>
                Ver detalle
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}