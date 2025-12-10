import React, { ReactNode, Suspense, lazy } from 'react';
import { AuthProvider } from '../components/Auth/AuthProvider';
import { PersonalizationProvider } from '../components/Personalization/PersonalizationProvider';

// Lazy load the ChatbotWidget to prevent it from breaking the entire app if there are errors
const LazyChatbotWidget = lazy(() =>
  import('../chatbot/frontend/src/components/ChatbotWidget').catch(() => {
    console.error('Failed to load ChatbotWidget');
    return { default: () => null };
  })
);

// Fallback component for chatbot loading errors
const ChatbotFallback = () => null;

// This component wraps the entire app
// It provides authentication and personalization context to all pages
export default function Root({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        {children}
        <Suspense fallback={<ChatbotFallback />}>
          <LazyChatbotWidget apiUrl={process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8000'} />
        </Suspense>
      </PersonalizationProvider>
    </AuthProvider>
  );
}
