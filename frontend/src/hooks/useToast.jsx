import { useState, useCallback, createContext, useContext } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = ++toastId;
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      autoDismiss: true,
      ...options
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss
    if (newToast.autoDismiss && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'success', message });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'error', message, duration: 0 });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'warning', message });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ ...options, type: 'info', message });
  }, [addToast]);

  const promise = useCallback((promise, options = {}) => {
    const loadingId = addToast({
      ...options,
      type: 'info',
      message: options.loadingMessage || 'Loading...',
      autoDismiss: false
    });

    return promise
      .then((result) => {
        removeToast(loadingId);
        addToast({
          ...options,
          type: 'success',
          message: options.successMessage || 'Operation completed successfully'
        });
        return result;
      })
      .catch((error) => {
        removeToast(loadingId);
        addToast({
          ...options,
          type: 'error',
          message: options.errorMessage || error.message || 'Operation failed',
          duration: 0
        });
        throw error;
      });
  }, [addToast, removeToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    promise
  };
};

// Global toast context for easier usage
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useToast();
  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
