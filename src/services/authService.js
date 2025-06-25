import { API_URL } from './apiConfig';

export async function register(user) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Error en el registro');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error en el registro');
  }
}

export async function login(credentials) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Error de autenticación');
    }
    
    return data;
  } catch (error) {
    // Siempre devolver el mismo mensaje genérico para no revelar información
    throw new Error('Credenciales inválidas');
  }
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}
