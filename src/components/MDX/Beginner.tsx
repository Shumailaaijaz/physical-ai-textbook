import React, { ReactNode } from 'react';
import { usePersonalizationContext } from '../Personalization/PersonalizationProvider';

interface BeginnerProps {
  children: ReactNode;
}

export default function Beginner({ children }: BeginnerProps) {
  const { enabled, profile } = usePersonalizationContext();

  // If personalization is disabled, show everything
  if (!enabled || !profile) {
    return <>{children}</>;
  }

  // Only show for beginner Python skill
  if (profile.python_skill === 'beginner') {
    return (
      <div style={{
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: 'var(--ifm-color-info-lightest)',
        borderLeft: '4px solid var(--ifm-color-info)',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-info-darkest)' }}>
          📚 Beginner Section
        </div>
        {children}
      </div>
    );
  }

  return null;
}
