import React, { ReactNode } from 'react';
import { usePersonalizationContext } from '../Personalization/PersonalizationProvider';

interface ResearchGradeProps {
  children: ReactNode;
}

export default function ResearchGrade({ children }: ResearchGradeProps) {
  const { enabled, profile } = usePersonalizationContext();

  if (!enabled || !profile) {
    return <>{children}</>;
  }

  if (profile.budget_tier === 'research_grade') {
    return (
      <div style={{
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: 'var(--ifm-color-success-lightest)',
        borderLeft: '4px solid var(--ifm-color-success)',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-success-darkest)' }}>
          🔬 Research-Grade Hardware
        </div>
        {children}
      </div>
    );
  }

  return null;
}
