import React, { useEffect, useState, useCallback } from 'react';
import { getAllUserProjects, deleteProject } from '../services/projectService';
import ErrorHandler from '../utils/errorHandler';

export default function ProjectList({ ownerId, token, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUserProjects(token); // Eliminado ownerId
      setProjects(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [token]); // Eliminado ownerId de las dependencias

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    backgroundColor: 'var(--background-light)',
    boxShadow: '0 2px 4px var(--shadow-color)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  };

  const projectCardHoverStyle = {
    ...projectCardStyle,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px var(--shadow-hover)'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
          🔄 Cargando proyectos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: 'var(--danger-color)', 
        padding: '20px', 
        backgroundColor: 'var(--danger-light)',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid var(--danger-color)'
      }}>
        ❌ {error}
        <button 
          onClick={loadProjects}
          style={{
            marginLeft: '10px',
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-light)',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
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
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📋 {project.name}
                  {project.ownerId === ownerId ? (
                    <span style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      PROPIETARIO
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold'
                    }}>
                      MIEMBRO
                    </span>
                  )}
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
                
                {project.ownerId === ownerId && (
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
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}