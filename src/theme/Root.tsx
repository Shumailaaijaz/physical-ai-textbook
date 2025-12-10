import React, { ReactNode } from 'react';
import { AuthProvider } from '../components/Auth/AuthProvider';
import { PersonalizationProvider } from '../components/Personalization/PersonalizationProvider';
import ChatbotWidget from '../chatbot/frontend/src/components/ChatbotWidget';

// This component wraps the entire app
// It provides authentication and personalization context to all pages
export default function Root({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        {children}
        <ChatbotWidget apiUrl={process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8000'} />
      </PersonalizationProvider>
    </AuthProvider>
  );
}
