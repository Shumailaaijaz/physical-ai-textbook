import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './styles.module.css';

interface UrduTranslateProps {
  chapterId: string;
  chapterTitle: string;
}

export default function UrduTranslate({ chapterId, chapterTitle }: UrduTranslateProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urduContent, setUrduContent] = useState<string | null>(null);

  // Check localStorage for cached translation
  useEffect(() => {
    const cachedTranslation = localStorage.getItem(`urdu-${chapterId}`);
    if (cachedTranslation) {
      try {
        const data = JSON.parse(cachedTranslation);
        setUrduContent(data.mdx_content);
      } catch (err) {
        console.error('Error parsing cached translation:', err);
      }
    }
  }, [chapterId]);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setError(null);

    // If we already have cached content, no need to fetch
    if (urduContent) {
      return;
    }

    // Try to fetch from API
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('translation_content')
        .select('*')
        .eq('chapter_id', chapterId)
        .eq('language_code', 'ur')
        .single();

      if (fetchError || !data) {
        // No translation available - show placeholder
        setUrduContent(null);
        setError('اس باب کا اردو ترجمہ ابھی دستیاب نہیں ہے۔\n\nUrdu translation for this chapter is not yet available. It will be added soon.');
      } else {
        setUrduContent(data.mdx_content);
        // Cache the translation
        localStorage.setItem(`urdu-${chapterId}`, JSON.stringify(data));
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      setError('اس باب کا اردو ترجمہ ابھی دستیاب نہیں ہے۔\n\nUrdu translation for this chapter is not yet available. It will be added soon.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Get English content from the page
  const getEnglishContent = () => {
    const article = document.querySelector('article');
    if (article) {
      return article.textContent || '';
    }
    return '';
  };

  return (
    <>
      <div className={styles.urduTranslate}>
        <button
          onClick={handleOpenModal}
          className={styles.translateButton}
          aria-label="View in Urdu"
        >
          🇵🇰 اردو میں دیکھیں (View in Urdu)
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {chapterTitle}
                <span className={styles.urduLabel}> (اردو ترجمہ)</span>
              </h2>
              <button
                onClick={handleCloseModal}
                className={styles.closeButton}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <span className={styles.spinner}></span>
                  <p>Loading Urdu translation...</p>
                </div>
              ) : error ? (
                <div className={styles.errorContainer}>
                  <div className={styles.errorIcon}>📖</div>
                  <p style={{ whiteSpace: 'pre-line', textAlign: 'center', fontSize: '1.1rem' }}>
                    {error}
                  </p>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    In the meantime, you can read the English version below.
                  </p>
                </div>
              ) : urduContent ? (
                <div
                  className={styles.urduText}
                  dangerouslySetInnerHTML={{ __html: urduContent }}
                />
              ) : (
                <div className={styles.placeholderContainer}>
                  <div className={styles.placeholderIcon}>📚</div>
                  <h3>اردو ترجمہ جلد آرہا ہے</h3>
                  <p>Urdu translation coming soon!</p>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    This chapter will be translated into Urdu shortly. Technical terms (ROS 2, Python, URDF, etc.) will be preserved in English for clarity.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button onClick={handleCloseModal} className={styles.closeFooterButton}>
                Close / بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
