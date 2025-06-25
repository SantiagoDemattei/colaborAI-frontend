import { API_URL } from './apiConfig';

const PROJECT_MEMBERS_URL = `${API_URL}/api/projects`;

export async function addMemberToProject(projectId, userId, ownerId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId, ownerId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al agregar miembro');
  }
  return res.json();
}

export async function updateMemberRole(projectId, memberId, role, ownerId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members/${memberId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role, ownerId })
  });
  if (!res.ok) throw new Error('Error al actualizar rol del miembro');
  return res.json();
}

export async function removeMemberFromProject(projectId, memberId, ownerId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members/${memberId}?ownerId=${ownerId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al remover miembro');
  return true;
}

export async function getProjectMembers(projectId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener miembros del proyecto');
  return res.json();
}

export async function getAvailableUsersForProject(projectId, ownerId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members/available?ownerId=${ownerId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener usuarios disponibles');
  return res.json();
}

export async function canUserModifyProject(projectId, userId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members/can-modify?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al verificar permisos');
  return res.json();
}

export async function canUserAssignTasks(projectId, userId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members/can-assign-tasks?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al verificar permisos de asignación');
  return res.json();
}

export async function isUserProjectMember(projectId, userId, token) {
  const res = await fetch(`${PROJECT_MEMBERS_URL}/${projectId}/members/is-member?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al verificar membresía');
  return res.json();
}
