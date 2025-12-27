import React, { ReactNode } from 'react';
import ChatbotWidget from '../components/ChatbotWidget';
import { PersonalizationProvider } from '../contexts/PersonalizationProvider';

// This component wraps the entire app
// It provides the floating chat button to all pages and PersonalizationProvider for MDX components
// Updated: Chatbot integrated from Vercel deployment via iframe
export default function Root({ children }: { children: ReactNode }) {
  return (
    <PersonalizationProvider>
      {children}
      <ChatbotWidget />
    </PersonalizationProvider>
  );
}
