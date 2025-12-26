import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import styles from './chatbot.module.css';

function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        text: data.response,
        sender: 'bot',
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout title="Chatbot" description="AI-powered chatbot for Physical AI & Humanoid Robotics textbook">
      <div className={clsx('hero', styles.heroBanner)}>
        <div className="container">
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <h1>Physical AI & Humanoid Robotics Chatbot</h1>
              <p>Ask questions about the textbook content</p>
            </div>

            <div className={styles.chatMessages}>
              {messages.length === 0 ? (
                <div className={styles.welcomeMessage}>
                  <p>Hello! I'm your AI assistant for the Physical AI & Humanoid Robotics textbook.</p>
                  <p>Ask me anything about the course content and I'll help you find the information you need.</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={clsx(
                      styles.message,
                      message.sender === 'user' ? styles.userMessage : styles.botMessage
                    )}
                  >
                    <div className={styles.messageContent}>
                      <strong>{message.sender === 'user' ? 'You:' : 'AI:'}</strong>
                      <p>{message.text}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className={styles.sources}>
                          <small>Sources: {message.sources.slice(0, 3).join(', ')}</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className={clsx(styles.message, styles.botMessage)}>
                  <div className={styles.messageContent}>
                    <strong>AI:</strong>
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.chatInput}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about Physical AI & Humanoid Robotics..."
                rows="3"
                disabled={isLoading}
                className={styles.textInput}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={clsx(styles.sendButton, (!inputValue.trim() || isLoading) && styles.sendButtonDisabled)}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChatbotPage;