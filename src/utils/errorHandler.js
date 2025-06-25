class ErrorHandler {
  static handleApiError(error) {
    console.error('API Error:', error);
    
    // Errores de red
    if (!navigator.onLine) {
      return 'No hay conexión a internet. Verifica tu conexión y vuelve a intentar.';
    }
    
    // Errores específicos del backend
    if (error.message) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return 'No tienes permisos para realizar esta acción.';
      }
      
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return 'El recurso solicitado no fue encontrado.';
      }
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        return 'Error interno del servidor. Por favor, intenta más tarde.';
      }
      
      // Devolver el mensaje de error específico del backend
      return error.message;
    }
    
    // Error genérico
    return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
  }
  
  static showNotification(message, type = 'error') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: opacity 0.3s ease;
      ${type === 'error' ? 'background-color: #f44336;' : ''}
      ${type === 'success' ? 'background-color: #4caf50;' : ''}
      ${type === 'warning' ? 'background-color: #ff9800;' : ''}
      ${type === 'info' ? 'background-color: #2196f3;' : ''}
    `;
    
    notification.textContent = message;
    
    // Agregar botón de cerrar
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      float: right;
      font-size: 20px;
      cursor: pointer;
      margin-left: 10px;
    `;
    closeBtn.onclick = () => notification.remove();
    
    notification.appendChild(closeBtn);
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
  
  static validateForm(data, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = data[field];
      
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${rule.label} es requerido`;
        return;
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `${rule.label} debe tener al menos ${rule.minLength} caracteres`;
        return;
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${rule.label} no puede tener más de ${rule.maxLength} caracteres`;
        return;
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.patternMessage || `${rule.label} tiene un formato inválido`;
        return;
      }
      
      if (value && rule.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          errors[field] = `${rule.label} debe ser un email válido`;
          return;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  static formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  static formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

export default ErrorHandler;
