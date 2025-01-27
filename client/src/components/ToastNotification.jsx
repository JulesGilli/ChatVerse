import React, { useEffect } from 'react';

function ToastNotification({ message, onClose }) {
    const isError = message.toLowerCase().startsWith('error:'); 
  
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);
  
    return (
      <div className={`toast-notification ${isError ? 'error' : ''}`}>
        <p>{message}</p>
      </div>
    );
  }
  
  export default ToastNotification;
  