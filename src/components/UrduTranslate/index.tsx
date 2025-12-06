import React, { useState } from 'react';
import styles from './styles.module.css';

interface UrduTranslateProps {
  chapterId: string;
  chapterTitle: string;
}

export default function UrduTranslate({ chapterId, chapterTitle }: UrduTranslateProps): JSX.Element {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the chapter content
      const content = document.querySelector('article')?.innerText || '';

      // Call translation API
      const response = await fetch('/api/v1/translate/urdu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();

      // Toggle translation view
      setIsTranslated(!isTranslated);

      // Store translation in localStorage for caching
      localStorage.setItem(`urdu-${chapterId}`, JSON.stringify(data.data));
    } catch (err: any) {
      setError(err.message || 'Failed to translate');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.urduTranslate}>
      <button
        onClick={handleTranslate}
        className={styles.translateButton}
        disabled={isLoading}
        aria-label={isTranslated ? 'View in English' : 'View in Urdu'}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Translating...
          </>
        ) : isTranslated ? (
          <>
            🇬🇧 View in English
          </>
        ) : (
          <>
            🇵🇰 اردو میں دیکھیں (View in Urdu)
          </>
        )}
      </button>

      {error && (
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.info}>
        <small>
          Technical terms (ROS 2, Python, etc.) preserved in English
        </small>
      </div>
    </div>
  );
}
