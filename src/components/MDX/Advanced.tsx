import React, { ReactNode } from 'react';
import { usePersonalizationContext } from '../Personalization/PersonalizationProvider';

interface AdvancedProps {
  children: ReactNode;
}

export default function Advanced({ children }: AdvancedProps) {
  const { enabled, profile } = usePersonalizationContext();

  if (!enabled || !profile) {
    return <>{children}</>;
  }

  if (profile.python_skill === 'advanced') {
    return (
      <div style={{
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: 'var(--ifm-color-warning-lightest)',
        borderLeft: '4px solid var(--ifm-color-warning)',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-warning-darkest)' }}>
          🚀 Advanced Section
        </div>
        {children}
      </div>
    );
  }

  return null;
}
