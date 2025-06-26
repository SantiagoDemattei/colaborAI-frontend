import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await register(form);
    if (res.token) {
      setMessage('Registro exitoso! Por favor hacé login.');
      setMessageType('success');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(res.message || 'Error en registro');
      setMessageType('error');
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '30px' }}>
        Registro
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Usuario</label>
          <input 
            className="form-input"
            name="username" 
            placeholder="Ingresa tu usuario" 
            value={form.username} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            className="form-input"
            type="email" 
            name="email" 
            placeholder="Ingresa tu email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input 
            className="form-input"
            type="password" 
            name="password" 
            placeholder="Ingresa tu contraseña" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
          Registrarse
        </button>
      </form>
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}
    </div>
  );
}
