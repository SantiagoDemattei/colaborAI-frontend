import React, { useEffect, useState, useCallback } from 'react';
import { getProjectsByOwner, deleteProject } from '../services/projectService';
import ErrorHandler from '../utils/errorHandler';

export default function ProjectList({ ownerId, token, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjectsByOwner(ownerId, token);
      setProjects(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [ownerId, token]);

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"?`)) {
      return;
    }

    try {
      setDeletingId(projectId);
      await deleteProject(projectId, token);
      ErrorHandler.showNotification('Proyecto eliminado exitosamente', 'success');
      loadProjects();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const projectCardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  };

  const projectCardHoverStyle = {
    ...projectCardStyle,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>
          🔄 Cargando proyectos...
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
          onClick={loadProjects}
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

  if (projects.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#666',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '2px dashed #ddd'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
        <h3 style={{ margin: '0 0 10px 0' }}>No tienes proyectos</h3>
        <p style={{ margin: 0 }}>¡Crea tu primer proyecto para comenzar a colaborar!</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>
          Mis Proyectos ({projects.length})
        </h3>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {projects.map(project => (
          <div
            key={project.id}
            style={projectCardStyle}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, projectCardHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, projectCardStyle);
            }}
            onClick={() => onSelectProject && onSelectProject(project.id, project)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  color: '#1976d2',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  📋 {project.name}
                </h4>
                
                <p style={{ 
                  margin: '0 0 15px 0', 
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  {project.description || 'Sin descripción'}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '15px',
                  fontSize: '14px',
                  color: '#888'
                }}>
                  <span>🏷️ ID: {project.id}</span>
                  {project.createdAt && (
                    <span>📅 Creado: {ErrorHandler.formatDate(project.createdAt)}</span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject && onSelectProject(project.id, project);
                  }}
                  style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Ver detalles del proyecto"
                >
                  👁️ Ver
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                  disabled={deletingId === project.id}
                  style={{
                    backgroundColor: deletingId === project.id ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: deletingId === project.id ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  title="Eliminar proyecto"
                >
                  {deletingId === project.id ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}