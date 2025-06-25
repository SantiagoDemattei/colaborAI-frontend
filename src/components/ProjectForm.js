import React, { useState, useEffect } from 'react';
import { createProject, updateProject } from '../services/projectService';
import ErrorHandler from '../utils/errorHandler';

export default function ProjectForm({ token, onSubmit, project }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validación
      const validation = ErrorHandler.validateForm(
        { name, description },
        {
          name: {
            required: true,
            label: 'Nombre del proyecto',
            minLength: 3,
            maxLength: 100
          },
          description: {
            required: false,
            label: 'Descripción',
            maxLength: 500
          }
        }
      );

      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      const data = { name, description, ownerId: user.id };
      
      let result;
      if (project && project.id) {
        result = await updateProject(project.id, data, token);
      } else {
        result = await createProject(data, token);
      }
      
      if (onSubmit) onSubmit(result);
      
      // Limpiar formulario solo si es creación
      if (!project) {
        setName('');
        setDescription('');
      }
      
      ErrorHandler.showNotification(
        project ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente', 
        'success'
      );
    } catch (err) {
      const errorMessage = ErrorHandler.handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  };

  return (
    <div style={formStyle}>
      <h3 style={{ marginTop: 0, color: '#1976d2' }}>
        {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Nombre del proyecto: *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            disabled={loading}
            placeholder="Ingresa el nombre del proyecto"
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Descripción:</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{...inputStyle, height: '80px', resize: 'vertical'}}
            disabled={loading}
            placeholder="Describe tu proyecto (opcional)"
          />
        </div>
        
        {error && (
          <div style={{ 
            color: '#f44336', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            border: '1px solid #f44336'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={loading || !name.trim()}
            style={{
              backgroundColor: loading || !name.trim() ? '#ccc' : '#1976d2',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              flex: 1
            }}
          >
            {loading ? 'Guardando...' : (project ? 'Actualizar Proyecto' : 'Crear Proyecto')}
          </button>
          
          {project && (
            <button
              type="button"
              onClick={() => onSubmit && onSubmit(null)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}