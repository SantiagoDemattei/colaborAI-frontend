import React, { useState, useEffect } from 'react';
import { createProject, updateProject } from '../services/projectService';

export default function ProjectForm({ token, onSubmit, project }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const data = { name, description, ownerId: user.id };
      let result;
      if (project && project.id) {
        result = await updateProject(project.id, data, token);
      } else {
        result = await createProject(data, token);
      }
      if (onSubmit) onSubmit(result);
      setName('');
      setDescription('');
    } catch (err) {
      setError('Error al guardar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{project ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : (project ? 'Actualizar' : 'Crear')}
      </button>
    </form>
  );
}