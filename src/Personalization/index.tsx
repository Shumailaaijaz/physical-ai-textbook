import React, { useContext, ReactNode } from 'react';
import { PersonalizationContext } from '../../contexts/PersonalizationProvider';
import './styles.css';

interface Props {
  children: ReactNode;
  level: string;
  language?: string;
}

export default function Personalization({ children, level, language }: Props) {
  const context = useContext(PersonalizationContext);
  
  if (!context) return null;
  
  const { experienceLevel, language: contextLanguage } = context;
  
  // Normalize inputs
  const currentLevel = experienceLevel.toLowerCase(); // "novice" or "professional"
  const targetLevel = level.toLowerCase();
  
  // Normalize language
  const currentLang = contextLanguage.toLowerCase();
  const targetLang = (language || 'English').toLowerCase();

  // Map "expert" to "professional" to handle synonyms
  const normalizedTargetLevel = targetLevel === 'expert' ? 'professional' : targetLevel;

  if (currentLevel === normalizedTargetLevel && currentLang === targetLang) {
    return <div className="animate-fade-in my-4 personalization-content">{children}</div>;
  }
  return null;
}