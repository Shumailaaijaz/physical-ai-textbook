import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Get the backend URL from environment - fallback to the external Hugging Face space
const BACKEND_URL = process.env.REACT_APP_CHATBOT_API_URL || 'https://shumailaaijaz-hackathon-book.hf.space';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]); // Store all responses in an array
  const [isLoading, setIsLoading] = useState(false);
  const [useSelected, setUseSelected] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
        if(response.status === 200) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        setConnectionStatus('disconnected');
        console.error('Connection check failed:', error);
      }
    };

    checkConnection();
  }, []);

  // Capture text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection().toString();
      if (selection) setSelectedText(selection);
    };
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);

    // Add user message to responses
    const userMessage = { role: 'user', content: query };
    setResponses(prev => [...prev, userMessage]);

    try {
      // Prepare the payload
      const payload = {
        message: query,
        history: responses.filter(msg => msg.role === 'user' || msg.role === 'assistant').slice(-6), // Last 3 exchanges
        sessionId: localStorage.getItem('simple-chat-session') || `session_${Date.now()}`
      };

      if (useSelected && selectedText) {
        payload.selected_text = selectedText;
      }

      const response = await axios.post(`${BACKEND_URL}/chat`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      const botResponse = {
        role: 'assistant',
        content: response.data.response || response.data.answer || 'No response from chatbot'
      };

      setResponses(prev => [...prev, botResponse]);
      setQuery(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error in chat request:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.response?.data?.detail || error.message || 'Failed to get response'}`
      };
      setResponses(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setResponses([]);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      border: '1px solid #ccc',
      padding: '10px',
      background: '#16213e',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      color: 'white',
      zIndex: 9999
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #4a5568'
      }}>
        <h3 style={{ margin: 0, color: '#4cc9f0' }}>Book Chatbot</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'connected' ? '#4ade80' : '#f87171',
            }}
          />
          <button
            onClick={clearChat}
            style={{
              background: '#4a5568',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{
        maxHeight: '200px',
        overflowY: 'auto',
        marginBottom: '10px',
        padding: '8px',
        background: '#2d3748',
        borderRadius: '6px'
      }}>
        {responses.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#a0aec0' }}>Ask me anything about the book...</p>
        ) : (
          responses.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                wordWrap: 'break-word'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: msg.role === 'user' ? '#4361ee' : '#0f3460',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  maxWidth: '90%'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <div style={{ display: 'inline-block', background: '#0f3460', padding: '6px 10px', borderRadius: '8px' }}>
              <em>Thinking...</em>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about the book..."
          disabled={isLoading}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #4a5568',
            background: '#2d3748',
            color: 'white'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={useSelected}
              onChange={(e) => setUseSelected(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Use selected text
          </label>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            style={{
              padding: '8px 12px',
              background: isLoading ? '#4a5568' : '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
              marginLeft: 'auto'
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        {selectedText && (
          <p style={{ fontSize: '12px', color: '#a0aec0', margin: '5px 0 0 0' }}>
            Selected: {selectedText.slice(0, 40)}...
          </p>
        )}
      </form>

      <div style={{ marginTop: '8px', fontSize: '12px', color: '#a0aec0', textAlign: 'center' }}>
        Connected to: {BACKEND_URL}
      </div>
    </div>
  );
};

export default Chatbot;