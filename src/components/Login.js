import React, { useState } from 'react';
import { login, saveToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await login(form);
    if (res.token) {
      saveToken(res.token);
      setMessage('Login exitoso!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setMessage(res.message || 'Error en login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange} required />
        <br />
        <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        <br />
        <button type="submit">Ingresar</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
