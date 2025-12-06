import React, { ReactNode } from 'react';
import { AuthProvider } from '../components/Auth/AuthProvider';
import { PersonalizationProvider } from '../components/Personalization/PersonalizationProvider';

// This component wraps the entire app
// It provides authentication and personalization context to all pages
export default function Root({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        {children}
      </PersonalizationProvider>
    </AuthProvider>
  );
}
