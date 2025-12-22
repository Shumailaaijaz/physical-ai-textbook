import React, { ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FloatingChatButton from '../chatbot/FloatingChatButton';
import { PersonalizationProvider } from '../contexts/PersonalizationProvider';

// This component wraps the entire app
// It provides the floating chat button to all pages and PersonalizationProvider for MDX components
export default function Root({ children }: { children: ReactNode }) {
  return (
    <PersonalizationProvider>
      {children}
      <BrowserOnly>
        {() => <FloatingChatButton />}
      </BrowserOnly>
    </PersonalizationProvider>
  );
}
