import { API_URL } from './apiConfig';

const PROJECTS_URL = `${API_URL}/api/projects`;

export async function getProjectsByOwner(token) {
  // No necesitamos enviar ownerId ya que se obtiene del token JWT
  const res = await fetch(`${PROJECTS_URL}/owner`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener proyectos');
  return res.json();
}

export async function getAllUserProjects(token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${PROJECTS_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener proyectos del usuario');
  return res.json();
}

export async function getProjectById(id, token) {
  const res = await fetch(`${PROJECTS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener el proyecto');
  return res.json();
}

export async function createProject(project, token) {
  const res = await fetch(PROJECTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Error al crear el proyecto');
  return res.json();
}

export async function updateProject(id, project, token) {
  const res = await fetch(`${PROJECTS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Error al actualizar el proyecto');
  return res.json();
}

export async function deleteProject(id, token) {
  const res = await fetch(`${PROJECTS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al eliminar el proyecto');
  return true;
}