import React, { useState } from 'react';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

export default function Dashboard({ token, ownerId }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshProjects, setRefreshProjects] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(false);

  const [editProject, setEditProject] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const handleProjectCreatedOrUpdated = () => {
    setShowProjectForm(false);
    setEditProject(null);
    setRefreshProjects(r => !r);
  };

  const handleTaskCreatedOrUpdated = () => {
    setShowTaskForm(false);
    setEditTask(null);
    setRefreshTasks(r => !r);
  };

  return (
    <div>
      <h1>Panel de Proyectos</h1>
      <button onClick={() => { setShowProjectForm(true); setEditProject(null); }}>
        Nuevo Proyecto
      </button>
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
        onSelectProject={setSelectedProjectId}
        key={refreshProjects}
      />
      {selectedProjectId && (
        <div>
          <h2>Tareas del Proyecto</h2>
          <button onClick={() => { setShowTaskForm(true); setEditTask(null); }}>
            Nueva Tarea
          </button>
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
            onSelectTask={taskId => {
              setEditTask(taskId);
              setShowTaskForm(true);
            }}
            key={refreshTasks}
          />
        </div>
      )}
    </div>
  );
}