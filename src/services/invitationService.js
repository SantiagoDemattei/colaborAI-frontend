import { API_URL } from './apiConfig';

const CONNECTIONS_URL = `${API_URL}/api/connections`;

export async function sendConnectionRequest(requesterId, usernameOrEmail, token) {
  const res = await fetch(`${CONNECTIONS_URL}/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ usernameOrEmail }) // Solo enviar usernameOrEmail, el requesterId se obtiene del token
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al enviar invitación');
  }
  return res.json();
}

export async function acceptConnectionRequest(connectionId, userId, token) {
  const res = await fetch(`${CONNECTIONS_URL}/${connectionId}/accept?userId=${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al aceptar invitación');
  return res.json();
}

export async function rejectConnectionRequest(connectionId, userId, token) {
  const res = await fetch(`${CONNECTIONS_URL}/${connectionId}/reject?userId=${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al rechazar invitación');
  return res.json();
}

export async function getPendingRequests(token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${CONNECTIONS_URL}/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener invitaciones pendientes');
  return res.json();
}

export async function getSentRequests(token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${CONNECTIONS_URL}/sent`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener invitaciones enviadas');
  return res.json();
}

export async function getConnectedUsers(token) {
  // No necesitamos enviar userId ya que se obtiene del token JWT
  const res = await fetch(`${CONNECTIONS_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener contactos');
  return res.json();
}

export async function areUsersConnected(user1Id, user2Id, token) {
  const res = await fetch(`${CONNECTIONS_URL}/check?user1Id=${user1Id}&user2Id=${user2Id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al verificar conexión');
  return res.json();
}
