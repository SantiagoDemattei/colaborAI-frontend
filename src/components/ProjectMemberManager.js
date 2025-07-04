import React, { useState, useEffect, useCallback } from 'react';
import { 
  getProjectMembers, 
  getAvailableUsersForProject, 
  addMemberToProject, 
  updateMemberRole, 
  removeMemberFromProject 
} from '../services/memberService';
import ErrorHandler from '../utils/errorHandler';

export default function ProjectMemberManager({ projectId, token, ownerId, isOwner, currentUser }) {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
    try {
      const data = await getProjectMembers(projectId, token);
      setMembers(data);
    } catch (err) {
      setError(ErrorHandler.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  const loadAvailableUsers = useCallback(async () => {
    try {
      const data = await getAvailableUsersForProject(projectId, ownerId, token);
      setAvailableUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios disponibles:', err);
    }
  }, [projectId, ownerId, token]);

  useEffect(() => {
    if (projectId) {
      loadMembers();
      if (isOwner) loadAvailableUsers();
    }
  }, [projectId, isOwner, loadMembers, loadAvailableUsers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setProcessingId('add');
      await addMemberToProject(projectId, parseInt(selectedUserId), ownerId, token);
      ErrorHandler.showNotification('Miembro agregado exitosamente', 'success');
      
      setSelectedUserId('');
      setShowAddMember(false);
      loadMembers();
      loadAvailableUsers();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (memberId) => {
    if (!newRole) return;

    try {
      setProcessingId(memberId);
      await updateMemberRole(projectId, memberId, newRole, ownerId, token);
      ErrorHandler.showNotification('Rol actualizado exitosamente', 'success');
      
      setEditingMemberId(null);
      setNewRole('');
      loadMembers();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('¿Estás seguro de que quieres remover este miembro?')) return;

    try {
      setProcessingId(memberId);
      await removeMemberFromProject(projectId, memberId, ownerId, token);
      ErrorHandler.showNotification('Miembro removido exitosamente', 'success');
      
      loadMembers();
      loadAvailableUsers();
    } catch (err) {
      ErrorHandler.showNotification(ErrorHandler.handleApiError(err), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      'OWNER': 'Propietario',
      'ADMIN': 'Administrador',
      'MEMBER': 'Miembro'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'OWNER': '#9c27b0',
      'ADMIN': '#f44336',
      'MEMBER': '#2196f3'
    };
    return colors[role] || '#666';
  };

  if (loading) return <div>Cargando miembros...</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#1976d2' }}>Miembros del Proyecto</h3>
        {isOwner && (
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showAddMember ? 'Cancelar' : 'Agregar Miembro'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ 
          color: '#f44336', 
          padding: '10px', 
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {showAddMember && isOwner && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h4>Agregar Nuevo Miembro</h4>
          <form onSubmit={handleAddMember}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{
                width: '300px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginRight: '10px'
              }}
              required
            >
              <option value="">Seleccionar usuario...</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedUserId || processingId === 'add'}
              style={{
                backgroundColor: selectedUserId ? '#4caf50' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
                cursor: selectedUserId ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              {processingId === 'add' ? 'Agregando...' : 'Agregar'}
            </button>
          </form>
        </div>
      )}

      <div>
        {members.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No hay miembros en este proyecto</p>
        ) : (
          members.map(member => {
            return (
            <div key={member.id} style={{ 
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '10px',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {member.username || member.user?.username || member.name || 'Sin nombre'}
                  {currentUser && currentUser.id === (member.userId || member.user?.id) && (
                    <span style={{ 
                      color: '#1976d2', 
                      fontSize: '12px', 
                      marginLeft: '8px',
                      fontWeight: 'normal',
                      fontStyle: 'italic' 
                    }}>
                      (Yo)
                    </span>
                  )}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {member.email || member.user?.email || 'Sin email'}
                </div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: getRoleColor(member.role),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginTop: '5px',
                  fontWeight: 'bold'
                }}>
                  {getRoleDisplayName(member.role)}
                </div>
              </div>
              
              {isOwner && member.role !== 'OWNER' && (
                <div>
                  {editingMemberId === member.id ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        style={{ marginRight: '10px', padding: '5px' }}
                      >
                        <option value="">Seleccionar rol...</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="MEMBER">Miembro</option>
                      </select>
                      <button
                        onClick={() => handleUpdateRole(member.id)}
                        disabled={!newRole || processingId === member.id}
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingMemberId(null);
                          setNewRole('');
                        }}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setNewRole(member.role);
                        }}
                        style={{
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '10px',
                          fontWeight: 'bold'
                        }}
                      >
                        Cambiar Rol
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={processingId === member.id}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {processingId === member.id ? 'Removiendo...' : 'Remover'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )})
        )}
      </div>
    </div>
  );
}
