import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface PersonalizationPreferences {
  experienceLevel?: 'Novice' | 'Professional';
  language?: 'English' | 'Urdu';
  pythonSkill?: 'beginner' | 'intermediate' | 'advanced';
  rosExperience?: 'beginner' | 'intermediate' | 'advanced';
  linuxFamiliarity?: 'beginner' | 'intermediate' | 'advanced';
  gpuAccess?: 'none' | 'local' | 'cloud';
  budgetTier?: 'simulation_only' | 'budget_hobbyist' | 'enthusiast' | 'research_grade';
}

interface PersonalizationContextType {
  preferences: PersonalizationPreferences;
  setPreferences: (prefs: PersonalizationPreferences) => void;
  updatePreference: (key: keyof PersonalizationPreferences, value: any) => void;
  resetPreferences: () => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

interface PersonalizationProviderProps {
  children: ReactNode;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<PersonalizationPreferences>(() => {
    // Load from localStorage on initial load
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('personalization_preferences');
      return savedPrefs ? JSON.parse(savedPrefs) : {};
    }
    return {};
  });

  // Save to localStorage whenever preferences change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('personalization_preferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const updatePreference = (key: keyof PersonalizationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('personalization_preferences');
    }
  };

  const value: PersonalizationContextType = {
    preferences,
    setPreferences,
    updatePreference,
    resetPreferences
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

// Export both the Provider and the Context for different import patterns
export default PersonalizationProvider; // For the component
export { PersonalizationContext }; // For the context itself