import { API_URL } from './apiConfig';

const TASKS_URL = `${API_URL}/api/tasks`;

export async function getTasksByProject(projectId, token) {
  const res = await fetch(`${TASKS_URL}/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
}

export async function getTaskById(id, token) {
  const res = await fetch(`${TASKS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener la tarea');
  return res.json();
}

export async function createTask(task, projectId, token) {
  // No necesitamos enviar createdById ya que se obtiene del token JWT
  const res = await fetch(`${TASKS_URL}/project/${projectId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear la tarea');
  }
  return res.json();
}

export async function updateTask(id, task, token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${TASKS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar la tarea');
  }
  return res.json();
}

export async function deleteTask(id, token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${TASKS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al eliminar la tarea');
  return true;
}

export async function assignTask(taskId, assigneeId, token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${TASKS_URL}/${taskId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ assigneeId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al asignar la tarea');
  }
  return res.json();
}

export async function getAssignableUsers(projectId, token) {
  const res = await fetch(`${TASKS_URL}/project/${projectId}/assignable-users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener usuarios asignables');
  return res.json();
}

export async function getMyAssignedTasks(token) {
  const res = await fetch(`${TASKS_URL}/my-tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener mis tareas asignadas');
  return res.json();
}

export async function getTaskPriorities(token) {
  const res = await fetch(`${TASKS_URL}/priorities`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener las prioridades de tareas');
  return res.json();
}

// Funciones para dependencias entre tareas
export async function addTaskDependency(taskId, dependsOnTaskId, token) {
  const res = await fetch(`${TASKS_URL}/${taskId}/dependencies/${dependsOnTaskId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al agregar dependencia de tarea');
  return res.json();
}

export async function removeTaskDependency(taskId, dependsOnTaskId, token) {
  const res = await fetch(`${TASKS_URL}/${taskId}/dependencies/${dependsOnTaskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al remover dependencia de tarea');
  return res.json();
}

export async function getTaskDependencies(taskId, token) {
  const res = await fetch(`${TASKS_URL}/${taskId}/dependencies`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener dependencias de tarea');
  return res.json();
}

export async function getTaskDependents(taskId, token) {
  const res = await fetch(`${TASKS_URL}/${taskId}/dependents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener tareas dependientes');
  return res.json();
}

// Funciones para análisis CPM-PERT
export async function getCriticalPath(projectId, token) {
  const res = await fetch(`${TASKS_URL}/project/${projectId}/critical-path`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener el camino crítico');
  return res.json();
}

export async function getCriticalTasks(projectId, token) {
  const res = await fetch(`${TASKS_URL}/project/${projectId}/critical-tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener las tareas críticas');
  return res.json();
}