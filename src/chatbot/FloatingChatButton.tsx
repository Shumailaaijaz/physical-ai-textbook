import React, { useState, useEffect } from 'react';
import { sendMessage, ChatMessage, ChatResponse, healthCheck } from '../services/chatbot-api';

// A minimal floating chat button that will appear on all pages
const FloatingChatButton: React.FC = () => {
  const [isVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [sessionId] = useState<string>(() => {
    // Generate a unique session ID or retrieve from localStorage
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const storedSessionId = localStorage.getItem('chatbot-session-id');
    if (storedSessionId) return storedSessionId;

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatbot-session-id', newSessionId);
    return newSessionId;
  });

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await healthCheck();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('disconnected');
        console.error('Connection check failed:', error);
      }
    };

    checkConnection();
  }, []);

  // Remove any problematic dependencies and just create a simple FAB
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Add user message to chat
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare chat history (last 10 messages to avoid overwhelming the API)
      const recentHistory = newMessages.slice(-10);

      const response = await sendMessage({
        message: inputValue,
        history: recentHistory,
        sessionId: sessionId
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unable to process your request'}`,
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple floating action button
  if (!isVisible) return null;

  return (
    <div style={{ position: 'relative', zIndex: 10000 }}>
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
            background: connectionStatus === 'connected'
              ? 'linear-gradient(135deg, #4361ee, #4cc9f0)'
              : 'linear-gradient(135deg, #ff6b6b, #ffa500)', // Red/orange if disconnected
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
          onMouseOver={(e) => {
            try {
              e.currentTarget.style.transform = 'scale(1.1)';
            } catch (err) {
              console.error('Mouse over error:', err);
            }
          }}
          onMouseOut={(e) => {
            try {
              e.currentTarget.style.transform = 'scale(1)';
            } catch (err) {
              console.error('Mouse out error:', err);
            }
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Chat modal connected to backend */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#4cc9f0', fontWeight: 'bold' }}>AI Assistant</span>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: connectionStatus === 'connected' ? '#4ade80' : '#f87171',
                  boxShadow: connectionStatus === 'connected'
                    ? '0 0 6px #4ade80'
                    : '0 0 6px #f87171'
                }}
              />
            </div>
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

          {/* Messages container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflow: 'auto',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
            ref={(el) => {
              // Auto-scroll to bottom when messages change
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? '#2d3748' : '#0f3460',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                }}
              >
                <div style={{ fontSize: '0.9rem' }}>{msg.content}</div>
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#0f3460',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  maxWidth: '80%',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Thinking...</div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div style={{ padding: '1rem', borderTop: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #4a5568',
                  background: '#2d3748',
                  color: 'white',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  background: isLoading ? '#4a5568' : '#4361ee',
                  color: 'white',
                  border: 'none',
                  cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Send
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a0aec0', textAlign: 'center' }}>
              Connected to: {process.env.REACT_APP_CHATBOT_API_URL}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatButton;