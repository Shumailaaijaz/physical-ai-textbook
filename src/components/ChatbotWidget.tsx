import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * Floating chatbot widget that integrates Vercel-deployed chatbot
 * into the Docusaurus site via iframe
 */
function ChatbotWidgetComponent() {
  const [isOpen, setIsOpen] = useState(false);
  // Vercel chatbot URL - hardcoded for reliability in Docusaurus
  const chatbotUrl = 'https://physical-ai-textbook-e3se.vercel.app';

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="chatbot-fab"
        aria-label="Open AI Chatbot"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2e8555',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 9998,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Modal with iframe */}
      {isOpen && (
        <div
          className="chatbot-modal"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '400px',
            height: '600px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 150px)',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#2e8555',
              color: 'white',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px' }}>AI Assistant</h3>
            <button
              onClick={toggleChat}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                width: '24px',
                height: '24px',
              }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* iframe containing the Vercel chatbot */}
          <iframe
            src={chatbotUrl}
            style={{
              flex: 1,
              border: 'none',
              width: '100%',
              height: '100%',
            }}
            title="AI Chatbot"
            allow="clipboard-write"
          />
        </div>
      )}

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .chatbot-modal {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
          }
          .chatbot-fab {
            bottom: 16px !important;
            right: 16px !important;
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </>
  );
}

// Wrap in BrowserOnly to prevent SSR issues
export default function ChatbotWidget() {
  return (
    <BrowserOnly fallback={<div></div>}>
      {() => <ChatbotWidgetComponent />}
    </BrowserOnly>
  );
}
