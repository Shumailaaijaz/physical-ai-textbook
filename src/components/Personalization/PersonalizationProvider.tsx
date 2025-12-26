import React, { createContext, useContext, ReactNode } from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';

interface PersonalizationContextType {
  enabled: boolean;
  loading: boolean;
  togglePersonalization: () => Promise<void>;
  profile: any;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const personalization = usePersonalization();

  return (
    <PersonalizationContext.Provider value={personalization}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalizationContext() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalizationContext must be used within PersonalizationProvider');
  }
  return context;
}
