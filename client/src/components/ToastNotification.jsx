import React, { useEffect } from 'react';

function ToastNotification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); 
    }, 3000);
    return () => clearTimeout(timer); 
  }, [onClose]);

  return (
    <div className="toast-notification">
      <p>{message}</p>
    </div>
  );
}

export default ToastNotification;
