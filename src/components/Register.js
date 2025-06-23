import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await register(form);
    if (res.token) {
      setMessage('Registro exitoso! Por favor hacé login.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(res.message || 'Error en registro');
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange} required />
        <br />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <br />
        <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        <br />
        <button type="submit">Registrarse</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
