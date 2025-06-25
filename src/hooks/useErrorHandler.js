import { useState, useCallback } from 'react';
import ErrorHandler from '../utils/errorHandler';

export const useErrorHandler = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsync = useCallback(async (asyncFunction, options = {}) => {
    const { 
      showNotification = true, 
      loadingMessage = 'Procesando...',
      successMessage = null 
    } = options;

    setError('');
    setLoading(true);

    try {
      const result = await asyncFunction();
      
      if (successMessage && showNotification) {
        ErrorHandler.showNotification(successMessage, 'success');
      }
      
      return result;
    } catch (err) {
      const errorMessage = ErrorHandler.handleApiError(err);
      setError(errorMessage);
      
      if (showNotification) {
        ErrorHandler.showNotification(errorMessage, 'error');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    error,
    loading,
    handleAsync,
    clearError,
    setError,
    setLoading
  };
};

export default useErrorHandler;
