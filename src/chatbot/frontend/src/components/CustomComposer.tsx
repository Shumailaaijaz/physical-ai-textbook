import React, { useState, useEffect } from 'react';

interface CustomComposerProps {
  onSendMessage: (message: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CustomComposer: React.FC<CustomComposerProps> = ({ onSendMessage, placeholder, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #1a1a2e' }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid #4a5568',
          background: '#2d3748',
          color: 'white',
          marginRight: '0.5rem'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          background: message.trim() && !disabled ? '#4361ee' : '#4a5568',
          color: 'white',
          border: 'none',
          cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed'
        }}
      >
        Send
      </button>
    </form>
  );
};

export default CustomComposer;