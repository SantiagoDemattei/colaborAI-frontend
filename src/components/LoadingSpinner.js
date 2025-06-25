import React from 'react';

export default function LoadingSpinner({ message = 'Cargando...', size = 'medium' }) {
  const sizeStyles = {
    small: { width: '20px', height: '20px' },
    medium: { width: '40px', height: '40px' },
    large: { width: '60px', height: '60px' }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const spinnerStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    ...sizeStyles[size],
    animation: 'spin 1s linear infinite',
    marginBottom: '15px'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
        {message}
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
