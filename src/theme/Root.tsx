import React, { ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FloatingChatButton from '../chatbot/FloatingChatButton';
import { PersonalizationProvider } from '../contexts/PersonalizationProvider';

// This component wraps the entire app
// It provides the floating chat button to all pages and PersonalizationProvider for MDX components
// Updated: Chatbot with Qdrant + OpenRouter
export default function Root({ children }: { children: ReactNode }) {
  return (
    <PersonalizationProvider>
      {children}
      <BrowserOnly fallback={<div />}>
        {() => {
          try {
            return <FloatingChatButton />;
          } catch (error) {
            console.error('FloatingChatButton error:', error);
            return null;
          }
        }}
      </BrowserOnly>
    </PersonalizationProvider>
  );
}
