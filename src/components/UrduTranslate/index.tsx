import React, { useState } from 'react';
import styles from './styles.module.css';

interface UrduTranslateProps {
  chapterId: string;
  chapterTitle: string;
}

export default function UrduTranslate({ chapterId, chapterTitle }: UrduTranslateProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
              <div className={styles.placeholderContainer}>
                <div className={styles.placeholderIcon}>📚</div>
                <h3 style={{ fontSize: '1.8rem', margin: '1rem 0', fontFamily: 'Noto Nastaliq Urdu, serif' }}>
                  اردو ترجمہ جلد آرہا ہے
                </h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#01411c' }}>
                  Urdu Translation Coming Soon!
                </p>
                <p style={{ marginTop: '1.5rem', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px' }}>
                  This chapter will be translated into Urdu shortly. Technical terms (ROS 2, Python, URDF, Gazebo, etc.) will be preserved in English for clarity and consistency.
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  یہ باب جلد ہی اردو میں دستیاب ہوگا۔ تکنیکی اصطلاحات انگریزی میں محفوظ رہیں گی۔
                </p>
              </div>
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
