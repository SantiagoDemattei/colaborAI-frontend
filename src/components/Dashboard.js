import React, { useState, useEffect, useCallback } from 'react';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import ProjectMemberManager from './ProjectMemberManager';
import InvitationForm from './InvitationForm';
import InvitationManager from './InvitationManager';
import { canUserModifyProject } from '../services/memberService';
import ErrorHandler from '../utils/errorHandler';

export default function Dashboard({ token, ownerId, user }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshProjects, setRefreshProjects] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [canModifyProject, setCanModifyProject] = useState(false);
  const [isProjectOwner, setIsProjectOwner] = useState(false);

  const [editProject, setEditProject] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const checkProjectPermissions = useCallback(async () => {
    try {
      const canModify = await canUserModifyProject(selectedProjectId, ownerId, token);
      setCanModifyProject(canModify);
    } catch (err) {
      console.error('Error al verificar permisos:', err);
      setCanModifyProject(false);
    }
  }, [selectedProjectId, ownerId, token]);

  useEffect(() => {
    if (selectedProjectId && selectedProject) {
      checkProjectPermissions();
      setIsProjectOwner(selectedProject.ownerId === ownerId);
    }
  }, [selectedProjectId, selectedProject, ownerId, checkProjectPermissions]);

  const handleProjectCreatedOrUpdated = (project) => {
    setShowProjectForm(false);
    setEditProject(null);
    setRefreshProjects(r => !r);
    if (project) {
      ErrorHandler.showNotification(
        editProject ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente',
        'success'
      );
    }
  };

  const handleTaskCreatedOrUpdated = (task) => {
    setShowTaskForm(false);
    setEditTask(null);
    setRefreshTasks(r => !r);
    if (task) {
      ErrorHandler.showNotification(
        editTask ? 'Tarea actualizada exitosamente' : 'Tarea creada exitosamente',
        'success'
      );
    }
  };

  const handleProjectSelect = (projectId, project) => {
    setSelectedProjectId(projectId);
    setSelectedProject(project);
    setActiveTab('project-details');
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: isActive ? 'var(--primary-color)' : 'var(--accent-color)',
    color: isActive ? 'var(--text-light)' : 'var(--text-primary)',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    marginRight: '5px',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  });

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  const sectionStyle = {
    backgroundColor: 'var(--background-light)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px var(--shadow-color)',
    border: '1px solid var(--border-light)'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ color: 'var(--primary-color)', marginBottom: '30px', textAlign: 'center' }}>
        Panel de Colaboración
      </h1>
      
      {/* Navegación por pestañas */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          style={tabStyle(activeTab === 'projects')}
          onClick={() => setActiveTab('projects')}
        >
          📋 Mis Proyectos
        </button>
        <button 
          style={tabStyle(activeTab === 'invitations')}
          onClick={() => setActiveTab('invitations')}
        >
          👥 Invitaciones
        </button>
        {selectedProjectId && (
          <button 
            style={tabStyle(activeTab === 'project-details')}
            onClick={() => setActiveTab('project-details')}
          >
            📊 Detalles del Proyecto
          </button>
        )}
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'projects' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Gestión de Proyectos</h2>
            <button 
              onClick={() => { 
                setShowProjectForm(true); 
                setEditProject(null); 
              }}
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'var(--text-light)',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'var(--primary-hover)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'var(--primary-color)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ➕ Nuevo Proyecto
            </button>
          </div>
          
          {showProjectForm && (
            <ProjectForm
              token={token}
              onSubmit={handleProjectCreatedOrUpdated}
              project={editProject}
            />
          )}
          
          <ProjectList
            ownerId={ownerId}
            token={token}
            onSelectProject={handleProjectSelect}
            key={refreshProjects}
          />
        </div>
      )}

      {activeTab === 'invitations' && (
        <div>
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)' }}>Enviar Nueva Invitación</h2>
            <InvitationForm
              token={token}
              onInvitationSent={() => {
                setRefreshProjects(r => !r);
              }}
            />
          </div>
          
          <div style={sectionStyle}>
            <InvitationManager
              token={token}
              userId={ownerId}
            />
          </div>
        </div>
      )}

      {activeTab === 'project-details' && selectedProjectId && (
        <div>
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  {selectedProject?.name || 'Proyecto Seleccionado'}
                </h2>
                <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>
                  {selectedProject?.description || 'Sin descripción'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {canModifyProject && (
                  <button 
                    onClick={() => { 
                      setShowTaskForm(true); 
                      setEditTask(null); 
                    }}
                    style={{
                      backgroundColor: 'var(--success-color)',
                      color: 'var(--text-light)',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'var(--tiffany-blue-dark)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'var(--success-color)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    ➕ Nueva Tarea
                  </button>
                )}
                <button 
                  onClick={() => setActiveTab('projects')}
                  style={{
                    backgroundColor: 'var(--danger-color)',
                    color: 'var(--text-light)',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#b71c1c';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'var(--danger-color)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ← Volver
                </button>
              </div>
            </div>
            
            {showTaskForm && (
              <TaskForm
                token={token}
                projectId={selectedProjectId}
                onSubmit={handleTaskCreatedOrUpdated}
                task={editTask}
              />
            )}
            
            <TaskList
              projectId={selectedProjectId}
              token={token}
              onSelectTask={(taskId, task) => {
                setEditTask(task);
                setShowTaskForm(true);
              }}
              canModify={canModifyProject}
              key={refreshTasks}
            />
          </div>

          {/* Gestión de miembros del proyecto */}
          <div style={sectionStyle}>
            <ProjectMemberManager
              projectId={selectedProjectId}
              token={token}
              ownerId={ownerId}
              isOwner={isProjectOwner}
            />
          </div>
        </div>
      )}
    </div>
  );
}