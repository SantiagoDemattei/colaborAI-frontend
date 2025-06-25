import { API_URL } from './apiConfig';

const CONNECTIONS_URL = `${API_URL}/api/connections`;

export async function sendConnectionRequest(requesterId, usernameOrEmail, token) {
  const res = await fetch(`${CONNECTIONS_URL}/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ requesterId, usernameOrEmail })
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

export async function getPendingRequests(userId, token) {
  const res = await fetch(`${CONNECTIONS_URL}/pending/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener invitaciones pendientes');
  return res.json();
}

export async function getSentRequests(userId, token) {
  const res = await fetch(`${CONNECTIONS_URL}/sent/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener invitaciones enviadas');
  return res.json();
}

export async function getConnectedUsers(userId, token) {
  const res = await fetch(`${CONNECTIONS_URL}/users/${userId}`, {
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
