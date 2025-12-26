import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';

// Import our custom components
import Beginner from '../components/MDX/Beginner';
import Advanced from '../components/MDX/Advanced';
import SimulationOnly from '../components/MDX/SimulationOnly';
import ResearchGrade from '../components/MDX/ResearchGrade';
import PersonalizeButton from '../components/Personalization/PersonalizeButton';
import UrduTranslate from '../components/UrduTranslate';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Add our custom components
  Beginner,
  Advanced,
  SimulationOnly,
  ResearchGrade,
  PersonalizeButton,
  UrduTranslate,
};
