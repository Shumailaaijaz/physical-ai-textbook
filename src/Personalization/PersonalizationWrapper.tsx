import React, { useContext, ReactNode } from 'react';
import { PersonalizationContext } from './../contexts/PersonalizationProvider';

interface PersonalizationWrapperProps {
  children: ReactNode;
  level: 'Novice' | 'Professional';
}

const PersonalizationWrapper = ({ children, level }: PersonalizationWrapperProps) => {
  const { experienceLevel } = useContext(PersonalizationContext);

  if (experienceLevel === level) {
    return <>{children}</>;
  }

  return null;
};

export default PersonalizationWrapper;