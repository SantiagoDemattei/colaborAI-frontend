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
  const res = await fetch(`${TASKS_URL}/project/${projectId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Error al crear la tarea');
  return res.json();
}

export async function updateTask(id, task, token) {
  const res = await fetch(`${TASKS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Error al actualizar la tarea');
  return res.json();
}

export async function deleteTask(id, token) {
  const res = await fetch(`${TASKS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al eliminar la tarea');
  return true;
}