import React, { useState, useEffect, useCallback } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import useTextSelection from '../hooks/useTextSelection';

interface ChatbotWidgetProps {
  apiUrl?: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ apiUrl = 'http://localhost:8000' }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { selectedText } = useTextSelection();

  // Check if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load saved thread ID and messages on mount
  useEffect(() => {
    const loadThreadAndMessages = async () => {
      const savedThread = localStorage.getItem('chatkit-thread-id');
      if (savedThread) {
        setThreadId(savedThread);

        try {
          // Fetch the thread messages from the backend
          const response = await fetch(`${apiUrl}/chatkit/threads/${savedThread}/messages`);
          if (response.ok) {
            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
            }
          }
        } catch (error) {
          console.error('Error fetching thread messages:', error);
          // Continue without loading messages if there's an error
        }
      }
      setIsReady(true);
    };

    loadThreadAndMessages();
  }, [apiUrl]);

  // Determine the API endpoint based on selected text
  const getApiEndpoint = useCallback(() => {
    // For ChatKit, we need to handle the dual-mode differently
    // We'll use the regular endpoint and let the backend handle routing
    return `${apiUrl}/chatkit`;
  }, [apiUrl]);

  const { control } = useChatKit({
    api: {
      url: getApiEndpoint(),
      domainKey: 'localhost',
    },
    initialThread: threadId || undefined,
    theme: {
      colorScheme: 'dark',
      color: {
        grayscale: { hue: 220, tint: 6, shade: -1 },
        accent: { primary: '#4cc9f0', level: 1 },
      },
      radius: 'round',
    },
    startScreen: {
      greeting: 'Welcome to the Physical AI Textbook Assistant!',
      prompts: [
        { label: 'Kinematics', prompt: 'Explain forward kinematics' },
        { label: 'SLAM', prompt: 'What is SLAM?' },
        { label: 'Sensors', prompt: 'How do sensors work in robotics?' },
        { label: 'ROS 2', prompt: 'Tell me about ROS 2' },
      ],
    },
    composer: {
      placeholder: selectedText
        ? `Ask about ${selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}`
        : 'Ask about the textbook...',
    },
    onThreadChange: ({ threadId: newThreadId }) => {
      console.log('Thread changed:', newThreadId);
      if (newThreadId) {
        localStorage.setItem('chatkit-thread-id', newThreadId);
        setThreadId(newThreadId);
      }
    },
    onError: ({ error }) => {
      console.error('ChatKit error:', error);
    },
    onReady: () => {
      console.log('ChatKit is ready!');
    },
  });

  // Custom message sending for dual-mode
  const sendMessage = async (message: string) => {
    if (selectedText) {
      // For selected text mode, we need to call the specific endpoint
      try {
        const response = await fetch(`${apiUrl}/chatkit/ask-selected`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thread_id: threadId || `thread_${Date.now()}`,
            query: message,
            selected_text: selectedText,
            items: [{ role: 'user', content: message }] // Simplified for this example
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Handle the SSE response
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6); // Remove 'data: ' prefix
                if (data.trim()) {
                  try {
                    const event = JSON.parse(data);
                    console.log('Received event:', event);
                    // Handle the event based on its type
                    if (event.type === 'ThreadItemAdded' || event.type === 'ThreadItemUpdated') {
                      // Update UI with incremental content
                    } else if (event.type === 'ThreadItemDone') {
                      // Final message received
                    }
                  } catch (e) {
                    console.error('Error parsing event:', e);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in selected-text mode:', error);
      }
    } else {
      // For general mode, use ChatKit's built-in functionality
      if (control) {
        control.sendText(message);
      }
    }
  };

  if (!isReady) {
    return null; // Don't render until ready
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
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

      {/* Chat Modal */}
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsChatOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
            }}
          />

          {/* Modal Content */}
          <div
            style={{
              position: 'fixed',
              top: isMobile ? '0' : '50%',
              left: isMobile ? '0' : '50%',
              transform: isMobile ? 'none' : 'translate(-50%, -50%)',
              width: isMobile ? '100%' : '420px',
              height: isMobile ? '100%' : '600px',
              maxWidth: '100%',
              maxHeight: '100%',
              background: '#16213e',
              borderRadius: isMobile ? '0' : '1rem',
              boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 10000,
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#0f3460',
                borderBottom: '1px solid #1a1a2e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#4cc9f0', fontWeight: 'bold', fontSize: '1rem' }}>
                  Physical AI Assistant
                </span>
                {selectedText && (
                  <span style={{
                    color: '#f72585',
                    fontSize: '0.8rem',
                    background: 'rgba(247, 37, 133, 0.1)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.5rem'
                  }}>
                    📄 {selectedText.split(/\s+/).length} words selected
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    localStorage.removeItem('chatkit-thread-id');
                    // Reset thread in ChatKit
                    if (control) {
                      control.createNewThread();
                    }
                  }}
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: '#4361ee',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                  }}
                >
                  New Chat
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    padding: '0.4rem',
                    background: 'transparent',
                    color: '#a0a0a0',
                    border: '1px solid #a0a0a0',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {control && <ChatKit control={control} className="h-full w-full" />}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatbotWidget;