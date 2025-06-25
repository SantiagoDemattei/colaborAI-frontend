import { API_URL } from './apiConfig';

const NOTIFICATIONS_URL = `${API_URL}/api/notifications`;

export async function getUserNotifications(userId, token) {
  const res = await fetch(`${NOTIFICATIONS_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return res.json();
}

export async function getUnreadNotifications(userId, token) {
  const res = await fetch(`${NOTIFICATIONS_URL}/user/${userId}/unread`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener notificaciones no leídas');
  return res.json();
}

export async function getUnreadCount(userId, token) {
  const res = await fetch(`${NOTIFICATIONS_URL}/user/${userId}/unread/count`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al obtener contador de notificaciones');
  return res.json();
}

export async function markAsRead(notificationId, userId, token) {
  const res = await fetch(`${NOTIFICATIONS_URL}/${notificationId}/read?userId=${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al marcar notificación como leída');
  return res.json();
}

export async function markAllAsRead(userId, token) {
  const res = await fetch(`${NOTIFICATIONS_URL}/user/${userId}/read-all`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Error al marcar todas las notificaciones como leídas');
  return true;
}
