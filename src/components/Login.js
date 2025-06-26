import React, { useState } from 'react';
import { login, saveAuth } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(''); // Limpiar mensaje anterior
    
    try {
      const res = await login(form);
      if (res.token && res.id && res.username) {
        saveAuth(res.token, { id: res.id, username: res.username });
        setMessage('Login exitoso!');
        setMessageType('success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage('Credenciales inválidas');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Credenciales inválidas');
      setMessageType('error');
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '30px' }}>
        Iniciar Sesión
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
          Ingresar
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
