import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children, token, user }) {
  return token && user ? React.cloneElement(children, { token, ownerId: user.id, user }) : <Navigate to="/login" />;
}

export default function App() {
  const { token, user, updateAuth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  return (
    <Router>
      <Navbar
        user={user}
        token={token}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={updateAuth} />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute token={token} user={user}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}