import React, { useEffect, useState } from 'react';
import { getProjectsByOwner } from '../services/projectService';

export default function ProjectList({ ownerId, token, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getProjectsByOwner(ownerId, token)
      .then(setProjects)
      .catch(() => setError('Error al cargar proyectos'))
      .finally(() => setLoading(false));
  }, [ownerId, token]);

  if (loading) return <p>Cargando proyectos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (projects.length === 0) return <p>No tienes proyectos.</p>;

  return (
    <div>
      <h2>Mis Proyectos</h2>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            <strong>{project.name}</strong> - {project.description}
            {onSelectProject && (
              <button onClick={() => onSelectProject(project.id)} style={{ marginLeft: 10 }}>
                Ver tareas
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}