import React, { ReactNode } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FloatingChatButton from '../chatbot/FloatingChatButton';

// This component wraps the entire app
// It provides the floating chat button to all pages
export default function Root({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BrowserOnly>
        {() => <FloatingChatButton />}
      </BrowserOnly>
    </>
  );
}
