import React, { createContext, useState, ReactNode, useEffect } from 'react';

export type ExperienceLevel = 'Novice' | 'Professional';
export type Language = 'English' | 'Urdu';

interface PersonalizationContextType {
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (level: ExperienceLevel) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isQuizCompleted: boolean;
  completeQuiz: () => void;
  resetPreferences: () => void;
}

export const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

interface PersonalizationProviderProps {
  children: ReactNode;
}

const PersonalizationProvider = ({ children }: PersonalizationProviderProps) => {
  // Initialize with defaults for SSR safety
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice');
  const [language, setLanguage] = useState<Language>('English');
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Load from localStorage on client-side mount
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem('pai_pref_level') as ExperienceLevel;
      if (savedLevel) setExperienceLevel(savedLevel);

      const savedLang = localStorage.getItem('pai_pref_lang') as Language;
      if (savedLang) setLanguage(savedLang);

      const savedQuiz = localStorage.getItem('pai_quiz_done');
      if (savedQuiz) setIsQuizCompleted(savedQuiz === 'true');
    } catch (e) {
      console.warn('Failed to load personalization settings:', e);
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pai_pref_level', experienceLevel);
    }
  }, [experienceLevel]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pai_pref_lang', language);
    }
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pai_quiz_done', String(isQuizCompleted));
    }
  }, [isQuizCompleted]);

  const completeQuiz = () => setIsQuizCompleted(true);

  const resetPreferences = () => {
    setExperienceLevel('Novice');
    setLanguage('English');
    setIsQuizCompleted(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pai_pref_level');
      localStorage.removeItem('pai_pref_lang');
      localStorage.removeItem('pai_quiz_done');
    }
  };

  return (
    <PersonalizationContext.Provider value={{ 
      experienceLevel, 
      setExperienceLevel, 
      language, 
      setLanguage, 
      isQuizCompleted,
      completeQuiz,
      resetPreferences
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export default PersonalizationProvider;