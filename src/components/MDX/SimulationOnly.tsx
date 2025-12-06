import React, { ReactNode } from 'react';
import { usePersonalizationContext } from '../Personalization/PersonalizationProvider';

interface SimulationOnlyProps {
  children: ReactNode;
}

export default function SimulationOnly({ children }: SimulationOnlyProps) {
  const { enabled, profile } = usePersonalizationContext();

  if (!enabled || !profile) {
    return <>{children}</>;
  }

  if (profile.budget_tier === 'simulation_only') {
    return (
      <div style={{
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: 'var(--ifm-color-primary-lightest)',
        borderLeft: '4px solid var(--ifm-color-primary)',
        borderRadius: '4px'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-primary-darkest)' }}>
          ☁️ Cloud/Simulation Setup
        </div>
        {children}
      </div>
    );
  }

  return null;
}
