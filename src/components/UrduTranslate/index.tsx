import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './styles.module.css';

interface UrduTranslateProps {
  chapterId: string;
  chapterTitle: string;
}

export default function UrduTranslate({ chapterId, chapterTitle }: UrduTranslateProps): React.JSX.Element {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urduContent, setUrduContent] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Check localStorage for cached translation and language preference
  useEffect(() => {
    const cachedTranslation = localStorage.getItem(`urdu-${chapterId}`);
    const languagePreference = localStorage.getItem('language_preference');

    if (cachedTranslation) {
      try {
        const data = JSON.parse(cachedTranslation);
        setUrduContent(data.mdx_content);

        // Auto-load Urdu if user's preference is Urdu
        if (languagePreference === 'ur' && data.mdx_content) {
          setIsTranslated(true);
        }
      } catch (err) {
        console.error('Error parsing cached translation:', err);
      }
    }
  }, [chapterId]);

  const handleToggle = async () => {
    // If we already have the Urdu content cached, just toggle
    if (urduContent) {
      toggleContent();
      return;
    }

    // Otherwise, fetch from API
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('translation_content')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('language_code', 'ur')
        .single();

      if (fetchError || !data) {
        throw new Error('Translation not available for this chapter yet');
      }

      setUrduContent(data.mdx_content);

      // Cache the translation
      localStorage.setItem(`urdu-${chapterId}`, JSON.stringify(data));

      // Store original content before toggling
      if (!originalContent) {
        const article = document.querySelector('article');
        if (article) {
          setOriginalContent(article.innerHTML);
        }
      }

      toggleContent(data.mdx_content);
    } catch (err: any) {
      setError(err.message || 'Failed to load Urdu translation');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContent = (content?: string) => {
    const article = document.querySelector('article');
    if (!article) return;

    // Save current scroll position
    setScrollPosition(window.scrollY);

    if (isTranslated) {
      // Switch back to English
      if (originalContent) {
        article.innerHTML = originalContent;
      }
      setIsTranslated(false);
      localStorage.setItem('language_preference', 'en');
    } else {
      // Switch to Urdu
      if (!originalContent) {
        setOriginalContent(article.innerHTML);
      }
      if (content || urduContent) {
        article.innerHTML = content || urduContent || '';
        article.style.direction = 'rtl';
        article.style.textAlign = 'right';
      }
      setIsTranslated(true);
      localStorage.setItem('language_preference', 'ur');
    }

    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });

    // Update session in database if user is logged in
    updateSessionLanguage(isTranslated ? 'en' : 'ur');
  };

  const updateSessionLanguage = async (language: 'en' | 'ur') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('sessions')
          .update({ language_preference: language })
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('Error updating session language:', err);
    }
  };

  return (
    <div className={styles.urduTranslate}>
      <button
        onClick={handleToggle}
        className={styles.translateButton}
        disabled={isLoading}
        aria-label={isTranslated ? 'View in English' : 'View in Urdu'}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Loading...
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

      {!error && !urduContent && !isLoading && (
        <div className={styles.info}>
          <small>
            Technical terms (ROS 2, Python, etc.) preserved in English
          </small>
        </div>
      )}
    </div>
  );
}
