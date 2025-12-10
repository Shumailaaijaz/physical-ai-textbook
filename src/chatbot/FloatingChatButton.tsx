import React, { useState } from 'react';

// A minimal floating chat button that will appear on all pages
const FloatingChatButton: React.FC = () => {
  const [isVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Remove any problematic dependencies and just create a simple FAB
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Simple floating action button
  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4361ee, #4cc9f0)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(76, 201, 240, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            zIndex: 10000,
            fontSize: '24px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Simple chat modal for testing */}
      {isChatOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '420px',
            height: '600px',
            background: '#16213e',
            borderRadius: '1rem',
            boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: '#0f3460',
              borderBottom: '1px solid #1a1a2e',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#4cc9f0', fontWeight: 'bold' }}>AI Assistant</span>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: '1rem', overflow: 'auto', color: 'white' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Chatbot is ready!</p>
              <p>Backend connection: {process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8000'}</p>
            </div>
          </div>
          <div style={{ padding: '1rem', borderTop: '1px solid #1a1a2e' }}>
            <input
              type="text"
              placeholder="Type a message..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #4a5568',
                background: '#2d3748',
                color: 'white',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;