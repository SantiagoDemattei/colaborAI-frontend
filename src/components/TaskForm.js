import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/taskService';

export default function TaskForm({ token, projectId, onSubmit, task }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      setStatus(task.status || 'PENDING');
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {
        title,
        description,
        dueDate: dueDate ? dueDate : null,
        status,
      };
      let result;
      if (task && task.id) {
        result = await updateTask(task.id, data, token);
      } else {
        result = await createTask(data, projectId, token);
      }
      if (onSubmit) onSubmit(result);
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('PENDING');
    } catch (err) {
      setError('Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
      <div>
        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Descripción:</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Fecha límite:</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </div>
      <div>
        <label>Estado:</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="COMPLETED">Completada</option>
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : (task ? 'Actualizar' : 'Crear')}
      </button>
    </form>
  );
}