import React from 'react';
import { usePersonalizationContext } from './PersonalizationProvider';
import styles from './Personalization.module.css';

export default function PersonalizeButton() {
  const { enabled, loading, togglePersonalization } = usePersonalizationContext();

  if (loading) {
    return null; // Don't show button while loading
  }

  return (
    <button
      onClick={togglePersonalization}
      className={`${styles.personalizeButton} ${enabled ? styles.active : ''}`}
      title={enabled ? 'Disable personalization' : 'Enable personalization based on your profile'}
      aria-label={enabled ? 'Disable personalized content' : 'Enable personalized content'}
    >
      <span className={styles.icon}>
        {enabled ? '✓' : '⚙️'}
      </span>
      <span className={styles.text}>
        {enabled ? 'Personalized' : 'Personalize this chapter'}
      </span>
    </button>
  );
}
