import React, { useState, useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  children,
  showInput = false, 
  inputType = 'text', 
  inputPlaceholder = '',
  confirmText = 'Aceptar', 
  cancelText = 'Cancelar', 
  isAlert = false,
  icon = '💡',
  variant = 'primary', // 'primary', 'danger'
  showFooter = true
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      if (showInput) {
        onConfirm(inputValue);
      } else {
        onConfirm();
      }
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          {message && <p>{message}</p>}
          {children}
          {showInput && (
            <input 
              type={inputType}
              className="modal-input"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
            />
          )}
        </div>

        {showFooter && (
          <div className="modal-footer">
            {!isAlert && (
              <button className="btn-modal btn-cancel" onClick={onClose}>
                {cancelText}
              </button>
            )}
            <button 
              className={`btn-modal ${variant === 'danger' ? 'btn-danger' : 'btn-confirm'}`} 
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
